import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized. Patient access required.' }, { status: 403 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;
    const phone = formData.get('phone') as string;
    const symptoms = formData.get('symptoms') as string;
    const file = formData.get('file') as File | null;

    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms are required.' }, { status: 400 });
    }

    // Get patient profile
    let patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: authUser.userId }
    });

    if (!patientProfile) {
      // Create profile if missing
      patientProfile = await prisma.patientProfile.create({
        data: {
          userId: authUser.userId,
          name: name || 'Unknown',
          age: age ? parseInt(age, 10) : 0,
          gender: gender || 'Not Specified',
          phone: phone || '',
        }
      });
    } else {
      // Update profile with form inputs if provided
      const updateData: any = {};
      if (name) updateData.name = name;
      if (age) updateData.age = parseInt(age, 10);
      if (gender) updateData.gender = gender;
      if (phone) updateData.phone = phone;

      if (Object.keys(updateData).length > 0) {
        patientProfile = await prisma.patientProfile.update({
          where: { id: patientProfile.id },
          data: updateData
        });
      }
    }

    let filePath: string | null = null;

    if (file && file.size > 0) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' }, { status: 400 });
      }

      // Upload file to Supabase Storage
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(uniqueFileName, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json({ error: `Supabase upload failed: ${uploadError.message}. Make sure you added storage policies to the bucket.` }, { status: 500 });
      }

      filePath = `/uploads/${uniqueFileName}`;
    }

    // Create report
    const report = await prisma.patientReport.create({
      data: {
        patientId: patientProfile.id,
        filePath,
        symptoms,
        reportTranscript: '', // to be filled by extraction
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      message: 'Report uploaded successfully.',
      report
    });
  } catch (error: any) {
    console.error('Upload Report API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
