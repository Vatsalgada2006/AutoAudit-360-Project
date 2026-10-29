import React, { useState } from 'react';
import { FairnessAuditItem, MitigationResult } from '../../types';
import { AlertTriangle, CheckCircle, Info, Scale, ShieldCheck, XCircle, Sliders, ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FairnessTabProps {
  fairnessData: FairnessAuditItem[];
  mitigation?: MitigationResult | null;
  darkMode?: boolean;
}

export const FairnessTab: React.FC<FairnessTabProps> = ({ fairnessData, mitigation, darkMode = true }) => {
  const [selectedAttrIndex, setSelectedAttrIndex] = useState(0);
  const [sliderThreshold, setSliderThreshold] = useState(0.50);

  if (!fairnessData || fairnessData.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Scale className="w-10 h-10 text-slate-500 mx-auto mb-2" />
        <h3 className="font-display font-bold text-white text-base">No Fairness Audit Run Yet</h3>
        <p className="text-xs text-slate-400 mt-1">
          Select sensitive attributes in the Setup tab and click "Run Full Audit" or launch a 1-click Demo.
        </p>
      </div>
    );
  }

  // Filter out pure intersectional items from standard dropdown (display them in dedicated intersectional cohort table)
  const standardAttributes = fairnessData.filter(f => !f.is_intersectional);
  const intersectionalItem = fairnessData.find(f => f.is_intersectional);

  const currentItem = standardAttributes[selectedAttrIndex] || standardAttributes[0] || fairnessData[0];
  const { metrics, chart_data, subgroup_breakdown, small_group_warnings, confidence_intervals_95 } = currentItem;

  // Bar Chart with 80% line overlay
  const barChartData = {
    labels: chart_data.labels,
    datasets: [
      {
        label: 'Subgroup Selection Rate (%)',
        data: chart_data.selection_rates_pct,
        backgroundColor: chart_data.labels.map(l =>
          l === currentItem.privileged_group ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.7)'
        ),
        borderColor: chart_data.labels.map(l =>
          l === currentItem.privileged_group ? '#10B981' : '#F59E0B'
        ),
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        type: 'line' as const,
        label: `EEOC 80% Rule Baseline (${chart_data.eighty_percent_line_pct}%)`,
        data: chart_data.labels.map(() => chart_data.eighty_percent_line_pct),
        borderColor: '#EF4444',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (val: any) => `${val}%`,
          color: darkMode ? '#94a3b8' : '#64748b',
          font: { family: "'JetBrains Mono', monospace", size: 10 }
        },
        grid: {
          color: darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.06)'
        }
      },
      x: {
        ticks: {
          color: darkMode ? '#cbd5e1' : '#334155',
          font: { family: "'Space Grotesk', system-ui", size: 11, weight: 600 as const }
        },
        grid: { display: false }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? '#e2e8f0' : '#1e293b',
          font: { family: "'Plus Jakarta Sans', system-ui", size: 11 }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        titleColor: darkMode ? '#f8fafc' : '#0f172a',
        bodyColor: darkMode ? '#cbd5e1' : '#334155',
        borderColor: darkMode ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => {
            const whisker = chart_data.ci_whiskers_pct?.[ctx.dataIndex];
            if (whisker) {
              return `${ctx.dataset.label}: ${ctx.raw}% [95% CI: ${whisker[0]}% - ${whisker[1]}%]`;
            }
            return `${ctx.dataset.label}: ${ctx.raw}%`;
          }
        }
      }
    }
  };

  // Find threshold adjustment closest to slider
  const selectedAdjustment = mitigation?.threshold_adjustments?.reduce((prev, curr) =>
    Math.abs(curr.threshold - sliderThreshold) < Math.abs(prev.threshold - sliderThreshold) ? curr : prev
  , mitigation?.threshold_adjustments?.[0]);

  return (
    <div className="space-y-6">
      
      {/* Attribute Selector Switcher if multiple sensitive features */}
      {standardAttributes.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Protected Attribute:</span>
          {standardAttributes.map((item, idx) => (
            <button
              key={item.attribute}
              type="button"
              onClick={() => setSelectedAttrIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                idx === selectedAttrIndex
                  ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>{item.attribute}</span>
              <span className={`w-2 h-2 rounded-full ${
                item.status === 'pass' ? 'bg-emerald-400' : item.status === 'warn' ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
            </button>
          ))}
        </div>
      )}

      {/* Main Metric Cards Grid with 95% Bootstrap CIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Disparate Impact Card */}
        <div className={`p-4 rounded-xl border bg-slate-900 ${
          metrics.disparate_impact_ratio >= 0.80
            ? 'border-emerald-500/30 shadow-emerald-500/5'
            : metrics.disparate_impact_ratio >= 0.70
            ? 'border-amber-500/30 shadow-amber-500/5'
            : 'border-rose-500/40 shadow-rose-500/5'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Disparate Impact (DI)</span>
            <span className="text-[10px] text-slate-500 font-sans">Four-Fifths Rule</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-2xl font-black ${
              metrics.disparate_impact_ratio >= 0.80 ? 'text-emerald-400' : metrics.disparate_impact_ratio >= 0.70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {metrics.disparate_impact_ratio.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / &ge; 0.800
            </span>
          </div>
          {confidence_intervals_95?.disparate_impact && (
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              95% CI: [{confidence_intervals_95.disparate_impact[0].toFixed(3)}, {confidence_intervals_95.disparate_impact[1].toFixed(3)}]
            </div>
          )}
          <div className="text-[10px] text-slate-500 mt-1">
            Ratio = P(Y=1|Unprivileged) / P(Y=1|Privileged)
          </div>
        </div>

        {/* Demographic Parity Difference */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Demographic Parity Diff</span>
            <span className="text-[10px] text-slate-500">&le; 10% tol</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {(metrics.demographic_parity_difference * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">gap</span>
          </div>
          {confidence_intervals_95?.demographic_parity_difference && (
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              95% CI: [{(confidence_intervals_95.demographic_parity_difference[0] * 100).toFixed(1)}%, {(confidence_intervals_95.demographic_parity_difference[1] * 100).toFixed(1)}%]
            </div>
          )}
          <div className="text-[10px] text-slate-500 mt-1">
            Max selection rate gap between groups
          </div>
        </div>

        {/* Equal Opportunity Difference */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Equal Opportunity Diff</span>
            <span className="text-[10px] text-slate-500">TPR Parity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {(metrics.equal_opportunity_difference * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">gap</span>
          </div>
          {confidence_intervals_95?.equal_opportunity_difference && (
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              95% CI: [{(confidence_intervals_95.equal_opportunity_difference[0] * 100).toFixed(1)}%, {(confidence_intervals_95.equal_opportunity_difference[1] * 100).toFixed(1)}%]
            </div>
          )}
          <div className="text-[10px] text-slate-500 mt-1">
            True positive rate gap across cohorts
          </div>
        </div>

        {/* Held-out Test Sample Size & Group Status */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Evaluation Test Split</span>
            <span className="text-[10px] text-cyan-400 font-mono">Held-out 20%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-cyan-300">
              N={currentItem.test_sample_size || 200}
            </span>
            <span className="text-xs text-slate-400 font-mono">samples</span>
          </div>
          <div className="text-[11px] font-mono text-slate-300 mt-1 truncate">
            Privileged: <span className="text-emerald-400 font-bold">{currentItem.privileged_group}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Bootstrap replications: n=500
          </div>
        </div>

      </div>

      {/* Insufficient Sample Warnings (<30) */}
      {small_group_warnings && small_group_warnings.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <strong>Statistical Power Warning (n &lt; 30):</strong> The following subgroups have insufficient test sample size: {small_group_warnings.map(w => `${w.group} (n=${w.size})`).join(', ')}. Findings for these groups carry wider confidence intervals.
          </div>
        </div>
      )}

      {/* Selection Rate Chart with CI Whiskers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-display font-bold text-white text-base">
              Selection Rate by Subgroup with 95% Confidence Bounds
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              The red dashed line marks the statutory 80% tolerance threshold of the privileged group's selection rate.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Privileged
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Comparison
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72">
          {/* @ts-ignore */}
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Subgroup Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <h4 className="font-display font-bold text-white text-base mb-1">
          Held-out Test Cohort Demographics &amp; Error Distribution
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Empirical confusion matrix statistics computed strictly on held-out test records.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Cohort</th>
                <th className="p-3">Test N</th>
                <th className="p-3">Selection Rate</th>
                <th className="p-3">True Positive Rate (TPR)</th>
                <th className="p-3">False Positive Rate (FPR)</th>
                <th className="p-3">Disparate Impact vs Priv</th>
                <th className="p-3">Sample Sufficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {Object.entries(subgroup_breakdown).map(([grp, stats]) => {
                const isPriv = grp === currentItem.privileged_group;
                const diRatio = currentItem.di_per_subgroup?.[grp];
                const isSmall = stats.size < 30;

                return (
                  <tr key={grp} className={isPriv ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'}>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      {grp}
                      {isPriv && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          PRIVILEGED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">n={stats.size}</td>
                    <td className="p-3 text-white font-bold">{(stats.selection_rate * 100).toFixed(1)}%</td>
                    <td className="p-3 text-slate-300">{(stats.tpr * 100).toFixed(1)}%</td>
                    <td className="p-3 text-slate-300">{(stats.fpr * 100).toFixed(1)}%</td>
                    <td className="p-3">
                      {isPriv ? (
                        <span className="text-slate-500">1.000 (Ref)</span>
                      ) : diRatio !== undefined ? (
                        <span className={`font-bold ${diRatio >= 0.80 ? 'text-emerald-400' : diRatio >= 0.70 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {diRatio.toFixed(3)}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-3">
                      {isSmall ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-600/40">
                          n &lt; 30 (Low Power)
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-600/40">
                          Sufficient (n &ge; 30)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intersectional Fairness Cohort Table */}
      {intersectionalItem && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-indigo-400" />
            <h4 className="font-display font-bold text-white text-base">
              Intersectional Fairness Cohort Matrix ({intersectionalItem.attribute})
            </h4>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Joint demographic intersection analysis evaluating compound disparities across combined attributes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(intersectionalItem.subgroup_breakdown).map(([cohort, stats]) => (
              <div key={cohort} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-mono text-xs font-bold text-white">{cohort}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">Sample N = {stats.size}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-cyan-400">{(stats.selection_rate * 100).toFixed(1)}%</div>
                  <div className="text-[10px] font-mono text-slate-500">Selection Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bias Mitigation & Threshold Adjustment Simulation */}
      {mitigation && mitigation.baseline && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h4 className="font-display font-bold text-white text-base">
              Bias Mitigation Intervention (Kamiran &amp; Calders Sample Reweighing)
            </h4>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Intervention reweighs training tuples to neutralize historical bias without external AIF360 dependencies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Before vs After Reweighing */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h5 className="font-mono text-xs text-slate-400 uppercase font-semibold mb-3">
                Pre vs. Post Reweighing Metrics ({mitigation.sensitive_attribute}):
              </h5>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Disparate Impact:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{mitigation.baseline.disparate_impact.toFixed(3)}</span>
                    <ArrowRight size={13} className="text-slate-600" />
                    <span className="text-emerald-400 font-bold">{mitigation.reweighed.disparate_impact.toFixed(3)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Demographic Parity Diff:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{(mitigation.baseline.demographic_parity_diff * 100).toFixed(1)}%</span>
                    <ArrowRight size={13} className="text-slate-600" />
                    <span className="text-emerald-400 font-bold">{(mitigation.reweighed.demographic_parity_diff * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Accuracy Trade-off:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{(mitigation.baseline.accuracy * 100).toFixed(1)}%</span>
                    <ArrowRight size={13} className="text-slate-600" />
                    <span className="text-amber-400 font-bold">{(mitigation.reweighed.accuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Threshold Adjustment Slider */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-mono text-xs text-slate-400 uppercase font-semibold">
                  Post-Processing Threshold Slider:
                </h5>
                <span className="font-mono text-xs text-cyan-400 font-bold">
                  Threshold = {sliderThreshold.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Adjust decision threshold to observe live trade-offs between disparate impact and classifier recall.
              </p>

              <input
                type="range"
                min="0.30"
                max="0.70"
                step="0.10"
                value={sliderThreshold}
                onChange={e => setSliderThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer mb-4"
              />

              {selectedAdjustment && (
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Disparate Impact</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">{selectedAdjustment.disparate_impact.toFixed(3)}</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Accuracy</div>
                    <div className="text-sm font-bold text-white mt-0.5">{(selectedAdjustment.accuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-400">Recall</div>
                    <div className="text-sm font-bold text-white mt-0.5">{(selectedAdjustment.recall * 100).toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
