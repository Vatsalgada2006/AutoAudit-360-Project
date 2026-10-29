import React, { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Box, Layers } from 'lucide-react';
import { AuditScores } from '../types';
import { RadarPrism3D } from './Three/RadarPrism3D';
import { ThreeErrorBoundary } from './Three/ThreeErrorBoundary';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  scores: AuditScores;
  darkMode?: boolean;
  onSelectTab?: (tabKey: string) => void;
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores, darkMode = true, onSelectTab }) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const axes = [
    'Fairness',
    'Explainability',
    'Robustness',
    'EU AI Act Readiness',
    'DPDP Act 2023 Readiness',
    'Governance Disclosure'
  ];

  const values = axes.map(a => {
    const val = scores.dimension_scores[a];
    if (val === undefined) {
      // Check legacy fallback
      if (a === 'Governance Disclosure') {
        return scores.dimension_scores['Documentation Completeness'] ?? 0;
      }
      return 0;
    }
    return val !== null ? val : 0;
  });

  const benchmarkValues = [75, 75, 75, 75, 75, 75];

  const data: ChartData<'radar'> = {
    labels: axes,
    datasets: [
      {
        label: 'Model Trust Profile',
        data: values,
        backgroundColor: 'rgba(229, 169, 60, 0.25)',
        borderColor: '#E5A93C',
        borderWidth: 2.5,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#F59E0B',
        pointRadius: 4.5,
      },
      {
        label: 'Minimum Compliance Benchmark (75.0)',
        data: benchmarkValues,
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        borderColor: 'rgba(6, 182, 212, 0.7)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 2,
        pointBackgroundColor: 'rgba(6, 182, 212, 0.8)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        },
        pointLabels: {
          color: darkMode ? '#cbd5e1' : '#334155',
          font: {
            family: "'Space Grotesk', system-ui, sans-serif",
            size: 10,
            weight: 600 as const,
          },
        },
        ticks: {
          display: true,
          stepSize: 20,
          backdropColor: 'transparent',
          color: darkMode ? '#64748b' : '#94a3b8',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 9,
          },
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? '#e2e8f0' : '#1e293b',
          font: {
            family: "'Plus Jakarta Sans', system-ui, sans-serif",
            size: 11,
          },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        titleColor: darkMode ? '#f8fafc' : '#0f172a',
        bodyColor: darkMode ? '#cbd5e1' : '#334155',
        borderColor: darkMode ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw} / 100`
        }
      }
    },
  };

  return (
    <div className="relative">
      {/* 3D / 2D Toggle Switch */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Trust Vector Dimensionality:
        </span>
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
            3D Spatial Prism
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
            2D Diagnostic Radar
          </button>
        </div>
      </div>

      {viewMode === '3d' ? (
        <ThreeErrorBoundary
          fallback={
            <div className="w-full h-80 sm:h-96 relative">
              {/* @ts-ignore */}
              <Radar data={data} options={options} />
            </div>
          }
        >
          <RadarPrism3D
            dimensionScores={scores.dimension_scores}
            onSelectTab={onSelectTab}
          />
        </ThreeErrorBoundary>
      ) : (
        <div className="w-full h-80 sm:h-96 relative">
          {/* @ts-ignore */}
          <Radar data={data} options={options} />
        </div>
      )}
    </div>
  );
};
