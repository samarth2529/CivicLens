import { ExtractedEntity, VerificationIssue, ApplicationDraft, CheckedFieldPass } from '../types';

export interface ExtractResponse {
  success: boolean;
  programType?: string;
  entities: ExtractedEntity[];
  rawInsights?: string;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  issues: VerificationIssue[];
  passedChecks?: CheckedFieldPass[];
  deterministicSummary: {
    totalChecked: number;
    passed: number;
    flagged: number;
  };
  error?: string;
}

export interface FinalizeResponse {
  success: boolean;
  draft: ApplicationDraft;
  error?: string;
}

export async function extractPaperwork(formData: FormData): Promise<ExtractResponse> {
  const response = await fetch('/api/extract', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Extraction service failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function runVerification(data: {
  entities: ExtractedEntity[];
  userPrompt: string;
  programType?: string;
}): Promise<VerifyResponse> {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Verification engine failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function generateFinalDraft(data: {
  entities: ExtractedEntity[];
  resolvedIssues: VerificationIssue[];
  programType?: string;
  userPrompt?: string;
  documents?: { name: string; type?: string }[];
}): Promise<FinalizeResponse> {
  const response = await fetch('/api/generate-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Draft compilation failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}
