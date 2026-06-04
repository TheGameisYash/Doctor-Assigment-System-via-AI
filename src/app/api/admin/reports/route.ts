import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const reports = await prisma.patientReport.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
          }
        },
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
    console.error('Admin Get Reports API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
