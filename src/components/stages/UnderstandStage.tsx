import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ExtractedEntity } from '../../types';
import { 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  User, 
  Home, 
  DollarSign, 
  Calendar, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface UnderstandStageProps {
  entities: ExtractedEntity[];
  setEntities: React.Dispatch<React.SetStateAction<ExtractedEntity[]>>;
  onBack: () => void;
  onAdvance: () => void;
  isProcessing: boolean;
}

export const UnderstandStage: React.FC<UnderstandStageProps> = ({
  entities,
  setEntities,
  onBack,
  onAdvance,
  isProcessing,
}) => {
  const handleEntityValueChange = (id: string, newValue: string) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, value: newValue } : e))
    );
  };

  // Group entities by category
  const applicantEntities = entities.filter((e) => e.category === 'applicant_identity');
  const residenceEntities = entities.filter((e) => e.category === 'residence_property');
  const claimEntities = entities.filter((e) => e.category === 'claim_request' || e.category === 'supporting_dates');
  const financeEntities = entities.filter((e) => e.category === 'financial_income');
  const otherEntities = entities.filter(
    (e) => !['applicant_identity', 'residence_property', 'claim_request', 'supporting_dates', 'financial_income'].includes(e.category)
  );

  const highConfidenceCount = entities.filter((e) => e.confidence >= 0.85).length;
  const reviewConfidenceCount = entities.filter((e) => e.confidence < 0.85).length;

  const renderEntityCard = (entity: ExtractedEntity) => {
    const isHighConf = entity.confidence >= 0.85;
    const isLowConf = entity.confidence < 0.70;
    const isEmptyOrNotFound = !entity.value || entity.value.trim() === '';
    const confPercent = Math.round(entity.confidence * 100);

    return (
      <Card key={entity.id} className="p-5 flex flex-col justify-between bg-white border-[#e3e8ee] hover:border-[#c2e7ff] transition-all duration-200 shadow-sm rounded-2xl">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div>
              <span className="text-xs font-bold text-[#1f1f1f] block">
                {entity.label}
              </span>
              <span className="text-[11px] text-[#8e8e8e]">
                field: {entity.field}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f0f4f9] text-[#0b57d0] border border-[#d3e3fd]">
                Candidate
              </span>
              <Badge
                variant={isHighConf ? 'success' : isLowConf ? 'danger' : 'warning'}
                size="sm"
              >
                {confPercent}%
              </Badge>
            </div>
          </div>

          <div className="my-2">
            {isEmptyOrNotFound ? (
              <div className="p-2.5 rounded-xl bg-[#f8fafd] border border-[#e3e8ee] text-xs text-[#8e8e8e] italic">
                Not found in supplied documents
              </div>
            ) : (
              <input
                type="text"
                value={entity.value}
                onChange={(e) => handleEntityValueChange(entity.id, e.target.value)}
                className="w-full bg-[#f8fafd] border border-[#e3e8ee] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/30 focus:border-[#0b57d0] transition-all"
              />
            )}
          </div>

          {/* Micro confidence bar */}
          <div className="w-full bg-[#f0f4f9] rounded-full h-1 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHighConf
                  ? 'bg-emerald-500'
                  : isLowConf
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${confPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="pt-3 mt-3 border-t border-[#e3e8ee] text-[11px] text-[#5e5e5e] flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 truncate">
            <FileText className="w-3.5 h-3.5 text-[#0b57d0] shrink-0" />
            <span className="truncate">
              Source: <strong className="text-[#1f1f1f] font-medium">{entity.sourceDocName || 'Natural Language Request'}</strong>
            </span>
          </div>
          {entity.sourceSnippet && (
            <span className="text-[10px] text-[#5e5e5e] italic max-w-[160px] truncate shrink-0 bg-[#f8fafd] px-2 py-0.5 rounded-full border border-[#e3e8ee]" title={entity.sourceSnippet}>
              "{entity.sourceSnippet}"
            </span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clear Gemini Candidate Description */}
      <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#f0f4f9] border border-[#d3e3fd] rounded-2xl text-[#0b57d0] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#1a73e8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight">
                Stage 02: Multimodal Candidate Evidence
              </h2>
              <Badge variant="info" size="sm">Gemini Extraction</Badge>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#b06000]">
              Information extracted. Ready for independent deterministic verification.
            </p>
            <p className="text-xs text-[#5e5e5e] mt-1 max-w-2xl leading-relaxed">
              Every value below represents raw candidate evidence extracted from your uploaded paperwork. In Stage 03, CivicLens's independent rule engine tests consistency across records.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Badge variant="success" size="md">
            {highConfidenceCount} High Confidence
          </Badge>
          {reviewConfidenceCount > 0 && (
            <Badge variant="warning" size="md">
              {reviewConfidenceCount} Review Suggested
            </Badge>
          )}
        </div>
      </div>

      {/* Grouped Category Sections */}
      <div className="space-y-6">
        {/* Section 1: Applicant & Identity */}
        {applicantEntities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1f1f1f] px-1">
              <User className="w-4 h-4 text-[#0b57d0]" />
              <span>Applicant &amp; Identity Records ({applicantEntities.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applicantEntities.map(renderEntityCard)}
            </div>
          </div>
        )}

        {/* Section 2: Residence & Property */}
        {residenceEntities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1f1f1f] px-1">
              <Home className="w-4 h-4 text-[#137333]" />
              <span>Residence &amp; Property Domicile ({residenceEntities.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {residenceEntities.map(renderEntityCard)}
            </div>
          </div>
        )}

        {/* Section 3: Request, Intent & Dates */}
        {claimEntities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1f1f1f] px-1">
              <Calendar className="w-4 h-4 text-[#8e24aa]" />
              <span>Request Scope &amp; Supporting Dates ({claimEntities.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claimEntities.map(renderEntityCard)}
            </div>
          </div>
        )}

        {/* Section 4: Finances & Income */}
        {financeEntities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1f1f1f] px-1">
              <DollarSign className="w-4 h-4 text-[#b06000]" />
              <span>Financial &amp; Loss Evidence ({financeEntities.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financeEntities.map(renderEntityCard)}
            </div>
          </div>
        )}

        {/* Fallback for other entities if any */}
        {otherEntities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1f1f1f] px-1">
              <FileText className="w-4 h-4 text-[#5e5e5e]" />
              <span>Supporting Metadata ({otherEntities.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherEntities.map(renderEntityCard)}
            </div>
          </div>
        )}
      </div>

      {/* Stage Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#e3e8ee]">
        <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Input
        </Button>

        <Button
          variant="primary"
          size="lg"
          loading={isProcessing}
          onClick={onAdvance}
          icon={<ShieldCheck className="w-4 h-4" />}
          className="w-full sm:w-auto px-8 py-3 text-sm font-semibold shadow-sm"
        >
          <span>Run Verification Engine</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
