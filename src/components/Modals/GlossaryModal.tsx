import React, { useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOSSARY_TERMS = [
  {
    term: 'Disparate Impact (DI)',
    category: 'Fairness',
    definition: 'The ratio between the favourable outcome rate of an unprivileged demographic group and that of the privileged group. Under the EEOC four-fifths rule, a DI below 0.80 constitutes adverse selection.',
    formula: 'DI = P(Ŷ = 1 | A = unprivileged) / P(Ŷ = 1 | A = privileged)',
  },
  {
    term: 'Demographic Parity Difference (DPD)',
    category: 'Fairness',
    definition: 'The absolute statistical difference in favorable outcome rates between privileged and unprivileged demographic cohorts. Target tolerance is <= 0.10 (10%).',
    formula: 'DPD = |P(Ŷ = 1 | A = privileged) - P(Ŷ = 1 | A = unprivileged)|',
  },
  {
    term: 'Equal Opportunity Difference (EOD)',
    category: 'Fairness',
    definition: 'The absolute difference in True Positive Rates (recall) between protected subgroups, ensuring qualified candidates from both groups have equal probability of acceptance.',
    formula: 'EOD = |TPR(privileged) - TPR(unprivileged)|',
  },
  {
    term: 'Equalized Odds Gap',
    category: 'Fairness',
    definition: 'The maximum gap across both True Positive Rate and False Positive Rate differences between demographic groups.',
    formula: 'EO = max(|TPR_priv - TPR_unpriv|, |FPR_priv - FPR_unpriv|)',
  },
  {
    term: 'Global SHAP (Shapley Values)',
    category: 'Explainability',
    definition: 'A cooperative game-theoretic method that calculates the average marginal contribution of each feature across all possible feature subsets. Reflects statistical contribution in the trained model, not causal physical necessity.',
    formula: 'ϕ_i = ∑ [|S|! (|F| - |S| - 1)! / |F|!] * [f(S ∪ {i}) - f(S)]',
  },
  {
    term: 'Proxy Feature Leakage',
    category: 'Explainability',
    definition: 'A seemingly neutral feature (e.g. zip code, account type) that exhibits high statistical correlation (|r| > 0.40) with protected demographic attributes, acting as an unintended proxy.',
    formula: 'Pearson / Cramer\'s V correlation |r| > 0.40 against protected identities',
  },
  {
    term: 'Counterfactual Flip Rate',
    category: 'Robustness',
    definition: 'The percentage of model decisions that flip solely when a protected identity trait (Sex, Race, Age) is swapped while keeping all other financial and behavioral data identical.',
    formula: 'Flip Rate = E[ |f(x) - f(x_counterfactual)| ]',
  },
  {
    term: 'Bounded Adversarial Perturbation',
    category: 'Robustness',
    definition: 'A greedy coordinate search that modifies numeric input features within ±ε standard deviations to identify the worst-case degradation in model accuracy and stability.',
    formula: '||δ||_∞ <= ε · σ_feat, with ε ∈ {0.05, 0.10, 0.20}',
  },
  {
    term: 'Weakest-Link Scoring Rule',
    category: 'Scoring Integrity',
    definition: 'A safety capping rule where severe deficiencies in any individual axis prevent high scores elsewhere from masking risks. If any axis < 50, overall is capped at 74.9 (Amber). If Fairness < 50 on a High-Risk system OR two axes < 50, overall is capped at 49.9 (Red).',
    formula: 'Overall = min(mean(axes), Cap_Rule)',
  },
  {
    term: 'EU AI Act Annex III (High-Risk)',
    category: 'Regulation',
    definition: 'Statutory classification under the European Union AI Act designating automated credit scoring (Point 5b), employment recruitment (Point 4), and criminal recidivism (Point 6) as High-Risk systems requiring mandatory conformity testing (Articles 9–15).',
    formula: 'Articles 9 (Risk Mgmt), 10 (Data/Bias), 11 (Documentation), 12 (Logging), 13 (Transparency), 14 (Human Oversight), 15 (Accuracy/Robustness)',
  },
  {
    term: 'India DPDP Act 2023',
    category: 'Regulation',
    definition: 'The Digital Personal Data Protection Act 2023 governing data fiduciaries in India. Mandates clear notice (Sec 5), explicit consent (Sec 6), parental consent for minors < 18 (Sec 9), and grievance redressal (Sec 11–13).',
    formula: 'Notice, Consent, Purpose Limitation, Minor Protection, DPO & Breach Reporting',
  },
  {
    term: 'RAG Readiness Status',
    category: 'Readiness Stamp',
    definition: 'Traffic-light diagnostic readiness indicator: Green (Score >= 75: READINESS: PASS), Amber (Score 50-74.9: READINESS: NEEDS REVIEW), Red (Score < 50: READINESS: ACTION REQUIRED). Diagnostic findings, not legal certification.',
    formula: 'Green: [75, 100] | Amber: [50, 74.9] | Red: [0, 49.9]',
  },
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = GLOSSARY_TERMS.filter(
    t => t.term.toLowerCase().includes(search.toLowerCase()) ||
         t.definition.toLowerCase().includes(search.toLowerCase()) ||
         t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] dark:bg-[#1B1B1F] border border-[#1B1B1F]/20 dark:border-[#F6F1E7]/20 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF6B2C]" />
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#1B1B1F] dark:text-[#F6F1E7]">
              Glossary of Regulatory &amp; Technical Terms
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 bg-[#F6F1E7]/40 dark:bg-[#16161A]/40">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search terms (e.g. disparate impact, SHAP, DPDP, weakest-link)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-[#1B1B1F] dark:text-[#F6F1E7] focus:outline-none focus:border-[#FF6B2C]"
            />
          </div>
        </div>

        {/* Terms List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {filtered.map((item) => (
            <div key={item.term} className="p-3.5 rounded bg-[#F6F1E7]/50 dark:bg-[#16161A]/50 border border-stone-200 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm sm:text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
                  {item.term}
                </span>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FF6B2C]/10 text-[#FF6B2C]">
                  {item.category}
                </span>
              </div>
              <p className="text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
                {item.definition}
              </p>
              <div className="font-mono text-[11px] text-[#FF6B2C] pt-1 border-t border-stone-200 dark:border-stone-800">
                Formula / Standard: {item.formula}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-stone-500 font-mono text-xs">
              No matching glossary terms found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 bg-[#F6F1E7]/30 dark:bg-[#16161A]/30 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1B1B1F] text-white dark:bg-[#F6F1E7] dark:text-[#1B1B1F] rounded font-mono text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
