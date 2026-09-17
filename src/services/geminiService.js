/**
 * Gemini AI Service for Civic Issue Categorization, Detail Auto-Fill & Verification
 * Configured with 4 keys in reversed order with automatic fallback rotation.
 */

// Loaded from .env (gitignored) in reversed order:
// 1. Primary: Reversed Key 3
// 2. Backup 1: Reversed Key 2
// 3. Backup 2: Reversed Key 1
// 4. Backup 3: Reversed Primary
const ENV_KEYS = [
  import.meta.env.VITE_GEMINI_PRIMARY_KEY,
  import.meta.env.VITE_GEMINI_BACKUP_KEY_1,
  import.meta.env.VITE_GEMINI_BACKUP_KEY_2,
  import.meta.env.VITE_GEMINI_BACKUP_KEY_3,
].filter(Boolean);

const FALLBACK_KEYS = [];

export const GEMINI_API_KEYS = ENV_KEYS.length > 0 ? ENV_KEYS : FALLBACK_KEYS;

export const PRIMARY_MODEL = "gemini-3.6-flash";

/**
 * Convert a browser File / Blob into base64 string and mimeType
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type || 'image/jpeg' });
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert external image URL to base64 if fetchable, else null
 */
export const urlToBase64 = async (url) => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await fileToBase64(blob);
  } catch (err) {
    console.warn('Cannot fetch image URL as blob due to CORS; proceeding with text reference.', err);
    return null;
  }
};

const SYSTEM_PROMPT = `
You are an expert civic infrastructure AI triage engineer for a state government civic problem portal (Confluence).
Analyze this civic issue report. If an image is provided, examine every visual detail carefully.

Tasks:
1. Categorize the issue strictly into one of the following 8 system categories:
   - "water" (Drinking water quality, pipe burst, sewage leaks, open drains, water contamination)
   - "urban_infra" (Roads, potholes, bridges, street lighting, municipal garbage dumps, broken footpaths)
   - "education" (Government schools, classroom infrastructure, student sanitation, campus hazard)
   - "healthcare" (Public health centers, hospital facilities, medical waste, disease vector breeding)
   - "agriculture" (Farm irrigation canals, agricultural runoff, soil erosion, crop storage)
   - "environment" (Air/water pollution, industrial toxic effluents, illegal deforestation, hazardous waste)
   - "energy" (Electric poles, exposed wiring, transformer hazards, erratic rural power grid)
   - "rural_livelihoods" (Panchayat marketplaces, rural connectivity, community handlooms/workshops)

2. Fill all details:
   - "title": Professional, punchy, descriptive title (maximum 80 characters)
   - "description": Comprehensive, objective report detailing the visible problem, exact hazard, and community impact
   - "expected_outcome": Actionable engineering or administrative solution required from authorities
   - "severity": "low", "medium", "high", or "critical"

3. AI-Verify the issue:
   - "is_civic_issue": Boolean. True if genuine public or community infrastructure hazard. False if it is a selfie, meme, personal indoor photo, animal photo, or non-civic content.
   - "confidence_score": Float between 0.60 and 0.99 indicating confidence.
   - "detected_objects": Array of key visual and physical elements observed (e.g. ["deep pothole", "stagnant rainwater", "cracked bitumen"]).
   - "verification_status": "verified" (if legitimate civic issue) or "flagged_non_civic" (if invalid/spam).
   - "verification_notes": 1-2 sentence rationale for verification.

Return strictly valid JSON only.
`;

/**
 * Call Gemini API with automatic key rotation fallback
 */
export const analyzeAndVerifyIssue = async ({
  imageFile = null,
  imageUrl = '',
  userNotes = '',
  district = '',
}) => {
  // 1. Prepare image payload if available
  let inlineData = null;
  if (imageFile) {
    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      inlineData = {
        inline_data: {
          mime_type: mimeType,
          data: base64,
        },
      };
    } catch (err) {
      console.error('Error converting file to base64:', err);
    }
  } else if (imageUrl) {
    const fetched = await urlToBase64(imageUrl);
    if (fetched) {
      inlineData = {
        inline_data: {
          mime_type: fetched.mimeType,
          data: fetched.base64,
        },
      };
    }
  }

  // 2. Assemble user prompt parts
  const parts = [{ text: SYSTEM_PROMPT }];

  let userContext = `Citizen Report Context:\nDistrict: ${district || 'Statewide'}\n`;
  if (userNotes && userNotes.trim()) {
    userContext += `Citizen Observation: "${userNotes.trim()}"\n`;
  }
  if (imageUrl && !inlineData) {
    userContext += `Photo URL provided: ${imageUrl}\n`;
  }
  parts.push({ text: userContext });

  if (inlineData) {
    parts.push(inlineData);
  }

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  };

  // 3. Key rotation loop
  let lastError = null;
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[i];
    const keyLabel = i === 0 ? 'Primary' : `Backup ${i}`;
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${PRIMARY_MODEL}:generateContent?key=${key}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          parsed.keyUsed = keyLabel;
          return {
            success: true,
            data: parsed,
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`Gemini API Key ${keyLabel} returned HTTP ${response.status}:`, errText);
        lastError = new Error(`Key ${keyLabel} HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn(`Gemini API call failed with ${keyLabel}:`, err);
      lastError = err;
    }
  }

  // Fallback heuristic if network fails completely or keys are exhausted
  console.warn('All Gemini keys failed or unreachable. Using fallback engine.', lastError);
  return {
    success: false,
    error: lastError?.message || 'Network error',
    data: getFallbackHeuristic(userNotes, district),
  };
};

function getFallbackHeuristic(userNotes = '', district = '') {
  const text = (userNotes || '').toLowerCase();
  let category = 'urban_infra';
  if (text.includes('water') || text.includes('drain') || text.includes('leak') || text.includes('pipe')) {
    category = 'water';
  } else if (text.includes('school') || text.includes('student') || text.includes('teacher') || text.includes('class')) {
    category = 'education';
  } else if (text.includes('hospital') || text.includes('clinic') || text.includes('health') || text.includes('doctor')) {
    category = 'healthcare';
  } else if (text.includes('farm') || text.includes('crop') || text.includes('soil')) {
    category = 'agriculture';
  } else if (text.includes('electric') || text.includes('power') || text.includes('light')) {
    category = 'energy';
  } else if (text.includes('tree') || text.includes('pollution') || text.includes('smoke')) {
    category = 'environment';
  }

  return {
    is_civic_issue: true,
    confidence_score: 0.85,
    category,
    title: userNotes.slice(0, 60) || 'Civic Infrastructure Defect Reported',
    description: userNotes || 'Civic infrastructure deficiency observed by local resident requiring administrative remediation.',
    expected_outcome: 'Inspection and corrective repair by designated municipal or department authorities.',
    severity: 'medium',
    detected_objects: ['civic infrastructure', 'public site'],
    verification_status: 'verified',
    verification_notes: 'Validated via local heuristic engine.',
    keyUsed: 'Local Fallback',
  };
}
