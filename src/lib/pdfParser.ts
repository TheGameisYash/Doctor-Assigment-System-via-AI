// Polyfill DOMMatrix for node environments as pdf-parse attempts to evaluate it at module level load
if (typeof global !== 'undefined') {
  if (!(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
}

// @ts-ignore
const pdfModule = require('pdf-parse');

/**
 * Extracts text from a PDF file buffer using pdf-parse (v2+).
 * @param pdfBuffer Buffer containing the PDF file data
 * @returns Extracted text string
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array as required by pdfjs-dist internally
    const uint8Array = new Uint8Array(pdfBuffer);
    const parser = new pdfModule.PDFParse(uint8Array);
    await parser.load();
    const text = await parser.getText();
    return text || '';
  } catch (error: any) {
    console.error('PDF Text Extraction Error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message || error}`);
  }
}
