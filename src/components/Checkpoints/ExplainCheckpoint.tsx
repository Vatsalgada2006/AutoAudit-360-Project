import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Link2 } from 'lucide-react';
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
        <h3 className="font-display font-bold text-lg">No Feature Attribution Data Available</h3>
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
    ? `The model bases its decisions primarily on legitimate financial/behavioral signals with zero detected proxy leakage.`
    : isWarn
    ? `Inspection alert: ${proxies.length} proxy feature(s) strongly correlate with protected identity attributes in the top decision drivers.`
    : `Severe bias risk: Protected demographic attributes directly dominate top prediction weights.`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. The Plain Question (Large) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#1B1B1F] dark:bg-[#F6F1E7] text-white dark:text-[#1B1B1F] font-mono font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#C9A66B]">
            Checkpoint 2: Explainability Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#1B1B1F] dark:text-[#F6F1E7]">
          Which factors drive the decisions?
        </h2>
      </div>

      {/* 2. One-sentence answer with Status Badge */}
      <div className="observatory-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[#C9A66B]">
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-body font-semibold text-[#1B1B1F] dark:text-[#F6F1E7]">
            {answerText}
          </div>
          <p className="text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
            Explainer: <strong>{explain.explainer_type}</strong> | {explain.flagged_count} flagged proxy/sensitive attributes detected.
          </p>
        </div>
        <StatusBadge
          status={explain.status}
          label={explain.status === 'pass' ? 'Good' : explain.status === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* 3. The Evidence: Charts + "What this means" Box */}
      <div className="space-y-6">
        
        {/* Chart 1: Global SHAP Feature Importance */}
        <div className="observatory-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
              Global Feature Attributions (Mean |SHAP Value|)
            </h4>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C9A66B]" />Standard Feature</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F2B01E]" />Proxy Risk</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D6334A]" />Protected Sensitive</span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-2.5">
            {topFeatures.map((f, i) => {
              const widthPct = maxImportance > 0 ? (f.importance / maxImportance) * 100 : 0;
              const isSensitive = f.is_sensitive;
              const isProxy = f.is_proxy;

              const barColor = isSensitive
                ? 'bg-[#D6334A]'
                : isProxy
                ? 'bg-[#F2B01E]'
                : 'bg-[#C9A66B]';

              return (
                <div key={f.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[#1B1B1F] dark:text-[#F6F1E7] flex items-center gap-1.5">
                      <span className="text-stone-400">#{i + 1}</span>
                      <span>{f.feature}</span>
                      {isSensitive && (
                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded text-[9px] font-bold">
                          PROTECTED
                        </span>
                      )}
                      {isProxy && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded text-[9px] font-bold">
                          PROXY (r={f.proxy_correlation?.toFixed(2)})
                        </span>
                      )}
                    </span>
                    <span className="font-bold">{f.importance.toFixed(4)}</span>
                  </div>

                  <div className="h-3.5 w-full bg-stone-100 dark:bg-stone-800 rounded relative overflow-hidden border border-stone-200 dark:border-stone-700">
                    <div
                      className={`h-full rounded transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(widthPct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* "What this means" Box */}
          <div className="p-3 bg-[#C9A66B]/5 rounded border border-[#C9A66B]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
            <strong>What this means:</strong> <Tooltip term="SHAP" definition="Shapley Additive Explanations: game-theoretic measure of empirical statistical contribution of a feature to the model's output." /> values show how strongly each input pushes predictions up or down. Note: SHAP represents statistical contribution in the trained model, not causal necessity in the real world.
          </div>
        </div>

        {/* Evidence 2: Flagged Proxy Risk Breakdown */}
        {proxies.length > 0 && (
          <div className="observatory-card p-5 space-y-3 border-amber-400/40">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#F2B01E]" />
              <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
                Hidden Proxy Detection (Correlation with Protected Attributes)
              </h4>
            </div>

            <p className="text-xs text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70">
              Features that seem neutral on the surface can act as backdoor stand-ins for protected groups if their correlation exceeds 0.40.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
              {proxies.map(p => (
                <div key={p.feature} className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="font-bold text-[#1B1B1F] dark:text-[#F6F1E7]">{p.feature}</div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                    Correlates with: <strong>{p.sensitive_attribute}</strong> (|r| = {p.correlation.toFixed(2)})
                  </div>
                </div>
              ))}
            </div>

            {/* "What this means" Box */}
            <div className="p-3 bg-[#C9A66B]/5 rounded border border-[#C9A66B]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
              <strong>What this means:</strong> Even if protected identity columns are removed, the model can reconstruct demographic traits through high-correlation proxies like zip code or account type.
            </div>
          </div>
        )}
      </div>

      {/* 4. Collapsible "Expert Details" Section */}
      <div className="observatory-card p-4 space-y-3">
        <button
          onClick={() => setShowExpertDetails(!showExpertDetails)}
          className="w-full flex items-center justify-between text-left font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]"
        >
          <span>Expert Details: Shapley Values &amp; Proxy Screening Methodology</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#C9A66B]">Shapley Attribution Formula:</div>
              <div className="p-2.5 bg-stone-100 dark:bg-stone-900 rounded space-y-1">
                <div>• ϕ_i(x) = ∑ [|S|! (|F| - |S| - 1)! / |F|!] * [f_x(S ∪ &#123;i&#125;) - f_x(S)]</div>
                <div>• Evaluated across background reference sample (max 80 samples) and evaluation test split (200 instances).</div>
                <div>• Proxy correlation threshold: Pearson / Cramer's V |r| &gt; 0.40 against protected identity vectors.</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
