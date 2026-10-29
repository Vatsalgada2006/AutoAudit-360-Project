import React from 'react';
import { ShieldCheck, BookOpen, Info, Moon, Sun, Sliders, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AuditScores } from '../types';

interface HeaderProps {
  scores?: AuditScores | null;
  hasAuditRun: boolean;
  isExpertMode: boolean;
  setIsExpertMode: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenGlossary: () => void;
  onOpenAbout: () => void;
  onOpenComparison: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scores,
  hasAuditRun,
  isExpertMode,
  setIsExpertMode,
  isDarkMode,
  setIsDarkMode,
  onOpenGlossary,
  onOpenAbout,
  onOpenComparison
}) => {
  return (
    <header className="border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 bg-[#FFFFFF] dark:bg-[#1B1B1F] shadow-sm transition-colors sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Title and Domain Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded bg-[#FF6B2C] text-white flex items-center justify-center font-mono font-black text-lg shadow-sm">
                360
              </span>
              <h1 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#1B1B1F] dark:text-[#F6F1E7]">
                AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70 font-body">
              Domain: AI Governance, Policy & Risk Management | Modules 1-4: Trustworthy AI pipeline, AI Model Card, EU AI Act, India DPDP Act 2023
            </p>
          </div>

          {/* Controls & Inspection Status */}
          <div className="flex items-center flex-wrap gap-2.5 justify-end">
            
            {/* Show stamp ONLY when audit has actually run */}
            {hasAuditRun && scores && (
              <div className="flex items-center mr-2">
                <span className={`stamp-badge text-xs sm:text-sm py-1 px-3 ${
                  scores.rag_status === 'green' ? 'stamp-pass' :
                  scores.rag_status === 'amber' ? 'stamp-warn' : 'stamp-fail'
                }`}>
                  {scores.rag_status === 'green' && <CheckCircle2 className="w-4 h-4" />}
                  {scores.rag_status === 'amber' && <AlertTriangle className="w-4 h-4" />}
                  {scores.rag_status === 'red' && <XCircle className="w-4 h-4" />}
                  <span>{scores.readiness_verdict || 'READINESS DETERMINED'}</span>
                </span>
              </div>
            )}

            {/* Simple / Expert Mode Toggle */}
            <button
              onClick={() => setIsExpertMode(!isExpertMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded border transition-colors ${
                isExpertMode
                  ? 'bg-[#FF6B2C] text-white border-[#FF6B2C]'
                  : 'bg-[#F6F1E7] dark:bg-[#16161A] text-[#1B1B1F] dark:text-[#F6F1E7] border-[#1B1B1F]/15 dark:border-[#F6F1E7]/15 hover:border-[#FF6B2C]'
              }`}
              title="Toggle between Simple inspection findings and Expert mathematical details"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isExpertMode ? 'Expert Mode' : 'Simple View'}</span>
            </button>

            {/* Benchmark Comparison Button */}
            <button
              onClick={onOpenComparison}
              className="px-2.5 py-1.5 text-xs font-mono rounded border border-[#1B1B1F]/15 dark:border-[#F6F1E7]/15 hover:border-[#FF6B2C] text-[#1B1B1F] dark:text-[#F6F1E7] bg-[#F6F1E7]/50 dark:bg-[#16161A]/50 transition-colors"
              title="View German Credit vs COMPAS benchmark comparison"
            >
              Benchmarks
            </button>

            {/* Glossary Button */}
            <button
              onClick={onOpenGlossary}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded border border-[#1B1B1F]/15 dark:border-[#F6F1E7]/15 hover:border-[#FF6B2C] text-[#1B1B1F] dark:text-[#F6F1E7] bg-[#F6F1E7]/50 dark:bg-[#16161A]/50 transition-colors"
              title="Open Glossary of Regulatory & Technical Terms"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Glossary</span>
            </button>

            {/* About Architecture Button */}
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded border border-[#1B1B1F]/15 dark:border-[#F6F1E7]/15 hover:border-[#FF6B2C] text-[#1B1B1F] dark:text-[#F6F1E7] bg-[#F6F1E7]/50 dark:bg-[#16161A]/50 transition-colors"
              title="About AutoAudit-360 Modular Architecture"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">About</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded border border-[#1B1B1F]/15 dark:border-[#F6F1E7]/15 hover:border-[#FF6B2C] text-[#1B1B1F] dark:text-[#F6F1E7] bg-[#F6F1E7]/50 dark:bg-[#16161A]/50 transition-colors"
              title={isDarkMode ? 'Switch to Paper Mode' : 'Switch to Charcoal Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
