import React from 'react';
import { FullAuditResult } from '../../types';
import { Download, Printer, FileText, FileCode, CheckCircle, Shield, Info, AlertOctagon } from 'lucide-react';

interface ModelCardTabProps {
  auditResult: FullAuditResult;
}

export const ModelCardTab: React.FC<ModelCardTabProps> = ({ auditResult }) => {
  if (!auditResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No Model Card compiled yet.
      </div>
    );
  }

  const { meta, data_summary, performance, fairness, explain, robustness, compliance, scores, limitations } = auditResult;

  const downloadHtmlReport = () => {
    const auditId = meta.audit_id;
    const url = `/api/modelcard/${auditId}.html`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `modelcard_${auditId}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const downloadJsonReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autoaudit360_${meta.audit_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const stampClass =
    scores.rag_status === 'green'
      ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
      : scores.rag_status === 'amber'
      ? 'border-amber-500 text-amber-400 bg-amber-950/40'
      : 'border-rose-500 text-rose-400 bg-rose-950/40';

  const stampText =
    scores.readiness_verdict ||
    (scores.rag_status === 'green'
      ? 'READINESS: PASS'
      : scores.rag_status === 'amber'
      ? 'READINESS: REVIEW'
      : 'READINESS: ACTION REQUIRED');

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar: Export Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            AI Model Card Compilation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit ID: <code className="text-amber-300 font-mono">{meta.audit_id}</code> | SHA-256: <code className="text-slate-400 font-mono">{meta.dataset_hash.slice(0, 16)}...</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={downloadHtmlReport}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download size={14} /> Download HTML Report
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} /> Print / Save as PDF
          </button>

          <button
            onClick={downloadJsonReport}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileCode size={14} /> Download JSON
          </button>
        </div>
      </div>

      {/* Printable Model Card Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl text-slate-200 print:bg-white print:text-black print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-700 pb-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 print:text-slate-800 font-bold block mb-1">
              AUTOAUDIT-360 &bull; FORENSIC REGULATORY AI MODEL CARD
            </span>
            <h2 className="text-2xl font-bold font-display text-white print:text-black">
              System Specification: {meta.model_name}
            </h2>
            <div className="text-xs font-mono text-slate-400 print:text-slate-600 mt-1 flex flex-wrap gap-3">
              <span>Timestamp: {meta.timestamp}</span>
              <span>Framework: {meta.framework}</span>
              <span>Deterministic Seed: {meta.random_seed}</span>
            </div>
          </div>

          <div className="text-right">
            <div className={`px-4 py-1.5 border-2 border-dashed rounded-lg font-mono font-bold text-xs tracking-wider uppercase inline-block print:border-black print:text-black ${stampClass}`}>
              {stampText}
            </div>
            <div className="text-xs font-mono text-slate-400 print:text-slate-700 mt-1 font-bold">
              Trust Score: {scores.overall_trust_score} / 100
            </div>
          </div>
        </div>

        {/* Cap alert if applied */}
        {scores.cap_reason && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 mb-5 flex items-start gap-2 print:border-black print:bg-slate-100 print:text-black">
            <AlertOctagon size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Weakest-Link Score Cap Applied:</strong> {scores.cap_reason}
              <div className="text-[11px] text-rose-300 print:text-slate-700 mt-0.5">
                Raw mean score: {scores.raw_mean_score ?? scores.overall_trust_score}/100 &rarr; Enforced readiness ceiling: {scores.overall_trust_score}/100.
              </div>
            </div>
          </div>
        )}

        {/* Executive Summary Block */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 mb-6 print:border-slate-300 print:bg-slate-50 print:text-slate-900">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300 print:text-slate-800 mb-1">
            Executive Summary &amp; Diagnostic Verdict
          </h4>
          <p className="text-xs leading-relaxed text-slate-300 print:text-slate-800 font-sans">
            {scores.verdict_statement || scores.verdict_summary || 'Diagnostic audit completed across statistical fairness, interpretability, and regulatory governance checklists.'}
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 mb-6 print:border-slate-300 print:bg-slate-50 print:text-slate-800">
          <strong>Statutory Transparency Notice:</strong> Diagnostic audit based on the four-fifths rule and EU AI Act / DPDP Act checklists. Not legal certification. Findings reflect statistical bounds and self-declared disclosures.
        </div>

        {/* Section 1: Model Details & Intended Use */}
        <section className="mb-6">
          <h3 className="font-display font-bold text-white print:text-black text-sm uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
            1. Model Architecture &amp; Scope of Use
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <div className="text-slate-400">Algorithm Class:</div>
              <div className="text-white print:text-black font-semibold mt-0.5">{meta.algorithm}</div>
              <div className="text-slate-400 mt-2">Target Variable:</div>
              <div className="text-amber-400 print:text-black font-semibold mt-0.5">{data_summary.target_column} (Positive Label: {data_summary.positive_label})</div>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <div className="text-slate-400">Intended Application:</div>
              <div className="text-white print:text-black font-semibold mt-0.5">{compliance.use_case.title}</div>
              <div className="text-slate-400 mt-2">EU AI Act Classification:</div>
              <div className="text-cyan-400 print:text-black font-semibold mt-0.5">{compliance.eu_ai_act.classification}</div>
            </div>
          </div>
        </section>

        {/* Section 2: Dataset Demographics */}
        <section className="mb-6">
          <h3 className="font-display font-bold text-white print:text-black text-sm uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
            2. Dataset Scale &amp; Split
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">Total Records:</span>
              <div className="text-base font-bold text-white print:text-black">{data_summary.total_rows}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">Test Split N:</span>
              <div className="text-base font-bold text-cyan-400 print:text-black">{data_summary.test_split_rows || 200}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">Feature Count:</span>
              <div className="text-base font-bold text-white print:text-black">{data_summary.total_features}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">Positive Rate:</span>
              <div className="text-base font-bold text-white print:text-black">{data_summary.positive_rate}%</div>
            </div>
          </div>
        </section>

        {/* Section 3: Performance */}
        <section className="mb-6">
          <h3 className="font-display font-bold text-white print:text-black text-sm uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
            3. Predictive Quantitative Performance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">Accuracy:</span>
              <div className="text-base font-bold text-white print:text-black">{performance.accuracy}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">F1-Score:</span>
              <div className="text-base font-bold text-white print:text-black">{performance.f1_score}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">Precision / Recall:</span>
              <div className="text-base font-bold text-white print:text-black">{performance.precision} / {performance.recall}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-slate-400">ROC-AUC:</span>
              <div className="text-base font-bold text-white print:text-black">{performance.roc_auc}</div>
            </div>
          </div>
        </section>

        {/* Section 4: Fairness Assessment */}
        <section className="mb-6">
          <h3 className="font-display font-bold text-white print:text-black text-sm uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
            4. Algorithmic Fairness &amp; Parity Matrix (Held-out Test Split, n=500 Bootstraps)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 print:bg-slate-100 print:text-black">
                <tr>
                  <th className="p-2">Protected Attribute</th>
                  <th className="p-2">Privileged Cohort</th>
                  <th className="p-2">Disparate Impact [95% CI]</th>
                  <th className="p-2">Demographic Parity Diff</th>
                  <th className="p-2">Equal Opportunity Diff</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {fairness.filter(f => !f.is_intersectional).map(f => (
                  <tr key={f.attribute}>
                    <td className="p-2 font-bold text-white print:text-black">{f.attribute}</td>
                    <td className="p-2 text-slate-300 print:text-black">{f.privileged_group}</td>
                    <td className="p-2 font-bold text-white print:text-black">
                      {f.metrics.disparate_impact_ratio}
                      {f.confidence_intervals_95?.disparate_impact && (
                        <div className="text-[10px] text-slate-400 print:text-slate-600">
                          [{f.confidence_intervals_95.disparate_impact[0].toFixed(3)}, {f.confidence_intervals_95.disparate_impact[1].toFixed(3)}]
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-slate-300 print:text-black">{(f.metrics.demographic_parity_difference * 100).toFixed(1)}%</td>
                    <td className="p-2 text-slate-300 print:text-black">{(f.metrics.equal_opportunity_difference * 100).toFixed(1)}%</td>
                    <td className="p-2 uppercase font-bold text-[11px]">
                      <span className={f.status === 'pass' ? 'text-emerald-400 print:text-black' : f.status === 'warn' ? 'text-amber-400 print:text-black' : 'text-rose-400 print:text-black'}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Trust Radar Breakdown Table */}
        <section className="mb-6">
          <h3 className="font-display font-bold text-white print:text-black text-sm uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
            5. Dimension Scores &amp; Weakest-Link Enforcements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            {Object.entries(scores.dimension_scores).map(([axis, val]) => (
              <div key={axis} className="p-2.5 bg-slate-950 rounded border border-slate-800 print:bg-slate-50 print:border-slate-300">
                <span className="text-slate-400">{axis}:</span>
                <div className={`text-sm font-bold mt-0.5 ${
                  val === null ? 'text-slate-500' : val >= 75 ? 'text-emerald-400 print:text-black' : val >= 50 ? 'text-amber-400 print:text-black' : 'text-rose-400 print:text-black'
                }`}>
                  {val !== null ? `${val} / 100` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Limitations */}
        <section className="mb-6">
          <h3 className="font-display font-bold text-white print:text-black text-sm uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
            6. Known Audit Limitations &amp; Risk Boundaries
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300 print:text-slate-800 font-sans">
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </section>

        {/* Neutral Academic Prototype Footer */}
        <div className="mt-8 pt-5 border-t-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400 print:text-slate-700">
          <div>
            <strong>AutoAudit-360 | Trustworthy AI Audit &amp; Compliance Suite | Academic prototype</strong>
          </div>
          <div className="text-right">
            Deterministic Verification Stamp: <span className="text-amber-400 print:text-black">{meta.dataset_hash.slice(0, 16)}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
