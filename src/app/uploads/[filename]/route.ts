import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const dbFilePath = `/uploads/${filename}`;

    // Find the report associated with this file
    const report = await prisma.patientReport.findFirst({
      where: { filePath: dbFilePath },
      include: {
        patient: true,
        assignedDoctor: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'File reference not found in database.' }, { status: 404 });
    }

    // Enforce role-based access control (RBAC) security on files
    if (authUser.role === 'PATIENT') {
      if (report.patient.userId !== authUser.userId) {
        return NextResponse.json({ error: 'Forbidden. You do not own this report.' }, { status: 403 });
      }
    } else if (authUser.role === 'DOCTOR') {
      if (!report.assignedDoctor || report.assignedDoctor.userId !== authUser.userId) {
        return NextResponse.json({ error: 'Forbidden. You are not assigned to this case.' }, { status: 403 });
      }
    }
    // ADMIN has full access

    // Resolve file on disk
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    const fullPath = path.join(uploadDir, filename);

    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json({ error: 'Physical file not found on disk.' }, { status: 404 });
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath);

    // Determine correct content type
    let contentType = 'application/octet-stream';
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'pdf') {
      contentType = 'application/pdf';
    } else if (ext === 'png') {
      contentType = 'image/png';
    } else if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg';
    }

    // Serve file inline in the browser
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Serve uploaded file API error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
