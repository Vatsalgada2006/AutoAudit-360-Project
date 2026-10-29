import React from 'react';
import { Compass, PlayCircle, Scale, Search, ShieldAlert, FileCheck2, ArrowRight, BookOpen, CheckCircle2, Shield } from 'lucide-react';
import { AuditLens } from '../Three/AuditLens';

interface OverviewViewProps {
  onStartNewAudit: () => void;
  onExploreSample: (sample: 'german_credit' | 'compas') => void;
  onOpenGlossary: () => void;
  isAuditing: boolean;
  auditStage: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onStartNewAudit,
  onExploreSample,
  onOpenGlossary,
  isAuditing,
  auditStage,
}) => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      
      {/* Hero: The Trust Observatory */}
      <div className="text-center space-y-3.5 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A66B]/15 text-[#9E7A38] dark:text-[#E2BF84] border border-[#C9A66B]/30 rounded-full font-mono text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
          <span>The Trust Observatory &bull; Diagnostic Suite</span>
        </div>
        
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[#171A18] dark:text-[#F2EEE5] tracking-tight max-w-3xl mx-auto">
          A scientific health check-up for AI decisions.
        </h2>
        
        <p className="font-body text-base sm:text-lg text-[#171A18]/75 dark:text-[#F2EEE5]/75 max-w-2xl mx-auto leading-relaxed">
          AutoAudit-360 evaluates tabular classification models against demographic fairness, global feature attribution, adversarial stress boundaries, and statutory regulatory requirements.
        </p>

        {/* Two Obvious Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <button
            type="button"
            onClick={onStartNewAudit}
            className="w-full sm:w-auto px-6 py-3.5 rounded bg-[#C9A66B] text-[#171A18] hover:bg-[#D8B67B] font-mono text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-[#171A18]" />
            <span>Start an Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onExploreSample('german_credit')}
            className="w-full sm:w-auto px-6 py-3.5 rounded bg-white dark:bg-[#212523] border border-[#C9A66B]/40 hover:border-[#C9A66B] text-[#171A18] dark:text-[#F2EEE5] font-mono text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#C9A66B]" />
            <span>Explore a Sample Audit</span>
          </button>
        </div>
      </div>

      {/* Signature 3D Element: The Audit Lens */}
      <div className="space-y-3">
        <AuditLens
          stage={auditStage}
          isAuditing={isAuditing}
          onLayerClick={() => onStartNewAudit()}
        />
      </div>

      {/* Visual 4-Stage Audit Sequence */}
      <div className="space-y-4">
        <div className="border-b border-[#C9A66B]/20 pb-2">
          <h3 className="font-display font-bold text-lg text-[#171A18] dark:text-[#F2EEE5]">
            The Four Diagnostic Inspection Stages
          </h3>
          <p className="text-xs text-[#171A18]/65 dark:text-[#F2EEE5]/65">
            Every audited model passes through these rigorous empirical checkpoints before a diagnostic report card is generated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stage 1 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#C9A66B]">
            <div className="w-9 h-9 rounded bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5]">
              1. Fairness
            </div>
            <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70 leading-normal">
              Tests demographic parity, disparate impact (four-fifths rule), equal opportunity, and intersectional subgroup disparities on held-out test data.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#C9A66B]">
            <div className="w-9 h-9 rounded bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5]">
              2. Explainability
            </div>
            <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70 leading-normal">
              Computes global SHAP feature attributions, screens for illicit proxy variables (|r| &gt; 0.40), and clearly distinguishes attribution from causation.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#C9A66B]">
            <div className="w-9 h-9 rounded bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5]">
              3. Robustness
            </div>
            <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70 leading-normal">
              Stress tests model stability with label corruption (5-20%), Gaussian noise, counterfactual identity flips, and bounded coordinate attacks.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#C9A66B]">
            <div className="w-9 h-9 rounded bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5]">
              4. Regulatory Readiness
            </div>
            <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70 leading-normal">
              Evaluates readiness under EU AI Act High-Risk Annex III and India DPDP Act 2023 principles, with PII/minor scanning and governance disclosures.
            </p>
          </div>

        </div>
      </div>

      {/* Pre-Computed Case Studies Cards */}
      <div className="space-y-4">
        <div className="border-b border-[#C9A66B]/20 pb-2 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#171A18] dark:text-[#F2EEE5]">
              Explore Academic Benchmark Case Studies
            </h3>
            <p className="text-xs text-[#171A18]/65 dark:text-[#F2EEE5]/65">
              Instant examination of authentic lending and criminal justice datasets with real computed metrics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* German Credit */}
          <div className="observatory-card p-5 space-y-3 hover:border-[#C9A66B] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9A66B] font-bold">
                  High-Risk Financial Annex III
                </span>
                <h4 className="font-display font-bold text-lg text-[#171A18] dark:text-[#F2EEE5]">
                  Loan Approvals (German Credit)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onExploreSample('german_credit')}
                className="px-3 py-1.5 rounded bg-[#C9A66B]/15 hover:bg-[#C9A66B] text-[#171A18] dark:text-[#F2EEE5] dark:hover:text-[#171A18] font-mono text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>Load Case</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70">
              1,000 retail credit applications assessed by a banking risk surrogate model. Evaluates disparate outcomes across Sex, Age, and Foreign Worker status.
            </p>

            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] pt-1">
              <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">Target: Creditability</span>
              <span className="px-2 py-0.5 bg-[#B85D45]/15 text-[#B85D45] rounded">Disparate Impact: 0.528</span>
              <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">Cap: Fairness &lt; 50</span>
            </div>
          </div>

          {/* COMPAS */}
          <div className="observatory-card p-5 space-y-3 hover:border-[#C9A66B] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C9A66B] font-bold">
                  High-Risk Law Enforcement Annex III
                </span>
                <h4 className="font-display font-bold text-lg text-[#171A18] dark:text-[#F2EEE5]">
                  Criminal Re-Offence Risk (COMPAS)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onExploreSample('compas')}
                className="px-3 py-1.5 rounded bg-[#C9A66B]/15 hover:bg-[#C9A66B] text-[#171A18] dark:text-[#F2EEE5] dark:hover:text-[#171A18] font-mono text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>Load Case</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70">
              6,172 criminal justice records evaluated for recidivism risk across racial groups. Audits algorithmic bias, proxy feature attribution, and statutory gaps.
            </p>

            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] pt-1">
              <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">Target: Low_Risk_Outcome</span>
              <span className="px-2 py-0.5 bg-[#B85D45]/15 text-[#B85D45] rounded">Disparate Impact: 0.627</span>
              <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">Cap: Multiple Axes &lt; 50</span>
            </div>
          </div>

        </div>
      </div>

      {/* Governance & Methodology Transparency Banner */}
      <div className="p-4 rounded border border-[#C9A66B]/30 bg-[#F2EEE5]/60 dark:bg-[#212523] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-mono font-bold text-[#C9A66B] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Weakest-Link Scoring &amp; Diagnostic Policy</span>
          </div>
          <p className="text-[#171A18]/70 dark:text-[#F2EEE5]/70 max-w-2xl">
            Overall trust scores are governed by the weakest-link principle: any axis below 50 caps the overall score at 74.9 (Amber Needs Review), and critical fairness violations on High-Risk systems cap the score at 49.9 (Red Action Required).
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenGlossary}
          className="shrink-0 px-3 py-1.5 rounded border border-[#C9A66B]/50 hover:border-[#C9A66B] font-mono text-xs font-bold text-[#171A18] dark:text-[#F2EEE5] flex items-center gap-1"
        >
          <BookOpen className="w-3 h-3 text-[#C9A66B]" />
          <span>Explore Terminology</span>
        </button>
      </div>

    </div>
  );
};
