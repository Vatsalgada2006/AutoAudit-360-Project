import React from 'react';
import { RobustnessAudit } from '../../types';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, ShieldCheck, Zap, XCircle, Crosshair, RefreshCw, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface RobustnessTabProps {
  robustnessData: RobustnessAudit;
  darkMode?: boolean;
}

export const RobustnessTab: React.FC<RobustnessTabProps> = ({ robustnessData, darkMode = true }) => {
  if (!robustnessData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No Robustness audit data available.
      </div>
    );
  }

  const {
    status,
    severity,
    finding,
    robustness_score,
    metric_drop_10pct,
    prediction_flip_rate_5pct,
    counterfactual_flip_rate,
    worst_case_drop_eps10,
    fairness_stability_delta,
    bounded_attack_tests,
    multi_attribute_stability,
    label_flip_tests,
    perturbation_tests,
    chart_data
  } = robustnessData;

  const lineLabels = chart_data?.label_flips?.x_labels || [];
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Accuracy',
        data: chart_data?.label_flips?.accuracy || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.2,
        pointRadius: 4,
      },
      {
        label: 'F1-Score',
        data: chart_data?.label_flips?.f1 || [],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        tension: 0.2,
        pointRadius: 4,
      },
      {
        label: 'ROC-AUC',
        data: chart_data?.label_flips?.roc_auc || [],
        borderColor: '#E5A93C',
        backgroundColor: 'rgba(229, 169, 60, 0.2)',
        tension: 0.2,
        pointRadius: 4,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 0.3,
        max: 1.0,
        ticks: {
          callback: (val: any) => `${(val * 100).toFixed(0)}%`,
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
          label: (ctx: any) => `${ctx.dataset.label}: ${(ctx.raw * 100).toFixed(1)}%`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Status */}
      <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        status === 'pass'
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          : status === 'warn'
          ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
      }`}>
        <div className="flex items-start gap-3">
          {status === 'pass' ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          ) : status === 'warn' ? (
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Adversarial &amp; Perturbation Stress Status: {status.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-black/30 border border-current">
                Score: {robustness_score !== null && robustness_score !== undefined ? `${robustness_score}/100` : 'N/A'}
              </span>
            </div>
            <p className="text-sm font-sans mt-1 text-slate-200">
              {finding}
            </p>
          </div>
        </div>

        <div className="font-mono text-xs uppercase px-3 py-1.5 rounded-lg bg-black/40 border border-slate-700/80 shrink-0">
          Severity: <strong className="text-white">{severity.toUpperCase()}</strong>
        </div>
      </div>

      {/* Adversarial Attacks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Counterfactual Flip Rate */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Counterfactual Flip Rate</span>
            <RefreshCw size={13} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-2xl font-black ${
              counterfactual_flip_rate !== null && counterfactual_flip_rate !== undefined && counterfactual_flip_rate > 0.05
                ? 'text-rose-400'
                : 'text-emerald-400'
            }`}>
              {counterfactual_flip_rate !== null && counterfactual_flip_rate !== undefined
                ? `${(counterfactual_flip_rate * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Prediction flip upon swapping protected demographics
          </div>
        </div>

        {/* Bounded Coordinate Attack (eps=0.10) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Worst-Case Drop (&epsilon;=0.10)</span>
            <Crosshair size={13} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {worst_case_drop_eps10 !== null && worst_case_drop_eps10 !== undefined
                ? `-${(worst_case_drop_eps10 * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Greedy coordinate attack within &plusmn;0.10&sigma; bound
          </div>
        </div>

        {/* 10% Label Poisoning Drop */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">10% Label Flip Drop</span>
            <Zap size={13} className="text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {metric_drop_10pct !== null && metric_drop_10pct !== undefined
                ? `${(metric_drop_10pct * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Degradation tolerance: &le; 5.0%
          </div>
        </div>

        {/* Multi-attribute Fairness Stability */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Max Fairness Drift</span>
            <Activity size={13} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              {fairness_stability_delta !== null && fairness_stability_delta !== undefined
                ? `&plusmn;${fairness_stability_delta.toFixed(3)}`
                : 'N/A'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Max Disparate Impact drift under noise
          </div>
        </div>

      </div>

      {/* Bounded Perturbation Attack Table (eps in 0.05, 0.10, 0.20) */}
      {bounded_attack_tests && bounded_attack_tests.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h4 className="font-display font-bold text-white text-base mb-1">
            Bounded Adversarial Perturbation Tests (Greedy Coordinate Search)
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Simulates worst-case feature manipulations within bounded spherical neighborhoods (&plusmn;&epsilon;&sigma;).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Adversarial Bound (&epsilon;)</th>
                  <th className="p-3">Perturbed Accuracy</th>
                  <th className="p-3">Accuracy Drop</th>
                  <th className="p-3">Prediction Flip Rate</th>
                  <th className="p-3">Robustness Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {bounded_attack_tests.map((b) => (
                  <tr key={b.epsilon} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-cyan-300">&epsilon; = {b.epsilon.toFixed(2)} &sigma;</td>
                    <td className="p-3 text-white">{(b.accuracy * 100).toFixed(1)}%</td>
                    <td className="p-3 text-rose-400 font-bold">-{(b.accuracy_drop * 100).toFixed(1)}%</td>
                    <td className="p-3 text-amber-300">{(b.prediction_flip_rate * 100).toFixed(1)}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.accuracy_drop <= 0.05
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : b.accuracy_drop <= 0.12
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        {b.accuracy_drop <= 0.05 ? 'RESILIENT' : b.accuracy_drop <= 0.12 ? 'VULNERABLE' : 'CRITICAL DEFICIENCY'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-attribute Stability Table */}
      {multi_attribute_stability && Object.keys(multi_attribute_stability).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h4 className="font-display font-bold text-white text-base mb-1">
            Fairness Stability under Feature Perturbation (&Delta; DI across Sensitive Attributes)
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Audits whether Gaussian noise triggers disparate impact drift across all declared protected attributes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(multi_attribute_stability).map(([attr, drift]) => (
              <div key={attr} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="font-mono text-xs text-white font-bold">{attr}</span>
                <span className={`font-mono text-xs font-bold ${
                  drift <= 0.05 ? 'text-emerald-400' : drift <= 0.10 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  &Delta; {drift.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Degradation Chart */}
      {lineLabels.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h4 className="font-display font-bold text-white text-base mb-1">
            Performance Degradation Curve across Synthetic Corruption Levels
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Progressive label corruption stress testing evaluating model stability envelope.
          </p>

          <div className="h-64 sm:h-72">
            {/* @ts-ignore */}
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      )}

    </div>
  );
};
