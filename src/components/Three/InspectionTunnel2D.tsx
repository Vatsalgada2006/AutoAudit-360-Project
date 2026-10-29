import React from 'react';
import { Scale, Search, ShieldAlert, FileText, Stamp, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { FullAuditResult } from '../../types';

interface InspectionTunnel2DProps {
  stage: number; // 0 to 5
  isAuditing: boolean;
  auditResult?: FullAuditResult | null;
  onGateClick?: (gateKey: 'fairness' | 'explain' | 'stresstest' | 'lawcheck') => void;
}

export const InspectionTunnel2D: React.FC<InspectionTunnel2DProps> = ({
  stage,
  isAuditing,
  auditResult,
  onGateClick,
}) => {
  const gates = [
    {
      id: 'fairness' as const,
      name: 'Fairness',
      icon: Scale,
      gateIndex: 1,
      status: auditResult?.fairness.some(f => f.status === 'fail') ? 'fail' : auditResult?.fairness.some(f => f.status === 'warn') ? 'warn' : auditResult ? 'pass' : 'idle',
    },
    {
      id: 'explain' as const,
      name: 'Explainability',
      icon: Search,
      gateIndex: 2,
      status: auditResult?.explain.status || 'idle',
    },
    {
      id: 'stresstest' as const,
      name: 'Stress Test',
      icon: ShieldAlert,
      gateIndex: 3,
      status: auditResult?.robustness.status || 'idle',
    },
    {
      id: 'lawcheck' as const,
      name: 'Regulatory Law',
      icon: FileText,
      gateIndex: 4,
      status: auditResult ? (auditResult.compliance.eu_ai_act.score < 50 ? 'fail' : auditResult.compliance.eu_ai_act.score < 75 ? 'warn' : 'pass') : 'idle',
    },
  ];

  // Calculate box position percentage along the conveyor
  const boxProgress = isAuditing ? (stage / 5) * 80 + 10 : auditResult ? 90 : 5;

  return (
    <div className="w-full bg-[#FFFFFF] dark:bg-[#1B1B1F] rounded-lg p-5 border border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C] animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70">
            AI Model Inspection Tunnel
          </span>
        </div>
        <span className="font-mono text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
          {isAuditing ? `Checkpoint ${stage} of 4 in progress...` : auditResult ? 'Inspection Complete' : 'Awaiting Inspection Launch'}
        </span>
      </div>

      {/* Conveyor Belt & 4 Gates Station */}
      <div className="relative py-8">
        
        {/* Conveyor Track */}
        <div className="h-6 w-full bg-[#1B1B1F]/10 dark:bg-[#F6F1E7]/10 rounded-full border border-[#1B1B1F]/20 dark:border-[#F6F1E7]/20 relative conveyor-belt">
          {/* Rollers */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-40">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="w-1.5 h-3 bg-[#1B1B1F] dark:bg-[#F6F1E7] rounded-sm" />
            ))}
          </div>
        </div>

        {/* The 4 Inspection Gates */}
        <div className="absolute inset-0 flex justify-around items-center px-4 pointer-events-none">
          {gates.map((g) => {
            const Icon = g.icon;
            const isPassing = isAuditing && stage === g.gateIndex;
            const isCompleted = isAuditing ? stage > g.gateIndex : !!auditResult;

            let gateBorderColor = 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900';
            if (isCompleted && g.status === 'pass') gateBorderColor = 'border-[#1F9D6B] bg-[#1F9D6B]/10';
            if (isCompleted && g.status === 'warn') gateBorderColor = 'border-[#F2B01E] bg-[#F2B01E]/10';
            if (isCompleted && g.status === 'fail') gateBorderColor = 'border-[#D6334A] bg-[#D6334A]/10';
            if (isPassing) gateBorderColor = 'border-[#FF6B2C] bg-[#FF6B2C]/20 ring-4 ring-[#FF6B2C]/20';

            return (
              <button
                key={g.id}
                onClick={() => onGateClick && onGateClick(g.id)}
                className={`pointer-events-auto flex flex-col items-center p-2 rounded-lg border-2 transition-transform hover:scale-105 ${gateBorderColor}`}
                title={`Click to inspect ${g.name}`}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center mb-1">
                  <Icon className="w-5 h-5 text-[#1B1B1F] dark:text-[#F6F1E7]" />
                </div>
                <span className="font-display font-bold text-xs text-[#1B1B1F] dark:text-[#F6F1E7]">
                  {g.name}
                </span>

                {/* Gate Status Badge */}
                {isCompleted && (
                  <div className="mt-1">
                    {g.status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-[#1F9D6B]" />}
                    {g.status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-[#F2B01E]" />}
                    {g.status === 'fail' && <XCircle className="w-3.5 h-3.5 text-[#D6334A]" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* The Model Box traversing the conveyor */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20 pointer-events-none"
          style={{ left: `${boxProgress}%` }}
        >
          <div className="w-14 h-12 -ml-7 bg-[#FF6B2C] text-white rounded shadow-md border-2 border-white flex flex-col items-center justify-center font-mono text-[9px] font-bold">
            <span>MODEL</span>
            <span className="text-[8px] opacity-80">BOX</span>
          </div>

          {/* Stamp landing animation at end of audit */}
          {auditResult && stage === 5 && (
            <div className="absolute -top-6 -right-3 animate-bounce">
              <Stamp className="w-6 h-6 text-[#1F9D6B]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
