import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { AuditGates3D } from './Three/AuditGates3D';
import { ThreeErrorBoundary } from './Three/ThreeErrorBoundary';

interface ScannerHeroProps {
  currentStage: number;
  totalStages: number;
  stageName: string;
}

const STAGES = [
  { id: 'fairness', title: '1. Ingestion & Fairness Battery: Four-Fifths 80% Rule...' },
  { id: 'explain', title: '2. Global SHAP Explanations & Proxy Leakage Audit...' },
  { id: 'robustness', title: '3. Adversarial Robustness & Sensitive Flips...' },
  { id: 'compliance', title: '4. EU AI Act (Annex III High-Risk) Evaluation...' },
  { id: 'dpdp', title: '5. India DPDP Act 2023 Statutory Verification...' },
  { id: 'modelcard', title: '6. Synthesizing AI Model Card & Trust Radar...' }
];

export const ScannerHero: React.FC<ScannerHeroProps> = ({ currentStage }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const progress = Math.min(100, Math.round(((currentStage + 1) / STAGES.length) * 100));
  const stageId = STAGES[currentStage]?.id || 'fairness';

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-slate-900/95 p-5 md:p-7 shadow-2xl shadow-amber-500/10 mb-8 backdrop-blur-md">
      
      {/* Laser Scanning Line */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scanner pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Reticle & Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center relative shadow-inner shrink-0">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <div className="absolute inset-1.5 border border-cyan-400/30 rounded-lg animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                FORENSIC REGULATORY SCANNER ACTIVE
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold font-display text-white mt-1">
              Executing Battery of Trustworthy AI Audits{dots}
            </h2>
            <p className="text-xs font-mono text-cyan-300 mt-0.5">
              Stage [{currentStage + 1}/{STAGES.length}]: {STAGES[currentStage]?.title || STAGES[0].title}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 bg-slate-950/80 p-3 rounded-lg border border-slate-800 shrink-0">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-slate-400 uppercase">Verification Progress</span>
            <span className="text-amber-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_#38bdf8]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-500">
            <span>ISOLATED SANDBOX</span>
            <span className="text-cyan-400">DETERMINISTIC SEED: 42</span>
          </div>
        </div>

      </div>

      {/* 3D Flowing Gate Pipeline */}
      <div className="mt-5">
        <ThreeErrorBoundary>
          <AuditGates3D currentStage={stageId} progress={progress} />
        </ThreeErrorBoundary>
      </div>

      {/* Audit Step Badges with full titles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-800/80">
        {STAGES.map((stg, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          return (
            <div
              key={idx}
              className={`p-2 rounded text-[10px] font-mono flex items-center gap-1.5 transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-amber-950/50 border border-amber-500/50 text-amber-200 animate-pulse'
                  : 'bg-slate-950/40 border border-slate-800 text-slate-500'
              }`}
              title={stg.title}
            >
              {isDone ? (
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 size={13} className="text-amber-400 animate-spin shrink-0" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full border border-slate-600 shrink-0" />
              )}
              <span className="truncate">{stg.title.split(':')[0]}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
