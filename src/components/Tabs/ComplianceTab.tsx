import React, { useState } from 'react';
import { ComplianceAudit } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, FileCheck, HelpCircle, Info, Shield, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface ComplianceTabProps {
  complianceData: ComplianceAudit;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ complianceData }) => {
  const [activeFramework, setActiveFramework] = useState<'eu' | 'dpdp'>('eu');

  if (!complianceData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No Compliance Readiness data available.
      </div>
    );
  }

  const { use_case, is_high_risk, pii_and_sensitive_signals, eu_ai_act, dpdp_act_2023 } = complianceData;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Use Case & Statutory High-Risk Classification */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                is_high_risk
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
              }`}>
                {is_high_risk ? 'HIGH-RISK AI SYSTEM' : 'MINIMAL RISK AI SYSTEM'}
              </span>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                EU AI Act {use_case.annex_ref}
              </span>
            </div>
            <h3 className="font-display font-bold text-white text-lg">
              Application Domain: {use_case.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {use_case.description} High-risk classification activates mandatory technical conformity under Articles 9 through 15 before deployment.
            </p>
          </div>

          {/* Quick Score Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center min-w-[110px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase">EU AI Act Score</div>
              <div className="font-mono text-xl font-bold text-amber-400 mt-0.5">
                {eu_ai_act.score} / 100
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center min-w-[110px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase">DPDP 2023 Score</div>
              <div className="font-mono text-xl font-bold text-cyan-400 mt-0.5">
                {dpdp_act_2023.score} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Dataset Signals & PII / Minors Detection under DPDP Act */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">PII Columns Detected:</span>
            <span className="text-xs font-mono font-bold text-white">
              {pii_and_sensitive_signals.detected_pii_columns.length > 0
                ? `${pii_and_sensitive_signals.detected_pii_columns.length} column(s)`
                : 'Zero Detected'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Aadhaar Regex Check:</span>
            <span className={`text-xs font-mono font-bold ${pii_and_sensitive_signals.has_aadhaar_pattern ? 'text-rose-400' : 'text-emerald-400'}`}>
              {pii_and_sensitive_signals.has_aadhaar_pattern ? '⚠️ Pattern Match Found' : '✓ No Aadhaar PII'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Minors (&lt;18 Yrs) Detection:</span>
            <span className={`text-xs font-mono font-bold ${pii_and_sensitive_signals.has_minors ? 'text-amber-400' : 'text-emerald-400'}`}>
              {pii_and_sensitive_signals.has_minors
                ? `⚠️ ${pii_and_sensitive_signals.minors_count} Minor(s) Found`
                : '✓ No Minors Found'}
            </span>
          </div>
        </div>
      </div>

      {/* Framework Switcher Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          type="button"
          onClick={() => setActiveFramework('eu')}
          className={`pb-3 font-display text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeFramework === 'eu'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Shield size={16} />
          EU AI Act Readiness Checklist (Articles 9–15)
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300">
            {eu_ai_act.score}/100
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFramework('dpdp')}
          className={`pb-3 font-display text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeFramework === 'dpdp'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck size={16} />
          India DPDP Act 2023 Principles (Sections 4–13)
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300">
            {dpdp_act_2023.score}/100
          </span>
        </button>
      </div>

      {/* Active Framework Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-display font-bold text-white text-base">
              {activeFramework === 'eu' ? 'EU AI Act Statutory Articles' : 'India DPDP Act 2023 Principles'}
            </h4>
            <p className="text-xs text-slate-400">
              Items marked <span className="text-cyan-400 font-semibold">[Auto-Verified]</span> are dynamically verified from empirical audit results (weight = 2.0). Items marked <span className="text-slate-300 font-semibold">[Self-Declared]</span> stem from governance disclosures (weight = 1.0).
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            Earned: <strong className="text-white">
              {activeFramework === 'eu' ? eu_ai_act.earned_points : dpdp_act_2023.earned_points}
            </strong> / {activeFramework === 'eu' ? eu_ai_act.max_points : dpdp_act_2023.max_points} pts
          </div>
        </div>

        <div className="space-y-3">
          {(activeFramework === 'eu' ? eu_ai_act.checklist : dpdp_act_2023.checklist).map((item, idx) => {
            const isAuto = item.type === 'auto_verified';
            const statusClass =
              item.status === 'yes'
                ? 'border-emerald-500/30 bg-emerald-950/20'
                : item.status === 'partial'
                ? 'border-amber-500/30 bg-amber-950/20'
                : item.status === 'no'
                ? 'border-rose-500/30 bg-rose-950/20'
                : 'border-slate-700/50 bg-slate-950/60';

            return (
              <div key={idx} className={`p-4 rounded-lg border ${statusClass} transition-all`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-white border border-slate-700">
                      {item.article || item.section}
                    </span>
                    <h5 className="font-display font-bold text-white text-sm">
                      {item.title || item.principle}
                    </h5>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded uppercase ${
                      isAuto
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {isAuto ? 'Auto-Verified (2x)' : 'Self-Declared (1x)'}
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded ${
                    item.status === 'yes'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : item.status === 'partial'
                      ? 'bg-amber-500/20 text-amber-300'
                      : item.status === 'no'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.status === 'unanswered' ? 'UNANSWERED (0 pts)' : item.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1.5 font-sans">
                  <strong>Statutory Mandate:</strong> {item.requirement}
                </p>

                <div className="mt-2 text-xs font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                  <strong className="text-cyan-400">Audit Evidence / Findings:</strong> {item.evidence}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Identified Compliance Gaps & Recommended Remediation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gap List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h4 className="font-display font-bold text-white text-base">
              Identified Compliance Deficiencies
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(activeFramework === 'eu' ? eu_ai_act.gaps : dpdp_act_2023.gaps).map((gap, i) => (
              <li key={i} className="p-2 rounded bg-amber-950/20 border border-amber-500/20 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{gap}</span>
              </li>
            ))}
            {(activeFramework === 'eu' ? eu_ai_act.gaps : dpdp_act_2023.gaps).length === 0 && (
              <li className="text-emerald-400 font-mono">No critical compliance gaps detected.</li>
            )}
          </ul>
        </div>

        {/* Recommended Remediation Roadmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h4 className="font-display font-bold text-white text-base">
              Recommended Remediation Roadmap
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(activeFramework === 'eu' ? eu_ai_act.remediations : dpdp_act_2023.remediations).map((rem, i) => (
              <li key={i} className="p-2 rounded bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">{i + 1}.</span>
                <span>{rem}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Statutory Disclaimer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
        <h5 className="font-mono uppercase font-bold text-slate-300 mb-1 flex items-center gap-1.5">
          <Info size={14} className="text-amber-400" /> Legal & Regulatory Boundary:
        </h5>
        <p>
          Compliance scores and checklist evaluations produced by AutoAudit-360 serve exclusively as diagnostic readiness assessments. They do not constitute formal legal certification, conformity assessment certificates under EU AI Act Chapter 5, or indemnity against enforcement by the Data Protection Board of India.
        </p>
      </div>

    </div>
  );
};
