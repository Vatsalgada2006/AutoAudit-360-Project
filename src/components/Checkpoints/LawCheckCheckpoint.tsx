import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { ComplianceAudit } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { Tooltip } from '../Common/Tooltip';

interface LawCheckCheckpointProps {
  compliance: ComplianceAudit;
  isExpertMode: boolean;
}

export const LawCheckCheckpoint: React.FC<LawCheckCheckpointProps> = ({
  compliance,
  isExpertMode,
}) => {
  const [showExpertDetails, setShowExpertDetails] = useState(isExpertMode);
  const [activeLawTab, setActiveLawTab] = useState<'eu' | 'dpdp'>('eu');

  if (!compliance) {
    return (
      <div className="observatory-card p-8 text-center space-y-3">
        <FileText className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="font-display font-bold text-lg">No Regulatory Assessment Data</h3>
        <p className="text-sm text-stone-500">Run an inspection to audit against EU AI Act and India DPDP Act 2023.</p>
      </div>
    );
  }

  const euScore = compliance.eu_ai_act?.score ?? 0;
  const dpdpScore = compliance.dpdp_act_2023?.score ?? 0;
  const isHighRisk = compliance.is_high_risk;

  const minLawScore = Math.min(euScore, dpdpScore);
  const lawStatus = minLawScore >= 75 ? 'pass' : minLawScore >= 50 ? 'warn' : 'fail';

  const answerText = minLawScore >= 75
    ? `The system demonstrates high regulatory readiness across automated verification gates and operational policy disclosures.`
    : minLawScore >= 50
    ? `Partial readiness: Core automated verifications passed, but operational governance disclosures remain unaddressed.`
    : `Compliance action required: ${isHighRisk ? 'High-Risk AI System (EU AI Act Annex III)' : 'AI System'} has significant unverified requirements and zero-credit disclosures.`;

  const activeChecklist = activeLawTab === 'eu' ? compliance.eu_ai_act.checklist : compliance.dpdp_act_2023.checklist;
  const activeGaps = activeLawTab === 'eu' ? compliance.eu_ai_act.gaps : compliance.dpdp_act_2023.gaps;
  const activeRemediations = activeLawTab === 'eu' ? compliance.eu_ai_act.remediations : compliance.dpdp_act_2023.remediations;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. The Plain Question (Large) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#1B1B1F] dark:bg-[#F6F1E7] text-white dark:text-[#1B1B1F] font-mono font-bold text-xs flex items-center justify-center">
            4
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#C9A66B]">
            Checkpoint 4: Regulatory Law Check Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#1B1B1F] dark:text-[#F6F1E7]">
          Does it meet the law?
        </h2>
      </div>

      {/* 2. One-sentence answer with Status Badge */}
      <div className="observatory-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[#C9A66B]">
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-body font-semibold text-[#1B1B1F] dark:text-[#F6F1E7]">
            {answerText}
          </div>
          <p className="text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
            Classification: <strong>{compliance.eu_ai_act.classification}</strong> | EU AI Act: {euScore.toFixed(1)}/100 | DPDP Act: {dpdpScore.toFixed(1)}/100.
          </p>
        </div>
        <StatusBadge
          status={lawStatus}
          label={lawStatus === 'pass' ? 'Good' : lawStatus === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* Framework Selector Tabs */}
      <div className="flex gap-2 border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 pb-2">
        <button
          onClick={() => setActiveLawTab('eu')}
          className={`px-4 py-2 rounded font-mono text-xs font-bold transition-colors flex items-center gap-2 border ${
            activeLawTab === 'eu'
              ? 'bg-[#1B1B1F] text-white dark:bg-[#F6F1E7] dark:text-[#1B1B1F] border-transparent'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
          }`}
        >
          <span>EU AI Act (Articles 9–15)</span>
          <span className="font-normal opacity-80">({euScore.toFixed(1)}/100)</span>
        </button>

        <button
          onClick={() => setActiveLawTab('dpdp')}
          className={`px-4 py-2 rounded font-mono text-xs font-bold transition-colors flex items-center gap-2 border ${
            activeLawTab === 'dpdp'
              ? 'bg-[#1B1B1F] text-white dark:bg-[#F6F1E7] dark:text-[#1B1B1F] border-transparent'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
          }`}
        >
          <span>India DPDP Act 2023</span>
          <span className="font-normal opacity-80">({dpdpScore.toFixed(1)}/100)</span>
        </button>
      </div>

      {/* 3. The Evidence: Verification Checklist & Gap Remediation List */}
      <div className="space-y-6">
        
        {/* Checklist */}
        <div className="observatory-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
              {activeLawTab === 'eu' ? 'EU AI Act Compliance Checklist (Articles 9–15)' : 'India DPDP Act 2023 Principles Checklist'}
            </h4>
            <span className="font-mono text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
              Auto-verified weight 2 | Self-declared weight 1
            </span>
          </div>

          <div className="space-y-2.5">
            {activeChecklist.map((item: any, i: number) => {
              const isAuto = item.type === 'auto_verified';
              const status = item.status;

              return (
                <div
                  key={i}
                  className="p-3 rounded border border-stone-200 dark:border-stone-800 bg-[#F6F1E7]/30 dark:bg-[#16161A]/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C9A66B]">
                        {item.article || item.section}
                      </span>
                      <span className="font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]">
                        {item.title || item.principle}
                      </span>
                      {isAuto && (
                        <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-mono text-[9px] font-bold">
                          AUTO-VERIFIED (2x)
                        </span>
                      )}
                    </div>

                    <StatusBadge
                      status={status === 'yes' ? 'pass' : status === 'partial' ? 'warn' : 'fail'}
                      label={status === 'yes' ? 'Fulfilled' : status === 'partial' ? 'Partial' : status === 'no' ? 'Unfulfilled' : 'Unanswered (0 pts)'}
                      size="sm"
                    />
                  </div>

                  <p className="text-xs text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70 font-body">
                    {item.requirement}
                  </p>
                  <div className="text-[11px] font-mono text-stone-500 pt-0.5">
                    <strong>Evidence:</strong> {item.evidence}
                  </div>
                </div>
              );
            })}
          </div>

          {/* "What this means" Box */}
          <div className="p-3 bg-[#C9A66B]/5 rounded border border-[#C9A66B]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
            <strong>What this means:</strong> High-risk systems must meet mandatory EU AI Act articles before deployment. Auto-verified items inspect mathematical test split metrics; self-declared policies count 0 points if left unanswered.
          </div>
        </div>

        {/* Gap List & Remediation Plan */}
        {activeGaps && activeGaps.length > 0 && (
          <div className="observatory-card p-5 space-y-3 border-amber-300 dark:border-amber-800">
            <h4 className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F2B01E]" />
              <span>Identified Regulatory Gaps &amp; Required Remediation</span>
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {activeGaps.slice(0, 4).map((gap: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="font-bold text-[#D6334A]">{gap}</div>
                  {activeRemediations && activeRemediations[idx] && (
                    <div className="mt-1 text-stone-700 dark:text-stone-300">
                      → Action: {activeRemediations[idx]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* "What this means" Box */}
            <div className="p-3 bg-[#C9A66B]/5 rounded border border-[#C9A66B]/20 text-xs font-body text-[#1B1B1F]/80 dark:text-[#F6F1E7]/80">
              <strong>What this means:</strong> Addressing these top deficiencies closes operational liabilities before submission to external auditing boards.
            </div>
          </div>
        )}
      </div>

      {/* 4. Collapsible "Expert Details" Section */}
      <div className="observatory-card p-4 space-y-3">
        <button
          onClick={() => setShowExpertDetails(!showExpertDetails)}
          className="w-full flex items-center justify-between text-left font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]"
        >
          <span>Expert Details: Regulatory Weighting Formula &amp; Statutory References</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#C9A66B]">Statutory Scoring Methodology:</div>
              <div className="p-2.5 bg-stone-100 dark:bg-stone-900 rounded space-y-1">
                <div>• Score = 100 * [∑ (W_i * M_i)] / ∑ W_i</div>
                <div>• Weights: Auto-verified items (W=2.0); Self-declared questionnaire items (W=1.0).</div>
                <div>• Multipliers: Yes = 1.0, Partial = 0.5, No = 0.0, Unanswered = 0.0 (strict zero credit).</div>
                <div>• EU AI Act Annex III Ref: Point 5(b) Credit Scoring / Point 6 Recidivism Law Enforcement.</div>
                <div>• India DPDP Act 2023: Section 9 child consent verification; Sections 11–13 Data Principal rights.</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
