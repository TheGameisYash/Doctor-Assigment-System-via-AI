import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.cookies.set({
        name: 'token',
        value: '',
        httpOnly: true,
        path: '/',
        expires: new Date(0),
      });
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      response.cookies.set({
        name: 'token',
        value: '',
        httpOnly: true,
        path: '/',
        expires: new Date(0),
      });
      return response;
    }

    const profile = user.role === 'PATIENT' ? user.patientProfile : user.role === 'DOCTOR' ? user.doctorProfile : null;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profile,
      },
    });
  } catch (error: any) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to clear auth token (logout)
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0), // expire immediately
  });

  return response;
}
