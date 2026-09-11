import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractWithGemini } from '../services/gemini';
import { runDeterministicVerification } from '../services/verifier';

const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });
const router = Router();

// Healthcheck
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'civiclens-api', timestamp: new Date().toISOString() });
});

// Extraction Endpoint (Gemini)
router.post('/extract', upload.array('files'), async (req: Request, res: Response) => {
  try {
    const prompt = (req.body.prompt as string) || '';
    const programType = (req.body.programType as string) || 'Civic Assistance';
    const files = (req.files as Express.Multer.File[]) || [];

    const fileBuffers = files.map((f) => ({
      originalname: f.originalname,
      buffer: f.buffer,
      mimetype: f.mimetype,
    }));

    const result = await extractWithGemini(prompt, fileBuffers, programType);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[API /extract] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Extraction failed' });
  }
});

// Deterministic Verification Endpoint
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { entities, userPrompt, programType } = req.body;
    if (!entities || !Array.isArray(entities)) {
      return res.status(400).json({ success: false, error: 'Entities array required' });
    }

    const { issues, passedChecks, summary } = runDeterministicVerification(entities, userPrompt || '', programType);
    res.json({
      success: true,
      issues,
      passedChecks,
      deterministicSummary: summary,
    });
  } catch (err: any) {
    console.error('[API /verify] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Verification failed' });
  }
});

// Draft Finalization Endpoint (Grounding strictly on verified evidence and human affirmations)
router.post('/generate-draft', (req: Request, res: Response) => {
  try {
    const { entities = [], resolvedIssues = [], programType = 'Civic Assistance Program', userPrompt = '', documents = [] } = req.body;

    const NOT_FOUND_MSG = 'Not found in supplied documents.';

    // Helper to find entity value by field names with strict typing
    const findEntity = (fieldNames: string[]) => {
      const match = entities.find((e: any) => {
        const f = (e.field || '').toLowerCase();
        return fieldNames.some(target => f === target || f.includes(target));
      });
      return match && match.value && match.value.trim() ? match.value.trim() : null;
    };

    // 1. Determine Applicant Name (Prioritize human affirmation if discrepancy existed)
    const nameIssue = resolvedIssues.find((r: any) => 
      r.resolved && 
      (r.affectedFields?.some((f: string) => f.toLowerCase().includes('name')) || r.title?.toLowerCase().includes('name'))
    );
    let applicantName = nameIssue?.resolvedValue;
    if (!applicantName) {
      applicantName = findEntity(['applicant_name_doc_a', 'applicant_name_doc_b', 'applicant_name', 'primary_applicant_name', 'full_name', 'legal_name']);
    }
    if (!applicantName || !applicantName.trim()) {
      applicantName = NOT_FOUND_MSG;
    }

    const isApplicantName = (val: string | null | undefined): boolean => {
      if (!val || val === NOT_FOUND_MSG) return false;
      if (applicantName !== NOT_FOUND_MSG && val.trim().toLowerCase() === applicantName.trim().toLowerCase()) {
        return true;
      }
      return false;
    };

    // 2. Determine Date of Birth (DOB) - MUST NEVER EQUAL OR INHERIT APPLICANT NAME
    const dobIssue = resolvedIssues.find((r: any) => 
      r.resolved && 
      (r.affectedFields?.some((f: string) => f.toLowerCase().includes('dob') || f.toLowerCase().includes('birth')) || r.title?.toLowerCase().includes('birth') || r.title?.toLowerCase().includes('dob'))
    );
    let dob = dobIssue?.resolvedValue;
    if (!dob || isApplicantName(dob)) {
      const rawDob = findEntity(['date_of_birth', 'dob', 'birth_date']);
      if (rawDob && !isApplicantName(rawDob)) {
        dob = rawDob;
      } else {
        dob = NOT_FOUND_MSG;
      }
    }
    if (!dob || isApplicantName(dob)) {
      dob = NOT_FOUND_MSG;
    }

    // 3. Determine Residential Address - MUST NEVER EQUAL OR INHERIT APPLICANT NAME
    const addressIssue = resolvedIssues.find((r: any) => 
      r.resolved && 
      (r.affectedFields?.some((f: string) => f.toLowerCase().includes('address') || f.toLowerCase().includes('residence')) || r.title?.toLowerCase().includes('address') || r.title?.toLowerCase().includes('residence'))
    );
    let address = addressIssue?.resolvedValue;
    if (!address || isApplicantName(address)) {
      const rawAddress = findEntity(['current_residential_address', 'primary_residence', 'residential_address', 'service_address', 'address']);
      if (rawAddress && !isApplicantName(rawAddress)) {
        address = rawAddress;
      } else {
        address = NOT_FOUND_MSG;
      }
    }
    if (!address || isApplicantName(address)) {
      address = NOT_FOUND_MSG;
    }

    // 4. Identification Record (SSN / State ID) - MUST NEVER EQUAL OR INHERIT APPLICANT NAME
    const idIssue = resolvedIssues.find((r: any) => 
      r.resolved && 
      (r.affectedFields?.some((f: string) => f.toLowerCase().includes('ssn') || f.toLowerCase().includes('state_id') || f.toLowerCase().includes('id_number')) || r.title?.toLowerCase().includes('identification') || r.title?.toLowerCase().includes('id record'))
    );
    let ssnLast4 = idIssue?.resolvedValue;
    if (!ssnLast4 || isApplicantName(ssnLast4)) {
      const rawId = findEntity(['ssn_last_4', 'ssn', 'state_id_number', 'id_number', 'driver_license_number', 'identification_record', 'state_id']);
      if (rawId && !isApplicantName(rawId)) {
        ssnLast4 = rawId;
      } else {
        ssnLast4 = NOT_FOUND_MSG;
      }
    }
    if (!ssnLast4 || isApplicantName(ssnLast4)) {
      ssnLast4 = NOT_FOUND_MSG;
    }

    // 5. Contact Phone & Email - MUST NEVER EQUAL OR INHERIT APPLICANT NAME
    let phone = findEntity(['phone_number', 'contact_phone', 'phone', 'telephone']);
    if (!phone || isApplicantName(phone)) {
      phone = NOT_FOUND_MSG;
    }
    let email = findEntity(['email_address', 'contact_email', 'email']);
    if (!email || isApplicantName(email)) {
      email = NOT_FOUND_MSG;
    }

    // 6. Dynamic Program Scope & Details (Only include values actually present in evidence or user request)
    const details: Record<string, any> = {};

    const incidentDate = findEntity(['incident_date', 'disaster_date', 'event_date', 'date_of_incident']);
    if (incidentDate) {
      details['incidentDate'] = incidentDate;
    }

    const claimAmount = findEntity(['out_of_pocket_loss_amount', 'claim_amount', 'loss_amount', 'requested_amount']);
    if (claimAmount) {
      details['claimAmount'] = claimAmount;
    }

    const damageType = findEntity(['damage_type', 'damage_description', 'loss_description', 'assistance_scope']);
    if (damageType) {
      details['damageType'] = damageType;
    }

    // Include other non-profile entities
    const excludedFields = [
      'applicant_name', 'applicant_name_doc_a', 'applicant_name_doc_b', 'primary_applicant_name', 'full_name', 'legal_name',
      'date_of_birth', 'dob', 'birth_date',
      'current_residential_address', 'primary_residence', 'address', 'residential_address', 'service_address',
      'ssn_last_4', 'ssn', 'state_id_number', 'id_number', 'driver_license_number', 'identification_record',
      'phone', 'phone_number', 'contact_phone', 'telephone',
      'email', 'email_address', 'contact_email',
      'incident_date', 'disaster_date', 'event_date', 'date_of_incident',
      'out_of_pocket_loss_amount', 'claim_amount', 'loss_amount', 'requested_amount',
      'damage_type', 'damage_description', 'loss_description', 'assistance_scope'
    ];

    entities.forEach((e: any) => {
      const fieldKey = e.field?.toLowerCase();
      if (!excludedFields.includes(fieldKey) && e.value && e.value.trim()) {
        const readableKey = e.label || e.field;
        details[readableKey] = e.value;
      }
    });

    // If details has no fields, explicitly display grounded fallback notices
    if (Object.keys(details).length === 0) {
      if (userPrompt && userPrompt.trim()) {
        details['requestedAssistance'] = `${userPrompt.trim()} (User-provided request)`;
      } else {
        details['requestedAssistance'] = NOT_FOUND_MSG;
      }
      details['incidentDate'] = NOT_FOUND_MSG;
      details['claimAmount'] = NOT_FOUND_MSG;
    }

    // 7. Supporting Documents (Construct strictly from uploaded documents or unique entity sources)
    const docMap = new Map<string, string>();
    if (Array.isArray(documents) && documents.length > 0) {
      documents.forEach((d: any) => {
        if (d.name) {
          docMap.set(d.name, d.type || 'Verified Upload');
        }
      });
    }
    entities.forEach((e: any) => {
      if (e.sourceDocName && !docMap.has(e.sourceDocName)) {
        docMap.set(e.sourceDocName, e.category === 'applicant_identity' ? 'Identity Record' : 'Supporting Evidence');
      }
    });

    const supportingDocuments = Array.from(docMap.entries()).map(([docName, docType]) => ({
      docName,
      docType: docType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      status: 'Verified & Reconciled',
    }));

    if (supportingDocuments.length === 0) {
      supportingDocuments.push({
        docName: 'User Natural Language Request',
        docType: 'Natural Language Ingestion',
        status: 'Reconciled',
      });
    }

    // 8. Verification Audit Trail
    const auditIssues = resolvedIssues.map((r: any) => ({
      issueTitle: r.title || 'Verification Concordance Check',
      resolutionChosen: r.resolvedValue || 'Affirmed by human operator',
      resolvedBy: 'human_operator' as const,
      timestamp: r.resolvedAt || new Date().toISOString(),
    }));

    const draft = {
      applicationId: `CVL-${Math.floor(100000 + Math.random() * 900000)}`,
      targetProgram: programType || 'Emergency Relief Assistance',
      programCategory: 'Civic Relief & Municipal Assistance',
      generatedAt: new Date().toISOString(),
      applicant: {
        fullName: applicantName,
        dob,
        ssnLast4,
        currentAddress: address,
        phone,
        email,
      },
      details,
      supportingDocuments,
      verificationAuditTrail: {
        totalFieldsChecked: entities.length + resolvedIssues.length,
        issuesFound: resolvedIssues.length,
        issuesResolved: resolvedIssues.filter((r: any) => r.resolved).length,
        deterministicEngineVersion: 'CivicLens-RulesEngine-v1.4',
        auditedAt: new Date().toISOString(),
        resolvedIssues: auditIssues,
      },
      signatureBlock: {
        requiresSignature: true,
        signedBy: applicantName !== NOT_FOUND_MSG ? applicantName : 'Applicant (Signature Pending)',
        signedDate: new Date().toLocaleDateString(),
      },
    };

    res.json({ success: true, draft });
  } catch (err: any) {
    console.error('[API /generate-draft] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Draft compilation failed' });
  }
});

export default router;
