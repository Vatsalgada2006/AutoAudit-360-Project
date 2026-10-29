import React from 'react';
import { Download, Printer, FileJson, AlertCircle, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Scale, Search, ShieldAlert, FileText } from 'lucide-react';
import { FullAuditResult } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { Tooltip } from '../Common/Tooltip';

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
      <div className="ticket-card p-10 text-center space-y-3 max-w-xl mx-auto my-8">
        <Scale className="w-12 h-12 text-stone-400 mx-auto" />
        <h3 className="font-display font-bold text-xl">Inspection Not Yet Executed</h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Return to the Start checkpoint to select a dataset and run the automated inspection suite.
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF6B2C]">
            Official Inspection Report Card
          </span>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-[#1B1B1F] dark:text-[#F6F1E7]">
            AI Model Card &amp; Diagnostic Findings
          </h2>
          <p className="text-xs text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70 mt-1">
            System: {auditResult.meta.system || auditResult.meta.author?.system || 'AutoAudit-360'} | Audit ID: {auditResult.meta.audit_id} | UTC: {auditResult.meta.timestamp}
          </p>
        </div>

        {/* Action Buttons: HTML, Print-to-PDF, JSON */}
        <div className="flex items-center gap-2 no-print shrink-0">
          <button
            onClick={onPrintPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-[#FF6B2C] rounded font-mono text-xs font-bold text-[#1B1B1F] dark:text-[#F6F1E7] shadow-xs transition-colors"
            title="Print Model Card or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span>Print to PDF</span>
          </button>

          <button
            onClick={onDownloadHtml}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-[#FF6B2C] rounded font-mono text-xs font-bold text-[#1B1B1F] dark:text-[#F6F1E7] shadow-xs transition-colors"
            title="Download Standalone HTML Report"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span>HTML Report</span>
          </button>

          <button
            onClick={onDownloadJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B2C] hover:bg-[#E55A1F] text-white rounded font-mono text-xs font-bold shadow-xs transition-colors"
            title="Download Raw Audit JSON Data"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Official Stamp & Executive Summary Card */}
      <div className="ticket-card p-6 border-l-8 border-l-[#FF6B2C] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-stone-500 font-bold block mb-1">
              Inspection Readiness Verdict
            </span>
            <div className="flex items-center gap-3">
              <span className={`stamp-badge text-base sm:text-lg py-2 px-5 ${
                ragStatus === 'green' ? 'stamp-pass' : ragStatus === 'amber' ? 'stamp-warn' : 'stamp-fail'
              }`}>
                {ragStatus === 'green' && <CheckCircle2 className="w-5 h-5" />}
                {ragStatus === 'amber' && <AlertTriangle className="w-5 h-5" />}
                {ragStatus === 'red' && <XCircle className="w-5 h-5" />}
                <span>{verdictStamp}</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs uppercase text-stone-500 block">Overall Trust Score</span>
            <div className="font-mono font-black text-4xl text-[#1B1B1F] dark:text-[#F6F1E7]">
              {overallScore.toFixed(1)}<span className="text-xl font-normal text-stone-400">/100</span>
            </div>
            {scores.raw_mean_score && scores.raw_mean_score !== overallScore && (
              <span className="text-xs font-mono text-stone-500 line-through">
                Raw Mean: {scores.raw_mean_score.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Cap Reason Alert Callout */}
        {capReason && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded font-mono text-xs text-red-800 dark:text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <strong>Weakest-Link Scoring Rule Triggered:</strong> {capReason}
            </div>
          </div>
        )}

        <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80 leading-relaxed border border-stone-200 dark:border-stone-800">
          <strong>Executive Summary:</strong> {scores.verdict_statement}
        </div>
      </div>

      {/* Six Scorecards with FULL Names as Bars */}
      <div className="ticket-card p-6 space-y-4">
        <h3 className="font-display font-bold text-lg text-[#1B1B1F] dark:text-[#F6F1E7]">
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
              ? 'bg-[#1F9D6B]'
              : numScore >= 50
              ? 'bg-[#F2B01E]'
              : 'bg-[#D6334A]';

            return (
              <div key={name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 font-bold text-[#1B1B1F] dark:text-[#F6F1E7]">
                    <Icon className="w-4 h-4 text-[#FF6B2C]" />
                    <span>{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={status}
                      label={!hasScore ? 'N/A' : status === 'pass' ? 'Good' : status === 'warn' ? 'Needs attention' : 'Problem'}
                      size="sm"
                    />
                    <span className="font-bold text-sm w-12 text-right">
                      {hasScore ? `${numScore.toFixed(1)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded relative overflow-hidden border border-stone-200 dark:border-stone-700">
                  <div
                    className={`h-full rounded transition-all duration-500 ${barColor}`}
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
        <div className="ticket-card p-5 space-y-3 border-red-300 dark:border-red-900">
          <h4 className="font-display font-bold text-base text-[#D6334A] flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            <span>Top Problems Found</span>
          </h4>
          <div className="space-y-2 font-mono text-xs">
            {problemsFound.slice(0, 3).map((prob, i) => (
              <div key={i} className="p-2.5 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-[#1B1B1F] dark:text-[#F6F1E7]">
                <strong>#{i + 1}:</strong> {prob}
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Recommended Actions */}
        <div className="ticket-card p-5 space-y-3 border-emerald-300 dark:border-emerald-900">
          <h4 className="font-display font-bold text-base text-[#1F9D6B] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Top Recommended Actions</span>
          </h4>
          <div className="space-y-2 font-mono text-xs">
            {recActions.slice(0, 3).map((act, i) => (
              <div key={i} className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[#1B1B1F] dark:text-[#F6F1E7]">
                <strong>#{i + 1}:</strong> {act}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Limitations, Intended Use & Model Specifications */}
      <div className="ticket-card p-5 space-y-3 text-xs font-mono">
        <h4 className="font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]">
          Diagnostic Scope, Limitations &amp; Cryptographic Trace
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

        <div className="p-2.5 bg-stone-100 dark:bg-stone-900 rounded text-stone-500 mt-2">
          <strong>Mandatory Notice:</strong> {auditResult.limitations[0] || 'Diagnostic findings, not legal certification.'}
        </div>
      </div>

    </div>
  );
};
