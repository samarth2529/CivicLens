import { PresetDemo } from '../types';

export const SAMPLE_PRESETS: PresetDemo[] = [
  {
    id: 'rahul_kumar_name_discrepancy',
    title: 'Emergency Aid Request (Name Discrepancy Case)',
    category: '60s Demo Benchmark',
    description: 'Applicant provided two identity records with conflicting name spellings (Rahul Kumar vs Rahul Kumer) at 742 Maple Avenue.',
    userPrompt: 'I need help preparing an emergency relief grant application using these two documents. Please ensure my details are verified.',
    sampleDocuments: [
      {
        id: 'doc-a',
        name: 'Document_A_ID_Card.png',
        type: 'id_card',
        snippet: 'State Photo ID — Name: Rahul Kumar. Address: 742 Maple Avenue. DOB: 08/12/1988. Issued: 2021.'
      },
      {
        id: 'doc-b',
        name: 'Document_B_Utility_Statement.pdf',
        type: 'utility_bill',
        snippet: 'Metropolitan Energy — Account Holder: Rahul Kumer. Service Address: 742 Maple Avenue. Statement Date: Jan 2026.'
      }
    ],
    expectedIssuesCount: 1,
    simulatedEntities: [
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
      },
      {
        id: 'ent-rk-4',
        field: 'date_of_birth',
        label: 'Date of Birth',
        category: 'applicant_identity',
        value: '1988-08-12',
        confidence: 0.95,
        confidenceLevel: 'high',
        sourceDocName: 'Document_A_ID_Card.png',
        sourceSnippet: 'DOB: 08/12/1988'
      }
    ],
    simulatedIssues: [
      {
        id: 'iss-det-conflict-applicant_name',
        type: 'conflict',
        severity: 'critical',
        title: 'Applicant Name Discrepancy Across Documents',
        description: 'Identity Document records "Rahul Kumar" while Utility Statement records "Rahul Kumer". Software verification cannot assume which spelling is legally binding without human confirmation.',
        affectedFields: ['applicant_name_doc_a', 'applicant_name_doc_b'],
        docReferences: [
          { docId: 'doc-a', docName: 'Document_A_ID_Card.png', valueFound: 'Rahul Kumar' },
          { docId: 'doc-b', docName: 'Document_B_Utility_Statement.pdf', valueFound: 'Rahul Kumer' }
        ],
        resolutionOptions: [
          {
            id: 'opt-rk-1',
            label: 'Affirm "Rahul Kumar" (State Photo ID)',
            description: 'Use "Rahul Kumar" as verified legal name; treat "Rahul Kumer" as a utility billing clerical typo.',
            actionValue: 'Rahul Kumar'
          },
          {
            id: 'opt-rk-2',
            label: 'Affirm "Rahul Kumer" (Utility Statement)',
            description: 'Use "Rahul Kumer" as legal name; require updated State ID proof.',
            actionValue: 'Rahul Kumer'
          }
        ],
        resolved: false
      }
    ],
    simulatedPassedChecks: [
      {
        field: 'current_residential_address',
        label: 'Primary Domicile Address',
        verifiedValue: '742 Maple Avenue',
        sourceDocName: 'Document_A_ID_Card.png & Document_B_Utility_Statement.pdf',
        ruleApplied: 'Deterministic Concordance Verification (2 records evaluated - 100% Match)',
        concordanceScore: 1.0
      },
      {
        field: 'date_of_birth',
        label: 'Legal Adult Age Gate (>= 18 yrs)',
        verifiedValue: '1988-08-12 (Age 37)',
        sourceDocName: 'Document_A_ID_Card.png',
        ruleApplied: 'Statutory Age Majority Rule',
        concordanceScore: 1.0
      }
    ]
  },
  {
    id: 'fema_disaster_relief',
    title: 'FEMA Disaster Relief (Address Conflict Case)',
    category: 'Emergency Assistance',
    description: 'Applicant requesting emergency repair grant after sub-zero freeze pipe burst. Contains an address discrepancy across uploaded records.',
    userPrompt: 'I need to apply for emergency freeze relief grant. My basement flooded when the main pipe burst on Jan 14th. My driver license has my old address on Oak Street, but I live on Maple Avenue now.',
    sampleDocuments: [
      {
        id: 'doc-1',
        name: 'Electric_Utility_Bill_Jan2026.pdf',
        type: 'utility_bill',
        snippet: 'Metropolitan Power & Gas — Service Address: 742 Maple Ave, Apt 3B, Springfield. Customer: Elena Vance. Statement Date: Jan 20, 2026. Current balance: $184.20.'
      },
      {
        id: 'doc-2',
        name: 'Plumbing_Emergency_Invoice_Scan.jpg',
        type: 'handwritten_note',
        snippet: 'A-1 Emergency Plumbing (Handwritten): Replaced 12ft burst copper pipe at 742 Maple St. Total Paid: $3,450.00. Date: 01/16/2026.'
      },
      {
        id: 'doc-3',
        name: 'State_Drivers_License_Scan.png',
        type: 'id_card',
        snippet: 'State Dept of Motor Vehicles — Elena M Vance. DOB: 04/18/1984. Address: 104 Oak St, Springfield.'
      }
    ],
    expectedIssuesCount: 2,
    simulatedEntities: [
      {
        id: 'ent-1',
        field: 'applicant_name',
        label: 'Primary Applicant Name',
        category: 'applicant_identity',
        value: 'Elena M Vance',
        confidence: 0.98,
        confidenceLevel: 'high',
        sourceDocName: 'State_Drivers_License_Scan.png',
        sourceSnippet: 'Elena M Vance'
      },
      {
        id: 'ent-2',
        field: 'date_of_birth',
        label: 'Date of Birth',
        category: 'applicant_identity',
        value: '1984-04-18',
        confidence: 0.95,
        confidenceLevel: 'high',
        sourceDocName: 'State_Drivers_License_Scan.png',
        sourceSnippet: 'DOB: 04/18/1984'
      },
      {
        id: 'ent-3',
        field: 'current_residential_address',
        label: 'Primary Residence Address',
        category: 'residence_property',
        value: '742 Maple Ave, Apt 3B, Springfield',
        confidence: 0.89,
        confidenceLevel: 'medium',
        sourceDocName: 'Electric_Utility_Bill_Jan2026.pdf',
        sourceSnippet: 'Service Address: 742 Maple Ave, Apt 3B'
      },
      {
        id: 'ent-4',
        field: 'incident_date',
        label: 'Date of Disaster / Incident',
        category: 'claim_request',
        value: '2026-01-14',
        confidence: 0.92,
        confidenceLevel: 'high',
        sourceDocName: 'Natural Language Request',
        sourceSnippet: 'pipe burst on Jan 14th'
      },
      {
        id: 'ent-5',
        field: 'out_of_pocket_loss_amount',
        label: 'Out of Pocket Repair Cost',
        category: 'financial_income',
        value: '$3,450.00',
        confidence: 0.76,
        confidenceLevel: 'medium',
        sourceDocName: 'Plumbing_Emergency_Invoice_Scan.jpg',
        sourceSnippet: 'Total Paid: $3,450.00'
      }
    ],
    simulatedIssues: [
      {
        id: 'iss-1',
        type: 'conflict',
        severity: 'critical',
        title: 'Address Discrepancy Across Verified Documents',
        description: 'Driver License records residence as "104 Oak St", whereas Utility Bill and Claim Request specify "742 Maple Ave, Apt 3B". Civic grant approval requires a verified single primary domicile.',
        affectedFields: ['current_residential_address', 'id_address'],
        docReferences: [
          { docId: 'doc-3', docName: 'State_Drivers_License_Scan.png', valueFound: '104 Oak St, Springfield' },
          { docId: 'doc-1', docName: 'Electric_Utility_Bill_Jan2026.pdf', valueFound: '742 Maple Ave, Apt 3B, Springfield' }
        ],
        resolutionOptions: [
          {
            id: 'opt-util',
            label: 'Affirm 742 Maple Ave (Current Residence)',
            description: 'Applicant moved recently. Use current utility bill verified address; flag ID as legacy address with relocation note.',
            actionValue: '742 Maple Ave, Apt 3B, Springfield'
          },
          {
            id: 'opt-id',
            label: 'Use ID Address (104 Oak St)',
            description: 'Require applicant to provide utility proof for Oak St.',
            actionValue: '104 Oak St, Springfield'
          }
        ],
        resolved: false
      },
      {
        id: 'iss-2',
        type: 'missing',
        severity: 'warning',
        title: 'Missing Insurance Denial / Waiver Statement',
        description: 'County FEMA grant guidelines require certifying whether private insurance was claimed before public emergency funds are allocated.',
        affectedFields: ['insurance_status'],
        resolutionOptions: [
          {
            id: 'opt-uninsured',
            label: 'Declare Uninsured / Water Backup Excluded',
            description: 'Attach applicant affirmation that freeze pipe burst was excluded by policy.',
            actionValue: 'Affirmed: Water backup excluded from renter policy'
          }
        ],
        resolved: false
      }
    ],
    simulatedPassedChecks: [
      {
        field: 'applicant_name',
        label: 'Primary Applicant Identity',
        verifiedValue: 'Elena M Vance',
        sourceDocName: 'State_Drivers_License_Scan.png',
        ruleApplied: 'Exact Name Concordance Check',
        concordanceScore: 1.0
      },
      {
        field: 'incident_date',
        label: 'Incident Window Rule',
        verifiedValue: '2026-01-14',
        sourceDocName: 'Natural Language Request',
        ruleApplied: 'Winter Storm Emergency Window (Jan 10-22, 2026)',
        concordanceScore: 0.98
      }
    ]
  },
  {
    id: 'clean_property_tax_relief',
    title: 'Senior Citizen Property Tax Relief (Clean Case)',
    category: 'Municipal Tax Relief',
    description: 'Clean scenario with 0 critical conflicts. Fully concordant identity and property records with zero discrepancies.',
    userPrompt: 'Applying for municipal senior citizen homestead property tax exemption. Enclosing my property assessment statement and state ID card.',
    sampleDocuments: [
      {
        id: 'doc-tax-1',
        name: 'County_Property_Tax_Assessment_2025.pdf',
        type: 'tax_form',
        snippet: 'County Assessor — Parcel ID: #409-22-108. Property: 512 Willow Brook Rd. Owner of Record: Arthur Pendelton.'
      },
      {
        id: 'doc-tax-2',
        name: 'State_Senior_ID_Card.jpg',
        type: 'id_card',
        snippet: 'State Identification — Arthur Pendelton. DOB: 09/14/1953 (Age 72). Address: 512 Willow Brook Rd.'
      }
    ],
    expectedIssuesCount: 0,
    simulatedEntities: [
      {
        id: 'ent-c1',
        field: 'applicant_name',
        label: 'Property Owner Name',
        category: 'applicant_identity',
        value: 'Arthur Pendelton',
        confidence: 0.99,
        confidenceLevel: 'high',
        sourceDocName: 'State_Senior_ID_Card.jpg',
        sourceSnippet: 'Arthur Pendelton'
      },
      {
        id: 'ent-c2',
        field: 'date_of_birth',
        label: 'Date of Birth (Senior Qualification)',
        category: 'applicant_identity',
        value: '1953-09-14 (Age 72)',
        confidence: 0.98,
        confidenceLevel: 'high',
        sourceDocName: 'State_Senior_ID_Card.jpg',
        sourceSnippet: 'DOB: 09/14/1953'
      },
      {
        id: 'ent-c3',
        field: 'current_residential_address',
        label: 'Homestead Property Address',
        category: 'residence_property',
        value: '512 Willow Brook Rd',
        confidence: 0.99,
        confidenceLevel: 'high',
        sourceDocName: 'County_Property_Tax_Assessment_2025.pdf',
        sourceSnippet: 'Property: 512 Willow Brook Rd'
      }
    ],
    simulatedIssues: [],
    simulatedPassedChecks: [
      {
        field: 'applicant_name',
        label: 'Owner of Record Match',
        verifiedValue: 'Arthur Pendelton',
        sourceDocName: 'State_Senior_ID_Card.jpg & Tax Assessment',
        ruleApplied: 'Exact 100% Concordance across Deed and State ID',
        concordanceScore: 1.0
      },
      {
        field: 'date_of_birth',
        label: 'Senior Exemption Age Threshold (>= 65 yrs)',
        verifiedValue: 'Age 72 (Qualified)',
        sourceDocName: 'State_Senior_ID_Card.jpg',
        ruleApplied: 'Senior Exemption Statutory Age Gate',
        concordanceScore: 1.0
      }
    ]
  }
];
