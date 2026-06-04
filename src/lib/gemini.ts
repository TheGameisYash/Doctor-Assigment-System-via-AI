import { GoogleGenerativeAI } from '@google/generative-ai';
import { classifyTranscriptFallback, ClassificationResult } from './fallbackClassifier';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const USE_GEMINI = process.env.USE_GEMINI === 'true';

export async function classifyTranscript(
  transcript: string
): Promise<{ result: ClassificationResult; source: 'GEMINI_FLASH' | 'FALLBACK_RULE_ENGINE' }> {
  if (!USE_GEMINI || !GEMINI_API_KEY) {
    console.log('Gemini is disabled or key is missing. Using Fallback Keyword Classifier.');
    return {
      result: classifyTranscriptFallback(transcript),
      source: 'FALLBACK_RULE_ENGINE',
    };
  }

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting Gemini AI classification with model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `You are a medical report routing assistant. Given the following patient symptoms and medical report transcript, you must read and analyze the entire text in detail. Based on the complete context, classify the case into ONE of these doctor categories: 
General Physician, Cardiologist, Dermatologist, Orthopedic, Neurologist, Gynecologist, Pediatrician, ENT Specialist, Diabetologist.

Rules:
- Do NOT diagnose the patient.
- Do NOT recommend any medicine or treatment.
- Read the full transcript carefully, identifying key clinical terms, patient symptoms, lab results, and diagnostic notes.
- Only return a JSON object with this exact structure:
{
  "suggestedCategory": "<category name>",
  "confidence": <0.0 to 1.0>,
  "urgency": "<LOW | MEDIUM | HIGH>",
  "reason": "<one sentence explaining routing logic based on the full text>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "manualReviewRequired": <true | false>
}

Patient Case Details:
${transcript}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse response
      const parsed = JSON.parse(responseText.trim());
      
      // Validate response structure
      const validCategories = [
        'General Physician',
        'Cardiologist',
        'Dermatologist',
        'Orthopedic',
        'Neurologist',
        'Gynecologist',
        'Pediatrician',
        'ENT Specialist',
        'Diabetologist'
      ];

      let suggestedCategory = parsed.suggestedCategory;
      
      if (suggestedCategory && !validCategories.includes(suggestedCategory)) {
        const matched = validCategories.find(c => c.toLowerCase() === suggestedCategory.toLowerCase());
        suggestedCategory = matched || 'General Physician';
      }

      if (
        parsed &&
        typeof suggestedCategory === 'string' &&
        typeof parsed.confidence === 'number' &&
        ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.urgency) &&
        typeof parsed.reason === 'string' &&
        Array.isArray(parsed.keywords)
      ) {
        return {
          result: {
            suggestedCategory,
            confidence: parsed.confidence,
            urgency: parsed.urgency,
            reason: parsed.reason,
            keywords: parsed.keywords,
            manualReviewRequired: parsed.manualReviewRequired ?? true,
          },
          source: 'GEMINI_FLASH',
        };
      }
      
      throw new Error('Gemini response did not match the expected JSON structure.');
    } catch (error: any) {
      console.warn(`Gemini call failed with model ${modelName}:`, error.message || error);
      lastError = error;
      
      // If API key is invalid, don't bother trying other models
      const errMsg = (error.message || '').toLowerCase();
      if (errMsg.includes('api key not valid') || errMsg.includes('api_key_invalid') || errMsg.includes('key not valid')) {
        break;
      }
    }
  }

  console.error('All Gemini AI classification models failed, using fallback keyword router:', lastError);
  return {
    result: classifyTranscriptFallback(transcript),
    source: 'FALLBACK_RULE_ENGINE',
  };
}
