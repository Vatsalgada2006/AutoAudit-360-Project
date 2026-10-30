import React from 'react';
import {
  Scale,
  Search,
  ShieldAlert,
  FileCheck2,
  PlayCircle,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Cpu,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { FullAuditResult } from '../../types';

interface OverviewViewProps {
  onStartNewAudit: () => void;
  onExploreSample: (sample: 'german_credit' | 'compas') => void;
  onOpenGlossary?: () => void;
  isAuditing?: boolean;
  auditStage?: number;
  auditResult?: FullAuditResult | null;
  onNavigateToSection?: (section: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onStartNewAudit,
  onExploreSample,
  isAuditing,
  auditStage = 0,
  auditResult,
  onNavigateToSection,
}) => {
  // Current active scores
  const fairnessStatus = auditResult?.fairness?.[0]?.status ?? 'warn';
  const fairnessDi = auditResult?.fairness?.[0]?.metrics?.disparate_impact_ratio?.toFixed(3) ?? '0.528';
  const robustnessStatus = auditResult?.robustness?.status ?? 'pass';
  const robustnessBaseline = auditResult?.robustness?.baseline_metrics?.accuracy
    ? `${(auditResult.robustness.baseline_metrics.accuracy * 100).toFixed(1)}%`
    : '74.0%';
  const regScore = auditResult?.scores?.dimension_scores?.['EU AI Act Readiness'] ?? 62;
  const verdict = auditResult?.scores?.readiness_verdict ?? 'PRELIMINARY: ACTION REQUIRED';

  // Recent Audit History
  const auditHistory = [
    {
      id: 'german_credit',
      dataset: 'German Credit Lending',
      records: '1,000 rows',
      model: 'Random Forest (Baseline)',
      verdict: 'Action Required',
      fairness: 'Fail (DI 0.528)',
      robustness: '74.0% (Stable)',
      regulatory: '62% Readiness',
      status: 'warn',
      date: 'Oct 28, 2026',
    },
    {
      id: 'compas',
      dataset: 'COMPAS Recidivism Risk',
      records: '6,172 rows',
      model: 'Logistic Regression',
      verdict: 'Needs Review',
      fairness: 'Fail (DI 0.672)',
      robustness: '68.5% (Fair)',
      regulatory: '58% Readiness',
      status: 'fail',
      date: 'Oct 27, 2026',
    },
    {
      id: 'custom_hr',
      dataset: 'HR Recruitment Screening (Sample)',
      records: '4,500 rows',
      model: 'Gradient Boosting',
      verdict: 'Verified Ready',
      fairness: 'Pass (DI 0.842)',
      robustness: '81.2% (Strong)',
      regulatory: '79% Readiness',
      status: 'pass',
      date: 'Oct 25, 2026',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Hero & Project Identity */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#38A9DB] border border-[#DCE5EB] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38A9DB]" />
              <span>Domain: AI Governance, Policy &amp; Risk Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              AutoAudit-360 Dashboard
            </h1>
            <p className="text-sm text-[#555555] max-w-2xl leading-relaxed">
              End-to-End Trustworthy AI Audit &amp; Regulatory Compliance Suite.
              Evaluate classification models for fairness, explainability, robustness, and regulatory readiness under the EU AI Act and India DPDP Act 2023.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onStartNewAudit}
              className="btn-primary text-sm shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>New AI Audit</span>
            </button>
            <button
              onClick={() => onExploreSample('german_credit')}
              className="btn-secondary text-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-[#38A9DB]" />
              <span>Load German Credit</span>
            </button>
            <button
              onClick={() => onExploreSample('compas')}
              className="btn-secondary text-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-[#38A9DB]" />
              <span>Load COMPAS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Audits */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Total Audits</span>
            <Database className="w-4 h-4 text-[#38A9DB]" />
          </div>
          <div className="text-2xl font-bold text-[#111111]">14</div>
          <p className="text-[11px] text-[#555555]">Completed evaluations</p>
        </div>

        {/* Card 2: Models Evaluated */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Models Evaluated</span>
            <Cpu className="w-4 h-4 text-[#38A9DB]" />
          </div>
          <div className="text-2xl font-bold text-[#111111]">6</div>
          <p className="text-[11px] text-[#555555]">Classifiers tested</p>
        </div>

        {/* Card 3: Fairness Status */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Fairness Status</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base font-bold text-[#111111] truncate">
            {fairnessStatus === 'pass' ? 'Pass (≥ 0.80)' : `Caution (DI ${fairnessDi})`}
          </div>
          <p className="text-[11px] text-[#555555]">80% rule screening</p>
        </div>

        {/* Card 4: Robustness Status */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Robustness Status</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-[#111111] truncate">
            {robustnessStatus === 'pass' ? `Resilient (${robustnessBaseline})` : 'Sensitivity Flagged'}
          </div>
          <p className="text-[11px] text-[#555555]">Noise &amp; perturbation tests</p>
        </div>

        {/* Card 5: Regulatory Readiness */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Regulatory Readiness</span>
            <FileCheck2 className="w-4 h-4 text-[#38A9DB]" />
          </div>
          <div className="text-base font-bold text-[#111111]">
            {regScore}% Readiness
          </div>
          <p className="text-[11px] text-[#555555]">EU AI Act &bull; DPDP</p>
        </div>
      </div>

      {/* 3. The Four Audit Stages Overview */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE5EB] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">
              The Four Audit Stages
            </h2>
            <p className="text-xs text-[#555555]">
              Systematic multi-checkpoint inspection of classification algorithms before deployment
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-sky-50 text-[#38A9DB] border border-[#DCE5EB]">
            Modules 1 &ndash; 4 Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1: Fairness */}
          <div
            onClick={() => onNavigateToSection?.('fairness')}
            className="p-4 rounded-lg border border-[#DCE5EB] bg-white hover:border-[#38A9DB] hover:shadow-xs transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#38A9DB]">
                Stage 1
              </span>
              <Scale className="w-4 h-4 text-[#38A9DB]" />
            </div>
            <h3 className="font-bold text-sm text-[#111111]">1. Fairness Audit</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Quantifies Demographic Parity, Disparate Impact (80% four-fifths rule), group-wise selection rates, and reference vs protected cohorts.
            </p>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#38A9DB]">
              <span>View Fairness</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Stage 2: Explainability */}
          <div
            onClick={() => onNavigateToSection?.('explain')}
            className="p-4 rounded-lg border border-[#DCE5EB] bg-white hover:border-[#38A9DB] hover:shadow-xs transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#38A9DB]">
                Stage 2
              </span>
              <Search className="w-4 h-4 text-[#38A9DB]" />
            </div>
            <h3 className="font-bold text-sm text-[#111111]">2. Explainability</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Computes global SHAP feature attributions, isolates the top 5 most influential features, and detects covert proxy variables.
            </p>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#38A9DB]">
              <span>View Explanations</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Stage 3: Robustness */}
          <div
            onClick={() => onNavigateToSection?.('robustness')}
            className="p-4 rounded-lg border border-[#DCE5EB] bg-white hover:border-[#38A9DB] hover:shadow-xs transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#38A9DB]">
                Stage 3
              </span>
              <ShieldAlert className="w-4 h-4 text-[#38A9DB]" />
            </div>
            <h3 className="font-bold text-sm text-[#111111]">3. Robustness Testing</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Stress tests model resilience via synthetic label-flipping (5-20%), Gaussian feature noise, and counterfactual identity flips.
            </p>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#38A9DB]">
              <span>View Stress Tests</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Stage 4: Regulatory Compliance */}
          <div
            onClick={() => onNavigateToSection?.('regulatory')}
            className="p-4 rounded-lg border border-[#DCE5EB] bg-white hover:border-[#38A9DB] hover:shadow-xs transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#38A9DB]">
                Stage 4
              </span>
              <FileCheck2 className="w-4 h-4 text-[#38A9DB]" />
            </div>
            <h3 className="font-bold text-sm text-[#111111]">4. Regulatory Compliance</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Evaluates readiness checklists for EU AI Act Annex III &amp; Articles 9-15, and India DPDP Act 2023 Sections 4-13 with gap analysis.
            </p>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#38A9DB]">
              <span>View Compliance</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quantitative Dimension Scores & Active Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Diagnostic Status */}
        <div className="content-card p-5 bg-white border border-[#DCE5EB] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE5EB] pb-2">
            <h3 className="font-bold text-sm text-[#111111]">Active Model Status</h3>
            <span className="text-xs text-[#555555]">
              {auditResult ? auditResult.meta.model_name : 'Default Baseline'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#555555]">Readiness Verdict:</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  auditResult?.scores?.rag_status === 'green'
                    ? 'badge-pass'
                    : auditResult?.scores?.rag_status === 'amber'
                    ? 'badge-warn'
                    : 'badge-fail'
                }`}
              >
                {verdict}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#555555]">Overall Trust Score:</span>
              <span className="font-bold text-[#111111]">
                {auditResult?.scores?.overall_trust_score ?? 68}/100
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#555555]">Weakest-Link Cap:</span>
              <span className="text-[#555555] font-mono text-[11px]">
                {auditResult?.scores?.cap_reason ?? 'Fairness parity disparity'}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <span className="font-semibold text-[#111111] block">Scoring Breakdown:</span>
            <div className="space-y-1.5">
              {[
                { label: 'Fairness Disparity', score: auditResult?.scores?.dimension_scores?.['Fairness'] ?? 64 },
                { label: 'SHAP Explainability', score: auditResult?.scores?.dimension_scores?.['Explainability'] ?? 80 },
                { label: 'Noise Robustness', score: auditResult?.scores?.dimension_scores?.['Robustness'] ?? 78 },
                { label: 'EU AI Act Readiness', score: auditResult?.scores?.dimension_scores?.['EU AI Act Readiness'] ?? 62 },
                { label: 'India DPDP Readiness', score: auditResult?.scores?.dimension_scores?.['DPDP Act 2023 Readiness'] ?? 68 },
              ].map((dim) => (
                <div key={dim.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#555555]">{dim.label}</span>
                    <span className="font-bold text-[#111111]">{dim.score}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        dim.score >= 75 ? 'bg-emerald-500' : dim.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Audit History Table */}
        <div className="content-card p-5 bg-white border border-[#DCE5EB] space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#DCE5EB] pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#38A9DB]" />
              <h3 className="font-bold text-sm text-[#111111]">Recent Audit History</h3>
            </div>
            <span className="text-xs text-[#555555]">3 Benchmarks Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE5EB] text-[#555555]">
                  <th className="py-2 font-semibold">Dataset &bull; Model</th>
                  <th className="py-2 font-semibold">Fairness</th>
                  <th className="py-2 font-semibold">Robustness</th>
                  <th className="py-2 font-semibold">Regulatory</th>
                  <th className="py-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5EB]">
                {auditHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-[#111111]">{item.dataset}</div>
                      <div className="text-[11px] text-[#555555]">{item.model}</div>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'pass'
                            ? 'badge-pass'
                            : item.status === 'warn'
                            ? 'badge-warn'
                            : 'badge-fail'
                        }`}
                      >
                        {item.fairness}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#555555]">{item.robustness}</td>
                    <td className="py-2.5 text-[#555555]">{item.regulatory}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => {
                          if (item.id === 'compas' || item.id === 'german_credit') {
                            onExploreSample(item.id as any);
                          } else {
                            onStartNewAudit();
                          }
                        }}
                        className="text-xs font-semibold text-[#38A9DB] hover:text-[#2C92C0] cursor-pointer"
                      >
                        View &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-sky-50 border border-[#DCE5EB] flex items-center justify-between text-xs">
            <span className="text-[#555555]">
              Looking to audit your custom model or data? Upload your CSV dataset directly.
            </span>
            <button
              onClick={onStartNewAudit}
              className="px-2.5 py-1 bg-white hover:bg-sky-100 text-[#38A9DB] border border-[#DCE5EB] rounded font-semibold transition-colors shrink-0 cursor-pointer"
            >
              Upload CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
