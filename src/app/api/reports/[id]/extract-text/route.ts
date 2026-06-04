import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
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

    const fullPath = path.join(process.cwd(), report.filePath);

    // Verify file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Uploaded file could not be found on server disk. Please provide manual transcript.'
      });
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath);
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
        extractedText = await extractTextFromImage(fullPath); // Tesseract can read directly from path
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
