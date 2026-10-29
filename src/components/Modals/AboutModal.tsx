import React from 'react';
import { X, ShieldCheck, Code, Layers, FileText } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF2E8] dark:bg-[#201823] border border-[#DED3D8] dark:border-[#332A37] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DED3D8] dark:border-[#332A37] flex items-center justify-between bg-[#FAF2E8] dark:bg-[#201823]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF705D]" />
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#201823] dark:text-[#FAF2E8]">
              About AutoAudit-360 Modular Architecture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs font-mono bg-[#FAF2E8]/40 dark:bg-[#201823]">
          
          <div className="space-y-2">
            <h4 className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF705D]" />
              <span>Diagnostic System Architecture</span>
            </h4>
            <p className="font-body text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
              AutoAudit-360 evaluates AI and machine learning systems across four operational stages:
              (1) Algorithmic Fairness &amp; Disparate Impact on held-out test splits,
              (2) Interpretability &amp; Proxy Feature Screening via game-theoretic SHAP attributions,
              (3) Adversarial Robustness under label corruptions and bounded greedy coordinate perturbations, and
              (4) Statutory Regulatory Readiness matching EU AI Act Annex III and India DPDP Act 2023 principles.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF2E8] dark:bg-[#332A37]/50 border border-[#DED3D8] dark:border-[#332A37] space-y-2">
            <div className="font-bold text-[#FF705D]">PyTorch Compatibility Wrapper:</div>
            <p className="font-body text-[11px] text-[#201823]/70 dark:text-[#FAF2E8]/70">
              The engine seamlessly audits PyTorch models by accepting a fitted Scikit-Learn transformer pipeline alongside the PyTorch module:
            </p>
            <pre className="p-2.5 rounded bg-[#FAF2E8] dark:bg-[#201823] overflow-x-auto text-[11px] border border-[#DED3D8] dark:border-[#332A37] text-[#201823] dark:text-[#FAF2E8]">
{`from audit_model import PyTorchClassifierWrapper

# Wrap torch neural net + fitted sklearn preprocessor
wrapped_model = PyTorchClassifierWrapper(
    torch_model=net,
    preprocessor=fitted_pipeline.named_steps["preprocessor"],
    num_classes=2
)

# Run full inspection CLI
python audit_model.py --data dataset.csv --target Label --sensitive Sex,Age`}
            </pre>
          </div>

          <div className="space-y-1 p-3.5 rounded-lg bg-[#FAF2E8] dark:bg-[#332A37]/40 border-l-4 border-l-[#FF705D] border border-[#DED3D8] dark:border-[#332A37] text-[#201823] dark:text-[#FAF2E8]">
            <div className="font-bold text-[#FF705D]">Mandatory Regulatory &amp; Academic Notice:</div>
            <p className="font-body text-[11px] text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
              AutoAudit-360 is an academic prototype intended for diagnostic risk assessment, technical auditing, and research benchmarking. Its findings and readiness stamps do not constitute formal legal certification, attorney-client privileged advice, or statutory conformity seals.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#DED3D8] dark:border-[#332A37] bg-[#FAF2E8] dark:bg-[#201823] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#332A37] hover:bg-[#201823] text-[#FAF2E8] rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer border border-[#FF705D]/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
