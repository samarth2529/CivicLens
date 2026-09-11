export type PipelineStage = 'INPUT' | 'UNDERSTAND' | 'VERIFY' | 'READY';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type DocumentType = 
  | 'utility_bill'
  | 'lease_agreement'
  | 'paystub'
  | 'id_card'
  | 'handwritten_note'
  | 'tax_form'
  | 'medical_bill'
  | 'other';

export interface DocumentUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  docType?: DocumentType;
  previewUrl?: string;
  file?: File;
  status: 'pending' | 'processing' | 'extracted' | 'error';
  extractedText?: string;
  uploadedAt: string;
}

export interface ExtractedEntity {
  id: string;
  field: string;
  label: string;
  category: 'applicant_identity' | 'residence_property' | 'financial_income' | 'claim_request' | 'supporting_dates';
  value: string;
  confidence: number; // 0.0 to 1.0
  confidenceLevel: ConfidenceLevel;
  sourceDocId?: string;
  sourceDocName?: string;
  sourceSnippet?: string;
  isFlagged?: boolean;
}

export type IssueSeverity = 'critical' | 'warning' | 'info';

export type IssueType = 
  | 'conflict' // Value differs between two documents
  | 'missing' // Mandatory field missing for this application type
  | 'low_confidence' // Gemini extraction confidence below safety threshold
  | 'format_mismatch' // Format mismatch (e.g. invalid date or SSN pattern)
  | 'ineligible_threshold'; // Value exceeds programmatic rule threshold

export interface VerificationIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  affectedFields: string[];
  docReferences?: { docId: string; docName: string; valueFound: string }[];
  resolutionOptions?: {
    id: string;
    label: string;
    description: string;
    actionValue: string;
  }[];
  resolved: boolean;
  resolvedValue?: string;
  resolvedReason?: string;
  resolvedAt?: string;
}

export interface CheckedFieldPass {
  field: string;
  label: string;
  verifiedValue: string;
  sourceDocName: string;
  ruleApplied: string;
  concordanceScore: number;
}

export interface ApplicationDraft {
  applicationId: string;
  targetProgram: string;
  programCategory: string;
  generatedAt: string;
  applicant: {
    fullName: string;
    dob?: string;
    ssnLast4?: string;
    currentAddress: string;
    phone?: string;
    email?: string;
  };
  details: Record<string, any>;
  supportingDocuments: {
    docName: string;
    docType: string;
    status: string;
  }[];
  verificationAuditTrail: {
    totalFieldsChecked: number;
    issuesFound: number;
    issuesResolved: number;
    deterministicEngineVersion: string;
    auditedAt: string;
    resolvedIssues: {
      issueTitle: string;
      resolutionChosen: string;
      resolvedBy: 'human_operator';
      timestamp: string;
    }[];
  };
  signatureBlock: {
    requiresSignature: boolean;
    signedBy?: string;
    signedDate?: string;
  };
}

export interface PresetDemo {
  id: string;
  title: string;
  category: string;
  description: string;
  userPrompt: string;
  sampleDocuments: {
    id: string;
    name: string;
    type: DocumentType;
    snippet: string;
    previewPlaceholder?: string;
  }[];
  expectedIssuesCount: number;
  simulatedEntities: ExtractedEntity[];
  simulatedIssues: VerificationIssue[];
  simulatedPassedChecks: CheckedFieldPass[];
}
