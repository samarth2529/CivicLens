export interface ExtractedEntityInput {
  id: string;
  field: string;
  label: string;
  category: string;
  value: string;
  confidence: number;
  confidenceLevel?: 'high' | 'medium' | 'low';
  sourceDocName?: string;
  sourceSnippet?: string;
}

export interface VerificationIssueOutput {
  id: string;
  type: 'conflict' | 'missing' | 'low_confidence' | 'format_mismatch' | 'ineligible_threshold';
  severity: 'critical' | 'warning' | 'info';
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

export interface CheckedFieldPassOutput {
  field: string;
  label: string;
  verifiedValue: string;
  sourceDocName: string;
  ruleApplied: string;
  concordanceScore: number;
}

export function runDeterministicVerification(
  entities: ExtractedEntityInput[],
  _userPrompt: string,
  _programType?: string
): {
  issues: VerificationIssueOutput[];
  passedChecks: CheckedFieldPassOutput[];
  summary: { totalChecked: number; passed: number; flagged: number };
} {
  const issues: VerificationIssueOutput[] = [];
  const passedChecks: CheckedFieldPassOutput[] = [];
  let totalChecked = 0;

  // Group entities by conceptual category / normalized field family
  const fieldGroups = new Map<string, ExtractedEntityInput[]>();
  entities.forEach((ent) => {
    const field = ent.field.toLowerCase();
    let normalizedKey = field;

    if (field.includes('dob') || field.includes('birth')) {
      normalizedKey = 'date_of_birth';
    } else if (field.includes('ssn') || field.includes('state_id') || field.includes('license') || field.includes('id_num')) {
      normalizedKey = 'id_number';
    } else if (field.includes('phone') || field.includes('tel')) {
      normalizedKey = 'phone';
    } else if (field.includes('email')) {
      normalizedKey = 'email';
    } else if (field.includes('name') || field === 'applicant') {
      normalizedKey = 'applicant_name';
    } else if (field.includes('address') || field.includes('residence') || field.includes('street') || field.includes('domicile')) {
      normalizedKey = 'residential_address';
    } else if (field.includes('incident') || field.includes('disaster_date')) {
      normalizedKey = 'incident_date';
    } else if (field.includes('income') || field.includes('loss') || field.includes('amount') || field.includes('claim')) {
      normalizedKey = 'financial_amount';
    } else {
      normalizedKey = ent.field;
    }

    if (!fieldGroups.has(normalizedKey)) {
      fieldGroups.set(normalizedKey, []);
    }
    fieldGroups.get(normalizedKey)!.push(ent);
  });

  // 1. Mandatory Identity Check
  totalChecked++;
  const nameEntities = fieldGroups.get('applicant_name') || [];
  if (nameEntities.length === 0 || !nameEntities.some((e) => e.value && e.value.trim())) {
    issues.push({
      id: 'iss-det-missing-name',
      type: 'missing',
      severity: 'critical',
      title: 'Mandatory Applicant Legal Name Missing',
      description: 'The applicant legal identity was not deterministically found in the provided paperwork.',
      affectedFields: ['applicant_name'],
      resolutionOptions: [
        {
          id: 'opt-name-self',
          label: 'Provide Applicant Legal Name',
          description: 'Enter verified legal name directly for application filing.',
          actionValue: 'Operator-Affirmed Applicant Legal Name',
        },
      ],
      resolved: false,
    });
  }

  // 2. Generic Cross-Document Conflict Checker across all field groups
  fieldGroups.forEach((groupEntities, groupKey) => {
    totalChecked++;

    // Collect distinct values across documents
    const distinctValues = new Map<string, ExtractedEntityInput[]>();
    groupEntities.forEach((ent) => {
      const cleanVal = ent.value.trim().toLowerCase();
      if (cleanVal) {
        if (!distinctValues.has(cleanVal)) {
          distinctValues.set(cleanVal, []);
        }
        distinctValues.get(cleanVal)!.push(ent);
      }
    });

    if (distinctValues.size > 1) {
      // Discrepancy detected between records
      const sampleEntities = Array.from(distinctValues.values()).map((list) => list[0]);
      const fieldTitle = sampleEntities[0].label || groupKey.replace(/_/g, ' ');
      const isCritical = ['applicant_name', 'residential_address', 'date_of_birth'].includes(groupKey);

      const docRefs = sampleEntities.map((e, idx) => ({
        docId: `doc-${idx + 1}`,
        docName: e.sourceDocName || `Document ${idx + 1}`,
        valueFound: e.value,
      }));

      const resolutionOptions = sampleEntities.map((e, idx) => ({
        id: `opt-${groupKey}-${idx + 1}`,
        label: `Affirm "${e.value}" (${e.sourceDocName || 'Record'})`,
        description: `Use "${e.value}" as the confirmed value; note discrepancy on file.`,
        actionValue: e.value,
      }));

      issues.push({
        id: `iss-det-conflict-${groupKey}`,
        type: 'conflict',
        severity: isCritical ? 'critical' : 'warning',
        title: `${fieldTitle} Discrepancy Across Documents`,
        description: `Different values detected across supplied records: ${sampleEntities.map(e => `"${e.value}" in ${e.sourceDocName || 'Doc'}`).join(' vs ')}. Confirm the single verified value.`,
        affectedFields: sampleEntities.map((e) => e.field),
        docReferences: docRefs,
        resolutionOptions,
        resolved: false,
      });
    } else if (distinctValues.size === 1) {
      const representative = groupEntities[0];
      passedChecks.push({
        field: representative.field,
        label: representative.label || groupKey.replace(/_/g, ' '),
        verifiedValue: representative.value,
        sourceDocName: representative.sourceDocName || 'Supplied Documentation',
        ruleApplied: `Deterministic Concordance Verification (${groupEntities.length} record${groupEntities.length > 1 ? 's' : ''} evaluated)`,
        concordanceScore: 1.0,
      });
    }
  });

  // 3. Low Confidence Extractions Check
  entities.forEach((ent) => {
    totalChecked++;
    if (ent.confidence < 0.75) {
      issues.push({
        id: `iss-det-lowconf-${ent.id}`,
        type: 'low_confidence',
        severity: 'warning',
        title: `Low Extraction Certainty for ${ent.label}`,
        description: `Gemini extracted "${ent.value}" with lower confidence (${Math.round(ent.confidence * 100)}%). Human operator verification recommended.`,
        affectedFields: [ent.field],
        resolutionOptions: [
          {
            id: `opt-confirm-${ent.id}`,
            label: `Confirm Extracted Value ("${ent.value}")`,
            description: 'Certify that the extracted text is accurate from the original scan.',
            actionValue: ent.value,
          },
        ],
        resolved: false,
      });
    }
  });

  // 4. Incident Date Future Date Gate
  const incidentDateEntity = entities.find((e) => e.field.includes('incident_date') || e.field.includes('disaster_date'));
  if (incidentDateEntity && incidentDateEntity.value) {
    totalChecked++;
    const parsedDate = new Date(incidentDateEntity.value);
    const now = new Date();
    if (!isNaN(parsedDate.getTime()) && parsedDate > now) {
      issues.push({
        id: 'iss-det-future-incident-date',
        type: 'format_mismatch',
        severity: 'critical',
        title: 'Incident Date In The Future',
        description: `The extracted incident date "${incidentDateEntity.value}" is in the future. Valid prior date required.`,
        affectedFields: [incidentDateEntity.field],
        resolved: false,
      });
    }
  }

  const passed = Math.max(0, totalChecked - issues.length);

  return {
    issues,
    passedChecks,
    summary: {
      totalChecked,
      passed,
      flagged: issues.length,
    },
  };
}
