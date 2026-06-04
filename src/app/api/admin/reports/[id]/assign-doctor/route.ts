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
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { doctorId } = body;

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId is required.' }, { status: 400 });
    }

    // Verify report exists
    const report = await prisma.patientReport.findUnique({
      where: { id }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    // Verify doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    // Perform update and create assignment log inside transaction
    const updatedReport = await prisma.$transaction(async (tx) => {
      // 1. Create doctor assignment
      await tx.doctorAssignment.create({
        data: {
          reportId: id,
          doctorId,
          assignedBy: 'ADMIN',
          reviewStatus: 'PENDING',
        }
      });

      // 2. Update patient report status and doctor id
      return tx.patientReport.update({
        where: { id },
        data: {
          assignedDoctorId: doctorId,
          status: 'ASSIGNED',
        },
        include: {
          assignedDoctor: true,
          patient: true
        }
      });
    });

    return NextResponse.json({
      message: 'Doctor assigned successfully by Admin.',
      report: updatedReport
    });
  } catch (error: any) {
    console.error('Assign Doctor API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
