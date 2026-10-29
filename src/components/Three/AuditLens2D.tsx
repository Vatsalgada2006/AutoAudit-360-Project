import React from 'react';
import { Scale, Search, ShieldAlert, BookOpen, CheckCircle2, Clock } from 'lucide-react';

interface AuditLens2DProps {
  stage: number; // 0 to 5
  isAuditing: boolean;
  onLayerClick?: (stageKey: 'fairness' | 'explain' | 'stresstest' | 'lawcheck') => void;
}

export const AuditLens2D: React.FC<AuditLens2DProps> = ({ stage, isAuditing, onLayerClick }) => {
  const stages = [
    { key: 'fairness', label: 'Fairness Core', icon: Scale, ring: 'inner', desc: 'Demographic Parity & 4/5ths Rule' },
    { key: 'explain', label: 'Attribution Lens', icon: Search, ring: 'mid-inner', desc: 'Global SHAP & Proxy Screening' },
    { key: 'stresstest', label: 'Stress Filter', icon: ShieldAlert, ring: 'mid-outer', desc: 'Label Corruption & Bounded Perturbation' },
    { key: 'lawcheck', label: 'Regulatory Aperture', icon: BookOpen, ring: 'outer', desc: 'EU AI Act & India DPDP Act 2023' },
  ] as const;

  return (
    <div className="w-full observatory-card p-6 border border-[#C9A66B]/30 bg-[#F2EEE5]/70 dark:bg-[#171A18]/90 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Optical Lens Graphic */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0 flex items-center justify-center">
          
          {/* Outer Brass Instrument Ring */}
          <div className={`absolute inset-0 rounded-full border-4 border-[#C9A66B] shadow-inner bg-gradient-to-br from-[#C9A66B]/15 via-transparent to-[#171A18]/30 ${
            isAuditing ? 'animate-optical-rotate' : ''
          }`} />

          {/* Calibrated Degrees Tick Marks */}
          <div className="absolute inset-2 rounded-full border border-dashed border-[#C9A66B]/40 opacity-70" />

          {/* Layer 4: Regulatory Ring */}
          <div className={`absolute inset-6 rounded-full border-2 transition-all duration-500 ${
            stage >= 4 ? 'border-[#496F5A] bg-[#496F5A]/10 shadow-[0_0_12px_rgba(73,111,90,0.3)]' : 'border-[#C9A66B]/30'
          }`} />

          {/* Layer 3: Stress Test Ring */}
          <div className={`absolute inset-12 rounded-full border-2 transition-all duration-500 ${
            stage >= 3 ? 'border-[#496F5A] bg-[#496F5A]/10 shadow-[0_0_12px_rgba(73,111,90,0.25)]' : 'border-[#C9A66B]/40'
          }`} />

          {/* Layer 2: Explainability Ring */}
          <div className={`absolute inset-18 rounded-full border-2 transition-all duration-500 ${
            stage >= 2 ? 'border-[#496F5A] bg-[#496F5A]/10 shadow-[0_0_12px_rgba(73,111,90,0.2)]' : 'border-[#C9A66B]/50'
          }`} />

          {/* Layer 1: Fairness Focal Core */}
          <div className={`absolute inset-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
            stage >= 1 ? 'border-[#496F5A] bg-[#496F5A]/20' : 'border-[#C9A66B] bg-[#C9A66B]/10'
          }`}>
            <div className="text-center font-mono">
              <span className="text-[10px] uppercase tracking-wider block text-[#C9A66B] font-bold">Focus</span>
              <span className="text-xs font-bold text-[#171A18] dark:text-[#F2EEE5]">
                {stage === 5 ? 'DONE' : isAuditing ? `STAGE ${stage}/4` : 'READY'}
              </span>
            </div>
          </div>

          {/* Optical Crosshairs */}
          <div className="absolute w-full h-[1px] bg-[#C9A66B]/30 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-[#C9A66B]/30 pointer-events-none" />
        </div>

        {/* Inspection Stages Details & Interactive Controls */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C9A66B]" />
              <span className="font-mono text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
                The Audit Lens &bull; Precision Optical Inspector
              </span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#171A18] dark:text-[#F2EEE5] mt-1">
              Multi-Layered AI Verification Apparatus
            </h3>
            <p className="text-xs sm:text-sm text-[#171A18]/70 dark:text-[#F2EEE5]/70 max-w-xl">
              Each optical layer evaluates a distinct dimension of trustworthy AI—from core demographic equality through feature attribution, adversarial stress boundaries, and statutory regulatory checklists.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {stages.map((st, idx) => {
              const stageNum = idx + 1;
              const isCurrent = isAuditing && stage === stageNum;
              const isDone = stage >= stageNum;
              const Icon = st.icon;

              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => onLayerClick?.(st.key)}
                  className={`p-3 rounded border text-left transition-all flex items-start gap-3 ${
                    isCurrent
                      ? 'border-[#C9A66B] bg-[#C9A66B]/15 shadow-sm'
                      : isDone
                      ? 'border-[#496F5A] bg-[#496F5A]/5'
                      : 'border-[#171A18]/10 dark:border-[#F2EEE5]/10 hover:border-[#C9A66B]/50'
                  }`}
                >
                  <div className={`p-2 rounded mt-0.5 shrink-0 ${
                    isDone ? 'bg-[#496F5A]/20 text-[#496F5A]' : 'bg-[#C9A66B]/20 text-[#C9A66B]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-[#171A18] dark:text-[#F2EEE5] truncate">
                        {st.label}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#496F5A] shrink-0" />
                      ) : isCurrent ? (
                        <Clock className="w-3.5 h-3.5 text-[#C9A66B] animate-spin shrink-0" />
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#171A18]/60 dark:text-[#F2EEE5]/60 mt-0.5 truncate">
                      {st.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
