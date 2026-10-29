import React from 'react';
import { BookOpen, Info, Moon, Sun, Sliders, CheckCircle2, AlertTriangle, XCircle, Compass } from 'lucide-react';
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
    <header className="border-b border-[#332A37] bg-[#201823] text-[#FAF2E8] shadow-md transition-colors sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Title and Domain Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded bg-[#D5F36A] text-[#201823] flex items-center justify-center font-mono font-black text-sm shadow-xs">
                360
              </span>
              <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#FAF2E8]">
                AutoAudit-360: End-to-End Trustworthy AI Audit &amp; Regulatory Compliance Suite
              </h1>
            </div>
            <p className="mt-1 text-xs text-[#C5B6C9] font-body">
              Domain: AI Governance, Policy &amp; Risk Management | Modules 1-4: Trustworthy AI pipeline, AI Model Card, EU AI Act, India DPDP Act 2023
            </p>
          </div>

          {/* Controls & Readiness Seal */}
          <div className="flex items-center flex-wrap gap-2 justify-end">
            
            {/* Show stamp ONLY when audit has actually run */}
            {hasAuditRun && scores && (
              <div className="flex items-center mr-1">
                <span className={`stamp-badge text-xs py-1 px-3 ${
                  scores.rag_status === 'green' ? 'stamp-pass' :
                  scores.rag_status === 'amber' ? 'stamp-warn' : 'stamp-fail'
                }`}>
                  {scores.rag_status === 'green' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {scores.rag_status === 'amber' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {scores.rag_status === 'red' && <XCircle className="w-3.5 h-3.5" />}
                  <span>{scores.readiness_verdict || 'READINESS DETERMINED'}</span>
                </span>
              </div>
            )}

            {/* Simple / Expert Mode Toggle */}
            <button
              onClick={() => setIsExpertMode(!isExpertMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded border transition-colors ${
                isExpertMode
                  ? 'bg-[#D5F36A] text-[#201823] border-[#D5F36A] font-bold'
                  : 'bg-[#332A37] text-[#FAF2E8] border-[#C5B6C9]/30 hover:border-[#D5F36A]'
              }`}
              title="Toggle between Simple inspection findings and Expert mathematical details"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isExpertMode ? 'Expert Details' : 'Simple View'}</span>
            </button>

            {/* Benchmark Comparison Button */}
            <button
              onClick={onOpenComparison}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded border border-[#C5B6C9]/30 hover:border-[#D5F36A] text-[#FAF2E8] bg-[#332A37] transition-colors"
              title="View German Credit vs COMPAS benchmark comparison"
            >
              <Compass className="w-3.5 h-3.5 text-[#D5F36A]" />
              <span className="hidden sm:inline">Benchmarks</span>
            </button>

            {/* Glossary Button */}
            <button
              onClick={onOpenGlossary}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded border border-[#C5B6C9]/30 hover:border-[#D5F36A] text-[#FAF2E8] bg-[#332A37] transition-colors"
              title="Open Glossary of Regulatory & Technical Terms"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C5B6C9]" />
              <span className="hidden sm:inline">Glossary</span>
            </button>

            {/* About Architecture Button */}
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded border border-[#C5B6C9]/30 hover:border-[#D5F36A] text-[#FAF2E8] bg-[#332A37] transition-colors"
              title="About AutoAudit-360 Modular Architecture"
            >
              <Info className="w-3.5 h-3.5 text-[#C5B6C9]" />
              <span className="hidden sm:inline">About</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded border border-[#C5B6C9]/30 hover:border-[#D5F36A] text-[#FAF2E8] bg-[#332A37] transition-colors"
              title={isDarkMode ? 'Switch to Warm Ivory Paper Mode' : 'Switch to Obsidian Plum Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#D5F36A]" /> : <Moon className="w-4 h-4 text-[#C5B6C9]" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
