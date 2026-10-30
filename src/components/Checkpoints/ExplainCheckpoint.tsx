import React from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Link2
} from 'lucide-react';
import { ExplainabilityAudit } from '../../types';

interface ExplainCheckpointProps {
  explain: ExplainabilityAudit;
  isExpertMode?: boolean;
}

export const ExplainCheckpoint: React.FC<ExplainCheckpointProps> = ({ explain }) => {
  if (!explain || !explain.shap_success) {
    return (
      <div className="content-card p-8 text-center space-y-3 max-w-xl mx-auto my-6 bg-white border border-[#DCE5EB]">
        <Search className="w-10 h-10 text-[#38A9DB] mx-auto" />
        <h3 className="font-bold text-lg text-[#111111]">
          No SHAP Feature Attribution Data Available
        </h3>
        <p className="text-sm text-[#555555]">
          SHAP explanations require a model training run or precomputed feature importance. Run an audit on German Credit, COMPAS, or your own CSV to inspect feature contributions.
        </p>
      </div>
    );
  }

  const topFeatures = explain.top_features || [];
  const topFive = topFeatures.slice(0, 5);
  const maxImportance = topFive.length > 0 ? Math.max(...topFive.map((f) => f.importance)) : 1.0;
  const proxies = explain.proxies_in_top_5 || [];
  const directSensitive = explain.sensitive_in_top_5 || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Card */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#38A9DB] border border-[#DCE5EB] text-xs font-semibold">
          <Search className="w-3.5 h-3.5 text-[#38A9DB]" />
          <span>Checkpoint 2: Explainability</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
          Global SHAP Feature Attribution &amp; Proxy Detection
        </h2>
        <p className="text-sm text-[#555555]">
          Understand which features dominate model predictions using Shapley Additive Explanations (SHAP), and inspect whether covert proxies leak sensitive information.
        </p>
      </div>

      {/* 2. Critical Causation Disclaimer Banner */}
      <div className="content-card p-4 bg-sky-50 border border-[#DCE5EB] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#38A9DB] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-[#555555]">
          <strong className="text-[#111111] block text-sm">
            Core Interpretability Principle: Contribution vs. Causation
          </strong>
          <p className="leading-relaxed">
            SHAP (Shapley Additive Explanations) measures the mathematical contribution of each feature to the model's predictions based on cooperative game theory.
            <strong> A high SHAP value indicates statistical influence within this specific trained model, NOT a real-world causal relationship.</strong> Do not infer that altering a feature will directly alter real-world applicant risk.
          </p>
        </div>
      </div>

      {/* 3. Proxy and Direct Sensitive Attribute Warnings */}
      {proxies.length > 0 || directSensitive.length > 0 ? (
        <div className="content-card p-4 bg-amber-50/70 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-[#111111] block">
              Sensitive Information Leakage Alert:
            </span>
            {directSensitive.length > 0 && (
              <p className="text-amber-900">
                Direct sensitive attributes ({directSensitive.join(', ')}) rank among the top 5 most influential features, creating severe disparate treatment liability.
              </p>
            )}
            {proxies.length > 0 && (
              <p className="text-amber-900">
                Covert proxy features detected: <strong>{proxies.map(p => p.feature).join(', ')}</strong> strongly correlate with sensitive attributes (|r| &gt; 0.40), acting as indirect discriminators.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="content-card p-4 bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900">
            <strong className="text-emerald-950">Clean Feature Hygiene:</strong> No direct protected attributes or high-correlation proxy variables (|r| &gt; 0.40) appear in the top 5 decision drivers.
          </div>
        </div>
      )}

      {/* 4. Top 5 Most Influential Features (Simple Feature-Importance Chart) */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE5EB] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#111111]">
              Top 5 Most Influential Features (Mean |SHAP| Value)
            </h3>
            <p className="text-xs text-[#555555]">
              Ranked by their average absolute impact on model probability outputs
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-[#555555]">
            Global Importance
          </span>
        </div>

        {/* Feature Bars */}
        <div className="space-y-3 pt-1">
          {topFive.map((feat, idx) => {
            const widthPct = Math.max(8, (feat.importance / maxImportance) * 100);
            return (
              <div key={feat.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-[#555555] font-bold text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-[#111111]">{feat.feature}</span>
                    {feat.is_proxy && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                        Proxy Variable
                      </span>
                    )}
                    {feat.is_sensitive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-semibold">
                        Protected Attribute
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#111111]">
                    |SHAP|: {feat.importance.toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      feat.is_sensitive
                        ? 'bg-red-500'
                        : feat.is_proxy
                        ? 'bg-amber-500'
                        : 'bg-[#38A9DB]'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Short Explanations of Feature Influence */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <h3 className="font-bold text-base text-[#111111] border-b border-[#DCE5EB] pb-3">
          How These Top Features Influence Model Predictions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {topFive.map((feat, idx) => {
            const isHighInfluence = idx < 2;
            return (
              <div
                key={feat.feature}
                className="p-3.5 rounded-lg border border-[#DCE5EB] bg-gray-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111]">{feat.feature}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isHighInfluence
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isHighInfluence ? 'High Predictive Weight' : 'Secondary Influence'}
                  </span>
                </div>
                <p className="text-[#555555] leading-relaxed">
                  The model evaluates {feat.feature} as one of the primary quantitative drivers of prediction outcome probability.
                </p>
                {feat.proxy_correlation !== undefined && (
                  <div className="text-[11px] text-amber-700 flex items-center gap-1 pt-0.5">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>
                      Correlated with protected attribute: r = {feat.proxy_correlation.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
