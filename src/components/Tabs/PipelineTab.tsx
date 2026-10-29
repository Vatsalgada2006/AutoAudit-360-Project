import React from 'react';
import { Database, FileCheck, Layers, Scale, Sparkles, Shield, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PipelineTab: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Data Ingestion & Integrity',
      icon: Database,
      desc: 'Ingests arbitrary tabular CSV datasets (up to 20 MB). Generates deterministic SHA-256 hash. Identifies column dtypes (numeric vs. categorical). Discretizes continuous sensitive variables (such as applicant age) into generational cohorts.',
      specs: ['SHA-256 Checksum', 'Generational Age Binning', 'Handling Missing Attributes']
    },
    {
      num: '02',
      title: 'Model Loading / Auto-Baseline',
      icon: Layers,
      desc: 'Deserializes user-supplied scikit-learn Pipeline or wrapped PyTorch estimator exposing predict() and predict_proba(). If omitted, trains a default RandomForest pipeline with StandardScaler and OneHotEncoder.',
      specs: ['Pickle Sandboxing', 'PyTorch Sklearn Wrapper', 'RandomForest Baseline']
    },
    {
      num: '03',
      title: 'Fairness & Algorithmic Parity',
      icon: Scale,
      desc: 'Computes Disparate Impact (EEOC 80% Rule), Demographic Parity Difference, and Equal Opportunity Difference (True Positive Rate gap). Calculates subgroup False Positive Rates and False Negative Rates. Flags samples with N < 30.',
      specs: ['Four-Fifths Rule (DI)', 'Demographic Parity Gap', 'Equal Opportunity (EOD)']
    },
    {
      num: '04',
      title: 'Explainability & Proxy Detection',
      icon: Sparkles,
      desc: 'Applies global SHAP (TreeExplainer or PermutationExplainer) to quantify marginal feature attributions. Audits top 5 drivers for sensitive feature leakage or correlated proxy variables (Spearman rank corr > 0.40).',
      specs: ['Global Tree SHAP', 'Spearman Proxy Analysis', 'Causality Manifold Notice']
    },
    {
      num: '05',
      title: 'Adversarial Robustness Stress Test',
      icon: Shield,
      desc: 'Evaluates resilience by injecting 5%, 10%, 20% synthetic label flips and Gaussian feature jitter (1%, 5%, 10% standard deviation). Tracks prediction flip rates and fairness drift under noise.',
      specs: ['10% Label Poisoning Drop', '5% Perturbation Flip Rate', 'Fairness Stability Delta']
    },
    {
      num: '06',
      title: 'Regulatory Compliance Mapping',
      icon: FileCheck,
      desc: 'Classifies domain against EU AI Act Annex III High-Risk categorizations. Maps audit evidence to Articles 9–15 and India DPDP Act 2023 Sections 4–13. Scans for PII, Aadhaar patterns, and minor (<18 yrs) cohorts.',
      specs: ['Annex III High-Risk Check', 'Articles 9-15 Scoring', 'DPDP Sec 4-13 & Minors']
    },
    {
      num: '07',
      title: 'Model Card & Trust Radar Synthesis',
      icon: FileText,
      desc: 'Aggregates 6 dimensions into a single Trust Index (0–100) and RAG status (Green/Amber/Red). Compiles a production AI Model Card downloadable as self-contained HTML, JSON, or black-and-white printable PDF.',
      specs: ['6-Axis Radar Chart', 'RAG Status Verification', 'Self-Contained Model Card']
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          End-to-End Trustworthy AI Audit Architecture (Modules 1–4)
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          The AutoAudit-360 architecture executes a synchronized 7-stage verification loop, combining rigorous mathematical fair lending standards with international statutory conformity requirements under the European Union AI Act and the Digital Personal Data Protection Act (DPDP) 2023 of India.
        </p>
      </div>

      {/* Visual Step-by-Step Flow */}
      <div className="relative">
        <div className="space-y-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Left Step Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-400/50 flex items-center justify-center shrink-0 text-amber-400 font-mono font-bold text-sm shadow-inner transition-colors">
                    {s.num}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-display font-bold text-white text-base">
                        {s.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                {/* Right Specs Badges */}
                <div className="flex flex-wrap md:flex-col gap-1.5 shrink-0 self-end md:self-center">
                  {s.specs.map(spec => (
                    <span
                      key={spec}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      &bull; {spec}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
