import React from 'react';
import { Header } from '../components/layout/Header';
import { StageStepper } from '../components/layout/StageStepper';
import { InputStage } from '../components/stages/InputStage';
import { UnderstandStage } from '../components/stages/UnderstandStage';
import { VerifyStage } from '../components/stages/VerifyStage';
import { ReadyStage } from '../components/stages/ReadyStage';
import { usePipeline } from '../hooks/usePipeline';
import { SAMPLE_PRESETS } from '../data/presets';
import { AlertCircle, ArrowRight, Sparkles, UserCheck, FileText, CheckCircle, Info, Cpu } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    currentStage,
    navigateStage,
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
    isProcessing,
    errorMessage,
    finalDraft,
    processUnderstanding,
    processVerification,
    compileDraft,
    resetPipeline,
    allCriticalIssuesResolved,
    unresolvedCriticalCount,
  } = usePipeline();

  const selectedPreset = SAMPLE_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#1f1f1f] flex flex-col font-sans selection:bg-[#d3e3fd] selection:text-[#041e49]">
      <Header onReset={resetPipeline} selectedPresetTitle={selectedPreset?.title} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gemini-Style Workspace Hero Introduction */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#f0f4f9] border border-[#e3e8ee] text-[#0b57d0] text-xs font-semibold tracking-tight mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Multimodal AI Workspace for Verified Civic Applications</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1f1f1f] tracking-tight leading-[1.15]">
            AI interprets.{' '}
            <span className="gemini-gradient-text">Software verifies.</span>{' '}
            <span className="bg-gradient-to-r from-[#137333] to-[#0b57d0] bg-clip-text text-transparent">Humans confirm.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#444746] mt-4 leading-relaxed max-w-2xl mx-auto font-normal">
            CivicLens turns messy real-world paperwork and human intent into verified, actionable drafts — while keeping critical decisions under human control.
          </p>

          {/* Clean Horizontal Process Visualization */}
          <div className="mt-8 pt-6 border-t border-[#e3e8ee]/80 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-medium text-[#444746]">
            {/* Step 1 */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white border border-[#e3e8ee] shadow-sm hover:border-[#c2e7ff] transition-all">
              <FileText className="w-4 h-4 text-[#5e5e5e]" />
              <span className="font-semibold text-[#1f1f1f]">Messy evidence</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#8e8e8e] shrink-0" />

            {/* Step 2 */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#f0f4f9] border border-[#d3e3fd] text-[#0b57d0] shadow-sm hover:border-[#a8c7fa] transition-all">
              <Sparkles className="w-4 h-4 text-[#1a73e8]" />
              <span className="font-semibold">Gemini extracts</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#8e8e8e] shrink-0" />

            {/* Step 3 */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#fef7e0] border border-[#feefc3] text-[#b06000] shadow-sm hover:border-[#fdd663] transition-all">
              <Cpu className="w-4 h-4 text-[#b06000]" />
              <span className="font-semibold">Software verifies</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#8e8e8e] shrink-0" />

            {/* Step 4 */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#e6f4ea] border border-[#ceead6] text-[#137333] shadow-sm hover:border-[#81c995] transition-all">
              <UserCheck className="w-4 h-4 text-[#137333]" />
              <span className="font-semibold">Human confirms</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#8e8e8e] shrink-0" />

            {/* Step 5 */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#0b57d0] text-white shadow-sm hover:bg-[#0842a0] transition-all">
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="font-semibold">Verified draft</span>
            </div>
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-[#fce8e6] border border-[#f5c2cb] flex items-start space-x-3 text-[#c5221f] text-xs sm:text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#c5221f] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Notification:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* 4-Stage Stepper Navigation */}
        <StageStepper
          currentStage={currentStage}
          onStageClick={navigateStage}
          unresolvedCriticalCount={unresolvedCriticalCount}
          hasExtractionData={entities.length > 0}
        />

        {/* Stage Content Renderers */}
        {currentStage === 'INPUT' && (
          <InputStage
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            documents={documents}
            onAddDocument={addDocument}
            onRemoveDocument={removeDocument}
            selectedPresetId={selectedPresetId}
            onLoadPreset={loadPreset}
            onAdvance={processUnderstanding}
            isProcessing={isProcessing}
            errorMessage={errorMessage}
          />
        )}

        {currentStage === 'UNDERSTAND' && (
          <UnderstandStage
            entities={entities}
            setEntities={setEntities}
            onBack={() => navigateStage('INPUT')}
            onAdvance={processVerification}
            isProcessing={isProcessing}
          />
        )}

        {currentStage === 'VERIFY' && (
          <VerifyStage
            issues={issues}
            passedChecks={passedChecks}
            onResolveIssue={resolveIssue}
            onBack={() => navigateStage('UNDERSTAND')}
            onAdvance={compileDraft}
            isProcessing={isProcessing}
            allCriticalIssuesResolved={allCriticalIssuesResolved}
            unresolvedCriticalCount={unresolvedCriticalCount}
          />
        )}

        {currentStage === 'READY' && (
          <ReadyStage
            draft={finalDraft}
            onBack={() => navigateStage('VERIFY')}
            onReset={resetPipeline}
          />
        )}

        {/* Concise "Why CivicLens is not a chatbot" Section */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-[#e3e8ee] shadow-sm flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-[#f0f4f9] text-[#0b57d0] shrink-0 mt-0.5 border border-[#d3e3fd]">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-[#444746] space-y-1.5 leading-relaxed">
            <p className="font-bold text-[#1f1f1f] text-sm sm:text-base flex items-center gap-2">
              <span>Why CivicLens is not a chatbot:</span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#f0f4f9] text-[#0b57d0] border border-[#d3e3fd]">
                Core Architecture
              </span>
            </p>
            <p className="text-[#5e5e5e]">
              Chatbots and conversational assistants hallucinate and make confident errors. In civic and relief applications, a single misspelled name, mismatched address, or missing mandatory certificate causes instant administrative rejection. CivicLens uses Gemini for document comprehension, then delegates every claim to deterministic verification rules with human affirmation before compilation.
            </p>
          </div>
        </div>
      </main>

      {/* Clean Gemini Workspace Footer */}
      <footer className="border-t border-[#e3e8ee] bg-white py-6 text-xs text-[#5e5e5e] mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-medium">CivicLens Architecture &bull; Deterministic Verification Engine v1.4</span>
          <span className="font-semibold text-[#1f1f1f]">AI interprets. Software verifies. Humans confirm.</span>
        </div>
      </footer>
    </div>
  );
};
