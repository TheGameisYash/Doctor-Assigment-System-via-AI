export interface ClassificationResult {
  suggestedCategory: string;
  confidence: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  keywords: string[];
  manualReviewRequired: boolean;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Cardiologist: ['ecg', 'chest pain', 'blood pressure', 'cardiac', 'heart', 'pulse', 'arrhythmia', 'palpitations', 'hypertension', 'angina'],
  Dermatologist: ['skin', 'rash', 'allergy', 'infection', 'hair loss', 'eczema', 'psoriasis', 'acne', 'dermatology', 'lesion', 'itching'],
  Orthopedic: ['bone', 'fracture', 'joint pain', 'x-ray', 'back pain', 'knee pain', 'spine', 'arthritis', 'tendon', 'sprain', 'ligament'],
  Neurologist: ['migraine', 'headache', 'seizure', 'stroke', 'nerve', 'numbness', 'dizziness', 'brain', 'tremor', 'epilepsy'],
  Gynecologist: ['pregnancy', 'ovary', 'uterus', 'menstrual', 'pelvic', 'gynecological', 'obstetrics', 'menstruation'],
  Pediatrician: ['child', 'pediatric', 'infant', 'baby', 'immunization', 'pediatrics', 'toddler'],
  'ENT Specialist': ['ear', 'nose', 'throat', 'tonsil', 'sinusitis', 'otitis', 'hearing', 'larynx', 'pharynx'],
  Diabetologist: ['glucose', 'diabetes', 'insulin', 'hba1c', 'diabetic', 'blood sugar', 'hyperglycemia'],
  'General Physician': ['fever', 'cold', 'cough', 'weakness', 'fatigue', 'general symptoms', 'nausea', 'vomiting', 'flu']
};

// Words that trigger HIGH or MEDIUM urgency
const HIGH_URGENCY_KEYWORDS = ['chest pain', 'cardiac', 'heart', 'stroke', 'seizure', 'fracture', 'angina', 'epilepsy', 'arrhythmia'];
const MEDIUM_URGENCY_KEYWORDS = ['fever', 'infection', 'glucose', 'insulin', 'hba1c', 'sinusitis', 'otitis', 'allergy', 'hypertension'];

export function classifyTranscriptFallback(transcript: string): ClassificationResult {
  const normalized = transcript.toLowerCase();
  
  const categoryHits: Record<string, { count: number; matchedKeywords: string[] }> = {};
  
  // Initialize counts
  for (const category in CATEGORY_KEYWORDS) {
    categoryHits[category] = { count: 0, matchedKeywords: [] };
  }

  // Count matches
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        categoryHits[category].count += 1;
        categoryHits[category].matchedKeywords.push(keyword);
      }
    }
  }

  // Find the category with the maximum hits
  let bestCategory = 'General Physician';
  let maxHits = 0;
  let matchedKeywords: string[] = [];

  for (const [category, data] of Object.entries(categoryHits)) {
    if (data.count > maxHits) {
      maxHits = data.count;
      bestCategory = category;
      matchedKeywords = data.matchedKeywords;
    }
  }

  // If no hits at all, search for general symptoms or default to General Physician
  if (maxHits === 0) {
    bestCategory = 'General Physician';
    // Check if any general symptoms keywords are in General Physician
    const genPhysicianData = categoryHits['General Physician'];
    matchedKeywords = genPhysicianData.matchedKeywords;
    if (matchedKeywords.length === 0) {
      matchedKeywords = ['general symptoms'];
    }
  }

  // Determine Urgency
  let urgency: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const hasHighUrgency = HIGH_URGENCY_KEYWORDS.some(kw => normalized.includes(kw));
  const hasMediumUrgency = MEDIUM_URGENCY_KEYWORDS.some(kw => normalized.includes(kw));

  if (hasHighUrgency) {
    urgency = 'HIGH';
  } else if (hasMediumUrgency) {
    urgency = 'MEDIUM';
  }

  // Calculate confidence score
  // Default is 0.5. Each match adds 0.1, capped at 0.9.
  const confidence = Math.min(0.5 + (maxHits * 0.1), 0.9);

  const reason = `Routed to ${bestCategory} based on fallback keyword matching of symptoms: ${matchedKeywords.join(', ')}.`;

  return {
    suggestedCategory: bestCategory,
    confidence,
    urgency,
    reason,
    keywords: matchedKeywords,
    manualReviewRequired: true
  };
}
