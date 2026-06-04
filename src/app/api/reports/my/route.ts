import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized. Patient access required.' }, { status: 403 });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: authUser.userId }
    });

    if (!patientProfile) {
      return NextResponse.json({ reports: [] });
    }

    const reports = await prisma.patientReport.findMany({
      where: { patientId: patientProfile.id },
      include: {
        assignedDoctor: {
          select: {
            id: true,
            name: true,
            category: true,
            specialization: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Get My Reports API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
