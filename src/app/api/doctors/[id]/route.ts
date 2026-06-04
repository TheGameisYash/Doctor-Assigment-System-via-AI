import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET doctor by ID
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

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error: any) {
    console.error('Get Doctor by ID Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update doctor profile (Admin only)
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
    const { name, category, specialization, experience, available, status } = body;

    // Verify doctor profile exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (experience !== undefined) updateData.experience = parseInt(experience, 10);
    if (available !== undefined) updateData.available = available;
    if (status !== undefined) updateData.status = status;

    const updatedDoctor = await prisma.doctorProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Doctor profile updated successfully.',
      doctor: updatedDoctor,
    });
  } catch (error: any) {
    console.error('Update Doctor API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
