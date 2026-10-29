import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
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
      <div className="ticket-card p-8 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="font-display font-bold text-lg">No Adversarial Stress Test Data</h3>
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
      
      {/* 1. The Plain Question (Large) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#1B1B1F] dark:bg-[#F6F1E7] text-white dark:text-[#1B1B1F] font-mono font-bold text-xs flex items-center justify-center">
            3
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF6B2C]">
            Checkpoint 3: Stress Test Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#1B1B1F] dark:text-[#F6F1E7]">
          Does it still work when data gets messy or attacked?
        </h2>
      </div>

      {/* 2. One-sentence answer with Status Badge */}
      <div className="ticket-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[#FF6B2C]">
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-body font-semibold text-[#1B1B1F] dark:text-[#F6F1E7]">
            {answerText}
          </div>
          <p className="text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
            Robustness Score: <strong>{robustness.robustness_score?.toFixed(1)}/100</strong> | Counterfactual flip rate: {(cfFlipRate * 100).toFixed(1)}%.
          </p>
        </div>
        <StatusBadge
          status={robustness.status}
          label={robustness.status === 'pass' ? 'Good' : robustness.status === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* 3. The Evidence: Charts + "What this means" Box */}
      <div className="space-y-6">
        
        {/* Evidence 1: Bounded Perturbation Attacks & Counterfactual Flips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card A: Counterfactual Identity Swap Test */}
          <div className="ticket-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
                Counterfactual Identity Flip Test
              </h4>
              <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                cfFlipRate > 0.05 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {(cfFlipRate * 100).toFixed(1)}% Flipped
              </span>
            </div>

            <p className="text-xs text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70">
              Only the protected attribute (Sex, Age, or Race) is flipped while keeping all other variables identical.
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {Object.entries(cfResults).map(([attr, val]) => {
                const flipVal = typeof val === 'number' ? val : (val as { flip_rate?: number })?.flip_rate ?? 0;
                return (
                  <div key={attr} className="flex items-center justify-between p-2 rounded bg-stone-100 dark:bg-stone-800">
                    <span>{attr}:</span>
                    <strong>{(flipVal * 100).toFixed(1)}% flips</strong>
                  </div>
                );
              })}
            </div>

            {/* "What this means" Box */}
            <div className="p-3 bg-[#FF6B2C]/5 rounded border border-[#FF6B2C]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
              <strong>What this means:</strong> If an individual's loan approval or risk score changes simply by altering their demographic group label, the decision boundary directly penalizes protected identity.
            </div>
          </div>

          {/* Card B: Bounded Worst-Case Perturbation Attacks (ε = 0.05, 0.10, 0.20) */}
          <div className="ticket-card p-5 space-y-3">
            <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
              Worst-Case Bounded Attacks (Greedy Search)
            </h4>
            <p className="text-xs text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70">
              Adversarial coordinate search within ±ε·σ standard deviations on numeric features.
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {boundedAttacks.map((att) => (
                <div key={att.epsilon} className="flex items-center justify-between p-2 rounded bg-stone-100 dark:bg-stone-800">
                  <span>Attack Strength ε = {att.epsilon}:</span>
                  <div className="text-right">
                    <span className="font-bold text-[#D6334A]">-{(att.accuracy_drop * 100).toFixed(1)}% Acc</span>
                    <span className="text-stone-400 ml-2">({(att.prediction_flip_rate * 100).toFixed(1)}% flips)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* "What this means" Box */}
            <div className="p-3 bg-[#FF6B2C]/5 rounded border border-[#FF6B2C]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
              <strong>What this means:</strong> Measures how easily small realistic changes in user data (e.g. minor income shift) can trigger unintended prediction flips.
            </div>
          </div>
        </div>

        {/* Evidence 2: Label Corruption & Gaussian Noise Degradation */}
        <div className="ticket-card p-5 space-y-4">
          <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
            Model Degradation Under Data Corruption
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            {labelFlips.map(lf => (
              <div key={lf.flip_rate_pct} className="p-3 rounded bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-stone-500">{lf.flip_rate_pct}% Label Corruption</div>
                <div className="text-sm font-bold text-[#1B1B1F] dark:text-[#F6F1E7] mt-1">{(lf.accuracy * 100).toFixed(1)}% Accuracy</div>
                <div className="text-[11px] text-[#D6334A]">Drop: -{(lf.accuracy_drop * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>

          {/* "What this means" Box */}
          <div className="p-3 bg-[#FF6B2C]/5 rounded border border-[#FF6B2C]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
            <strong>What this means:</strong> Even if historical training data contains mislabelled training examples or data drift, resilient models maintain graceful performance degradation.
          </div>
        </div>
      </div>

      {/* 4. Collapsible "Expert Details" Section */}
      <div className="ticket-card p-4 space-y-3">
        <button
          onClick={() => setShowExpertDetails(!showExpertDetails)}
          className="w-full flex items-center justify-between text-left font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]"
        >
          <span>Expert Details: Perturbation Attack Algorithm &amp; Stability Deltas</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#FF6B2C]">Adversarial Attack Specification:</div>
              <div className="p-2.5 bg-stone-100 dark:bg-stone-900 rounded space-y-1">
                <div>• Greedy coordinate search: x_adv = x + argmax_δ L(f(x + δ), y) subject to ||δ||_∞ &le; ε·σ_feat</div>
                <div>• Evaluated at ε ∈ &#123;0.05, 0.10, 0.20&#125; across all continuous numerical coordinates.</div>
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
