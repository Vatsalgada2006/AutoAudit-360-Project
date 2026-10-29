import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Info, ArrowRight } from 'lucide-react';
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
        <h3 className="font-display font-bold text-lg text-[#201823] dark:text-[#FAF2E8]">No Regulatory Assessment Data</h3>
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
    ? `The system demonstrates solid readiness across automated technical gates and operational policy disclosures.`
    : minLawScore >= 50
    ? `Partial readiness: Core technical verifications passed, but operational governance disclosures remain unaddressed.`
    : `Compliance action required: ${isHighRisk ? 'High-Risk AI System (EU AI Act Annex III)' : 'AI System'} exhibits critical unfulfilled obligations and zero-credit governance disclosures.`;

  const activeChecklist = activeLawTab === 'eu' ? compliance.eu_ai_act.checklist : compliance.dpdp_act_2023.checklist;
  const activeGaps = activeLawTab === 'eu' ? compliance.eu_ai_act.gaps : compliance.dpdp_act_2023.gaps;
  const activeRemediations = activeLawTab === 'eu' ? compliance.eu_ai_act.remediations : compliance.dpdp_act_2023.remediations;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. Header & Station Identifier */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#332A37] text-[#D5F36A] font-mono font-bold text-xs flex items-center justify-center">
            4
          </span>
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#FF705D]">
            Checkpoint 4: Regulatory Law Check Station
          </span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-[#201823] dark:text-[#FAF2E8]">
          Does it meet the law?
        </h2>
      </div>

      {/* 2. Structured 4-Question Framing: What, Why */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#FF705D]">What is this?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            Statutory readiness evaluation against the EU AI Act (Articles 9–15: risk management, data governance, transparency, human oversight, robustness) and India's DPDP Act 2023 (Sections 4–13: consent, data minimization, principal rights).
          </p>
        </div>

        <div className="observatory-card p-4 space-y-1 border-l-4 border-l-[#C5B6C9]">
          <span className="font-mono text-[10px] uppercase font-bold text-[#D5F36A]">Why does it matter?</span>
          <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 leading-relaxed">
            Legal non-compliance exposes developers to statutory penalties and market bans. AutoAudit-360 combines automated empirical verification with governance disclosures to highlight unaddressed compliance liabilities.
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
            Classification: <strong>{compliance.eu_ai_act.classification}</strong> | EU AI Act Score: {euScore.toFixed(1)}/100 | India DPDP Score: {dpdpScore.toFixed(1)}/100.
          </p>
        </div>
        <StatusBadge
          status={lawStatus}
          label={lawStatus === 'pass' ? 'Good' : lawStatus === 'warn' ? 'Needs attention' : 'Problem'}
          size="lg"
        />
      </div>

      {/* Framework Selector Tabs */}
      <div className="flex gap-2 border-b border-[#DED3D8] dark:border-[#332A37] pb-2">
        <button
          onClick={() => setActiveLawTab('eu')}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
            activeLawTab === 'eu'
              ? 'bg-[#332A37] text-[#FAF2E8] border-[#332A37] shadow-sm'
              : 'bg-[#FAF2E8] dark:bg-[#201823] text-[#201823] dark:text-[#FAF2E8] border-[#DED3D8] dark:border-[#332A37] hover:border-[#FF705D]'
          }`}
        >
          <span>EU AI Act (Articles 9–15)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#201823] text-[#D5F36A] dark:bg-[#FAF2E8] dark:text-[#201823]">{euScore.toFixed(1)}/100</span>
        </button>

        <button
          onClick={() => setActiveLawTab('dpdp')}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
            activeLawTab === 'dpdp'
              ? 'bg-[#332A37] text-[#FAF2E8] border-[#332A37] shadow-sm'
              : 'bg-[#FAF2E8] dark:bg-[#201823] text-[#201823] dark:text-[#FAF2E8] border-[#DED3D8] dark:border-[#332A37] hover:border-[#FF705D]'
          }`}
        >
          <span>India DPDP Act 2023 (Sec 4–13)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#201823] text-[#D5F36A] dark:bg-[#FAF2E8] dark:text-[#201823]">{dpdpScore.toFixed(1)}/100</span>
        </button>
      </div>

      {/* 4. The Evidence: Verification Checklist & Gap Remediation List */}
      <div className="space-y-6">
        
        {/* Checklist */}
        <div className="observatory-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8]">
              {activeLawTab === 'eu' ? 'EU AI Act Compliance Checklist (Articles 9–15)' : 'India DPDP Act 2023 Principles Checklist'}
            </h4>
            <span className="font-mono text-xs text-[#201823]/60 dark:text-[#FAF2E8]/60">
              Auto-verified weight 2.0x | Self-declared weight 1.0x
            </span>
          </div>

          <div className="space-y-2.5">
            {activeChecklist.map((item: any, i: number) => {
              const isAuto = item.type === 'auto_verified';
              const status = item.status;

              return (
                <div
                  key={i}
                  className="p-3.5 rounded-lg border border-[#DED3D8] dark:border-[#332A37] bg-[#FAF2E8]/60 dark:bg-[#201823]/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FF705D]">
                        {item.article || item.section}
                      </span>
                      <span className="font-display font-bold text-sm text-[#201823] dark:text-[#FAF2E8]">
                        {item.title || item.principle}
                      </span>
                      {isAuto && (
                        <span className="px-1.5 py-0.5 bg-[#332A37] text-[#D5F36A] dark:bg-[#FAF2E8] dark:text-[#201823] rounded font-mono text-[9px] font-bold">
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

                  <p className="text-xs text-[#201823]/80 dark:text-[#FAF2E8]/80 font-body">
                    {item.requirement}
                  </p>
                  <div className="text-[11px] font-mono text-[#201823]/60 dark:text-[#FAF2E8]/60 pt-0.5">
                    <strong>Evidence:</strong> {item.evidence}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg border border-[#DED3D8] dark:border-[#332A37] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-[#201823] dark:text-[#FAF2E8]">
              <Info className="w-3.5 h-3.5 text-[#FF705D]" />
              Regulatory Status Disclaimer
            </div>
            <p className="text-[11px] leading-relaxed">
              AutoAudit-360 is a technical and governance auditing instrument. These checks calculate algorithmic readiness and disclosure completeness. This audit does <strong>not</strong> constitute formal legal certification, conformity assessment approval under EU AI Act Chapter 5, or immunity from statutory liability.
            </p>
          </div>
        </div>

        {/* Gap List & Remediation Plan */}
        {activeGaps && activeGaps.length > 0 && (
          <div className="observatory-card p-5 space-y-3 border-l-4 border-l-[#FF705D]">
            <h4 className="font-display font-bold text-base text-[#201823] dark:text-[#FAF2E8] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF705D]" />
              <span>Identified Regulatory Gaps &amp; Required Remediation</span>
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {activeGaps.slice(0, 4).map((gap: string, idx: number) => (
                <div key={idx} className="p-3 rounded bg-[#FAF2E8] dark:bg-[#332A37]/60 border border-[#DED3D8] dark:border-[#332A37]">
                  <div className="font-bold text-[#FF705D]">{gap}</div>
                  {activeRemediations && activeRemediations[idx] && (
                    <div className="mt-1 text-[#201823] dark:text-[#FAF2E8]">
                      → Action: {activeRemediations[idx]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#FAF2E8] dark:bg-[#332A37]/40 rounded-lg border border-[#DED3D8] dark:border-[#332A37] text-xs font-body text-[#201823]/80 dark:text-[#FAF2E8]/80">
              <strong>Audit recommendation:</strong> Complete formal documentation for unanswered operational policies and institute human oversight fallback mechanisms prior to production deployment.
            </div>
          </div>
        )}

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
              <strong>Article 14 Human Oversight:</strong> Document specific operating procedures for human intervention, including decision override protocols and appeal pipelines.
            </li>
            <li>
              <strong>DPDP Section 9 Child Consent:</strong> If users under 18 years can access this service, institute verifiable parental consent mechanisms before collecting personal identifiers.
            </li>
            <li>
              <strong>Post-Market Monitoring:</strong> Establish continuous telemetry logging to monitor concept drift and fairness degradation in real-world production streams.
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
          <span>Expert Details: Regulatory Weighting Formula &amp; Statutory References</span>
          {showExpertDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExpertDetails && (
          <div className="pt-3 border-t border-[#DED3D8] dark:border-[#332A37] space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#FF705D]">Statutory Scoring Methodology:</div>
              <div className="p-3 bg-[#FAF2E8] dark:bg-[#201823] rounded-lg border border-[#DED3D8] dark:border-[#332A37] space-y-1.5 text-[11px] leading-relaxed">
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
