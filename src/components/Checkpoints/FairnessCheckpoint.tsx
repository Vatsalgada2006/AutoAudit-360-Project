import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
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
  const [customThreshold, setCustomThreshold] = useState(0.50);

  if (!items || items.length === 0) {
    return (
      <div className="ticket-card p-8 text-center space-y-3">
        <Scale className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="font-display font-bold text-lg">No Fairness Inspection Data</h3>
        <p className="text-sm text-stone-500">Run an inspection from the Start checkpoint to analyze fairness metrics.</p>
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
    ? `All demographic cohorts satisfy the four-fifths rule and parity thresholds on the held-out test split.`
    : isWarn
    ? `Borderline parity detected: Disparate impact ratio (${worstDi.toFixed(2)}) is in the caution band [0.70, 0.80).`
    : `Parity violation detected: Demographic groups face disparate outcomes with disparate impact (${worstDi.toFixed(2)}) below the 0.80 benchmark.`;

  // Filter intersectional and individual items
  const individualItems = items.filter(i => !i.is_intersectional);
  const intersectionalItem = items.find(i => i.is_intersectional);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. The Plain Question (Large) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#1B1B1F] dark:bg-[#F6F1E7] text-white dark:text-[#1B1B1F] font-mono font-bold text-xs flex items-center justify-center">
            1
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF6B2C]">
            Checkpoint 1: Fairness Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#1B1B1F] dark:text-[#F6F1E7]">
          Is everyone treated equally?
        </h2>
      </div>

      {/* 2. One-sentence answer with Status Badge */}
      <div className="ticket-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[#FF6B2C]">
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-body font-semibold text-[#1B1B1F] dark:text-[#F6F1E7]">
            {answerText}
          </div>
          <p className="text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
            Attribute under inspection: <strong>{activeItem.attribute}</strong> (Privileged reference: {activeItem.privileged_group}) | Test sample: {activeItem.test_sample_size || 'Held-out split'} records.
          </p>
        </div>
        <StatusBadge
          status={activeItem.status}
          label={activeItem.status === 'pass' ? 'Good' : activeItem.status === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* Sensitive Attribute Selector Tabs */}
      <div className="flex gap-2 border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 pb-2 overflow-x-auto">
        {items.map((item, idx) => (
          <button
            key={item.attribute}
            onClick={() => setSelectedAttrIndex(idx)}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 border ${
              selectedAttrIndex === idx
                ? 'bg-[#1B1B1F] text-white dark:bg-[#F6F1E7] dark:text-[#1B1B1F] border-transparent shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#FF6B2C]'
            }`}
          >
            <span>{item.is_intersectional ? `Intersectional (${item.attribute})` : item.attribute}</span>
            <span className={`w-2 h-2 rounded-full ${
              item.status === 'pass' ? 'bg-[#1F9D6B]' : item.status === 'warn' ? 'bg-[#F2B01E]' : 'bg-[#D6334A]'
            }`} />
          </button>
        ))}
      </div>

      {/* 3. The Evidence: Charts + "What this means" Box */}
      <div className="space-y-6">
        
        {/* Chart 1: Subgroup Selection Rates with EEOC 80% line */}
        <div className="ticket-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
              Subgroup Selection Rates (%) & EEOC Reference Line
            </h4>
            <span className="font-mono text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
              Reference: {activeItem.chart_data.privileged_rate_pct.toFixed(1)}% | 80% Line: {activeItem.chart_data.eighty_percent_line_pct.toFixed(1)}%
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
                    <span className="font-semibold text-[#1B1B1F] dark:text-[#F6F1E7] flex items-center gap-1.5">
                      {label}
                      <span className="text-[10px] text-stone-500 font-normal">
                        (n={sampleSize})
                      </span>
                      {isInsufficient && (
                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded text-[9px] font-bold">
                          insufficient sample (&lt;30)
                        </span>
                      )}
                    </span>
                    <span className="font-bold">{val.toFixed(1)}%</span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 rounded relative overflow-hidden border border-stone-200 dark:border-stone-700">
                    {/* The 80% Reference Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${Math.min(activeItem.chart_data.eighty_percent_line_pct, 100)}%` }}
                      title={`EEOC 80% threshold (${activeItem.chart_data.eighty_percent_line_pct}%)`}
                    />

                    {/* Bar fill */}
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        val < activeItem.chart_data.eighty_percent_line_pct
                          ? 'bg-[#D6334A]'
                          : 'bg-[#1F9D6B]'
                      }`}
                      style={{ width: `${Math.min(val, 100)}%` }}
                    />
                  </div>

                  {whisker && (
                    <div className="text-[10px] font-mono text-stone-500 text-right">
                      Bootstrap 95% CI: [{whisker[0].toFixed(1)}%, {whisker[1].toFixed(1)}%]
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* "What this means" Box */}
          <div className="p-3 bg-[#FF6B2C]/5 rounded border border-[#FF6B2C]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
            <strong>What this means:</strong> The red vertical line shows the 80% four-fifths rule threshold. Any group bar ending to the left of this line receives substantially lower favourable outcomes, indicating systemic selection disparity.
          </div>
        </div>

        {/* Chart 2: Intersectional Fairness Cohort Matrix (Sex x Age / Race x Age) */}
        {intersectionalItem && (
          <div className="ticket-card p-5 space-y-3">
            <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
              Intersectional Cohort Analysis ({intersectionalItem.attribute})
            </h4>
            <p className="text-xs text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70">
              Combines the first two protected attributes to reveal compounding disadvantages that single-attribute scans miss.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {intersectionalItem.chart_data.labels.map((lbl, idx) => {
                const rate = intersectionalItem.chart_data.selection_rates_pct[idx] || 0;
                const subStats = intersectionalItem.subgroup_breakdown[lbl];
                const count = subStats ? subStats.size : 0;
                const isUnder = rate < intersectionalItem.chart_data.eighty_percent_line_pct;

                return (
                  <div key={lbl} className={`p-2.5 rounded border text-xs ${
                    isUnder ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                  }`}>
                    <div className="font-bold truncate text-[#1B1B1F] dark:text-[#F6F1E7]" title={lbl}>{lbl}</div>
                    <div className="flex items-center justify-between mt-1 font-mono">
                      <span className="text-[10px] text-stone-500">n={count}</span>
                      <span className={`font-bold ${isUnder ? 'text-[#D6334A]' : 'text-[#1F9D6B]'}`}>{rate.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "What this means" Box */}
            <div className="p-3 bg-[#FF6B2C]/5 rounded border border-[#FF6B2C]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
              <strong>What this means:</strong> Intersectional analysis prevents compound bias from hiding behind broad group averages. Subgroups flagged in red fail the four-fifths rule when both demographic traits interact.
            </div>
          </div>
        )}

        {/* Mitigation Demo Panel (Reweighing & Threshold Curve) */}
        {mitigation && (
          <div className="ticket-card p-5 space-y-4 border-2 border-emerald-600/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
                  Bias Mitigation & Trade-Off Analysis
                </h4>
                <p className="text-xs text-[#1B1B1F]/65 dark:text-[#F6F1E7]/65">
                  Pre-processing reweighing (Kamiran &amp; Calders) and post-processing decision threshold tuning.
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-mono text-xs font-bold">
                DI: +{(mitigation.reweighed.di_improvement * 100).toFixed(1)}% Boost
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded bg-stone-100 dark:bg-stone-800 space-y-2">
                <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-300">Baseline (Unmitigated)</span>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between"><span>Disparate Impact:</span><strong>{mitigation.baseline.disparate_impact.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Parity Gap (DPD):</span><strong>{mitigation.baseline.demographic_parity_diff.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Test Accuracy:</span><strong>{(mitigation.baseline.accuracy * 100).toFixed(1)}%</strong></div>
                </div>
              </div>

              <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">Reweighed (Mitigated)</span>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between"><span>Disparate Impact:</span><strong>{mitigation.reweighed.disparate_impact.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Parity Gap (DPD):</span><strong>{mitigation.reweighed.demographic_parity_diff.toFixed(3)}</strong></div>
                  <div className="flex justify-between"><span>Test Accuracy:</span><strong>{(mitigation.reweighed.accuracy * 100).toFixed(1)}%</strong></div>
                </div>
              </div>
            </div>

            {/* "What this means" Box */}
            <div className="p-3 bg-[#FF6B2C]/5 rounded border border-[#FF6B2C]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
              <strong>What this means:</strong> Reweighing balances training weights without modifying ground truth labels. It closes disparate impact gaps while preserving operational accuracy within a 1-2% tolerance.
            </div>
          </div>
        )}
      </div>

      {/* 4. Collapsible "Expert Details" Section */}
      <div className="ticket-card p-4 space-y-3">
        <button
          onClick={() => setShowExpertDetails(!showExpertDetails)}
          className="w-full flex items-center justify-between text-left font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]"
        >
          <span>Expert Details: Mathematical Formulas &amp; 95% Confidence Intervals</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#FF6B2C]">Governing Fairness Formulas:</div>
              <div className="p-2.5 bg-stone-100 dark:bg-stone-900 rounded space-y-1">
                <div>• <Tooltip term="Disparate Impact" definition="Ratio of favorable outcome rate of unprivileged group to privileged group (EEOC four-fifths rule: >= 0.80)." />: DI = P(Ŷ=1 | A=unprivileged) / P(Ŷ=1 | A=privileged)</div>
                <div>• <Tooltip term="Demographic Parity Difference" definition="Absolute difference in favorable selection rates between groups (Tolerance: <= 0.10)." />: DPD = |P(Ŷ=1 | A=privileged) - P(Ŷ=1 | A=unprivileged)|</div>
                <div>• <Tooltip term="Equal Opportunity Difference" definition="Absolute difference in recall (true positive rates) between groups (Tolerance: <= 0.10)." />: EOD = |TPR(privileged) - TPR(unprivileged)|</div>
                <div>• <Tooltip term="Equalized Odds Gap" definition="Maximum disparity between True Positive Rate gap and False Positive Rate gap." />: EO = max(|TPR_priv - TPR_unpriv|, |FPR_priv - FPR_unpriv|)</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#FF6B2C]">Point Estimates &amp; Bootstrap 95% CIs (n=500):</div>
              <div className="overflow-x-auto">
                <table className="w-full border border-stone-200 dark:border-stone-800 text-left">
                  <thead className="bg-stone-100 dark:bg-stone-900">
                    <tr>
                      <th className="p-2 border">Metric</th>
                      <th className="p-2 border">Test Value</th>
                      <th className="p-2 border">95% Confidence Interval</th>
                      <th className="p-2 border">Tolerance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border">Disparate Impact (DI)</td>
                      <td className="p-2 border font-bold">{worstDi.toFixed(4)}</td>
                      <td className="p-2 border">[{activeItem.confidence_intervals_95?.disparate_impact[0] ?? 0}, {activeItem.confidence_intervals_95?.disparate_impact[1] ?? 1}]</td>
                      <td className="p-2 border">&gt;= 0.80 (EEOC)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border">Demographic Parity Diff (DPD)</td>
                      <td className="p-2 border font-bold">{worstDpd.toFixed(4)}</td>
                      <td className="p-2 border">[{activeItem.confidence_intervals_95?.demographic_parity_difference[0] ?? 0}, {activeItem.confidence_intervals_95?.demographic_parity_difference[1] ?? 1}]</td>
                      <td className="p-2 border">&lt;= 0.10</td>
                    </tr>
                    <tr>
                      <td className="p-2 border">Equal Opportunity Diff (EOD)</td>
                      <td className="p-2 border font-bold">{worstEod.toFixed(4)}</td>
                      <td className="p-2 border">[{activeItem.confidence_intervals_95?.equal_opportunity_difference[0] ?? 0}, {activeItem.confidence_intervals_95?.equal_opportunity_difference[1] ?? 1}]</td>
                      <td className="p-2 border">&lt;= 0.10</td>
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
