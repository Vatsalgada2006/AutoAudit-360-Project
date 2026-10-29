import React from 'react';
import { Compass, BookOpen, Info, BarChart3 } from 'lucide-react';

interface FooterProps {
  onOpenAbout?: () => void;
  onOpenGlossary?: () => void;
  onOpenComparison?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenGlossary,
  onOpenComparison,
}) => {
  return (
    <footer className="border-t border-[#C9A66B]/25 bg-[#171A18] text-[#F2EEE5]/75 py-8 px-4 lg:px-8 mt-16 font-body transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        
        {/* Left: Project Branding & Academic Domain Scope */}
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2 font-display font-bold text-sm text-[#F2EEE5]">
            <Compass size={18} className="text-[#C9A66B]" />
            <span>AutoAudit-360: End-to-End Trustworthy AI Audit &amp; Regulatory Compliance Suite</span>
          </div>
          <p className="text-xs text-[#C9A66B]/80 font-mono">
            Domain: AI Governance, Policy &amp; Risk Management | Modules 1-4: Trustworthy AI pipeline, AI Model Card, EU AI Act, India DPDP Act 2023
          </p>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 font-mono text-xs">
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1 hover:text-[#C9A66B] transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>About Architecture</span>
            </button>
          )}

          {onOpenGlossary && (
            <button
              onClick={onOpenGlossary}
              className="flex items-center gap-1 hover:text-[#C9A66B] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Glossary</span>
            </button>
          )}

          {onOpenComparison && (
            <button
              onClick={onOpenComparison}
              className="flex items-center gap-1 hover:text-[#C9A66B] transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Benchmarks</span>
            </button>
          )}
        </div>

      </div>

      {/* Mandatory Neutral Footer Line */}
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[#C9A66B]/20 text-center text-xs font-mono text-[#F2EEE5]/60">
        AutoAudit-360 | Academic prototype | Diagnostic findings, not legal certification.
      </div>
    </footer>
  );
};
