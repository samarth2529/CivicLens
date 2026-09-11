import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ApplicationDraft } from '../../types';
import { 
  FileCheck2, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText, 
  User, 
  MapPin, 
  DollarSign, 
  History, 
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Cpu,
  UserCheck
} from 'lucide-react';

interface ReadyStageProps {
  draft: ApplicationDraft | null;
  onBack: () => void;
  onReset: () => void;
}

export const ReadyStage: React.FC<ReadyStageProps> = ({
  draft,
  onBack,
  onReset,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!draft) {
    return (
      <Card className="p-12 text-center text-[#5e5e5e] bg-white border-[#e3e8ee] rounded-3xl">
        <p className="text-sm">No verified draft compiled yet.</p>
        <Button variant="secondary" className="mt-4" onClick={onBack}>
          Back to Verification
        </Button>
      </Card>
    );
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Complete */}
      <div className="bg-white border border-[#ceead6] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#e6f4ea] border border-[#ceead6] rounded-2xl text-[#137333] shrink-0 mt-0.5">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight">
                VERIFICATION COMPLETE &bull; DRAFT READY
              </h2>
              <Badge variant="success" size="sm">Audit Complete</Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#137333] font-semibold mt-0.5">
              Your application draft has been reconciled, verified, and confirmed.
            </p>
            <p className="text-xs text-[#5e5e5e] mt-1 max-w-2xl">
              Cross-document discrepancies have been affirmed by human operator confirmation and backed by an unalterable audit log. Ready for submission review.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyJson}
            icon={copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied JSON' : 'Export JSON'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Packet
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Start New Application
          </Button>
        </div>
      </div>

      {/* 3-Part Outcome Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-[#f0f4f9] text-[#0b57d0] border border-[#d3e3fd] shrink-0">
            <Sparkles className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-[#8e8e8e] block">AI Extracted</span>
            <span className="text-xl font-bold text-[#1f1f1f]">
              {draft.verificationAuditTrail.totalFieldsChecked} Fields
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e3e8ee] flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-[#fef7e0] text-[#b06000] border border-[#feefc3] shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-[#8e8e8e] block">Software Verification</span>
            <span className="text-xl font-bold text-[#1f1f1f]">
              {draft.verificationAuditTrail.totalFieldsChecked} Rules Tested
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#ceead6] flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-[#e6f4ea] text-[#137333] border border-[#ceead6] shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-[#8e8e8e] block">Human Affirmations</span>
            <span className="text-xl font-bold text-[#137333]">
              {draft.verificationAuditTrail.issuesResolved} Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Structured Official Document View */}
      <div className="bg-white border border-[#e3e8ee] rounded-3xl shadow-sm p-6 sm:p-8 space-y-7 text-[#1f1f1f]">
        {/* Document Header */}
        <div className="border-b border-[#e3e8ee] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#0b57d0] font-bold">
                VERIFIED APPLICATION/ACTION DRAFT
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#1f1f1f]">
              {draft.targetProgram}
            </h1>
            <p className="text-xs text-[#5e5e5e] mt-1">
              Docket ID: <span className="text-[#1f1f1f] font-semibold">{draft.applicationId}</span> &bull; Compiled: {new Date(draft.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className="px-4 py-2 bg-[#e6f4ea] border border-[#ceead6] rounded-full flex items-center space-x-2 text-xs text-[#137333] shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-bold">VERIFICATION COMPLETE</span>
          </div>
        </div>

        {/* Section 1: Verified Applicant Identity & Residence */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f] flex items-center gap-2">
            <User className="w-4 h-4 text-[#0b57d0]" />
            <span>Section 1: Verified Applicant &amp; Household Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#f8fafd] p-5 rounded-2xl border border-[#e3e8ee] text-xs">
            <div>
              <span className="text-[#8e8e8e] block font-medium">Primary Applicant Legal Name</span>
              <span className="text-base font-bold text-[#1f1f1f] mt-0.5 block">
                {draft.applicant.fullName || 'Not found in supplied documents.'}
              </span>
            </div>
            <div>
              <span className="text-[#8e8e8e] block font-medium">Date of Birth</span>
              <span className={`text-sm font-semibold mt-0.5 block ${draft.applicant.dob === 'Not found in supplied documents.' ? 'text-[#8e8e8e] italic font-normal' : 'text-[#1f1f1f]'}`}>
                {draft.applicant.dob || 'Not found in supplied documents.'}
              </span>
            </div>
            <div>
              <span className="text-[#8e8e8e] block font-medium">Identification Record</span>
              <span className={`text-sm font-semibold mt-0.5 block ${draft.applicant.ssnLast4 === 'Not found in supplied documents.' ? 'text-[#8e8e8e] italic font-normal' : 'text-[#1f1f1f]'}`}>
                {draft.applicant.ssnLast4 || 'Not found in supplied documents.'}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-[#8e8e8e] block font-medium">Verified Domicile Address</span>
              <span className={`text-sm font-bold mt-0.5 block flex items-center gap-1.5 ${draft.applicant.currentAddress === 'Not found in supplied documents.' ? 'text-[#8e8e8e] italic font-normal' : 'text-[#137333]'}`}>
                <MapPin className="w-4 h-4 text-[#137333] shrink-0" />
                {draft.applicant.currentAddress || 'Not found in supplied documents.'}
              </span>
            </div>
            <div>
              <span className="text-[#8e8e8e] block font-medium">Contact Phone &amp; Email</span>
              <div className="text-xs text-[#5e5e5e] mt-0.5 space-y-0.5">
                <div>Phone: <span className={draft.applicant.phone === 'Not found in supplied documents.' ? 'italic text-[#8e8e8e]' : 'font-semibold text-[#1f1f1f]'}>{draft.applicant.phone || 'Not found in supplied documents.'}</span></div>
                <div>Email: <span className={draft.applicant.email === 'Not found in supplied documents.' ? 'italic text-[#8e8e8e]' : 'font-semibold text-[#1f1f1f]'}>{draft.applicant.email || 'Not found in supplied documents.'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Requested Action & Program Scope */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#b06000]" />
            <span>Section 2: Requested Action &amp; Scope Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 bg-[#f8fafd] p-5 rounded-2xl border border-[#e3e8ee] text-xs">
            {Object.entries(draft.details).map(([key, val]) => (
              <div key={key}>
                <span className="text-[#8e8e8e] block capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={`mt-1 block ${String(val) === 'Not found in supplied documents.' ? 'text-[#8e8e8e] italic font-normal text-xs' : 'text-[#1f1f1f] font-bold'}`}>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Attached Supporting Document Inventory */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0b57d0]" />
            <span>Section 3: Verified Supporting Document Inventory</span>
          </h3>

          <div className="space-y-2">
            {draft.supportingDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-[#f8fafd] border border-[#e3e8ee] rounded-2xl text-xs">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-[#0b57d0]" />
                  <span className="text-[#1f1f1f] font-semibold">{doc.docName}</span>
                </div>
                <Badge variant="success" size="sm">
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Human-in-the-Loop Audit Trail (The Key Differentiator) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1f1f1f] flex items-center gap-2">
            <History className="w-4 h-4 text-[#0b57d0]" />
            <span>Section 4: Human-In-The-Loop Verification Audit Log</span>
          </h3>

          <div className="bg-[#f8fafd] p-5 rounded-2xl border border-[#e3e8ee] space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5e5e5e] border-b border-[#e3e8ee] pb-3">
              <span>Verification Engine: <strong className="text-[#1f1f1f]">{draft.verificationAuditTrail.deterministicEngineVersion}</strong></span>
              <span>Total Rule Checks: <strong className="text-[#1f1f1f]">{draft.verificationAuditTrail.totalFieldsChecked}</strong></span>
              <span className="text-[#137333] font-bold">Operator Affirmations Recorded: {draft.verificationAuditTrail.issuesResolved}</span>
            </div>

            {draft.verificationAuditTrail.resolvedIssues.length > 0 ? (
              <div className="space-y-2.5">
                {draft.verificationAuditTrail.resolvedIssues.map((res, i) => (
                  <div key={i} className="text-xs p-3.5 rounded-xl bg-white border border-[#ceead6] flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
                    <div>
                      <span className="font-bold text-[#1f1f1f] block">{res.issueTitle}</span>
                      <span className="text-[#137333] font-semibold text-xs block mt-1">
                        Confirmed Value: {res.resolutionChosen}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5e5e5e] uppercase shrink-0 sm:text-right">
                      <span>Confirmed by: <strong className="text-[#1f1f1f]">{res.resolvedBy}</strong></span>
                      <span className="block text-[10px] text-[#8e8e8e] mt-0.5">{new Date(res.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5e5e5e]">
                All records were 100% concordant. No discrepancies required operator affirmation.
              </p>
            )}
          </div>
        </div>

        {/* Section 5: Operator Affirmation & Signature */}
        <div className="border-t border-[#e3e8ee] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[#8e8e8e] block font-medium">Operator Digital Attestation</span>
            <span className="text-[#1f1f1f] font-bold italic text-sm">{draft.signatureBlock.signedBy}</span>
          </div>
          <div className="text-[#5e5e5e]">
            Attested Date: {draft.signatureBlock.signedDate}
          </div>
        </div>
      </div>

      {/* Stage Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#e3e8ee]">
        <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Verification Workspace
        </Button>

        <Button variant="primary" size="lg" onClick={onReset} icon={<RotateCcw className="w-4 h-4" />}>
          Start New Application
        </Button>
      </div>
    </div>
  );
};
