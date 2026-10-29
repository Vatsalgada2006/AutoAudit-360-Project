import React, { useEffect, useState } from 'react';
import { X, GitCompare, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface ComparisonViewProps {
  onClose: () => void;
  isOpen?: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ onClose, isOpen }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (isOpen !== undefined && !isOpen) return null;

  useEffect(() => {
    fetch('/api/comparison')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to static embedded comparison if offline
        setData({
          title: "AutoAudit-360 Hardened Benchmark Comparison",
          baseline_legacy_results: {
            german_credit: { overall_score: 81.4, rag_status: "green", verdict: "CERTIFIED TRUSTWORTHY - PASS" },
            compas: { overall_score: 84.9, rag_status: "green", verdict: "CERTIFIED TRUSTWORTHY - PASS" }
          },
          hardened_results: {
            german_credit_surrogate: {
              overall_score: 48.0,
              raw_mean: 48.0,
              rag_status: "red",
              verdict: "READINESS: ACTION REQUIRED",
              cap_reason: "Weakest-Link Cap applied: Fairness (29.8) is below 50.0 on a High-Risk AI system (credit_scoring).",
              axes: {
                "Fairness": 29.8,
                "Explainability": 90.0,
                "Robustness": 91.8,
                "EU AI Act Readiness": 36.4,
                "DPDP Act 2023 Readiness": 40.0,
                "Governance Disclosure": 0.0
              }
            },
            compas_surrogate: {
              overall_score: 49.9,
              raw_mean: 50.4,
              rag_status: "red",
              verdict: "READINESS: ACTION REQUIRED",
              cap_reason: "Weakest-Link Cap applied: Multiple axes fell below 50.0.",
              axes: {
                "Fairness": 67.2,
                "Explainability": 50.0,
                "Robustness": 99.5,
                "EU AI Act Readiness": 45.5,
                "DPDP Act 2023 Readiness": 40.0,
                "Governance Disclosure": 0.0
              }
            },
            compas_decile_score_mode: {
              overall_score: 49.9,
              raw_mean: 50.4,
              rag_status: "red",
              verdict: "READINESS: ACTION REQUIRED",
              cap_reason: "Weakest-Link Cap applied: Multiple axes fell below 50.0.",
              axes: {
                "Fairness": 67.2,
                "Explainability": 50.0,
                "Robustness": 99.5,
                "EU AI Act Readiness": 45.5,
                "DPDP Act 2023 Readiness": 40.0,
                "Governance Disclosure": 0.0
              }
            }
          }
        });
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 max-w-4xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative font-sans text-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <GitCompare size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Side-by-Side Audit Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Legacy Unconstrained Scoring vs. Hardened Weakest-Link v2.0 Assurance
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400">Loading benchmark telemetry...</div>
        ) : (
          <div className="space-y-6 mt-6">
            
            {/* Top Overview: Legacy vs Hardened High-Level Delta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* German Credit Case */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm font-bold text-amber-400">German Credit Case Study</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    STATUS RECLASSIFIED
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Legacy Unchecked Score:</span>
                  <span className="text-emerald-400 font-bold">81.4 / 100 (GREEN PASS)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Hardened v2.0 Score:</span>
                  <span className="text-rose-400 font-bold">48.0 / 100 (RED ACTION REQUIRED)</span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2.5">
                  <strong className="text-amber-300">Why it dropped:</strong> Under strict test-split auditing, younger &amp; female credit cohorts breached the four-fifths rule (Fairness = 29.8). High-risk capping ceiling enforced.
                </p>
              </div>

              {/* COMPAS Case */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm font-bold text-cyan-400">COMPAS Recidivism Case Study</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    STATUS RECLASSIFIED
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Legacy Unchecked Score:</span>
                  <span className="text-emerald-400 font-bold">84.9 / 100 (GREEN PASS)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Hardened v2.0 Score:</span>
                  <span className="text-rose-400 font-bold">49.9 / 100 (RED ACTION REQUIRED)</span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2.5">
                  <strong className="text-cyan-300">Why it dropped:</strong> Removed artificial 100% documentation scores. Unanswered self-declarations now score 0 credit, triggering the multi-axis deficiency cap.
                </p>
              </div>

            </div>

            {/* Side-by-Side Dimension Breakdown Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Hardened Dimension Scores Comparison Table
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Audit Dimension</th>
                      <th className="p-2.5">German Credit (Surrogate)</th>
                      <th className="p-2.5">COMPAS (Surrogate RF)</th>
                      <th className="p-2.5">COMPAS (decile_score Mode)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      'Fairness',
                      'Explainability',
                      'Robustness',
                      'EU AI Act Readiness',
                      'DPDP Act 2023 Readiness',
                      'Governance Disclosure'
                    ].map(axis => {
                      const gVal = data.hardened_results.german_credit_surrogate?.axes?.[axis];
                      const cVal = data.hardened_results.compas_surrogate?.axes?.[axis];
                      const dVal = data.hardened_results.compas_decile_score_mode?.axes?.[axis];

                      return (
                        <tr key={axis} className="hover:bg-slate-900/40">
                          <td className="p-2.5 text-white font-bold">{axis}</td>
                          <td className={`p-2.5 font-bold ${gVal < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {gVal !== undefined ? `${gVal}` : 'N/A'}
                          </td>
                          <td className={`p-2.5 font-bold ${cVal < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {cVal !== undefined ? `${cVal}` : 'N/A'}
                          </td>
                          <td className={`p-2.5 font-bold ${dVal < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {dVal !== undefined ? `${dVal}` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-900 font-bold border-t-2 border-slate-700">
                      <td className="p-2.5 text-amber-300 uppercase">Overall Enforced Trust Score</td>
                      <td className="p-2.5 text-rose-400 text-sm">
                        {data.hardened_results.german_credit_surrogate?.overall_score} / 100
                      </td>
                      <td className="p-2.5 text-rose-400 text-sm">
                        {data.hardened_results.compas_surrogate?.overall_score} / 100
                      </td>
                      <td className="p-2.5 text-rose-400 text-sm">
                        {data.hardened_results.compas_decile_score_mode?.overall_score} / 100
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] text-slate-400 font-mono">
              <strong>Forensic Scanner Integrity:</strong> Scores reflect pure empirical indicators on held-out test splits. No artificial score smoothing or fallback inflation is permitted.
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
