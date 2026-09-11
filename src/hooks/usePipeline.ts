import { useState, useCallback } from 'react';
import { 
  PipelineStage, 
  DocumentUpload, 
  ExtractedEntity, 
  VerificationIssue, 
  CheckedFieldPass,
  ApplicationDraft, 
  PresetDemo 
} from '../types';
import { extractPaperwork, runVerification, generateFinalDraft } from '../lib/api';

export function usePipeline() {
  const [currentStage, setCurrentStage] = useState<PipelineStage>('INPUT');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  
  // Extracted entities from UNDERSTAND stage
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [programType, setProgramType] = useState<string>('Emergency Civic Assistance');
  
  // Verification issues and passed checks for VERIFY stage
  const [issues, setIssues] = useState<VerificationIssue[]>([]);
  const [passedChecks, setPassedChecks] = useState<CheckedFieldPass[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Final ready draft
  const [finalDraft, setFinalDraft] = useState<ApplicationDraft | null>(null);

  // Load sample preset for evaluation test scenarios
  const loadPreset = useCallback((preset: PresetDemo) => {
    setSelectedPresetId(preset.id);
    setUserPrompt(preset.userPrompt);
    setProgramType(preset.title);
    setErrorMessage(null);
    
    const mockDocs: DocumentUpload[] = preset.sampleDocuments.map((doc) => ({
      id: doc.id,
      name: doc.name,
      size: 145000,
      type: doc.type === 'id_card' ? 'image/png' : 'application/pdf',
      docType: doc.type,
      status: 'extracted',
      extractedText: doc.snippet,
      uploadedAt: new Date().toISOString(),
    }));
    
    setDocuments(mockDocs);
    setEntities(preset.simulatedEntities);
    setIssues(preset.simulatedIssues);
    setPassedChecks(preset.simulatedPassedChecks || []);
  }, []);

  // Add uploaded file with preview generation
  const addDocument = useCallback((file: File) => {
    const validExtensions = /\.(pdf|png|jpe?g|webp|txt)$/i;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf' && file.type !== 'text/plain' && !file.name.match(validExtensions)) {
      setErrorMessage(`Unsupported file format "${file.name}". Please upload PDF, PNG, JPG, or TXT documents.`);
      return;
    }

    setErrorMessage(null);
    setSelectedPresetId(null); // Clear preset mode when live file is uploaded

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

    const newDoc: DocumentUpload = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      file,
      previewUrl,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [...prev, newDoc]);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  // Trigger UNDERSTAND stage (Gemini Multimodal Extraction)
  const processUnderstanding = useCallback(async () => {
    // Pre-flight validation
    if (!selectedPresetId) {
      if (documents.length === 0) {
        setErrorMessage('At least one document must be uploaded for live analysis.');
        return;
      }
      if (!userPrompt.trim()) {
        setErrorMessage('Please describe what you need in your own words before proceeding.');
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // If a demo scenario is active, advance with preset evaluation data
      if (selectedPresetId && entities.length > 0) {
        await new Promise((res) => setTimeout(res, 500));
        setCurrentStage('UNDERSTAND');
        setIsProcessing(false);
        return;
      }

      // LIVE GEMINI MULTIMODAL EXTRACTION: Send actual binary files and prompt to backend
      const formData = new FormData();
      formData.append('prompt', userPrompt);
      formData.append('programType', programType);
      
      documents.forEach((doc) => {
        if (doc.file) {
          formData.append('files', doc.file);
        }
      });

      const result = await extractPaperwork(formData);

      if (result && result.entities && result.entities.length > 0) {
        setEntities(result.entities);
        if (result.programType) {
          setProgramType(result.programType);
        }
        setCurrentStage('UNDERSTAND');
      } else {
        throw new Error('Gemini could not extract readable civic data points from the provided documents.');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || 'Failed to process paperwork with Gemini.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPresetId, documents, userPrompt, programType, entities]);

  // Trigger VERIFY stage (Deterministic Rule Engine)
  const processVerification = useCallback(async () => {
    if (entities.length === 0) {
      setErrorMessage('No extracted entities found to verify. Please run understanding first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (selectedPresetId && (issues.length > 0 || passedChecks.length > 0)) {
        await new Promise((res) => setTimeout(res, 400));
        setCurrentStage('VERIFY');
        setIsProcessing(false);
        return;
      }

      const result = await runVerification({
        entities,
        userPrompt,
        programType,
      });

      if (result && (result.issues || result.passedChecks)) {
        setIssues(result.issues || []);
        setPassedChecks(result.passedChecks || []);
        setCurrentStage('VERIFY');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification engine error.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPresetId, issues, passedChecks, entities, userPrompt, programType]);

  // Resolve an issue in human-in-the-loop VERIFY stage
  const resolveIssue = useCallback((issueId: string, resolutionValue: string, reason: string) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id === issueId) {
          return {
            ...iss,
            resolved: true,
            resolvedValue: resolutionValue,
            resolvedReason: reason,
            resolvedAt: new Date().toISOString(),
          };
        }
        return iss;
      })
    );

    // Update matching entity value
    setEntities((prev) =>
      prev.map((ent) => {
        const issue = issues.find((i) => i.id === issueId);
        if (issue && issue.affectedFields.includes(ent.field)) {
          return {
            ...ent,
            value: resolutionValue,
            isFlagged: false,
          };
        }
        return ent;
      })
    );
  }, [issues]);

  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const unresolvedCriticalCount = criticalIssues.filter((i) => !i.resolved).length;
  const allCriticalIssuesResolved = unresolvedCriticalCount === 0;

  // Compile final draft to READY stage
  const compileDraft = useCallback(async () => {
    if (!allCriticalIssuesResolved) {
      setErrorMessage('Cannot generate final draft: Unresolved critical verification issues remain.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await generateFinalDraft({
        entities,
        resolvedIssues: issues,
        programType,
        userPrompt,
        documents: documents.map(d => ({ name: d.name, type: d.docType || d.type })),
      });

      if (result && result.draft) {
        setFinalDraft(result.draft);
        setCurrentStage('READY');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to compile final application draft.');
    } finally {
      setIsProcessing(false);
    }
  }, [allCriticalIssuesResolved, entities, issues, programType]);

  // Safely navigate via stepper while preventing impossible states
  const navigateStage = useCallback((targetStage: PipelineStage) => {
    if (targetStage === 'INPUT') {
      setCurrentStage('INPUT');
      return;
    }
    if (targetStage === 'UNDERSTAND') {
      if (entities.length > 0) {
        setCurrentStage('UNDERSTAND');
      } else {
        setErrorMessage('Cannot view understanding: Documents must be analyzed first.');
      }
      return;
    }
    if (targetStage === 'VERIFY') {
      if (entities.length > 0) {
        setCurrentStage('VERIFY');
      } else {
        setErrorMessage('Cannot verify: Extraction has not completed.');
      }
      return;
    }
    if (targetStage === 'READY') {
      if (allCriticalIssuesResolved && (finalDraft || issues.length >= 0)) {
        if (!finalDraft) {
          compileDraft();
        } else {
          setCurrentStage('READY');
        }
      } else {
        setErrorMessage('Cannot view ready state: Critical verification issues remain unresolved.');
      }
    }
  }, [entities, allCriticalIssuesResolved, finalDraft, issues, compileDraft]);

  const resetPipeline = useCallback(() => {
    documents.forEach((d) => {
      if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
    });

    setCurrentStage('INPUT');
    setUserPrompt('');
    setDocuments([]);
    setSelectedPresetId(null);
    setEntities([]);
    setIssues([]);
    setPassedChecks([]);
    setFinalDraft(null);
    setErrorMessage(null);
  }, [documents]);

  return {
    currentStage,
    navigateStage,
    setCurrentStage,
    userPrompt,
    setUserPrompt,
    documents,
    addDocument,
    removeDocument,
    selectedPresetId,
    loadPreset,
    entities,
    setEntities,
    issues,
    passedChecks,
    resolveIssue,
    programType,
    setProgramType,
    isProcessing,
    errorMessage,
    setErrorMessage,
    finalDraft,
    processUnderstanding,
    processVerification,
    compileDraft,
    resetPipeline,
    allCriticalIssuesResolved,
    unresolvedCriticalCount,
  };
}
