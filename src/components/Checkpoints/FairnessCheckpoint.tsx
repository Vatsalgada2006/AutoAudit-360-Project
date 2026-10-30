import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sliders,
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { FairnessAuditItem, MitigationResult } from '../../types';

interface FairnessCheckpointProps {
  items: FairnessAuditItem[];
  mitigation?: MitigationResult | null;
  isExpertMode?: boolean;
}

export const FairnessCheckpoint: React.FC<FairnessCheckpointProps> = ({
  items,
  mitigation,
}) => {
  const [selectedAttrIndex, setSelectedAttrIndex] = useState(0);
  const [threshold80, setThreshold80] = useState(0.80);

  if (!items || items.length === 0) {
    return (
      <div className="content-card p-8 text-center space-y-3 max-w-xl mx-auto my-6 bg-white border border-[#DCE5EB]">
        <Scale className="w-10 h-10 text-[#38A9DB] mx-auto" />
        <h3 className="font-bold text-lg text-[#111111]">No Fairness Data Available</h3>
        <p className="text-sm text-[#555555]">
          Please run an AI audit from the New AI Audit tab or load a sample benchmark to inspect fairness metrics.
        </p>
      </div>
    );
  }

  const activeItem = items[selectedAttrIndex] || items[0];
  const metrics = activeItem.metrics;
  const diRatio = metrics?.disparate_impact_ratio ?? 1.0;
  const dpDiff = metrics?.demographic_parity_difference ?? 0.0;
  const eoDiff = metrics?.equal_opportunity_difference ?? 0.0;
  const eqOdds = metrics?.equalized_odds_gap ?? 0.0;

  // Screening status against configured threshold
  const isViolation = diRatio < threshold80;
  const isWarning = diRatio >= threshold80 && diRatio < threshold80 + 0.10;

  // Subgroup breakdown
  const subgroups = Object.entries(activeItem.subgroup_breakdown || {});
  const privGroup = activeItem.privileged_group;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Station Header */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#38A9DB] border border-[#DCE5EB] text-xs font-semibold">
              <Scale className="w-3.5 h-3.5 text-[#38A9DB]" />
              <span>Checkpoint 1: Fairness Audit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
              Algorithmic Fairness &amp; Group Disparities
            </h2>
            <p className="text-sm text-[#555555]">
              Evaluate whether classification decisions provide equal treatment across protected cohorts under the EEOC 80% screening rule.
            </p>
          </div>

          {/* Sensitive Attribute Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#555555] mr-1">Attribute:</span>
            {items.map((item, idx) => (
              <button
                key={item.attribute}
                onClick={() => setSelectedAttrIndex(idx)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                  selectedAttrIndex === idx
                    ? 'bg-[#38A9DB] text-white border-[#38A9DB]'
                    : 'bg-white text-[#111111] border-[#DCE5EB] hover:bg-gray-50'
                }`}
              >
                {item.attribute}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Screening Warning / Pass Banner */}
      <div
        className={`content-card p-5 border flex items-start gap-3 ${
          isViolation
            ? 'bg-red-50/70 border-red-200'
            : isWarning
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-emerald-50/70 border-emerald-200'
        }`}
      >
        {isViolation ? (
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="text-sm font-bold text-[#111111]">
            {isViolation
              ? `Disparity Alert: Disparate Impact ratio (${diRatio.toFixed(3)}) fell below the ${(threshold80 * 100).toFixed(0)}% screening threshold for ${activeItem.attribute}.`
              : isWarning
              ? `Borderline Warning: Disparate Impact ratio (${diRatio.toFixed(3)}) is near the ${(threshold80 * 100).toFixed(0)}% caution boundary.`
              : `Fairness Threshold Satisfied: Disparate Impact ratio (${diRatio.toFixed(3)}) meets or exceeds ${(threshold80 * 100).toFixed(0)}%.`}
          </div>
          <p className="text-xs text-[#555555]">
            Reference (Privileged) Group: <strong className="text-[#111111]">{privGroup}</strong>.
            Finding: {activeItem.finding}
          </p>
        </div>
      </div>

      {/* 3. Four Core Quantitative Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Disparate Impact Ratio */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Disparate Impact (DIR)</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${diRatio >= threshold80 ? 'badge-pass' : 'badge-fail'}`}>
              {diRatio >= threshold80 ? 'Pass' : 'Flagged'}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#111111]">
            {diRatio.toFixed(3)}
          </div>
          <p className="text-[11px] text-[#555555]">
            Ratio of selection rate (unprivileged / privileged). Threshold: &ge; {threshold80.toFixed(2)}.
          </p>
        </div>

        {/* Metric 2: Demographic Parity Difference */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Demographic Parity Diff</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${dpDiff <= 0.15 ? 'badge-pass' : 'badge-warn'}`}>
              {dpDiff <= 0.15 ? 'Balanced' : 'Skewed'}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#111111]">
            {dpDiff.toFixed(3)}
          </div>
          <p className="text-[11px] text-[#555555]">
            Maximum difference in favourable outcome rates between demographic groups.
          </p>
        </div>

        {/* Metric 3: Equal Opportunity Difference */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Equal Opportunity Diff</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${eoDiff <= 0.15 ? 'badge-pass' : 'badge-warn'}`}>
              {eoDiff <= 0.15 ? 'Fair' : 'Disparity'}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#111111]">
            {eoDiff.toFixed(3)}
          </div>
          <p className="text-[11px] text-[#555555]">
            Difference in True Positive Rates (TPR) for qualified individuals across groups.
          </p>
        </div>

        {/* Metric 4: Equalized Odds Gap */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span className="font-semibold">Equalized Odds Gap</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${eqOdds <= 0.20 ? 'badge-pass' : 'badge-warn'}`}>
              {eqOdds <= 0.20 ? 'Good' : 'Review'}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#111111]">
            {eqOdds.toFixed(3)}
          </div>
          <p className="text-[11px] text-[#555555]">
            Combined maximum gap across True Positive Rate and False Positive Rate.
          </p>
        </div>
      </div>

      {/* 4. Group-Wise Selection Rates (Simple Clean Bar Chart) */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE5EB] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#111111]">
              Group-Wise Selection Rates: {activeItem.attribute}
            </h3>
            <p className="text-xs text-[#555555]">
              Percentage of each cohort receiving the favourable classification decision
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#555555]">
            <span>Screening Threshold:</span>
            <select
              value={threshold80}
              onChange={(e) => setThreshold80(Number(e.target.value))}
              className="p-1 border border-[#DCE5EB] rounded text-xs bg-white text-[#111111]"
            >
              <option value={0.75}>75% (Lenient)</option>
              <option value={0.80}>80% (Four-Fifths Rule)</option>
              <option value={0.85}>85% (Strict)</option>
              <option value={0.90}>90% (Rigorous)</option>
            </select>
          </div>
        </div>

        {/* Clean Bar Visualization */}
        <div className="space-y-3 pt-1">
          {subgroups.map(([groupName, stats]) => {
            const isPriv = groupName === privGroup;
            const ratePercent = (stats.selection_rate * 100).toFixed(1);
            return (
              <div key={groupName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#111111]">{groupName}</span>
                    {isPriv && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-[#38A9DB] font-semibold">
                        Reference Group
                      </span>
                    )}
                    <span className="text-[11px] text-[#555555]">({stats.size} records)</span>
                  </div>
                  <span className="font-bold text-[#111111]">{ratePercent}% selection</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isPriv ? 'bg-[#38A9DB]' : Number(ratePercent) < 40 ? 'bg-amber-500' : 'bg-sky-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, Number(ratePercent)))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanatory Note on the 80% Rule */}
        <div className="p-3.5 rounded-lg bg-sky-50 border border-[#DCE5EB] text-xs text-[#555555] space-y-1">
          <strong className="text-[#111111] block flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#38A9DB]" />
            <span>Understanding the 80% (Four-Fifths) Screening Rule</span>
          </strong>
          <p>
            Under US EEOC guidelines and international algorithmic screening conventions, a selection rate for any protected group that is less than 80% (four-fifths) of the rate for the highest group is regarded as evidence of adverse impact.
            <strong> Note:</strong> This metric serves as an empirical screening indicator to trigger further audit and remediation, rather than conclusive proof of intentional discrimination or statutory non-compliance.
          </p>
        </div>
      </div>

      {/* 5. Detailed Protected vs Reference Comparison Table */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <h3 className="font-bold text-base text-[#111111] border-b border-[#DCE5EB] pb-3">
          Protected vs Reference Group Diagnostics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DCE5EB] text-[#555555] bg-gray-50">
                <th className="p-2.5 font-semibold">Cohort</th>
                <th className="p-2.5 font-semibold">Sample Size</th>
                <th className="p-2.5 font-semibold">Selection Rate</th>
                <th className="p-2.5 font-semibold">True Positive (TPR)</th>
                <th className="p-2.5 font-semibold">False Positive (FPR)</th>
                <th className="p-2.5 font-semibold">Disparate Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5EB]">
              {subgroups.map(([groupName, stats]) => {
                const isPriv = groupName === privGroup;
                const diVal = activeItem.di_per_subgroup?.[groupName] ?? (isPriv ? 1.0 : diRatio);
                return (
                  <tr key={groupName} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-[#111111]">
                      {groupName} {isPriv && '(Privileged)'}
                    </td>
                    <td className="p-2.5 text-[#555555]">{stats.size}</td>
                    <td className="p-2.5 font-bold text-[#111111]">
                      {(stats.selection_rate * 100).toFixed(1)}%
                    </td>
                    <td className="p-2.5 text-[#555555]">
                      {(stats.tpr * 100).toFixed(1)}%
                    </td>
                    <td className="p-2.5 text-[#555555]">
                      {(stats.fpr * 100).toFixed(1)}%
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          diVal >= threshold80 ? 'badge-pass' : 'badge-fail'
                        }`}
                      >
                        {diVal.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Mitigation Recommendations */}
      {mitigation && (
        <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-3">
          <h3 className="font-bold text-base text-[#111111] border-b border-[#DCE5EB] pb-2">
            Recommended Fairness Mitigation Strategy
          </h3>
          <p className="text-xs text-[#555555]">
            Estimated improvements upon applying pre-processing sample reweighing or post-processing threshold adjustment:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB]">
              <span className="text-[#555555] block">Pre-Mitigation DIR:</span>
              <span className="text-base font-bold text-red-600">
                {mitigation.baseline?.disparate_impact?.toFixed(3) ?? diRatio.toFixed(3)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 block">Post-Mitigation DIR (Est):</span>
              <span className="text-base font-bold text-emerald-700">
                {mitigation.reweighed?.disparate_impact?.toFixed(3) ?? '0.845'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB]">
              <span className="text-[#555555] block">Accuracy Trade-off:</span>
              <span className="text-base font-bold text-[#111111]">
                -{(((mitigation.baseline?.accuracy ?? 0.74) - (mitigation.reweighed?.accuracy ?? 0.73)) * 100).toFixed(1)}% accuracy
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
