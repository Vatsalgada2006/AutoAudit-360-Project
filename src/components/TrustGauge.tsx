import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle, X, ChevronRight } from 'lucide-react';
import { AuditScores } from '../types';

interface TrustGaugeProps {
  scores: AuditScores;
  onOpenWhyScore?: () => void;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({ scores, onOpenWhyScore }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [stampLanded, setStampLanded] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    let start = 0;
    const target = scores.overall_trust_score;
    const duration = 800;
    const steps = 25;
    const increment = target / steps;
    const intervalTime = duration / steps;

    setStampLanded(false);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayScore(target);
        setStampLanded(true);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start * 10) / 10);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [scores.overall_trust_score]);

  const { rag_status, cap_reason, readiness_verdict, verdict_statement, verdict_summary } = scores;
  const strokeDashoffset = 440 - (440 * (displayScore / 100));

  const stampColorClass =
    rag_status === 'green'
      ? 'border-emerald-500 text-emerald-400 bg-emerald-950/60 shadow-emerald-500/20'
      : rag_status === 'amber'
      ? 'border-amber-500 text-amber-400 bg-amber-950/60 shadow-amber-500/20'
      : 'border-rose-500 text-rose-400 bg-rose-950/60 shadow-rose-500/20';

  const stampLabel =
    readiness_verdict ||
    (rag_status === 'green'
      ? 'READINESS: PASS'
      : rag_status === 'amber'
      ? 'READINESS: REVIEW'
      : 'READINESS: ACTION REQUIRED');

  const verdictText =
    verdict_statement ||
    verdict_summary ||
    (rag_status === 'green'
      ? 'All audited fairness, interpretability, and regulatory governance dimensions satisfied operational tolerances.'
      : rag_status === 'amber'
      ? 'Review advised: Disparities or documentation gaps detected. Requires manual supervisory mitigation.'
      : 'Action required: Critical deficiencies in algorithmic fairness or statutory safeguards require remediation.');

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        
        {/* Left: Circular Dial & Verdict */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          {/* Circular Dial */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className={
                  rag_status === 'green'
                    ? 'text-emerald-500'
                    : rag_status === 'amber'
                    ? 'text-amber-500'
                    : 'text-rose-500'
                }
                strokeWidth="12"
                strokeDasharray={440}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-extrabold text-white">
                {displayScore}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                / 100 Index
              </span>
            </div>
          </div>

          {/* Text Verdict and Slam Stamp */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                Trust & Regulatory Assurance Status:
              </span>
            </div>

            {/* Stamp Slam-down Animation */}
            <div
              className={`inline-block px-4 py-1.5 border-2 border-dashed rounded-lg font-mono font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-300 transform shadow-lg ${stampColorClass} ${
                stampLanded ? 'scale-100 rotate-[-1deg] opacity-100' : 'scale-150 rotate-[-8deg] opacity-0'
              }`}
            >
              {stampLabel}
            </div>

            <p className="text-xs text-slate-300 mt-2 max-w-md">
              {verdictText}
            </p>

            {/* Cap alert if applied */}
            {cap_reason && (
              <div className="mt-2.5 text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/80 p-2 rounded flex items-start gap-2 text-left">
                <AlertOctagon size={14} className="shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-200">Weakest-Link Cap:</span> {cap_reason}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Dimension Quick Breakdown & "Why this score?" trigger */}
        <div className="flex flex-col items-center sm:items-end gap-3 w-full lg:w-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            {Object.entries(scores.dimension_scores).map(([axis, val]) => (
              <div key={axis} className="bg-slate-950/90 border border-slate-800 p-2 rounded-lg text-center min-w-[90px]">
                <div className="text-[10px] font-mono text-slate-400 uppercase truncate" title={axis}>
                  {axis.replace(' Readiness', '').replace(' Completeness', '')}
                </div>
                <div className={`font-mono text-sm font-bold mt-0.5 ${
                  val === null ? 'text-slate-500' : val >= 75 ? 'text-emerald-400' : val >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {val !== null ? val : 'N/A'}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => (onOpenWhyScore ? onOpenWhyScore() : setShowDrawer(true))}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/50 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle size={13} />
            Why this score? (Formula &amp; Cap Logic)
            <ChevronRight size={13} />
          </button>
        </div>

      </div>

      {/* Internal "Why this score?" Drawer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-xl p-6 shadow-2xl relative font-sans text-slate-200 text-xs">
            <button
              onClick={() => setShowDrawer(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white font-display flex items-center gap-2 mb-3">
              <ShieldCheck className="text-cyan-400" size={20} />
              Scoring Integrity &amp; Weakest-Link Cap Methodology
            </h3>

            <div className="space-y-3 font-sans">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded font-mono text-[11px]">
                <div className="text-slate-400">1. Raw Mean Score Calculation:</div>
                <div className="text-cyan-300 mt-1 font-bold">
                  Raw Mean = Average(all valid non-N/A axes) = {scores.raw_mean_score ?? scores.overall_trust_score}/100
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded text-[11px] space-y-1.5">
                <div className="font-bold text-amber-300 font-mono">2. Weakest-Link Cap Rules (Strict Guardrails):</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><strong>Single Axis Deficient (&lt;50):</strong> If any axis drops below 50.0, the overall score is strictly capped at <span className="font-mono text-amber-300">74.9</span> (Amber rating).</li>
                  <li><strong>High-Risk Fairness Deficient (&lt;50):</strong> On High-Risk systems (credit, recruiting, justice), fairness &lt;50 strictly caps overall score at <span className="font-mono text-rose-300">49.9</span> (Red rating).</li>
                  <li><strong>Multiple Deficiencies (&ge;2 axes &lt;50):</strong> Two or more axes below 50.0 strictly cap overall score at <span className="font-mono text-rose-300">49.9</span>.</li>
                </ul>
              </div>

              {cap_reason ? (
                <div className="bg-rose-950/50 border border-rose-800 p-3 rounded text-[11px]">
                  <div className="font-bold text-rose-300 font-mono">Cap Applied to Current Model:</div>
                  <div className="text-rose-200 mt-1">{cap_reason}</div>
                  <div className="text-slate-400 mt-1 font-mono">Enforced Ceiling: {scores.overall_trust_score}/100</div>
                </div>
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded text-[11px] text-emerald-300">
                  No cap applied: All evaluated axes satisfied the minimum 50.0 baseline threshold.
                </div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
