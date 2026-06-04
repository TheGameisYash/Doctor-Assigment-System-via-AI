import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { extractTextFromImage } from '@/lib/ocr';
import { extractTextFromPDF } from '@/lib/pdfParser';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await prisma.patientReport.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Auth check: patient must own the report, or admin/doctor
    if (authUser.role === 'PATIENT' && report.patient.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!report.filePath) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded with this report. Please provide manual transcript.'
      });
    }

    const filename = report.filePath.replace('/uploads/', '');

    // Read file from Supabase Storage
    let fileBuffer: Buffer;
    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('medical-reports')
        .download(filename);

      if (downloadError || !fileData) {
        throw new Error(downloadError?.message || 'File not found in storage');
      }

      const arrayBuffer = await fileData.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } catch (err: any) {
      console.error('Failed to download file from Supabase for OCR:', err);
      return NextResponse.json({
        success: false,
        error: `Uploaded file could not be found in cloud storage: ${err.message}. Please provide manual transcript.`
      });
    }

    let extractedText = '';

    // Determine type
    const isPDF = report.filePath.toLowerCase().endsWith('.pdf');
    const isImage = report.filePath.toLowerCase().endsWith('.jpg') || 
                    report.filePath.toLowerCase().endsWith('.jpeg') || 
                    report.filePath.toLowerCase().endsWith('.png');

    try {
      if (isPDF) {
        extractedText = await extractTextFromPDF(fileBuffer);
      } else if (isImage) {
        extractedText = await extractTextFromImage(fileBuffer); // Tesseract can read directly from buffer
      } else {
        return NextResponse.json({
          success: false,
          error: 'Unsupported file format. Please write transcript manually.'
        });
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('Extracted text is empty.');
      }

      // Update report status
      const updatedReport = await prisma.patientReport.update({
        where: { id },
        data: {
          reportTranscript: extractedText,
          status: 'PROCESSING'
        }
      });

      return NextResponse.json({
        success: true,
        transcript: extractedText,
        report: updatedReport
      });
    } catch (extractionError: any) {
      console.error('Text extraction failed:', extractionError);
      return NextResponse.json({
        success: false,
        error: `Text extraction failed: ${extractionError.message || extractionError}. Please write transcript manually.`
      });
    }
  } catch (error: any) {
    console.error('Extract Text API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
