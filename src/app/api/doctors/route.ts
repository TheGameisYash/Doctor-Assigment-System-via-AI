import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser, hashPassword } from '@/lib/auth';

// GET all doctors (Admin only)
export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ doctors });
  } catch (error: any) {
    console.error('Get Doctors API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new doctor (Admin only)
export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, category, specialization, experience } = body;

    if (!email || !password || !name || !category || !specialization || experience === undefined) {
      return NextResponse.json(
        { error: 'All fields (email, password, name, category, specialization, experience) are required.' },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create doctor in transaction
    const newDoctorUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'DOCTOR',
        doctorProfile: {
          create: {
            name,
            category,
            specialization,
            experience: parseInt(experience, 10),
            available: true,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        doctorProfile: true,
      },
    });

    return NextResponse.json({
      message: 'Doctor profile created successfully.',
      doctor: newDoctorUser.doctorProfile,
    });
  } catch (error: any) {
    console.error('Create Doctor API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
