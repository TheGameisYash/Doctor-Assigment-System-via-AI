import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { classifyTranscript } from '@/lib/gemini';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await prisma.patientReport.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Patient must own the report, or admin/doctor
    if (authUser.role === 'PATIENT' && report.patient.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!report.reportTranscript || report.reportTranscript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Report transcript is empty. Extract text first or type it manually.' },
        { status: 400 }
      );
    }

    // Run classification using the combined symptoms and report transcript context
    const combinedText = `[Patient Symptoms]:\n${report.symptoms}\n\n[Medical Report Transcript]:\n${report.reportTranscript || '(No text extracted)'}`;

    const { result, source } = await classifyTranscript(combinedText);

    // Save AI Log and update Report in a transaction
    const updatedReport = await prisma.$transaction(async (tx) => {
      // 1. Create AI Analysis Log
      await tx.aIAnalysisLog.create({
        data: {
          reportId: id,
          inputTranscript: combinedText,
          modelUsed: source,
          responseJson: JSON.stringify(result),
          success: true,
        }
      });

      // 2. Find available doctor in the matching category
      const availableDoctor = await tx.doctorProfile.findFirst({
        where: {
          category: result.suggestedCategory,
          available: true,
          status: 'ACTIVE'
        }
      });

      let assignedDoctorId = report.assignedDoctorId;
      let status = report.status;

      if (availableDoctor) {
        assignedDoctorId = availableDoctor.id;
        status = 'ASSIGNED';

        // Create assignment log
        await tx.doctorAssignment.create({
          data: {
            reportId: id,
            doctorId: availableDoctor.id,
            assignedBy: 'AI',
            reviewStatus: 'PENDING',
          }
        });
      } else {
        console.log(`No available doctor found for category: ${result.suggestedCategory}`);
        status = 'PROCESSING'; // Leave in processing for Admin override
      }

      // 3. Update report with AI results
      return tx.patientReport.update({
        where: { id },
        data: {
          aiResult: JSON.stringify(result),
          assignedDoctorId,
          status,
        },
        include: {
          assignedDoctor: true,
          patient: true
        }
      });
    });

    return NextResponse.json({
      success: true,
      classification: result,
      source,
      report: updatedReport
    });
  } catch (error: any) {
    console.error('Analyze API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
