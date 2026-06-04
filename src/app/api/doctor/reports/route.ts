import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized. Doctor access required.' }, { status: 403 });
    }

    // Find doctor profile
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: authUser.userId }
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    const reports = await prisma.patientReport.findMany({
      where: { assignedDoctorId: doctorProfile.id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Doctor Get Reports API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
