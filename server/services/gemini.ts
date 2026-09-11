import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

export interface ExtractedEntityResult {
  id: string;
  field: string;
  label: string;
  category: 'applicant_identity' | 'residence_property' | 'financial_income' | 'claim_request' | 'supporting_dates';
  value: string;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  sourceDocName?: string;
  sourceSnippet?: string;
}

export interface ExtractionResult {
  programType: string;
  intentSummary: string;
  entities: ExtractedEntityResult[];
  missingInformationNote?: string;
}

export async function extractWithGemini(
  prompt: string,
  files: { originalname: string; buffer: Buffer; mimetype: string }[],
  programType?: string
): Promise<ExtractionResult> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('GEMINI LIVE TEST BLOCKED — API key not configured. Please set GEMINI_API_KEY in the server environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  try {

    const systemInstruction = `
You are CivicLens, a high-precision civic paperwork extraction engine.
Your role is purely EVIDENCE EXTRACTION (Understanding). A separate deterministic engine will independently verify the facts.

RULES:
1. Inspect all supplied document images, PDFs, and the user's natural language request.
2. Identify all relevant civic fields (such as applicant name, date of birth, addresses, incident dates, monetary loss, household size, ID numbers).
3. PRESERVE EXACT VALUES: Do not normalize, assume, or fabricate values.
4. MULTIPLE DOCUMENTS: If different documents contain different or conflicting values (e.g. Document 1 says "Elena Vance", Document 2 says "Elena M Vance", or Document 1 says "104 Oak St", Document 2 says "742 Maple Ave"), EXTRACT BOTH DISTINCT ENTITIES with their respective sourceDocName and sourceSnippet.
5. PROVENANCE: Every extracted entity MUST cite its exact sourceDocName (e.g. filename or "Natural Language Request") and a verbatim sourceSnippet.
6. CONFIDENCE: Assign a realistic extraction confidence score between 0.0 and 1.0 (where >= 0.85 is high, 0.70-0.84 is medium, < 0.70 is low).
7. DO NOT VERIFY OR DECLARE CONFLICTS: Simply extract what each document actually states.

RETURN ONLY VALID JSON matching this schema:
{
  "programType": "Identified civic grant or program name",
  "intentSummary": "1-2 sentence summary of applicant request",
  "entities": [
    {
      "id": "ent-1",
      "field": "applicant_name",
      "label": "Primary Applicant Name",
      "category": "applicant_identity",
      "value": "Extracted text verbatim",
      "confidence": 0.95,
      "confidenceLevel": "high",
      "sourceDocName": "filename.pdf",
      "sourceSnippet": "verbatim text snippet"
    }
  ],
  "missingInformationNote": "Any standard civic items conspicuously absent from the documents"
}
`;

    // Construct multimodal content parts
    const contentParts: (string | Part)[] = [
      systemInstruction,
      `User Natural Language Request: ${prompt || 'Please extract all relevant information from these documents.'}\nTarget Program: ${programType || 'Civic Assistance Program'}\n\nAttached Documents Count: ${files.length}`,
    ];

    // Add actual binary content for each file
    for (const file of files) {
      let mime = file.mimetype;
      // Normalization for common image/document formats
      if (!mime || mime === 'application/octet-stream') {
        const lowerName = file.originalname.toLowerCase();
        if (lowerName.endsWith('.png')) mime = 'image/png';
        else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mime = 'image/jpeg';
        else if (lowerName.endsWith('.webp')) mime = 'image/webp';
        else if (lowerName.endsWith('.pdf')) mime = 'application/pdf';
        else mime = 'image/jpeg';
      }

      if (mime.startsWith('image/') || mime === 'application/pdf') {
        contentParts.push({
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: mime,
          },
        });
        contentParts.push(`Document Label: ${file.originalname}`);
      } else {
        // Text files
        contentParts.push(`Document Content (${file.originalname}):\n${file.buffer.toString('utf-8')}`);
      }
    }

    // Attempt generation with primary model and automatic fallback on transient 503/429
    const candidateModels = [
      modelName,
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.5-flash',
    ].filter((v, i, a) => a.indexOf(v) === i);

    let responseText = '';
    let lastError: any = null;

    for (const currModel of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: currModel,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const result = await model.generateContent(contentParts);
        const response = await result.response;
        responseText = response.text();
        if (responseText && responseText.trim()) {
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Extraction] Model ${currModel} failed: ${err.message}. Trying next candidate...`);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    if (!responseText || responseText.trim() === '') {
      throw lastError || new Error('Gemini returned an empty response.');
    }

    const parsed = JSON.parse(responseText);

    // Validate structured format
    if (!parsed || !Array.isArray(parsed.entities)) {
      throw new Error('Malformed Gemini response: missing entities array.');
    }

    // Sanitize and ensure complete entity types
    const validatedEntities: ExtractedEntityResult[] = parsed.entities.map((e: any, idx: number) => {
      const conf = typeof e.confidence === 'number' ? Math.max(0, Math.min(1, e.confidence)) : 0.85;
      const confLevel = conf >= 0.85 ? 'high' : conf >= 0.7 ? 'medium' : 'low';

      return {
        id: e.id || `ent-live-${idx + 1}`,
        field: String(e.field || `field_${idx + 1}`),
        label: String(e.label || e.field || `Extracted Field ${idx + 1}`),
        category: ['applicant_identity', 'residence_property', 'financial_income', 'claim_request', 'supporting_dates'].includes(e.category)
          ? e.category
          : 'applicant_identity',
        value: String(e.value || ''),
        confidence: conf,
        confidenceLevel: confLevel,
        sourceDocName: e.sourceDocName ? String(e.sourceDocName) : (files[0]?.originalname || 'Uploaded Document'),
        sourceSnippet: e.sourceSnippet ? String(e.sourceSnippet) : undefined,
      };
    });

    return {
      programType: parsed.programType || programType || 'Civic Assistance Application',
      intentSummary: parsed.intentSummary || 'Applicant submission for civic assistance',
      entities: validatedEntities,
      missingInformationNote: parsed.missingInformationNote,
    };
  } catch (error: any) {
    console.error('[Gemini Service Error]:', error);
    // Preserve clear error message
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      throw new Error('Invalid Gemini API Key provided. Please verify GEMINI_API_KEY.');
    }
    if (error.message?.includes('GEMINI LIVE TEST BLOCKED')) {
      throw error;
    }
    throw new Error(`Gemini Multimodal Extraction failed: ${error.message || 'Unknown API error'}`);
  }
}
