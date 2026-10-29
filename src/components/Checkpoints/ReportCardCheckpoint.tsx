import React from 'react';
import { Download, Printer, FileJson, AlertCircle, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Scale, Search, ShieldAlert, FileText, ArrowRight, Info } from 'lucide-react';
import { FullAuditResult } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';

interface ReportCardCheckpointProps {
  auditResult?: FullAuditResult | null;
  onDownloadHtml: () => void;
  onDownloadJson: () => void;
  onPrintPdf: () => void;
}

export const ReportCardCheckpoint: React.FC<ReportCardCheckpointProps> = ({
  auditResult,
  onDownloadHtml,
  onDownloadJson,
  onPrintPdf,
}) => {
  if (!auditResult) {
    return (
      <div className="observatory-card p-10 text-center space-y-3 max-w-xl mx-auto my-8">
        <Scale className="w-12 h-12 text-[#FF705D] mx-auto" />
        <h3 className="font-display font-bold text-xl text-[#201823] dark:text-[#FAF2E8]">
          Inspection Not Yet Executed
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Return to the Overview or New Audit tab to select a dataset and run the automated inspection suite.
        </p>
      </div>
    );
  }

  const scores = auditResult.scores;
  const overallScore = scores.overall_trust_score;
  const ragStatus = scores.rag_status;
  const verdictStamp = scores.readiness_verdict || 'READINESS: NEEDS REVIEW';
  const capReason = scores.cap_reason;
  const dimScores = scores.dimension_scores || {};

  // 6 Scorecards with FULL names
  const scorecards = [
    { name: 'Fairness', score: dimScores['Fairness'], icon: Scale },
    { name: 'Explainability', score: dimScores['Explainability'], icon: Search },
    { name: 'Robustness', score: dimScores['Robustness'], icon: ShieldAlert },
    { name: 'EU AI Act readiness', score: dimScores['EU AI Act Readiness'], icon: FileText },
    { name: 'DPDP Act readiness', score: dimScores['DPDP Act 2023 Readiness'], icon: FileText },
    { name: 'Governance disclosures', score: dimScores['Governance Disclosure'], icon: ShieldCheck },
  ];

  // Top 3 Problems Found derived dynamically
  const problemsFound: string[] = [];
  const recActions: string[] = [];

  // Check fairness
  const failingFairness = auditResult.fairness.filter(f => f.status === 'fail');
  if (failingFairness.length > 0) {
    problemsFound.push(`Disparate impact ratio fell below 0.80 for ${failingFairness.map(f => f.attribute).join(', ')}.`);
    recActions.push(`Apply pre-processing sample reweighing or threshold tuning on ${failingFairness[0].attribute} to satisfy the EEOC four-fifths rule.`);
  }

  // Check explainability proxies
  if (auditResult.explain.proxies_in_top_5 && auditResult.explain.proxies_in_top_5.length > 0) {
    problemsFound.push(`Proxy leakage detected: Features strongly correlate with protected identity in top model attributions.`);
    recActions.push(`Inspect and decouple high-correlation proxy columns (${auditResult.explain.proxies_in_top_5[0].feature}) before deployment.`);
  }

  // Check robustness
  if (auditResult.robustness.counterfactual_flip_rate && auditResult.robustness.counterfactual_flip_rate > 0.05) {
    problemsFound.push(`Counterfactual sensitivity: Model flips decisions in ${(auditResult.robustness.counterfactual_flip_rate * 100).toFixed(1)}% of cases purely on demographic trait swaps.`);
    recActions.push(`Incorporate counterfactual data augmentation during training to decouple outputs from identity attributes.`);
  }

  // Check compliance gaps
  const complianceGaps = auditResult.compliance.eu_ai_act.gaps || [];
  if (complianceGaps.length > 0 && problemsFound.length < 3) {
    problemsFound.push(complianceGaps[0]);
    recActions.push(auditResult.compliance.eu_ai_act.remediations[0] || 'Complete operational risk management and logging disclosures.');
  }

  // Fallbacks if fewer than 3 problems
  if (problemsFound.length === 0) {
    problemsFound.push('No severe deficiencies detected; operational metrics meet current baseline thresholds.');
    recActions.push('Maintain continuous post-market monitoring and audit logging in production.');
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DED3D8] dark:border-[#332A37] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-[#332A37] text-[#D5F36A] font-mono font-bold text-xs flex items-center justify-center">
              5
            </span>
            <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF705D]">
              Checkpoint 5: Model Card &amp; Synthesis
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-[#201823] dark:text-[#FAF2E8]">
            AI Model Card &amp; Diagnostic Synthesis
          </h2>
          <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70 mt-1 font-mono">
            System: {auditResult.meta.system || auditResult.meta.author?.system || 'AutoAudit-360'} | Audit ID: {auditResult.meta.audit_id} | UTC: {auditResult.meta.timestamp}
          </p>
        </div>

        {/* Action Buttons: HTML, Print-to-PDF, JSON */}
        <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
          <button
            onClick={onPrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF2E8] dark:bg-[#332A37] border border-[#DED3D8] dark:border-[#332A37] hover:border-[#FF705D] rounded-lg font-mono text-xs font-bold text-[#201823] dark:text-[#FAF2E8] shadow-xs transition-all cursor-pointer"
            title="Print Model Card or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#FF705D]" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onDownloadHtml}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF2E8] dark:bg-[#332A37] border border-[#DED3D8] dark:border-[#332A37] hover:border-[#FF705D] rounded-lg font-mono text-xs font-bold text-[#201823] dark:text-[#FAF2E8] shadow-xs transition-all cursor-pointer"
            title="Download Standalone HTML Report"
          >
            <Download className="w-3.5 h-3.5 text-[#FF705D]" />
            <span>HTML Report</span>
          </button>

          <button
            onClick={onDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#332A37] hover:bg-[#201823] text-[#FAF2E8] rounded-lg font-mono text-xs font-bold shadow-xs transition-all cursor-pointer border border-[#FF705D]/40"
            title="Download Raw Audit JSON Data"
          >
            <FileJson className="w-3.5 h-3.5 text-[#D5F36A]" />
            <span>Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Structured 4-Question Framing: What, Why */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#FF705D]">What is this?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            The final unified AI Model Card synthesizing measured fairness, SHAP explainability, adversarial stress tests, and regulatory checklist readiness into an auditable diagnostic document.
          </p>
        </div>

        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#D5F36A]">Why does it matter?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            EU AI Act Article 11 technical documentation and Article 13 transparency mandate detailed record-keeping of algorithmic design, evaluation metrics, and identified residual risks before real-world deployment.
          </p>
        </div>
      </div>

      {/* Official Stamp & Executive Summary Card */}
      <div className="observatory-card p-6 border-l-4 border-l-[#FF705D] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-stone-500 font-bold block mb-1">
              Diagnostic Readiness Verdict
            </span>
            <div className="flex items-center gap-3">
              <span className={`stamp-badge text-base sm:text-lg py-2 px-5 ${
                ragStatus === 'green' ? 'stamp-pass' : ragStatus === 'amber' ? 'stamp-warn' : 'stamp-fail'
              }`}>
                {ragStatus === 'green' && <CheckCircle2 className="w-5 h-5 text-[#D5F36A]" />}
                {ragStatus === 'amber' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {ragStatus === 'red' && <XCircle className="w-5 h-5 text-[#FF705D]" />}
                <span>{verdictStamp}</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs uppercase text-stone-500 block">Overall Trust Score</span>
            <div className="font-mono font-black text-4xl text-[#201823] dark:text-[#FAF2E8]">
              {overallScore.toFixed(1)}<span className="text-xl font-normal text-stone-400">/100</span>
            </div>
            {scores.raw_mean_score && scores.raw_mean_score !== overallScore && (
              <span className="text-xs font-mono text-stone-500 line-through">
                Raw Arithmetic Mean: {scores.raw_mean_score.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Cap Reason Alert Callout */}
        {capReason && (
          <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-lg font-mono text-xs text-red-900 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FF705D] mt-0.5" />
            <div>
              <strong>Weakest-Link Scoring Rule Triggered:</strong> {capReason}
            </div>
          </div>
        )}

        <div className="p-3.5 bg-[#FAF2E8] dark:bg-[#332A37]/50 rounded-lg text-xs font-body text-[#201823]/85 dark:text-[#FAF2E8]/85 leading-relaxed border border-[#DED3D8] dark:border-[#332A37]">
          <strong>Executive Summary:</strong> {scores.verdict_statement}
        </div>
      </div>

      {/* Six Scorecards with FULL Names as Bars */}
      <div className="observatory-card p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">
          Six Diagnostic Axis Scorecards
        </h3>

        <div className="space-y-4">
          {scorecards.map(({ name, score, icon: Icon }) => {
            const hasScore = score !== null && score !== undefined;
            const numScore = hasScore ? score : 0;
            const status: 'pass' | 'warn' | 'fail' | 'pending' = !hasScore
              ? 'pending'
              : numScore >= 75
              ? 'pass'
              : numScore >= 50
              ? 'warn'
              : 'fail';

            const barColor = !hasScore
              ? 'bg-stone-300'
              : numScore >= 75
              ? 'bg-[#D5F36A]'
              : numScore >= 50
              ? 'bg-[#C5B6C9]'
              : 'bg-[#FF705D]';

            return (
              <div key={name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 font-bold text-[#201823] dark:text-[#FAF2E8]">
                    <Icon className="w-4 h-4 text-[#FF705D]" />
                    <span>{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={status}
                      label={!hasScore ? 'N/A' : status === 'pass' ? 'Good' : status === 'warn' ? 'Needs attention' : 'Problem'}
                      size="sm"
                    />
                    <span className="font-bold text-sm w-12 text-right text-[#201823] dark:text-[#FAF2E8]">
                      {hasScore ? `${numScore.toFixed(1)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full bg-[#FAF2E8]/40 dark:bg-[#332A37]/60 rounded-full relative overflow-hidden border border-[#DED3D8]/60 dark:border-stone-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(numScore, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 Problems Found & Top 3 Recommended Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Top 3 Problems */}
        <div className="observatory-card p-5 space-y-3 border-t-2 border-t-[#FF705D]">
          <h4 className="font-display font-bold text-base text-[#FF705D] flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            <span>Top Identified Vulnerabilities</span>
          </h4>
          <div className="space-y-2 font-mono text-xs">
            {problemsFound.slice(0, 3).map((prob, i) => (
              <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-[#201823] dark:text-[#FAF2E8]">
                <strong>#{i + 1}:</strong> {prob}
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Recommended Actions */}
        <div className="observatory-card p-5 space-y-3 border-t-2 border-t-[#D5F36A]">
          <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D5F36A]" />
            <span>Top Recommended Remediations</span>
          </h4>
          <div className="space-y-2 font-mono text-xs">
            {recActions.slice(0, 3).map((act, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#FAF2E8] dark:bg-[#332A37]/60 border border-[#DED3D8] dark:border-[#332A37] text-[#201823] dark:text-[#FAF2E8]">
                <strong>#{i + 1}:</strong> {act}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Limitations, Intended Use & Model Specifications */}
      <div className="observatory-card p-5 space-y-3 text-xs font-mono border-l-4 border-l-[#C5B6C9]">
        <h4 className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
          Diagnostic Scope, Limitations &amp; Provenance
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600 dark:text-stone-400">
          <div>
            <strong>Evaluation Model:</strong> {auditResult.meta.algorithm} ({auditResult.meta.framework})<br />
            <strong>Total Dataset Records:</strong> {auditResult.data_summary.total_rows} ({auditResult.data_summary.test_split_rows || 'N/A'} in held-out test split)<br />
            <strong>Target Column:</strong> {auditResult.data_summary.target_column} (Positive label: {auditResult.data_summary.positive_label})
          </div>
          <div>
            <strong>Random Seed:</strong> {auditResult.meta.random_seed} (Stratified 5-seed CV)<br />
            <strong>Dataset SHA-256:</strong> <span className="break-all">{auditResult.meta.dataset_hash}</span><br />
            <strong>Regulatory Scope:</strong> EU AI Act Annex III &amp; India DPDP Act 2023
          </div>
        </div>

        <div className="p-2.5 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg text-stone-500 dark:text-stone-400 mt-2 border border-[#DED3D8] dark:border-[#332A37]">
          <strong>Mandatory Notice:</strong> {auditResult.limitations[0] || 'Diagnostic findings, not legal certification.'}
        </div>
      </div>

    </div>
  );
};
