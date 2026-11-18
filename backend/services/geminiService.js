import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { ISSUE_CATEGORIES, SEVERITY_LEVELS } from '../config/constants.js';

let aiClient = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
};

export const isGeminiConfigured = () => {
  return Boolean(process.env.GEMINI_API_KEY);
};

export const analyzeReportWithGemini = async ({
  filePath,
  mimeType = 'image/jpeg',
  userDescription = '',
  userCategory = ''
}) => {
  const client = getClient();
  if (!client) {
    return {
      available: false,
      message: 'AI analysis is currently unavailable. You can continue with manual complaint submission.'
    };
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const prompt = `You are the CivicLens AI municipal complaint analysis engine. Your role is to provide objective, preliminary visual assessment of reported civic and environmental issues in urban areas (specifically Karachi, Pakistan).

RULES:
1. Base your assessment ONLY on directly visible physical evidence in the photograph and the user's description.
2. Avoid unsupported assumptions. Distinguish observed physical evidence from speculative conclusions.
3. Categorize the issue strictly into one of the following exact categories:
${ISSUE_CATEGORIES.map((c) => `   - "${c}"`).join('\n')}
4. Suggest a severity level strictly from:
${SEVERITY_LEVELS.map((s) => `   - "${s}"`).join('\n')}
5. Recommend a municipal department (e.g., "Sanitation and Solid Waste Management", "Municipal Drainage", "Water Supply and Sewerage", "Road Maintenance", "Municipal Electrical Services", "Environmental Protection").
6. Provide an objective summary of visible evidence, suggested immediate action, and a confidence score between 0 and 100.
7. CRITICAL SAFETY AND INTEGRITY:
   - NEVER identify individual people who may appear in the photograph.
   - NEVER claim to confirm a legal violation or determine official culpability.
   - NEVER attempt to infer exact geographical coordinates or private addresses from the image.
   - ALWAYS set requiresHumanReview to true.

User provided description: "${userDescription || 'No description provided'}"
User provided category hint: "${userCategory || 'None'}"

You must respond in valid, unformatted JSON matching this exact structure:
{
  "issueCategory": "string",
  "issueDescription": "string",
  "severitySuggestion": "Low | Medium | High | Critical | Unknown",
  "recommendedDepartment": "string",
  "suggestedAction": "string",
  "confidence": 85,
  "requiresHumanReview": true
}`;

    const contents = [{ text: prompt }];

    // If an image file path is provided, read and attach as inline data
    if (filePath && fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Data
        }
      });
    }

    const response = await client.models.generateContent({
      model,
      contents
    });

    const text = response?.text?.trim() || '';

    // Strip markdown code fences if wrapped in ```json ... ```
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      // Fallback regex extraction if model returned surrounding commentary
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response from Gemini');
      }
    }

    // Validate category and severity against allowed enums
    const validCategory = ISSUE_CATEGORIES.includes(parsed.issueCategory)
      ? parsed.issueCategory
      : userCategory || 'Other Municipal Issue';

    const validSeverity = SEVERITY_LEVELS.includes(parsed.severitySuggestion)
      ? parsed.severitySuggestion
      : 'Unknown';

    return {
      available: true,
      analysis: {
        issueCategory: validCategory,
        issueDescription: parsed.issueDescription || userDescription || 'Visual analysis completed.',
        severitySuggestion: validSeverity,
        recommendedDepartment: parsed.recommendedDepartment || 'General Municipal Administration',
        suggestedAction: parsed.suggestedAction || 'Deploy municipal inspection team.',
        confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0), 100) : 75,
        requiresHumanReview: true,
        rawAnalysis: text,
        analyzedAt: new Date()
      }
    };
  } catch (error) {
    console.error('[Gemini Service Error]', error.message);
    return {
      available: false,
      message: 'AI analysis is currently unavailable. You can continue with manual complaint submission.'
    };
  }
};
