import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Sliders, Info, ArrowRight } from 'lucide-react';
import { FairnessAuditItem, MitigationResult } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { Tooltip } from '../Common/Tooltip';

interface FairnessCheckpointProps {
  items: FairnessAuditItem[];
  mitigation?: MitigationResult | null;
  isExpertMode: boolean;
}

export const FairnessCheckpoint: React.FC<FairnessCheckpointProps> = ({
  items,
  mitigation,
  isExpertMode,
}) => {
  const [selectedAttrIndex, setSelectedAttrIndex] = useState(0);
  const [showExpertDetails, setShowExpertDetails] = useState(isExpertMode);

  if (!items || items.length === 0) {
    return (
      <div className="observatory-card p-8 text-center space-y-3">
        <Scale className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">No Fairness Inspection Data</h3>
        <p className="text-sm text-stone-500">Run an inspection from the Overview or New Audit tab to analyze fairness metrics.</p>
      </div>
    );
  }

  const activeItem = items[selectedAttrIndex] || items[0];
  const metrics = activeItem.metrics;
  const worstDi = metrics?.disparate_impact_ratio ?? 1.0;
  const worstDpd = metrics?.demographic_parity_difference ?? 0.0;
  const worstEod = metrics?.equal_opportunity_difference ?? 0.0;

  // Real result one-sentence answer
  const isPass = activeItem.status === 'pass';
  const isWarn = activeItem.status === 'warn';
  const answerText = isPass
    ? `All demographic cohorts satisfy the four-fifths rule and demographic parity thresholds on the held-out test split.`
    : isWarn
    ? `Borderline parity detected: Disparate impact ratio (${worstDi.toFixed(2)}) is in the caution band [0.70, 0.80).`
    : `Parity violation detected: Demographic groups face disparate outcomes with disparate impact (${worstDi.toFixed(2)}) below the 0.80 benchmark.`;

  const intersectionalItem = items.find(i => i.is_intersectional);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. Header & Station Identifier */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#332A37] text-[#D5F36A] font-mono font-bold text-xs flex items-center justify-center">
            1
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF705D]">
            Checkpoint 1: Fairness Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#201823] dark:text-[#FAF2E8]">
          Is everyone treated equally?
        </h2>
      </div>

      {/* 2. Structured 4-Question Framing: What, Why, Findings, Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#FF705D]">What is this?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            Evaluation of model prediction outcomes across demographic groups (such as Sex, Age, and Race) to detect whether favourable classifications are systematically skewed toward one cohort.
          </p>
        </div>

        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#D5F36A]">Why does it matter?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            Statutory frameworks like EU AI Act Article 10 and US EEOC guidelines require models affecting human livelihoods (credit, recruitment, justice) to avoid unjustified adverse impact.
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
            Attribute under inspection: <strong>{activeItem.attribute}</strong> (Reference group: {activeItem.privileged_group}) | Test sample: {activeItem.test_sample_size || 'Held-out split'} records.
          </p>
        </div>
        <StatusBadge
          status={activeItem.status}
          label={activeItem.status === 'pass' ? 'Good' : activeItem.status === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* Sensitive Attribute Selector Tabs */}
      <div className="flex gap-2 border-b border-[#DED3D8] dark:border-[#332A37] pb-2 overflow-x-auto">
        {items.map((item, idx) => (
          <button
            key={item.attribute}
            onClick={() => setSelectedAttrIndex(idx)}
            className={`px-3.5 py-1.5 rounded font-mono text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 border ${
              selectedAttrIndex === idx
                ? 'bg-[#332A37] text-[#FAF2E8] border-[#FF705D] shadow-xs'
                : 'bg-white dark:bg-[#332A37] text-stone-700 dark:text-stone-300 border-[#DED3D8] dark:border-[#483A4E] hover:border-[#D5F36A]'
            }`}
          >
            <span>{item.is_intersectional ? `Intersectional (${item.attribute})` : item.attribute}</span>
            <span className={`w-2 h-2 rounded-full ${
              item.status === 'pass' ? 'bg-[#D5F36A]' : item.status === 'warn' ? 'bg-amber-400' : 'bg-[#FF705D]'
            }`} />
          </button>
        ))}
      </div>

      {/* 4. The Evidence: Charts + "What this means" Box */}
      <div className="space-y-6">
        
        {/* Chart 1: Subgroup Selection Rates with EEOC 80% line */}
        <div className="observatory-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
              Subgroup Favourable Selection Rates (%) &amp; Four-Fifths Threshold Line
            </h4>
            <span className="font-mono text-xs text-[#201823]/60 dark:text-[#FAF2E8]/60">
              Reference Rate: {activeItem.chart_data.privileged_rate_pct.toFixed(1)}% | 80% Line: {activeItem.chart_data.eighty_percent_line_pct.toFixed(1)}%
            </span>
          </div>

          {/* Bar Chart Representation with CI Whiskers & Sample Sizes */}
          <div className="space-y-3">
            {activeItem.chart_data.labels.map((label, i) => {
              const val = activeItem.chart_data.selection_rates_pct[i] || 0;
              const whisker = activeItem.chart_data.ci_whiskers_pct ? activeItem.chart_data.ci_whiskers_pct[i] : null;
              const subStats = activeItem.subgroup_breakdown[label];
              const sampleSize = subStats ? subStats.size : 0;
              const isInsufficient = sampleSize < 30;

              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[#201823] dark:text-[#FAF2E8] flex items-center gap-1.5">
                      {label}
                      <span className="text-[10px] text-stone-500 font-normal">
                        (n={sampleSize})
                      </span>
                      {isInsufficient && (
                        <span className="px-1.5 py-0.2 bg-[#FF705D]/20 text-[#FF705D] border border-[#FF705D]/40 rounded text-[9px] font-bold">
                          insufficient sample (&lt;30)
                        </span>
                      )}
                    </span>
                    <span className="font-bold">{val.toFixed(1)}%</span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-4 w-full bg-stone-100 dark:bg-[#201823] rounded relative overflow-hidden border border-[#DED3D8] dark:border-[#483A4E]">
                    {/* The 80% Reference Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#FF705D] z-10"
                      style={{ left: `${Math.min(activeItem.chart_data.eighty_percent_line_pct, 100)}%` }}
                      title={`Four-fifths 80% screening threshold (${activeItem.chart_data.eighty_percent_line_pct}%)`}
                    />

                    {/* Bar fill */}
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        val < activeItem.chart_data.eighty_percent_line_pct
                          ? 'bg-[#FF705D]'
                          : 'bg-[#D5F36A]'
                      }`}
                      style={{ width: `${Math.min(val, 100)}%` }}
                    />
                  </div>

                  {whisker && (
                    <div className="text-[10px] font-mono text-stone-500 dark:text-[#C5B6C9] text-right">
                      Bootstrap 95% CI: [{whisker[0].toFixed(1)}%, {whisker[1].toFixed(1)}%]
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* "What this means" Box */}
          <div className="p-3.5 bg-stone-50 dark:bg-[#201823] rounded border border-[#DED3D8] dark:border-[#483A4E] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            <strong className="text-[#FF705D]">What this means:</strong> The coral vertical line indicates the four-fifths (80%) screening heuristic. A group rate bar falling to the left of this line (such as {worstDi.toFixed(2)}) means that under the favourable outcome definition, this cohort's positive outcome rate is {(worstDi * 100).toFixed(0)}% of the reference group's rate. This warrants investigation, but does not alone establish legal discrimination without examining business necessity and job/risk relevance.
          </div>
        </div>

        {/* Chart 2: Intersectional Fairness Cohort Matrix */}
        {intersectionalItem && (
          <div className="observatory-card p-5 space-y-3">
            <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
              Intersectional Cohort Analysis ({intersectionalItem.attribute})
            </h4>
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70">
              Combines demographic traits to identify compound disparities that single-attribute scans conceal.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {intersectionalItem.chart_data.labels.map((lbl, idx) => {
                const rate = intersectionalItem.chart_data.selection_rates_pct[idx] || 0;
                const subStats = intersectionalItem.subgroup_breakdown[lbl];
                const count = subStats ? subStats.size : 0;
                const isUnder = rate < intersectionalItem.chart_data.eighty_percent_line_pct;

                return (
                  <div key={lbl} className={`p-2.5 rounded border text-xs ${
                    isUnder ? 'bg-[#FF705D]/10 border-[#FF705D]/40' : 'bg-stone-50 dark:bg-[#201823] border-[#DED3D8] dark:border-[#483A4E]'
                  }`}>
                    <div className="font-bold truncate text-[#201823] dark:text-[#FAF2E8]" title={lbl}>{lbl}</div>
                    <div className="flex items-center justify-between mt-1 font-mono">
                      <span className="text-[10px] text-stone-500">n={count}</span>
                      <span className={`font-bold ${isUnder ? 'text-[#FF705D]' : 'text-[#2D5A1E] dark:text-[#D5F36A]'}`}>{rate.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggested Next Steps Card */}
        <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#D5F36A]">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#D5F36A]" />
            <h4 className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
              What should you investigate next?
            </h4>
          </div>
          <ul className="text-xs space-y-1.5 text-[#201823]/80 dark:text-[#FAF2E8]/80 font-body">
            <li>• <strong>Review Base Rates:</strong> Check whether historical labels contain systemic collection bias or unequal reporting rates.</li>
            <li>• <strong>Evaluate Feature Attribution:</strong> Inspect Checkpoint 2 (Explainability) to see if proxy features correlate heavily with {activeItem.attribute}.</li>
            <li>• <strong>Explore Reweighing:</strong> Pre-processing sample reweighing (Kamiran &amp; Calders) can equalize selection frequencies without sacrificing predictive validity.</li>
          </ul>
        </div>

        {/* Mitigation Demo Panel (Reweighing & Threshold Curve) */}
        {mitigation && (
          <div className="observatory-card p-5 space-y-4 border-2 border-[#D5F36A]/40">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
                  Bias Mitigation &amp; Trade-Off Analysis
                </h4>
                <p className="text-xs text-[#201823]/65 dark:text-[#FAF2E8]/65">
                  Pre-processing reweighing (Kamiran &amp; Calders) demonstrates how adjusting training weights closes parity gaps.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#D5F36A]/20 text-[#2D5A1E] dark:text-[#D5F36A] rounded font-mono text-xs font-bold border border-[#D5F36A]/40">
                DI: +{(mitigation.reweighed.di_improvement * 100).toFixed(1)}% Boost
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded bg-stone-100 dark:bg-[#201823] border border-[#DED3D8] dark:border-[#483A4E] space-y-2">
                <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-300">Baseline (Unmitigated)</span>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between"><span>Disparate Impact:</span><strong>{mitigation.baseline.disparate_impact.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Parity Gap (DPD):</span><strong>{mitigation.baseline.demographic_parity_diff.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Test Accuracy:</span><strong>{(mitigation.baseline.accuracy * 100).toFixed(1)}%</strong></div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#D5F36A]/10 border border-[#D5F36A]/30 space-y-2">
                <span className="font-mono text-xs font-bold text-[#2D5A1E] dark:text-[#D5F36A]">Reweighed (Mitigated)</span>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between"><span>Disparate Impact:</span><strong>{mitigation.reweighed.disparate_impact.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Parity Gap (DPD):</span><strong>{mitigation.reweighed.demographic_parity_diff.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Test Accuracy:</span><strong>{(mitigation.reweighed.accuracy * 100).toFixed(1)}%</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Collapsible "Expert Details" Section */}
      <div className="observatory-card p-4 space-y-3">
        <button
          onClick={() => setShowExpertDetails(!showExpertDetails)}
          className="w-full flex items-center justify-between text-left font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]"
        >
          <span>Expert Details: Mathematical Formulas &amp; 95% Confidence Intervals</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#DED3D8] dark:border-[#483A4E] space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#FF705D]">Governing Fairness Formulas:</div>
              <div className="p-2.5 bg-stone-100 dark:bg-[#201823] rounded space-y-1 border border-[#DED3D8] dark:border-[#483A4E]">
                <div>• <Tooltip term="Disparate Impact" definition="Ratio of favorable outcome rate of unprivileged group to privileged group (EEOC four-fifths rule screening: >= 0.80)." />: DI = P(Ŷ=1 | A=unprivileged) / P(Ŷ=1 | A=privileged)</div>
                <div>• <Tooltip term="Demographic Parity Difference" definition="Absolute difference in favorable selection rates between groups (Tolerance: <= 0.10)." />: DPD = |P(Ŷ=1 | A=privileged) - P(Ŷ=1 | A=unprivileged)|</div>
                <div>• <Tooltip term="Equal Opportunity Difference" definition="Absolute difference in recall (true positive rates) between groups (Tolerance: <= 0.10)." />: EOD = |TPR(privileged) - TPR(unprivileged)|</div>
                <div>• <Tooltip term="Equalized Odds Gap" definition="Maximum disparity between True Positive Rate gap and False Positive Rate gap." />: EO = max(|TPR_priv - TPR_unpriv|, |FPR_priv - FPR_unpriv|)</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#FF705D]">Point Estimates &amp; Bootstrap 95% CIs (n=500):</div>
              <div className="overflow-x-auto">
                <table className="w-full border border-[#DED3D8] dark:border-[#483A4E] text-left">
                  <thead className="bg-stone-100 dark:bg-[#201823]">
                    <tr>
                      <th className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">Metric</th>
                      <th className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">Test Value</th>
                      <th className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">95% Confidence Interval</th>
                      <th className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">Screening Tolerance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">Disparate Impact (DI)</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E] font-bold">{worstDi.toFixed(4)}</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">[{activeItem.confidence_intervals_95?.disparate_impact[0] ?? 0}, {activeItem.confidence_intervals_95?.disparate_impact[1] ?? 1}]</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">&gt;= 0.80 (EEOC Four-Fifths Screening)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">Demographic Parity Diff (DPD)</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E] font-bold">{worstDpd.toFixed(4)}</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">[{activeItem.confidence_intervals_95?.demographic_parity_difference[0] ?? 0}, {activeItem.confidence_intervals_95?.demographic_parity_difference[1] ?? 1}]</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">&lt;= 0.10</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">Equal Opportunity Diff (EOD)</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E] font-bold">{worstEod.toFixed(4)}</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">[{activeItem.confidence_intervals_95?.equal_opportunity_difference[0] ?? 0}, {activeItem.confidence_intervals_95?.equal_opportunity_difference[1] ?? 1}]</td>
                      <td className="p-2 border border-[#DED3D8] dark:border-[#483A4E]">&lt;= 0.10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
