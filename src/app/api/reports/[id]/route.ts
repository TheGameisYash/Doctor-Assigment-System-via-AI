import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET details of a single report
export async function GET(
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
      include: {
        patient: {
          select: {
            id: true,
            userId: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
          }
        },
        assignedDoctor: {
          select: {
            id: true,
            userId: true,
            name: true,
            category: true,
            specialization: true,
          }
        },
        assignments: {
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                category: true,
                specialization: true,
              }
            }
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Role-based authorization check
    if (authUser.role === 'PATIENT') {
      if (report.patient.userId !== authUser.userId) {
        return NextResponse.json({ error: 'Forbidden. You do not own this report.' }, { status: 403 });
      }
    } else if (authUser.role === 'DOCTOR') {
      if (!report.assignedDoctor || report.assignedDoctor.userId !== authUser.userId) {
        return NextResponse.json({ error: 'Forbidden. You are not assigned to this report.' }, { status: 403 });
      }
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Get Report API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

// PATCH to manually update transcript (for Patient manual typing fallback)
export async function PATCH(
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
      include: {
        patient: true
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Only allow the patient who owns the report to edit the transcript
    if (authUser.role === 'PATIENT' && report.patient.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { reportTranscript, status } = body;

    const updateData: any = {};
    if (reportTranscript !== undefined) updateData.reportTranscript = reportTranscript;
    if (status !== undefined) updateData.status = status; // e.g. set to PROCESSING or PENDING

    const updatedReport = await prisma.patientReport.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      message: 'Report transcript updated successfully.',
      report: updatedReport
    });
  } catch (error: any) {
    console.error('Update Report Transcript Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
