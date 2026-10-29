import React, { useState } from 'react';
import { ExplainabilityAudit } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Key, ShieldCheck, Sparkles, XCircle, Box, Layers } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ShapSkyline3D } from '../Three/ShapSkyline3D';
import { ThreeErrorBoundary } from '../Three/ThreeErrorBoundary';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ExplainabilityTabProps {
  explainData: ExplainabilityAudit;
  darkMode?: boolean;
}

export const ExplainabilityTab: React.FC<ExplainabilityTabProps> = ({ explainData, darkMode = true }) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  if (!explainData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No Explainability audit data available.
      </div>
    );
  }

  const { status, severity, explainer_type, finding, disclaimer, top_features, chart_data } = explainData;

  const barData = {
    labels: chart_data.labels,
    datasets: [
      {
        label: 'Mean |SHAP| Attribution Value',
        data: chart_data.values,
        backgroundColor: chart_data.labels.map(l => {
          const match = top_features.find(f => f.feature === l);
          if (match?.is_sensitive) return 'rgba(239, 68, 68, 0.8)';
          if (match?.is_proxy) return 'rgba(245, 158, 11, 0.8)';
          return 'rgba(6, 182, 212, 0.7)';
        }),
        borderColor: chart_data.labels.map(l => {
          const match = top_features.find(f => f.feature === l);
          if (match?.is_sensitive) return '#EF4444';
          if (match?.is_proxy) return '#F59E0B';
          return '#06B6D4';
        }),
        borderWidth: 1.5,
        borderRadius: 4,
      }
    ]
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#94a3b8' : '#64748b',
          font: { family: "'JetBrains Mono', monospace", size: 10 }
        },
        grid: {
          color: darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.06)'
        }
      },
      y: {
        ticks: {
          color: darkMode ? '#cbd5e1' : '#334155',
          font: { family: "'Space Grotesk', system-ui", size: 11, weight: 600 as const }
        },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        titleColor: darkMode ? '#f8fafc' : '#0f172a',
        bodyColor: darkMode ? '#cbd5e1' : '#334155',
        borderColor: darkMode ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => `Mean |SHAP|: ${ctx.raw}`
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
                Explainability &amp; Leakage Verdict: {status.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-black/30 border border-current">
                Engine: {explainer_type}
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

      {/* Critical Statutory Disclaimer Banner */}
      <div className="bg-cyan-950/30 border-l-4 border-cyan-400 p-4 rounded-r-xl text-xs text-cyan-200 flex items-start gap-2.5">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-mono uppercase text-cyan-300">Causality &amp; Manifold Disclaimer:</strong>
          <p className="mt-0.5 leading-relaxed font-sans">
            {disclaimer}
          </p>
        </div>
      </div>

      {/* Feature Attribution Chart with 3D Skyline Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-display font-bold text-white text-base">
              Feature Importance &amp; Proxy Attribution
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Features with statistical proxy leakage to protected attributes are highlighted.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  viewMode === '3d'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box size={13} />
                3D Skyline
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  viewMode === '2d'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={13} />
                2D Bar Chart
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono hidden md:flex">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded bg-red-500" /> Protected
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Proxy
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500" /> Standard
              </span>
            </div>
          </div>
        </div>

        {viewMode === '3d' ? (
          <ThreeErrorBoundary
            fallback={
              <div className="h-64 sm:h-72">
                {/* @ts-ignore */}
                <Bar data={barData} options={barOptions} />
              </div>
            }
          >
            <ShapSkyline3D features={top_features} />
          </ThreeErrorBoundary>
        ) : (
          <div className="h-64 sm:h-72">
            {/* @ts-ignore */}
            <Bar data={barData} options={barOptions} />
          </div>
        )}
      </div>

      {/* Top Features Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <h4 className="font-display font-bold text-white text-base mb-1">
          Detailed Feature Attribution Matrix
        </h4>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Feature Name</th>
                <th className="p-3">Mean |SHAP| Attribution</th>
                <th className="p-3">Protected / Proxy Status</th>
                <th className="p-3">Compliance Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {top_features.map((feat, idx) => (
                <tr key={feat.feature} className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-500">#{idx + 1}</td>
                  <td className="p-3 font-bold text-white">{feat.feature}</td>
                  <td className="p-3 text-cyan-300 font-bold">{feat.importance.toFixed(4)}</td>
                  <td className="p-3">
                    {feat.is_sensitive ? (
                      <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/50 text-[10px] font-bold">
                        PROTECTED ATTRIBUTE
                      </span>
                    ) : feat.is_proxy ? (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50 text-[10px] font-bold">
                        SUSPECTED PROXY (r={feat.proxy_correlation ? feat.proxy_correlation.toFixed(2) : '&gt;0.40'})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        Standard Covariate
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-sans text-slate-400 text-[11px]">
                    {feat.is_sensitive
                      ? 'Statutory non-compliance if used in high-risk adverse actions without legitimate purpose.'
                      : feat.is_proxy
                      ? 'High correlation with protected class: review for disparate impact proxy leakage.'
                      : 'Permissible model feature.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
