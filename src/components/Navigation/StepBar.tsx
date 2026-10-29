import React from 'react';
import { PlayCircle, Scale, Search, ShieldAlert, FileText, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { FullAuditResult } from '../../types';

export type CheckpointStep = 'start' | 'fairness' | 'explain' | 'stresstest' | 'lawcheck' | 'reportcard';

interface StepBarProps {
  currentStep: CheckpointStep;
  onSelectStep: (step: CheckpointStep) => void;
  auditResult?: FullAuditResult | null;
  isAuditing: boolean;
  auditStage: number; // 0 to 5
}

interface StepConfig {
  id: CheckpointStep;
  number?: string;
  name: string;
  formalSubtitle: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  {
    id: 'start',
    name: 'Start',
    formalSubtitle: 'Dataset & Setup',
    icon: PlayCircle,
  },
  {
    id: 'fairness',
    number: '1',
    name: 'Fairness',
    formalSubtitle: 'Demographic parity & disparate impact',
    icon: Scale,
  },
  {
    id: 'explain',
    number: '2',
    name: 'Explain',
    formalSubtitle: 'Global SHAP & proxy detection',
    icon: Search,
  },
  {
    id: 'stresstest',
    number: '3',
    name: 'Stress Test',
    formalSubtitle: 'Label flips & perturbation attacks',
    icon: ShieldAlert,
  },
  {
    id: 'lawcheck',
    number: '4',
    name: 'Law Check',
    formalSubtitle: 'EU AI Act high-risk & India DPDP Act 2023',
    icon: FileText,
  },
  {
    id: 'reportcard',
    name: 'Report Card',
    formalSubtitle: 'AI Model Card & Official Readiness',
    icon: CheckCircle2,
  },
];

export const StepBar: React.FC<StepBarProps> = ({
  currentStep,
  onSelectStep,
  auditResult,
  isAuditing,
  auditStage,
}) => {
  const getStepStatus = (stepId: CheckpointStep): 'pass' | 'warn' | 'fail' | 'pending' | 'running' => {
    if (isAuditing) {
      const stageMap: Record<CheckpointStep, number> = {
        start: 0,
        fairness: 1,
        explain: 2,
        stresstest: 3,
        lawcheck: 4,
        reportcard: 5,
      };
      if (stageMap[stepId] === auditStage) return 'running';
      if (stageMap[stepId] < auditStage) return 'pass';
      return 'pending';
    }

    if (!auditResult) return 'pending';

    switch (stepId) {
      case 'fairness': {
        const anyFail = auditResult.fairness.some(f => f.status === 'fail');
        const anyWarn = auditResult.fairness.some(f => f.status === 'warn');
        return anyFail ? 'fail' : anyWarn ? 'warn' : 'pass';
      }
      case 'explain':
        return auditResult.explain.status;
      case 'stresstest':
        return auditResult.robustness.status;
      case 'lawcheck': {
        const eu = auditResult.compliance.eu_ai_act.score;
        const dpdp = auditResult.compliance.dpdp_act_2023.score;
        return (eu < 50 || dpdp < 50) ? 'fail' : (eu < 75 || dpdp < 75) ? 'warn' : 'pass';
      }
      case 'reportcard': {
        const rag = auditResult.scores.rag_status;
        return rag === 'green' ? 'pass' : rag === 'amber' ? 'warn' : 'fail';
      }
      default:
        return 'pass';
    }
  };

  return (
    <nav className="w-full bg-[#FFFFFF] dark:bg-[#1B1B1F] border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 sticky top-[73px] z-30 shadow-xs" aria-label="Inspection Checkpoints">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto py-2 sm:py-2.5 gap-1.5 sm:gap-2 no-scrollbar scroll-smooth">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`flex-1 min-w-[150px] sm:min-w-[180px] p-2 sm:p-2.5 text-left rounded-md transition-all relative border ${
                  isActive
                    ? 'bg-[#FF6B2C]/10 border-[#FF6B2C] dark:bg-[#FF6B2C]/15 shadow-xs'
                    : 'bg-[#F6F1E7]/50 dark:bg-[#16161A]/50 border-transparent hover:border-[#1B1B1F]/20 dark:hover:border-[#F6F1E7]/20'
                }`}
              >
                {/* Active Indicator Top Notch */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#FF6B2C] rounded-b" />
                )}

                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    {step.number && (
                      <span className="w-5 h-5 rounded-full bg-[#1B1B1F] dark:bg-[#F6F1E7] text-[#FFFFFF] dark:text-[#1B1B1F] font-mono font-bold text-xs flex items-center justify-center">
                        {step.number}
                      </span>
                    )}
                    <span className="font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]">
                      {step.name}
                    </span>
                  </div>

                  {/* Status Indicator Icon */}
                  {status === 'running' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C] animate-ping" />
                  )}
                  {status === 'pass' && step.id !== 'start' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F9D6B]" />
                  )}
                  {status === 'warn' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F2B01E]" />
                  )}
                  {status === 'fail' && (
                    <XCircle className="w-3.5 h-3.5 text-[#D6334A]" />
                  )}
                  {status === 'pending' && step.id !== 'start' && (
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                  )}
                </div>

                {/* Plain Formal Subtitle */}
                <p className="text-[11px] leading-tight text-[#1B1B1F]/65 dark:text-[#F6F1E7]/65 truncate font-body">
                  {step.formalSubtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
