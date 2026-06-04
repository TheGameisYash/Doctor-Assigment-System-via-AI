import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image file (local path or buffer) using Tesseract OCR.
 * @param imagePathOrBuffer Path to the image file or a buffer containing image data
 * @returns Extracted text string
 */
export async function extractTextFromImage(imagePathOrBuffer: string | Buffer): Promise<string> {
  try {
    const result = await Tesseract.recognize(imagePathOrBuffer, 'eng');
    return result.data.text;
  } catch (error: any) {
    console.error('OCR Extraction Error:', error);
    throw new Error(`Failed to extract text from image: ${error.message || error}`);
  }
}
