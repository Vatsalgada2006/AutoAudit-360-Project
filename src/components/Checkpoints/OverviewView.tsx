import React from 'react';
import { Compass, PlayCircle, Scale, Search, ShieldAlert, FileCheck2, ArrowRight, BookOpen, FileText, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
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
      
      {/* 1. Hero: Know what your AI gets wrong (10-second explanation) */}
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#332A37] text-[#D5F36A] border border-[#D5F36A]/40 rounded-full font-mono text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-[#D5F36A]" />
          <span>The Trust Observatory &bull; Signal Edition</span>
        </div>
        
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[#201823] dark:text-[#FAF2E8] tracking-tight max-w-3xl mx-auto">
          Know what your AI gets wrong.
        </h2>
        
        <p className="font-body text-base sm:text-lg text-[#201823]/80 dark:text-[#FAF2E8]/80 max-w-2xl mx-auto leading-relaxed">
          Inspect fairness, understand model decisions, stress-test predictions, and review governance gaps—all in one evidence-driven audit.
        </p>

        {/* Two Obvious Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            type="button"
            onClick={onStartNewAudit}
            className="w-full sm:w-auto px-7 py-3.5 rounded bg-[#D5F36A] text-[#201823] hover:bg-[#c2e252] font-mono text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-[#201823]" />
            <span>Start an Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onExploreSample('german_credit')}
            className="w-full sm:w-auto px-7 py-3.5 rounded bg-white dark:bg-[#332A37] border border-[#DED3D8] dark:border-[#483A4E] hover:border-[#FF705D] text-[#201823] dark:text-[#FAF2E8] font-mono text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#FF705D]" />
            <span>Explore a Sample Audit</span>
          </button>
        </div>
      </div>

      {/* 2. Signature Visual: The Audit Lens */}
      <div className="space-y-3">
        <AuditLens
          stage={auditStage}
          isAuditing={isAuditing}
          onLayerClick={() => onStartNewAudit()}
        />
      </div>

      {/* 3. The Four-Stage Audit Sequence */}
      <div className="space-y-4">
        <div className="border-b border-[#DED3D8] dark:border-[#332A37] pb-2 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">
              The Four-Stage Audit Sequence
            </h3>
            <p className="text-xs text-[#201823]/65 dark:text-[#FAF2E8]/65">
              Every audited model passes through these rigorous empirical checkpoints to diagnose biases, vulnerabilities, and statutory compliance gaps.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-[#FF705D] hidden sm:inline">
            4 Verification Gates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stage 1 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#D5F36A]">
            <div className="w-9 h-9 rounded bg-[#D5F36A]/20 text-[#2D5A1E] dark:text-[#D5F36A] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
              1. Fairness
            </div>
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70 leading-normal">
              Tests demographic parity, disparate impact (four-fifths rule screening), equal opportunity, and intersectional group disparities on held-out test data.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#C5B6C9]">
            <div className="w-9 h-9 rounded bg-[#332A37] text-[#C5B6C9] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
              2. Explainability
            </div>
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70 leading-normal">
              Computes global SHAP feature attributions, screens for illicit proxy variables (|r| &gt; 0.40), and clearly distinguishes attribution from causation.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#FF705D]">
            <div className="w-9 h-9 rounded bg-[#FF705D]/20 text-[#FF705D] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
              3. Robustness
            </div>
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70 leading-normal">
              Stress tests model stability with synthetic label corruption (5-20%), Gaussian noise, counterfactual identity trait flips, and bounded coordinate attacks.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="observatory-card p-4 space-y-2.5 border-t-2 border-t-[#D5F36A]">
            <div className="w-9 h-9 rounded bg-[#D5F36A]/20 text-[#2D5A1E] dark:text-[#D5F36A] flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
              4. Regulatory Readiness
            </div>
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70 leading-normal">
              Evaluates readiness under EU AI Act High-Risk Annex III and India DPDP Act 2023 principles, with PII/minor scanning and 15 governance disclosures.
            </p>
          </div>

        </div>
      </div>

      {/* 4. Model Card Preview & Disclosure Distinction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card A: What the Model Card Contains */}
        <div className="observatory-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FF705D]" />
            <h4 className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
              What the Compiled Model Card Contains
            </h4>
          </div>
          <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70">
            Each audit compiles a regulatory-grade artifact exportable in printable HTML, structured JSON, and PDF formats:
          </p>
          <ul className="text-xs space-y-1.5 font-mono text-[#201823]/80 dark:text-[#FAF2E8]/80">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5F36A]" />
              <span>Model provenance, algorithm type &amp; intended use</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5F36A]" />
              <span>Fairness point estimates, group comparisons &amp; 95% CIs</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5F36A]" />
              <span>Global SHAP feature rankings with proxy detection</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5F36A]" />
              <span>Label corruption, noise perturbation &amp; counterfactual flips</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5F36A]" />
              <span>EU AI Act &amp; DPDP Act checklists with remediation guidance</span>
            </li>
          </ul>
        </div>

        {/* Card B: Evidence Distinction Banner */}
        <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#FF705D]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF705D]" />
            <h4 className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
              Measured Results vs. Illustrative Demo Benchmarks
            </h4>
          </div>
          <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70 leading-relaxed">
            AutoAudit-360 never fabricates measurements. When you upload a dataset, metrics are empirically computed directly from your test split.
          </p>
          <div className="space-y-2 text-xs font-mono pt-1">
            <div className="p-2 rounded bg-[#FAF2E8] dark:bg-[#332A37] border border-[#DED3D8] dark:border-[#483A4E]">
              <span className="text-[#FF705D] font-bold block mb-0.5">Live Audits:</span>
              <span>Calculated dynamically in Python. If a metric cannot be computed (e.g. predictions column mode), it is recorded as N/A rather than replaced with a synthetic score.</span>
            </div>
            <div className="p-2 rounded bg-[#FAF2E8] dark:bg-[#332A37] border border-[#DED3D8] dark:border-[#483A4E]">
              <span className="text-[#D5F36A] font-bold block mb-0.5">Academic Benchmarks:</span>
              <span>German Credit and COMPAS results reflect verified published datasets run through the identical inspection pipeline.</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Pre-Computed Academic Case Studies */}
      <div className="space-y-4">
        <div className="border-b border-[#DED3D8] dark:border-[#332A37] pb-2 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">
              Defensible Public-Dataset Case Studies
            </h3>
            <p className="text-xs text-[#201823]/65 dark:text-[#FAF2E8]/65">
              Instant examination of authentic retail credit and criminal justice risk surrogates with full empirical reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* German Credit */}
          <div className="observatory-card p-5 space-y-3 hover:border-[#FF705D] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF705D] font-bold">
                  High-Risk Financial &bull; EU Annex III 5(b)
                </span>
                <h4 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">
                  Loan Approvals (German Credit)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onExploreSample('german_credit')}
                className="px-3.5 py-1.5 rounded bg-[#332A37] hover:bg-[#201823] text-[#FAF2E8] font-mono text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#C5B6C9]/30"
              >
                <span>Inspect Case</span>
                <ArrowRight className="w-3 h-3 text-[#D5F36A]" />
              </button>
            </div>
            
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70">
              1,000 credit applications assessed by a banking risk model. Audits demographic disparities across Sex, Age, and Foreign Worker status with EEOC four-fifths rule screening.
            </p>

            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] pt-1">
              <span className="px-2 py-0.5 bg-[#FAF2E8] dark:bg-[#201823] border border-[#DED3D8] dark:border-[#483A4E] rounded">Target: Creditability</span>
              <span className="px-2 py-0.5 bg-[#FF705D]/15 text-[#FF705D] border border-[#FF705D]/30 rounded">Disparate Impact: 0.528</span>
              <span className="px-2 py-0.5 bg-[#FAF2E8] dark:bg-[#201823] border border-[#DED3D8] dark:border-[#483A4E] rounded">Weakest-Link Cap: Red &le; 49.9</span>
            </div>
          </div>

          {/* COMPAS */}
          <div className="observatory-card p-5 space-y-3 hover:border-[#FF705D] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF705D] font-bold">
                  High-Risk Law Enforcement &bull; EU Annex III 6
                </span>
                <h4 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">
                  Recidivism Risk (COMPAS)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onExploreSample('compas')}
                className="px-3.5 py-1.5 rounded bg-[#332A37] hover:bg-[#201823] text-[#FAF2E8] font-mono text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#C5B6C9]/30"
              >
                <span>Inspect Case</span>
                <ArrowRight className="w-3 h-3 text-[#D5F36A]" />
              </button>
            </div>
            
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70">
              6,172 criminal justice records evaluated for recidivism risk across racial groups. Audits disparate impact, false positive rate gaps, proxy features, and statutory compliance gaps.
            </p>

            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] pt-1">
              <span className="px-2 py-0.5 bg-[#FAF2E8] dark:bg-[#201823] border border-[#DED3D8] dark:border-[#483A4E] rounded">Target: Low_Risk_Outcome</span>
              <span className="px-2 py-0.5 bg-[#FF705D]/15 text-[#FF705D] border border-[#FF705D]/30 rounded">Disparate Impact: 0.627</span>
              <span className="px-2 py-0.5 bg-[#FAF2E8] dark:bg-[#201823] border border-[#DED3D8] dark:border-[#483A4E] rounded">Weakest-Link Cap: Red &le; 49.9</span>
            </div>
          </div>

        </div>
      </div>

      {/* 6. Scoring Integrity & Methodology Policy */}
      <div className="p-4 rounded border border-[#DED3D8] dark:border-[#332A37] bg-white dark:bg-[#332A37] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-1">
          <div className="font-mono font-bold text-[#FF705D] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#FF705D]" />
            <span>Weakest-Link Scoring &amp; Diagnostic Policy</span>
          </div>
          <p className="text-[#201823]/70 dark:text-[#FAF2E8]/70 max-w-2xl">
            Overall trust scores are governed by the weakest-link principle: any single axis below 50 caps the overall score at 74.9 (Amber Needs Review), and critical fairness violations on High-Risk systems cap the score at 49.9 (Red Action Required). High averages never conceal serious risks.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenGlossary}
          className="shrink-0 px-3.5 py-1.5 rounded border border-[#DED3D8] dark:border-[#483A4E] hover:border-[#D5F36A] font-mono text-xs font-bold text-[#201823] dark:text-[#FAF2E8] flex items-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#D5F36A]" />
          <span>Explore Terminology</span>
        </button>
      </div>

    </div>
  );
};
