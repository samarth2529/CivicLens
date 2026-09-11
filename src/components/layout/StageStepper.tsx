import React from 'react';
import { PipelineStage } from '../../types';
import { FileUp, Sparkles, ShieldAlert, FileCheck, Check, Lock } from 'lucide-react';

interface StageStepperProps {
  currentStage: PipelineStage;
  onStageClick: (stage: PipelineStage) => void;
  unresolvedCriticalCount?: number;
  hasExtractionData?: boolean;
}

interface StepItem {
  id: PipelineStage;
  stepNumber: string;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepItem[] = [
  {
    id: 'INPUT',
    stepNumber: '01',
    label: 'Input & Intent',
    tagline: 'Messy Docs & Request',
    icon: FileUp,
  },
  {
    id: 'UNDERSTAND',
    stepNumber: '02',
    label: 'Gemini Extract',
    tagline: 'Candidate Evidence',
    icon: Sparkles,
  },
  {
    id: 'VERIFY',
    stepNumber: '03',
    label: 'Verify & Confirm',
    tagline: 'Rules & Human Gate',
    icon: ShieldAlert,
  },
  {
    id: 'READY',
    stepNumber: '04',
    label: 'Verified Draft',
    tagline: 'Actionable Packet & Audit',
    icon: FileCheck,
  },
];

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStage,
  onStageClick,
  unresolvedCriticalCount = 0,
  hasExtractionData = false,
}) => {
  const stageOrder: PipelineStage[] = ['INPUT', 'UNDERSTAND', 'VERIFY', 'READY'];
  const currentIndex = stageOrder.indexOf(currentStage);

  const isStageAllowed = (stage: PipelineStage): boolean => {
    if (stage === 'INPUT') return true;
    if (stage === 'UNDERSTAND') return hasExtractionData || currentIndex >= 1;
    if (stage === 'VERIFY') return hasExtractionData && currentIndex >= 1;
    if (stage === 'READY') return hasExtractionData && unresolvedCriticalCount === 0 && currentIndex >= 2;
    return false;
  };

  return (
    <div className="w-full bg-[#f0f4f9] p-1.5 rounded-2xl mb-8 border border-[#e3e8ee]/80 shadow-sm">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
        {STEPS.map((step, idx) => {
          const isCurrent = step.id === currentStage;
          const isCompleted = idx < currentIndex;
          const allowed = isStageAllowed(step.id);
          const isLocked = !allowed && !isCompleted && !isCurrent;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!allowed && !isCompleted}
              onClick={() => {
                if (allowed || isCompleted) {
                  onStageClick(step.id);
                }
              }}
              className={`text-left p-3.5 rounded-xl transition-all duration-200 relative flex flex-col justify-between group ${
                isCurrent
                  ? 'bg-white text-[#1f1f1f] shadow-sm border border-[#d3e3fd]'
                  : isCompleted
                  ? 'bg-white/60 hover:bg-white text-[#1f1f1f] border border-transparent hover:border-[#e3e8ee] cursor-pointer'
                  : isLocked
                  ? 'bg-transparent text-[#8e8e8e] opacity-60 cursor-not-allowed border border-transparent'
                  : 'bg-white/40 hover:bg-white text-[#444746] border border-transparent hover:border-[#e3e8ee] cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-[#0b57d0] text-white shadow-sm'
                        : isCompleted
                        ? 'bg-[#e6f4ea] text-[#137333]'
                        : 'bg-[#e3e8ee] text-[#5e5e5e]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.stepNumber}
                  </div>
                  <span
                    className={`text-xs font-semibold tracking-tight ${
                      isCurrent
                        ? 'text-[#0b57d0] font-bold'
                        : isCompleted
                        ? 'text-[#1f1f1f]'
                        : 'text-[#5e5e5e]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                <div className="shrink-0">
                  {isCurrent ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d3e3fd] text-[#0b57d0]">
                      Active
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">
                      Done
                    </span>
                  ) : isLocked ? (
                    <div className="flex items-center gap-1 text-[10px] text-[#8e8e8e]">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5e5e5e] mt-1 pl-8">
                <span className="truncate pr-1">{step.tagline}</span>
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isCurrent
                      ? 'text-[#0b57d0]'
                      : isCompleted
                      ? 'text-[#137333]'
                      : 'text-[#8e8e8e]'
                  }`}
                />
              </div>

              {/* Special Indicator for Stage 03 critical blocker */}
              {step.id === 'VERIFY' && unresolvedCriticalCount > 0 && isCurrent && (
                <div className="mt-2 pt-1.5 border-t border-[#fce8e6] flex items-center justify-between text-[10px] text-[#c5221f] font-medium pl-8">
                  <span>{unresolvedCriticalCount} conflict requires human action</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
