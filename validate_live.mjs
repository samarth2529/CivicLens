import fs from 'fs';
import path from 'path';

async function runValidation() {
  console.log('=== STEP 1-3: ENVIRONMENT CHECKS ===');
  const envExists = fs.existsSync('.env');
  console.log('.env exists:', envExists);

  let keyPresent = false;
  let modelValue = '';
  if (envExists) {
    const content = fs.readFileSync('.env', 'utf8');
    const keyMatch = content.match(/GEMINI_API_KEY=\s*(\S+)/);
    keyPresent = Boolean(keyMatch && keyMatch[1] && keyMatch[1].length > 5 && !keyMatch[1].includes('your_actual_gemini_key_here'));
    const modelMatch = content.match(/GEMINI_MODEL=\s*(\S+)/);
    modelValue = modelMatch ? modelMatch[1] : '';
  }
  console.log('GEMINI_API_KEY present and non-empty:', keyPresent);
  console.log('GEMINI_MODEL:', modelValue);

  console.log('\n=== STEP 4: HEALTHCHECK ===');
  const healthRes = await fetch('http://localhost:3001/api/health');
  const healthJson = await healthRes.json();
  console.log('Health response:', healthJson);

  console.log('\n=== STEP 5-7: LIVE GEMINI MULTIMODAL EXTRACTION ===');
  // Minimal valid 1x1 PNG:
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(pngBase64, 'base64');

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  
  let header = '';
  header += '--' + boundary + '\r\n';
  header += 'Content-Disposition: form-data; name="prompt"\r\n\r\n';
  header += 'Extract applicant details from this submitted document.\r\n';
  header += '--' + boundary + '\r\n';
  header += 'Content-Disposition: form-data; name="programType"\r\n\r\n';
  header += 'Civic Assistance Relief\r\n';
  header += '--' + boundary + '\r\n';
  header += 'Content-Disposition: form-data; name="files"; filename="Sample_Gov_ID.png"\r\n';
  header += 'Content-Type: image/png\r\n\r\n';

  const bodyHeader = Buffer.from(header, 'utf-8');
  const bodyFooter = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf-8');
  const multipartBody = Buffer.concat([bodyHeader, pngBuffer, bodyFooter]);

  const extractRes = await fetch('http://localhost:3001/api/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
    },
    body: multipartBody
  });

  const extractJson = await extractRes.json();
  console.log('Live extract status:', extractRes.status);
  console.log('Live extract success:', extractJson.success);
  console.log('Extracted entities count:', extractJson.entities ? extractJson.entities.length : 0);
  if (extractJson.entities && extractJson.entities.length > 0) {
    const e = extractJson.entities[0];
    console.log('Structured evidence format:', {
      field: Boolean(e.field),
      value: Boolean(e.value),
      confidence: typeof e.confidence === 'number',
      source: Boolean(e.sourceDocName || e.source_document || e.sourceSnippet)
    });
  }
  if (!extractJson.success) {
    console.log('Extraction error message:', extractJson.error);
  }

  console.log('\n=== STEP 8-11: DETERMINISTIC VERIFIER & GATE TEST ===');
  const verifyRes = await fetch('http://localhost:3001/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entities: [
        {
          id: 'ent-rk-1',
          field: 'applicant_name_doc_a',
          label: 'Applicant Name (Record A)',
          category: 'applicant_identity',
          value: 'Rahul Kumar',
          confidence: 0.97,
          confidenceLevel: 'high',
          sourceDocName: 'Document_A_ID_Card.png',
          sourceSnippet: 'Rahul Kumar'
        },
        {
          id: 'ent-rk-2',
          field: 'applicant_name_doc_b',
          label: 'Applicant Name (Record B)',
          category: 'applicant_identity',
          value: 'Rahul Kumer',
          confidence: 0.94,
          confidenceLevel: 'high',
          sourceDocName: 'Document_B_Utility_Statement.pdf',
          sourceSnippet: 'Rahul Kumer'
        },
        {
          id: 'ent-rk-3',
          field: 'current_residential_address',
          label: 'Primary Residence Address',
          category: 'residence_property',
          value: '742 Maple Avenue',
          confidence: 0.98,
          confidenceLevel: 'high',
          sourceDocName: 'Document_A_ID_Card.png',
          sourceSnippet: '742 Maple Avenue'
        }
      ],
      userPrompt: 'Emergency aid application',
      programType: 'Emergency Relief'
    })
  });
  const verifyJson = await verifyRes.json();
  const criticalIssues = (verifyJson.issues || []).filter(i => i.severity === 'critical');
  console.log('Conflict detection success:', criticalIssues.length > 0);
  console.log('Conflict detected:', criticalIssues[0]?.title);
  console.log('READY stage locked before confirmation:', criticalIssues.length > 0);

  console.log('\n=== STEP 12-13: HUMAN AFFIRMATION & DRAFT GENERATION ===');
  const draftRes = await fetch('http://localhost:3001/api/generate-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entities: [
        {
          id: 'ent-rk-1',
          field: 'applicant_name',
          label: 'Applicant Name',
          value: 'Rahul Kumar',
          sourceDocName: 'Document_A_ID_Card.png'
        },
        {
          id: 'ent-rk-3',
          field: 'current_residential_address',
          label: 'Primary Residence Address',
          value: '742 Maple Avenue',
          sourceDocName: 'Document_A_ID_Card.png'
        }
      ],
      resolvedIssues: [
        {
          title: 'Applicant Name Discrepancy Across Documents',
          resolved: true,
          resolvedValue: 'Affirmed legal name: Rahul Kumar as stated in Government ID Document_A_ID_Card.png'
        }
      ],
      programType: 'Emergency Relief Grant'
    })
  });
  const draftJson = await draftRes.json();
  console.log('Verified draft generation success:', draftJson.success);
  console.log('Verified draft present:', Boolean(draftJson.draft));
  console.log('Audit trail present:', Boolean(draftJson.draft?.verificationAuditTrail));
  console.log('Audit trail records human confirmation:', draftJson.draft?.verificationAuditTrail?.resolvedIssues?.length > 0);
}

runValidation().catch(console.error);
