import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Flame, Info, ArrowRight } from 'lucide-react';
import { RobustnessAudit } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { Tooltip } from '../Common/Tooltip';

interface StressTestCheckpointProps {
  robustness: RobustnessAudit;
  isExpertMode: boolean;
}

export const StressTestCheckpoint: React.FC<StressTestCheckpointProps> = ({
  robustness,
  isExpertMode,
}) => {
  const [showExpertDetails, setShowExpertDetails] = useState(isExpertMode);

  if (!robustness || robustness.robustness_score === null) {
    return (
      <div className="observatory-card p-8 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">No Adversarial Stress Test Data</h3>
        <p className="text-sm text-stone-500">
          Adversarial perturbations are bypassed for precomputed predictions column mode.
        </p>
      </div>
    );
  }

  const labelFlips = robustness.label_flip_tests || [];
  const perturbations = robustness.perturbation_tests || [];
  const boundedAttacks = robustness.bounded_attack_tests || [];
  const cfFlipRate = robustness.counterfactual_flip_rate ?? 0;
  const cfResults = robustness.counterfactual_results || {};

  const isPass = robustness.status === 'pass';
  const isWarn = robustness.status === 'warn';

  const answerText = isPass
    ? `The model boundary demonstrates solid resilience against synthetic data noise, label corruption, and identity flips.`
    : isWarn
    ? `Moderate degradation observed: Model predictions exhibit sensitivity under adversarial feature noise or counterfactual inspection.`
    : `Elevated vulnerability: Significant performance drop or prediction flipping under minor data perturbations and identity swaps.`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. Header & Station Identifier */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#332A37] text-[#D5F36A] font-mono font-bold text-xs flex items-center justify-center">
            3
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF705D]">
            Checkpoint 3: Robustness &amp; Stress Test Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#201823] dark:text-[#FAF2E8]">
          Does it still work when data gets messy or attacked?
        </h2>
      </div>

      {/* 2. Structured 4-Question Framing: What, Why */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#FF705D]">What is this?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            Multi-axis stress testing consisting of synthetic label corruption (5%-20%), Gaussian input noise, counterfactual demographic identity swaps, and worst-case bounded coordinate perturbation attacks (ε = 0.05, 0.10, 0.20).
          </p>
        </div>

        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#D5F36A]">Why does it matter?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            EU AI Act Article 15 mandates technical robustness against errors, faults, and adversarial inputs. Fragile models can be easily manipulated or experience sudden performance collapse when real-world distributions shift.
          </p>
        </div>
      </div>

      {/* 3. One-sentence answer with Status Badge */}
      <div className="observatory-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[#FF705D]">
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-body font-semibold text-[#201823] dark:text-[#FAF2E8]">
            {answerText}
          </div>
          <p className="text-xs text-[#201823]/60 dark:text-[#FAF2E8]/60">
            Robustness Score: <strong>{robustness.robustness_score?.toFixed(1)}/100</strong> | Counterfactual identity flip rate: {(cfFlipRate * 100).toFixed(1)}%.
          </p>
        </div>
        <StatusBadge
          status={robustness.status}
          label={robustness.status === 'pass' ? 'Good' : robustness.status === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* 4. The Evidence: Charts + "What this means" Box */}
      <div className="space-y-6">
        
        {/* Evidence 1: Bounded Perturbation Attacks & Counterfactual Flips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card A: Counterfactual Identity Swap Test */}
          <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#FF705D]">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
                Counterfactual Identity Flip Test
              </h4>
              <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                cfFlipRate > 0.05 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-[#FF705D]' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-[#D5F36A]'
              }`}>
                {(cfFlipRate * 100).toFixed(1)}% Flipped
              </span>
            </div>

            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70">
              Only the protected attribute (Sex, Age, or Race) is flipped while holding all operational input variables completely constant.
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {Object.entries(cfResults).map(([attr, val]) => {
                const flipVal = typeof val === 'number' ? val : (val as { flip_rate?: number })?.flip_rate ?? 0;
                return (
                  <div key={attr} className="flex items-center justify-between p-2 rounded bg-[#FAF2E8] dark:bg-[#332A37]/60 border border-[#DED3D8] dark:border-[#332A37]">
                    <span className="text-[#201823] dark:text-[#FAF2E8]">{attr}:</span>
                    <strong className="text-[#FF705D]">{(flipVal * 100).toFixed(1)}% flips</strong>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg border border-[#DED3D8] dark:border-[#332A37] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80">
              <strong>What this means:</strong> If an applicant's prediction changes simply by altering their demographic group label, the decision surface directly penalizes protected identity without legitimate business justification.
            </div>
          </div>

          {/* Card B: Bounded Worst-Case Perturbation Attacks (ε = 0.05, 0.10, 0.20) */}
          <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#C5B6C9]">
            <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
              Worst-Case Bounded Coordinate Attacks
            </h4>
            <p className="text-xs text-[#201823]/70 dark:text-[#FAF2E8]/70">
              Greedy coordinate search within ±ε·σ standard deviations on continuous numeric features.
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {boundedAttacks.map((att) => (
                <div key={att.epsilon} className="flex items-center justify-between p-2 rounded bg-[#FAF2E8] dark:bg-[#332A37]/60 border border-[#DED3D8] dark:border-[#332A37]">
                  <span className="text-[#201823] dark:text-[#FAF2E8]">Attack Strength ε = {att.epsilon}:</span>
                  <div className="text-right">
                    <span className="font-bold text-[#FF705D]">-{(att.accuracy_drop * 100).toFixed(1)}% Acc</span>
                    <span className="text-stone-400 ml-2">({(att.prediction_flip_rate * 100).toFixed(1)}% flips)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg border border-[#DED3D8] dark:border-[#332A37] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80">
              <strong>What this means:</strong> Measures how readily minor fluctuations in realistic applicant data (such as small savings shifts) trigger decision changes.
            </div>
          </div>
        </div>

        {/* Evidence 2: Label Corruption & Degradation */}
        <div className="observatory-card p-5 space-y-4">
          <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
            Model Degradation Under Synthetic Label Corruption
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            {labelFlips.map(lf => (
              <div key={lf.flip_rate_pct} className="p-3 rounded bg-[#FAF2E8] dark:bg-[#332A37]/60 border border-[#DED3D8] dark:border-[#332A37]">
                <div className="font-bold text-stone-500">{lf.flip_rate_pct}% Corruption</div>
                <div className="text-sm font-bold text-[#201823] dark:text-[#FAF2E8] mt-1">{(lf.accuracy * 100).toFixed(1)}% Accuracy</div>
                <div className="text-[11px] text-[#FF705D] font-bold">Drop: -{(lf.accuracy_drop * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg border border-[#DED3D8] dark:border-[#332A37] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-[#201823] dark:text-[#FAF2E8]">
              <Info className="w-3.5 h-3.5 text-[#FF705D]" />
              Scientific Scope &amp; Threat Model Caveat
            </div>
            <p className="text-[11px] leading-relaxed">
              These experiments measure empirical stability under localized Gaussian noise, bounded greedy coordinate shifts, and uniform label noise. Synthetic perturbations do <strong>not</strong> simulate all real-world adversarial attacks, evasion strategies, or catastrophic distribution shifts.
            </p>
          </div>
        </div>

        {/* 5. What should you investigate next? */}
        <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#D5F36A]">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#201823] dark:text-[#D5F36A]" />
            <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
              What should you investigate next?
            </h4>
          </div>
          <ul className="text-xs space-y-2 text-[#201823]/80 dark:text-[#FAF2E8]/80 list-disc pl-4">
            <li>
              <strong>Decision boundary smoothing:</strong> If ε=0.10 induces &gt;15% prediction flips, apply adversarial training or margin regularization to stabilize model confidence.
            </li>
            <li>
              <strong>Input validation filters:</strong> Enforce runtime sanity bounds on continuous features before feeding inputs to model scoring engines.
            </li>
            <li>
              <strong>Demographic counterfactual fairness:</strong> If identity flips induce &gt;5% outcome changes, penalize counterfactual loss during gradient descent or post-process decision cutoffs.
            </li>
          </ul>
        </div>
      </div>

      {/* 6. Collapsible "Expert Details" Section */}
      <div className="observatory-card p-4 space-y-3">
        <button
          onClick={() => setShowExpertDetails(!showExpertDetails)}
          className="w-full flex items-center justify-between text-left font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]"
        >
          <span>Expert Details: Perturbation Attack Algorithm &amp; Stability Deltas</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#DED3D8] dark:border-[#332A37] space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#FF705D]">Adversarial Attack Specification:</div>
              <div className="p-3 bg-[#FAF2E8] dark:bg-[#201823] rounded-lg border border-[#DED3D8] dark:border-[#332A37] space-y-1.5 text-[11px] leading-relaxed">
                <div>• Greedy coordinate search: x_adv = x + argmax_δ L(f(x + δ), y) subject to ||δ||_∞ &le; ε·σ_feat</div>
                <div>• Evaluated at ε ∈ &#123;0.05, 0.10, 0.20&#125; across continuous numerical coordinates.</div>
                <div>• Multi-attribute fairness stability delta under 5% Gaussian noise: max DI drift = {robustness.fairness_stability_delta?.toFixed(3) ?? 'N/A'}.</div>
                <div>• Categorical swap test: {robustness.categorical_swap_flips ? `${(robustness.categorical_swap_flips * 100).toFixed(1)}% flip rate` : 'Zero sensitivity'}.</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
