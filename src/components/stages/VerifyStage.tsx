import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { VerificationIssue, CheckedFieldPass } from '../../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Unlock,
  Check, 
  Building,
  Sparkles,
  Cpu,
  UserCheck,
  HelpCircle
} from 'lucide-react';

interface VerifyStageProps {
  issues: VerificationIssue[];
  passedChecks?: CheckedFieldPass[];
  onResolveIssue: (issueId: string, value: string, reason: string) => void;
  onBack: () => void;
  onAdvance: () => void;
  isProcessing: boolean;
  allCriticalIssuesResolved: boolean;
  unresolvedCriticalCount: number;
}

export const VerifyStage: React.FC<VerifyStageProps> = ({
  issues,
  passedChecks = [],
  onResolveIssue,
  onBack,
  onAdvance,
  isProcessing,
  allCriticalIssuesResolved,
  unresolvedCriticalCount,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const [manualOverrideValue, setManualOverrideValue] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');

  const activeIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];
  
  // Categorize issues
  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const reviewIssues = issues.filter((i) => i.severity === 'warning' || i.severity === 'info');
  const resolvedCount = issues.filter((i) => i.resolved).length;

  const handleSelectOption = (issue: VerificationIssue, opt: { actionValue: string; label: string }) => {
    onResolveIssue(issue.id, opt.actionValue, opt.label);
  };

  const handleManualResolve = (issueId: string) => {
    if (!manualOverrideValue.trim()) return;
    onResolveIssue(
      issueId, 
      manualOverrideValue, 
      overrideReason.trim() || 'Manual operator affirmation'
    );
    setManualOverrideValue('');
    setOverrideReason('');
  };

  return (
    <div className="space-y-6">
      {/* Visual 3-Step Verification Pipeline State Banner */}
      <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight">
                Stage 03: Independent Verification &amp; Human Confirmation
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
                Rules Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5e5e5e] mt-1 max-w-2xl leading-relaxed">
              Gemini decomposes unstructured paperwork into candidates. The deterministic rules engine detects cross-record contradictions. <strong className="text-[#1f1f1f] font-semibold">You</strong> make the final binding confirmation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {unresolvedCriticalCount > 0 ? (
              <Badge variant="danger" size="md">
                {unresolvedCriticalCount} Critical Blocker{unresolvedCriticalCount > 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge variant="success" size="md">
                ✓ All Discrepancies Resolved
              </Badge>
            )}

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#f0f4f9] text-[#1f1f1f] border border-[#e3e8ee]">
              {resolvedCount}/{issues.length} Reconciled
            </span>
          </div>
        </div>

        {/* 3-Step Computational Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Step 1: Gemini Extraction */}
          <div className="p-4 rounded-2xl bg-[#f8fafd] border border-[#e3e8ee] flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#f0f4f9] text-[#0b57d0] border border-[#d3e3fd]">
                <Sparkles className="w-4 h-4 text-[#1a73e8]" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8e8e8e] font-semibold block">Phase 1: AI Model</span>
                <span className="text-xs font-bold text-[#1f1f1f]">Gemini Extraction</span>
              </div>
            </div>
            <span className="text-xs text-[#137333] font-bold flex items-center gap-1 bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6]">
              ✓ Done
            </span>
          </div>

          {/* Step 2: Software Verification */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${
            allCriticalIssuesResolved 
              ? 'bg-[#f8fafd] border-[#ceead6]' 
              : 'bg-[#fef7e0]/50 border-[#fdd663]'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8e8e8e] font-semibold block">Phase 2: Rules Engine</span>
                <span className="text-xs font-bold text-[#1f1f1f]">Deterministic Verify</span>
              </div>
            </div>
            {allCriticalIssuesResolved ? (
              <span className="text-xs text-[#137333] font-bold flex items-center gap-1 bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6]">
                ✓ Passed
              </span>
            ) : (
              <span className="text-xs text-[#b06000] font-bold flex items-center gap-1 bg-[#fef7e0] px-2.5 py-0.5 rounded-full border border-[#feefc3]">
                ⚠ Discrepancy
              </span>
            )}
          </div>

          {/* Step 3: Human Confirmation */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${
            allCriticalIssuesResolved 
              ? 'bg-[#e6f4ea]/40 border-[#81c995]' 
              : 'bg-[#fce8e6]/40 border-[#f5c2cb]'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8e8e8e] font-semibold block">Phase 3: Human Gate</span>
                <span className="text-xs font-bold text-[#1f1f1f]">Human Confirmation</span>
              </div>
            </div>
            {allCriticalIssuesResolved ? (
              <span className="text-xs text-[#137333] font-bold flex items-center gap-1 bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6]">
                ✓ Recorded
              </span>
            ) : (
              <span className="text-xs text-[#c5221f] font-bold flex items-center gap-1 bg-[#fce8e6] px-2.5 py-0.5 rounded-full border border-[#f5c2cb]">
                ○ Action Needed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Verification Workspace */}
      <div className="space-y-6">
        {/* SECTION 1: CRITICAL — ACTION REQUIRED */}
        {criticalIssues.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c5221f]">
                <AlertOctagon className="w-4 h-4 text-[#c5221f]" />
                <span>Critical Discrepancies ({criticalIssues.filter(i => !i.resolved).length} Unresolved)</span>
              </div>
              <span className="text-xs text-[#5e5e5e]">
                Deterministic verifier detected conflicting records
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Critical Issues List */}
              <div className="lg:col-span-5 space-y-3">
                {criticalIssues.map((issue) => {
                  const isSelected = selectedIssueId === issue.id;
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-[#fff8f7] border-[#c5221f] shadow-sm ring-2 ring-[#c5221f]/20'
                          : issue.resolved
                          ? 'bg-white border-[#ceead6] hover:border-[#81c995]'
                          : 'bg-white border-[#f5c2cb] hover:border-[#c5221f] shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center space-x-2.5">
                            {issue.resolved ? (
                              <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0" />
                            ) : (
                              <AlertOctagon className="w-4 h-4 text-[#c5221f] shrink-0" />
                            )}
                            <span className="text-xs font-bold text-[#1f1f1f]">
                              {issue.title}
                            </span>
                          </div>
                          <Badge variant={issue.resolved ? 'success' : 'danger'} size="sm">
                            {issue.resolved ? 'AFFIRMED' : 'BLOCKING'}
                          </Badge>
                        </div>

                        <p className="text-xs text-[#5e5e5e] line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>
                      </div>

                      {issue.resolved && (
                        <div className="mt-3 pt-2.5 border-t border-[#e3e8ee] text-xs font-semibold text-[#137333] flex items-center gap-1.5">
                          <span>✓ Confirmed:</span>
                          <strong className="text-[#1f1f1f]">{issue.resolvedValue}</strong>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Resolution Workspace for Selected Critical Issue */}
              <div className="lg:col-span-7">
                {activeIssue && activeIssue.severity === 'critical' ? (
                  <Card className={`p-6 space-y-5 rounded-3xl shadow-sm transition-all duration-300 ${
                    activeIssue.resolved
                      ? 'bg-white border-[#ceead6]'
                      : 'bg-white border-[#f5c2cb]'
                  }`}>
                    <div className="flex items-start justify-between border-b border-[#e3e8ee] pb-4 gap-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <Badge variant={activeIssue.resolved ? 'success' : 'danger'} size="sm">
                            {activeIssue.resolved ? 'RESOLVED & RECORDED' : 'CRITICAL VERIFICATION BLOCKED'}
                          </Badge>
                          <span className="text-xs text-[#8e8e8e]">Field: {activeIssue.affectedFields?.[0] || 'applicant_name'}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#1f1f1f]">
                          {activeIssue.title}
                        </h3>
                      </div>

                      {activeIssue.resolved ? (
                        <div className="text-right shrink-0">
                          <Badge variant="success" size="md">
                            ✓ Human Affirmation Recorded
                          </Badge>
                          <span className="text-[10px] text-[#137333] font-semibold block mt-1">
                            Status: PASSED
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-[#c5221f] px-3 py-1 rounded-full bg-[#fce8e6] border border-[#f5c2cb] shrink-0">
                          Requires Human Choice
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-[#444746] leading-relaxed bg-[#f8fafd] p-4 rounded-2xl border border-[#e3e8ee]">
                      {activeIssue.description}
                    </div>

                    {/* Side-by-side Evidence Comparison with Exact Provenance */}
                    {activeIssue.docReferences && activeIssue.docReferences.length >= 2 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1f1f1f]">
                          <span>Cross-Document Evidence Comparison</span>
                          <span className="text-[#b06000]">Gemini Extracted Discrepancy</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {activeIssue.docReferences.map((ref, idx) => {
                            const isConfirmed = activeIssue.resolved && activeIssue.resolvedValue === ref.valueFound;

                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                                  isConfirmed
                                    ? 'bg-[#e6f4ea]/40 border-[#81c995] ring-2 ring-[#137333]/20'
                                    : 'bg-[#f8fafd] border-[#e3e8ee] hover:border-[#c2e7ff]'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <div className="flex items-center space-x-1.5 text-xs text-[#5e5e5e]">
                                      <Building className="w-4 h-4 text-[#0b57d0] shrink-0" />
                                      <span className="text-xs font-bold text-[#1f1f1f] truncate">
                                        DOCUMENT {String.fromCharCode(65 + idx)}
                                      </span>
                                    </div>
                                    <Badge variant={isConfirmed ? 'success' : 'outline'} size="sm">
                                      {isConfirmed ? 'Affirmed' : 'Extracted'}
                                    </Badge>
                                  </div>

                                  <span className="text-xs text-[#5e5e5e] block truncate mb-2.5">
                                    Source: <strong className="text-[#1f1f1f] font-semibold">{ref.docName}</strong>
                                  </span>

                                  <div className={`text-base font-bold p-3 rounded-xl border tracking-wide ${
                                    isConfirmed
                                      ? 'bg-white text-[#137333] border-[#81c995]'
                                      : 'bg-white text-[#b06000] border-[#feefc3]'
                                  }`}>
                                    "{ref.valueFound}"
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interactive Guided Human Decision */}
                    {activeIssue.resolutionOptions && activeIssue.resolutionOptions.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f] block">
                          Select the authentic legal value to certify:
                        </label>
                        <div className="space-y-2.5">
                          {activeIssue.resolutionOptions.map((opt) => {
                            const isChosen = activeIssue.resolved && activeIssue.resolvedValue === opt.actionValue;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectOption(activeIssue, opt)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between group ${
                                  isChosen
                                    ? 'bg-[#e6f4ea] border-[#137333] text-[#1f1f1f] ring-2 ring-[#137333]/20 shadow-sm'
                                    : 'bg-white hover:bg-[#f8fafd] border-[#e3e8ee] hover:border-[#c2e7ff] text-[#1f1f1f]'
                                }`}
                              >
                                <div className="pr-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs sm:text-sm font-bold text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors">
                                      {opt.label}
                                    </span>
                                    {isChosen && (
                                      <Badge variant="success" size="sm">AFFIRMED</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#5e5e5e] leading-relaxed">{opt.description}</p>
                                  <span className="inline-block mt-2 text-xs font-semibold text-[#0b57d0] bg-[#f0f4f9] px-2.5 py-0.5 rounded-full border border-[#d3e3fd]">
                                    Certified Value: {opt.actionValue}
                                  </span>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 transition-colors ${
                                  isChosen ? 'bg-[#137333] text-white font-bold shadow-sm' : 'border border-[#e3e8ee] group-hover:border-[#0b57d0]'
                                }`}>
                                  {isChosen && <Check className="w-4 h-4 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Manual Custom Operator Affirmation */}
                    <div className="pt-4 border-t border-[#e3e8ee]">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#5e5e5e] mb-2 block">
                        Or Enter Custom Operator Affirmation:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          placeholder="Corrected legal value..."
                          value={manualOverrideValue}
                          onChange={(e) => setManualOverrideValue(e.target.value)}
                          className="flex-1 bg-[#f8fafd] border border-[#e3e8ee] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/30"
                        />
                        <input
                          type="text"
                          placeholder="Operator audit note..."
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          className="flex-1 bg-[#f8fafd] border border-[#e3e8ee] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/30"
                        />
                        <Button
                          size="md"
                          variant="secondary"
                          disabled={!manualOverrideValue.trim()}
                          onClick={() => handleManualResolve(activeIssue.id)}
                        >
                          Affirm
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center text-[#5e5e5e] bg-white border-[#e3e8ee] rounded-3xl">
                    <HelpCircle className="w-8 h-8 text-[#8e8e8e] mx-auto mb-2" />
                    <p className="text-xs">Select an issue on the left to review and affirm.</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: NEEDS REVIEW (Warnings & Low Confidence) */}
        {reviewIssues.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#b06000] px-1">
              <AlertTriangle className="w-4 h-4 text-[#b06000]" />
              <span>Review Advisory ({reviewIssues.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewIssues.map((issue) => (
                <Card
                  key={issue.id}
                  className={`p-5 flex flex-col justify-between transition-all duration-200 rounded-2xl ${
                    issue.resolved ? 'border-[#ceead6] bg-white' : 'border-[#feefc3] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {issue.resolved ? (
                          <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[#b06000]" />
                        )}
                        <span className="text-xs font-bold text-[#1f1f1f]">{issue.title}</span>
                      </div>
                      <Badge variant={issue.resolved ? 'success' : 'warning'} size="sm">
                        {issue.resolved ? 'CONFIRMED' : 'REVIEW'}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#5e5e5e] leading-relaxed mb-3">
                      {issue.description}
                    </p>

                    {issue.resolutionOptions && issue.resolutionOptions.length > 0 && !issue.resolved && (
                      <div className="space-y-2 my-2">
                        {issue.resolutionOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(issue, opt)}
                            className="w-full text-left p-2.5 rounded-xl bg-[#f8fafd] hover:bg-[#f0f7ff] border border-[#e3e8ee] hover:border-[#c2e7ff] text-xs text-[#1f1f1f] flex items-center justify-between transition-colors"
                          >
                            <span className="truncate pr-2 font-medium">{opt.label}</span>
                            <span className="text-xs text-[#0b57d0] shrink-0 font-semibold">Affirm →</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {issue.resolved && (
                    <div className="pt-2.5 mt-2 border-t border-[#e3e8ee] text-xs text-[#137333] font-semibold">
                      ✓ Confirmed Value: {issue.resolvedValue}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: CHECKED SUCCESSFULLY (Deterministic Concordance) */}
        {passedChecks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#137333] px-1">
              <CheckCircle2 className="w-4 h-4 text-[#137333]" />
              <span>Concordance Checks Passed ({passedChecks.length} Deterministic Rules Verified)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {passedChecks.map((chk, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-[#ceead6] flex flex-col justify-between shadow-sm hover:border-[#81c995] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#1f1f1f]">{chk.label}</span>
                      <span className="text-[10px] font-bold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#ceead6]">
                        PASSED
                      </span>
                    </div>
                    <div className="text-xs text-[#137333] font-bold mb-1">
                      {chk.verifiedValue}
                    </div>
                    <p className="text-[11px] text-[#5e5e5e]">
                      Rule: {chk.ruleApplied}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#e3e8ee] text-[11px] text-[#8e8e8e] truncate">
                    Source: {chk.sourceDocName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stage Action Footer with Strict Gate Enforcement */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#e3e8ee]">
        <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Extraction
        </Button>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {!allCriticalIssuesResolved ? (
            <div className="flex items-center space-x-2 text-xs text-[#c5221f] bg-[#fce8e6] border border-[#f5c2cb] px-4 py-2 rounded-full shadow-sm">
              <Lock className="w-4 h-4 text-[#c5221f] shrink-0" />
              <span>Resolve critical discrepancy to unlock draft.</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2 text-xs text-[#137333] bg-[#e6f4ea] border border-[#ceead6] px-4 py-2 rounded-full shadow-sm">
              <Unlock className="w-4 h-4 text-[#137333]" />
              <span>Verification complete • Ready unlocked</span>
            </div>
          )}

          <Button
            variant={allCriticalIssuesResolved ? 'primary' : 'secondary'}
            size="lg"
            disabled={!allCriticalIssuesResolved}
            loading={isProcessing}
            onClick={onAdvance}
            icon={allCriticalIssuesResolved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4" />}
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold shadow-sm"
          >
            <span>Compile Verified Application Draft</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
