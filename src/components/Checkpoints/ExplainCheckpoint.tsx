import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Link2, Info, ArrowRight } from 'lucide-react';
import { ExplainabilityAudit } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { Tooltip } from '../Common/Tooltip';

interface ExplainCheckpointProps {
  explain: ExplainabilityAudit;
  isExpertMode: boolean;
}

export const ExplainCheckpoint: React.FC<ExplainCheckpointProps> = ({
  explain,
  isExpertMode,
}) => {
  const [showExpertDetails, setShowExpertDetails] = useState(isExpertMode);

  if (!explain || !explain.shap_success) {
    return (
      <div className="observatory-card p-8 text-center space-y-3">
        <Search className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">No Feature Attribution Data Available</h3>
        <p className="text-sm text-stone-500">
          SHAP attribution was not calculated or is excluded from precomputed predictions mode.
        </p>
      </div>
    );
  }

  const topFeatures = explain.top_features || [];
  const maxImportance = topFeatures.length > 0 ? Math.max(...topFeatures.map(f => f.importance)) : 1.0;
  const proxies = explain.proxies_in_top_5 || [];
  const directSensitive = explain.sensitive_in_top_5 || [];

  const isPass = explain.status === 'pass';
  const isWarn = explain.status === 'warn';

  const answerText = isPass
    ? `The model bases decisions primarily on legitimate behavioral and operational signals with zero detected proxy leakage.`
    : isWarn
    ? `Inspection alert: ${proxies.length} proxy feature(s) strongly correlate with protected identity attributes (|r| > 0.40).`
    : `Severe bias risk: Protected demographic attributes directly dominate top prediction weights.`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. Header & Station Identifier */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#332A37] text-[#D5F36A] font-mono font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF705D]">
            Checkpoint 2: Explainability Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#201823] dark:text-[#FAF2E8]">
          Which factors drive the decisions?
        </h2>
      </div>

      {/* 2. Structured 4-Question Framing: What, Why */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#FF705D]">What is this?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            Global feature attribution calculated via Shapley values (SHAP). It measures how much each feature pushes predictions toward favourable or adverse outcomes, coupled with proxy correlation screening (|r| &gt; 0.40).
          </p>
        </div>

        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#D5F36A]">Why does it matter?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            EU AI Act Article 13 mandates transparency and interpretability for high-risk systems. It ensures algorithms do not rely on hidden proxies (like postal code or civil status) that recreate prohibited discrimination.
          </p>
        </div>
      </div>

      {/* 3. One-sentence answer with Status Badge */}
      <div className="observatory-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[#FF705D]">
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-body font-semibold text-[#201823] dark:text-[#FAF2E8]">
            {answerText}
          </div>
          <p className="text-xs text-[#201823]/60 dark:text-[#FAF2E8]/60">
            Explainer: <strong>{explain.explainer_type}</strong> | {explain.flagged_count} flagged proxy/sensitive attributes detected.
          </p>
        </div>
        <StatusBadge
          status={explain.status}
          label={explain.status === 'pass' ? 'Good' : explain.status === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* 4. The Evidence: Charts + "What this means" Box */}
      <div className="space-y-6">
        
        {/* Global SHAP Feature Importance */}
        <div className="observatory-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
                Global Feature Attributions (Mean |SHAP Value|)
              </h4>
              <p className="text-xs text-[#201823]/60 dark:text-[#FAF2E8]/60">
                Ranking of the highest-impact decision drivers on the held-out evaluation sample.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#332A37] dark:bg-[#FAF2E8]" />Standard Signal</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF705D]" />Proxy Risk (|r|&gt;0.4)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" />Protected Sensitive</span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-3 pt-2">
            {topFeatures.map((f, i) => {
              const widthPct = maxImportance > 0 ? (f.importance / maxImportance) * 100 : 0;
              const isSensitive = f.is_sensitive;
              const isProxy = f.is_proxy;

              const barColor = isSensitive
                ? 'bg-red-600'
                : isProxy
                ? 'bg-[#FF705D]'
                : 'bg-[#332A37] dark:bg-[#C5B6C9]';

              return (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[#201823] dark:text-[#FAF2E8] flex items-center gap-1.5">
                      <span className="text-stone-400">#{i + 1}</span>
                      <span className="font-bold">{f.feature}</span>
                      {isSensitive && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 rounded text-[9px] font-bold">
                          PROTECTED IDENTITY
                        </span>
                      )}
                      {isProxy && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-[#FF705D] rounded text-[9px] font-bold">
                          PROXY (r={f.proxy_correlation?.toFixed(2)})
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-[#201823] dark:text-[#FAF2E8]">{f.importance.toFixed(4)}</span>
                  </div>

                  <div className="h-3 w-full bg-[#FAF2E8]/40 dark:bg-[#332A37]/60 rounded-full relative overflow-hidden border border-[#DED3D8]/60 dark:border-stone-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(widthPct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scientific rigor note: Attribution vs Causation */}
          <div className="p-3 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg border border-[#DED3D8] dark:border-[#332A37] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-[#201823] dark:text-[#FAF2E8]">
              <Info className="w-3.5 h-3.5 text-[#FF705D]" />
              Scientific Clarification: Statistical Attribution vs. Real-World Causation
            </div>
            <p className="text-[11px] leading-relaxed">
              SHAP values measure empirical correlation and statistical influence within the trained model weights. A high SHAP attribution does <strong>not</strong> establish that a feature causes real-world creditworthiness or recidivism risk. Features with zero SHAP value may still be causal mechanisms masked by collinearity.
            </p>
          </div>
        </div>

        {/* Evidence 2: Flagged Proxy Risk Breakdown */}
        {proxies.length > 0 && (
          <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#FF705D]">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#FF705D]" />
              <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
                Hidden Proxy Detection (Correlation with Protected Attributes)
              </h4>
            </div>

            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70">
              Features that seem neutral on the surface can act as backdoor stand-ins for protected groups if their Pearson or Cramer's V correlation exceeds 0.40.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
              {proxies.map(p => (
                <div key={p.feature} className="p-3 rounded bg-[#FAF2E8] dark:bg-[#332A37]/60 border border-[#DED3D8] dark:border-[#332A37]">
                  <div className="font-bold text-[#201823] dark:text-[#FAF2E8]">{p.feature}</div>
                  <div className="text-[11px] text-[#FF705D] font-bold mt-1">
                    Correlates with: <strong>{p.sensitive_attribute}</strong> (|r| = {p.correlation.toFixed(2)})
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg border border-[#DED3D8] dark:border-[#332A37] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80">
              <strong>Audit finding:</strong> Even if protected identity columns are dropped prior to training, the model can reconstruct demographic identity through high-correlation proxies like account duration or co-applicant status.
            </div>
          </div>
        )}

        {/* 5. What should you investigate next? */}
        <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#D5F36A]">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#201823] dark:text-[#D5F36A]" />
            <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
              What should you investigate next?
            </h4>
          </div>
          <ul className="text-xs space-y-2 text-[#201823]/80 dark:text-[#FAF2E8]/80 list-disc pl-4">
            <li>
              <strong>Proxy regularization:</strong> If features like housing or co-borrower status have high proxy correlations (|r| &gt; 0.40), consider adversarial debiasing or feature de-correlation techniques.
            </li>
            <li>
              <strong>Causal domain review:</strong> Convene subject-matter experts to verify whether the top 3 features represent fair, legally permissible evaluation criteria.
            </li>
            <li>
              <strong>Local explanations:</strong> Test individual applicant edge cases to ensure borderline scores are not pushed over denial thresholds by unexplainable feature interactions.
            </li>
          </ul>
        </div>
      </div>

      {/* 6. Collapsible "Expert Details" Section */}
      <div className="observatory-card p-4 space-y-3">
        <button
          onClick={() => setShowExpertDetails(!showExpertDetails)}
          className="w-full flex items-center justify-between text-left font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]"
        >
          <span>Expert Details: Shapley Values &amp; Proxy Screening Methodology</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#DED3D8] dark:border-[#332A37] space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#FF705D]">Shapley Attribution Mathematics:</div>
              <div className="p-3 bg-[#FAF2E8] dark:bg-[#201823] rounded-lg border border-[#DED3D8] dark:border-[#332A37] space-y-1.5 text-[11px] leading-relaxed">
                <div>• ϕ_i(x) = ∑ [|S|! (|F| - |S| - 1)! / |F|!] * [f_x(S ∪ &#123;i&#125;) - f_x(S)]</div>
                <div>• Evaluated across background reference sample (max 80 samples) and evaluation test split (200 instances).</div>
                <div>• Proxy correlation threshold: Pearson / Cramer's V |r| &gt; 0.40 against protected identity vectors.</div>
                <div>• Strict fallback: When model type or environment prevents SHAP calculation, attribution is recorded as N/A rather than fabricated.</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
