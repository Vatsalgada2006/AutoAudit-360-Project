import React from 'react';
import {
  Compass,
  PlayCircle,
  Scale,
  Search,
  ShieldAlert,
  FileCheck2,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { FullAuditResult } from '../../types';

export type CheckpointStep =
  | 'overview'
  | 'newaudit'
  | 'fairness'
  | 'explain'
  | 'robustness'
  | 'regulatory'
  | 'modelcard'
  | 'learn'
  // Legacy alias compatibility
  | 'start'
  | 'stresstest'
  | 'lawcheck'
  | 'reportcard';

interface StepBarProps {
  currentStep: CheckpointStep;
  onSelectStep: (step: CheckpointStep) => void;
  auditResult?: FullAuditResult | null;
  isAuditing: boolean;
  auditStage: number; // 0 to 5
}

interface StepConfig {
  id: CheckpointStep;
  canonicalId: 'overview' | 'newaudit' | 'fairness' | 'explain' | 'robustness' | 'regulatory' | 'modelcard' | 'learn';
  number?: string;
  name: string;
  formalSubtitle: string;
  icon: React.ElementType;
}

const NAV_STEPS: StepConfig[] = [
  {
    id: 'overview',
    canonicalId: 'overview',
    name: 'Overview',
    formalSubtitle: 'The Trust Observatory',
    icon: Compass,
  },
  {
    id: 'newaudit',
    canonicalId: 'newaudit',
    name: 'New Audit',
    formalSubtitle: 'Guided Inspection Workflow',
    icon: PlayCircle,
  },
  {
    id: 'fairness',
    canonicalId: 'fairness',
    number: '1',
    name: 'Fairness',
    formalSubtitle: 'Demographic Parity & 4/5ths Rule',
    icon: Scale,
  },
  {
    id: 'explain',
    canonicalId: 'explain',
    number: '2',
    name: 'Explainability',
    formalSubtitle: 'Global SHAP & Proxy Screening',
    icon: Search,
  },
  {
    id: 'robustness',
    canonicalId: 'robustness',
    number: '3',
    name: 'Robustness',
    formalSubtitle: 'Label Corruption & Perturbation',
    icon: ShieldAlert,
  },
  {
    id: 'regulatory',
    canonicalId: 'regulatory',
    number: '4',
    name: 'Regulatory Readiness',
    formalSubtitle: 'EU AI Act & India DPDP Act 2023',
    icon: FileCheck2,
  },
  {
    id: 'modelcard',
    canonicalId: 'modelcard',
    name: 'Model Cards',
    formalSubtitle: 'AI Model Card & Diagnostic Findings',
    icon: FileText,
  },
  {
    id: 'learn',
    canonicalId: 'learn',
    name: 'Learn / Glossary',
    formalSubtitle: 'Terminology & Methodologies',
    icon: BookOpen,
  },
];

export const StepBar: React.FC<StepBarProps> = ({
  currentStep,
  onSelectStep,
  auditResult,
  isAuditing,
  auditStage,
}) => {
  // Normalize step for highlight
  const normalizedStep = (step: CheckpointStep): string => {
    if (step === 'start') return 'overview';
    if (step === 'stresstest') return 'robustness';
    if (step === 'lawcheck') return 'regulatory';
    if (step === 'reportcard') return 'modelcard';
    return step;
  };

  const activeCanonical = normalizedStep(currentStep);

  const getStepStatus = (canonicalId: string): 'pass' | 'warn' | 'fail' | 'pending' | 'running' => {
    if (isAuditing) {
      const stageMap: Record<string, number> = {
        overview: 0,
        newaudit: 0,
        fairness: 1,
        explain: 2,
        robustness: 3,
        regulatory: 4,
        modelcard: 5,
        learn: 0,
      };
      const targetStage = stageMap[canonicalId] ?? 0;
      if (targetStage > 0 && targetStage === auditStage) return 'running';
      if (targetStage > 0 && targetStage < auditStage) return 'pass';
      return 'pending';
    }

    if (!auditResult) return 'pending';

    switch (canonicalId) {
      case 'fairness': {
        const anyFail = auditResult.fairness.some(f => f.status === 'fail');
        const anyWarn = auditResult.fairness.some(f => f.status === 'warn');
        return anyFail ? 'fail' : anyWarn ? 'warn' : 'pass';
      }
      case 'explain':
        return auditResult.explain.status;
      case 'robustness':
        return auditResult.robustness.status;
      case 'regulatory': {
        const euStatus = auditResult.compliance.eu_ai_act.score >= 70 ? 'pass' : auditResult.compliance.eu_ai_act.score >= 50 ? 'warn' : 'fail';
        const dpdpStatus = auditResult.compliance.dpdp_act_2023.score >= 70 ? 'pass' : auditResult.compliance.dpdp_act_2023.score >= 50 ? 'warn' : 'fail';
        return (euStatus === 'fail' || dpdpStatus === 'fail') ? 'fail' : (euStatus === 'warn' || dpdpStatus === 'warn') ? 'warn' : 'pass';
      }
      case 'modelcard':
        return auditResult.scores.rag_status === 'green' ? 'pass' : auditResult.scores.rag_status === 'amber' ? 'warn' : 'fail';
      default:
        return 'pending';
    }
  };

  return (
    <nav
      className="bg-[#FFFFFF] dark:bg-[#1C201E] border-b border-[#C9A66B]/20 py-2.5 px-3 sm:px-6 shadow-xs overflow-x-auto"
      aria-label="Audit Navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-start xl:justify-between gap-1.5 sm:gap-2 min-w-max">
        {NAV_STEPS.map((step) => {
          const isSelected = activeCanonical === step.canonicalId;
          const status = getStepStatus(step.canonicalId);
          const Icon = step.icon;
          const isAuditMetricStep = ['fairness', 'explain', 'robustness', 'regulatory', 'modelcard'].includes(step.canonicalId);
          const isLocked = isAuditMetricStep && !auditResult && !isAuditing;

          return (
            <button
              key={step.id}
              type="button"
              disabled={isLocked}
              onClick={() => onSelectStep(step.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-md transition-all text-left select-none relative ${
                isSelected
                  ? 'bg-[#F2EEE5] dark:bg-[#171A18] border border-[#C9A66B] shadow-xs'
                  : isLocked
                  ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
                  : 'hover:bg-[#F2EEE5]/70 dark:hover:bg-[#252A27] border border-transparent'
              }`}
              title={isLocked ? 'Run or load an audit to inspect this stage' : step.formalSubtitle}
            >
              {/* Step Icon or Stage Number */}
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-colors ${
                  isSelected
                    ? 'bg-[#C9A66B] text-[#171A18]'
                    : status === 'pass'
                    ? 'bg-[#496F5A]/20 text-[#496F5A]'
                    : status === 'warn'
                    ? 'bg-[#C9A66B]/20 text-[#C9A66B]'
                    : status === 'fail'
                    ? 'bg-[#B85D45]/20 text-[#B85D45]'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {status === 'running' ? (
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-display text-xs sm:text-sm font-bold tracking-tight truncate ${
                      isSelected
                        ? 'text-[#171A18] dark:text-[#F2EEE5]'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {step.name}
                  </span>

                  {/* Status Indicator Pill */}
                  {status === 'pass' && (
                    <CheckCircle2 className="w-3 h-3 text-[#496F5A] shrink-0" />
                  )}
                  {status === 'warn' && (
                    <AlertTriangle className="w-3 h-3 text-[#C9A66B] shrink-0" />
                  )}
                  {status === 'fail' && (
                    <XCircle className="w-3 h-3 text-[#B85D45] shrink-0" />
                  )}
                </div>

                <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400 truncate max-w-[150px]">
                  {step.formalSubtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
