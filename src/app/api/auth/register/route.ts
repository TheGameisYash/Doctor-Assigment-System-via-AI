import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, age, gender, phone } = body;

    // Validate inputs
    if (!email || !password || !name || !age || !gender || !phone) {
      return NextResponse.json(
        { error: 'All fields (email, password, name, age, gender, phone) are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and profile in a transaction
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'PATIENT',
        patientProfile: {
          create: {
            name,
            age: parseInt(age, 10),
            gender,
            phone,
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });

    // Generate JWT
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
    const token = signJWT(tokenPayload);

    // Set HTTP-only Cookie
    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.patientProfile,
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
