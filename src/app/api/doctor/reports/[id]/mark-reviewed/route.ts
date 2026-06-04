import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized. Doctor access required.' }, { status: 403 });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: authUser.userId }
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    // Verify report is assigned to this doctor
    const report = await prisma.patientReport.findUnique({
      where: { id }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    if (report.assignedDoctorId !== doctorProfile.id) {
      return NextResponse.json({ error: 'Forbidden. This report is not assigned to you.' }, { status: 403 });
    }

    // Perform transaction to mark as reviewed
    const updatedReport = await prisma.$transaction(async (tx) => {
      // 1. Update reviewStatus in DoctorAssignment
      await tx.doctorAssignment.updateMany({
        where: {
          reportId: id,
          doctorId: doctorProfile.id,
          reviewStatus: 'PENDING'
        },
        data: {
          reviewStatus: 'REVIEWED',
          reviewedAt: new Date()
        }
      });

      // 2. Update PatientReport status
      return tx.patientReport.update({
        where: { id },
        data: {
          status: 'REVIEWED'
        },
        include: {
          patient: true
        }
      });
    });

    return NextResponse.json({
      message: 'Report marked as reviewed.',
      report: updatedReport
    });
  } catch (error: any) {
    console.error('Mark Reviewed API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
