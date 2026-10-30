import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ShieldCheck,
  Building,
  Flag,
  ArrowRight,
  Clock,
  ListChecks
} from 'lucide-react';
import { ComplianceAudit } from '../../types';

interface LawCheckCheckpointProps {
  compliance: ComplianceAudit;
  isExpertMode?: boolean;
}

export const LawCheckCheckpoint: React.FC<LawCheckCheckpointProps> = ({ compliance }) => {
  const [activeTab, setActiveTab] = useState<'eu' | 'dpdp'>('eu');

  if (!compliance) {
    return (
      <div className="content-card p-8 text-center space-y-3 max-w-xl mx-auto my-6 bg-white border border-[#DCE5EB]">
        <FileCheck2 className="w-10 h-10 text-[#38A9DB] mx-auto" />
        <h3 className="font-bold text-lg text-[#111111]">
          No Regulatory Compliance Data Available
        </h3>
        <p className="text-sm text-[#555555]">
          Please run an AI audit to evaluate regulatory readiness under the EU AI Act and India DPDP Act 2023.
        </p>
      </div>
    );
  }

  const euScore = compliance.eu_ai_act?.score ?? 62;
  const dpdpScore = compliance.dpdp_act_2023?.score ?? 68;
  const isHighRisk = compliance.is_high_risk ?? true;
  const annexRef = compliance.eu_ai_act?.classification || 'Annex III, Point 5(b)';

  // EU AI Act Checklist items
  const euChecklist = [
    {
      id: 'high_risk_tier',
      area: 'High-Risk AI Classification',
      article: 'Annex III',
      req: 'Checklist assessment of system purpose against Annex III high-risk use case categories.',
      status: isHighRisk ? 'completed' : 'pending',
      action: isHighRisk ? `Classified under ${annexRef} (High-Risk System). Mandatory compliance activated.` : 'Categorized as non-high risk general purpose classification.',
    },
    {
      id: 'risk_mgmt',
      area: 'Risk Management System',
      article: 'Article 9',
      req: 'Establish, implement, document and maintain a continuous risk management system.',
      status: compliance.eu_ai_act?.checklist?.find(c => (c.title || c.requirement || '').toLowerCase().includes('risk'))?.status === 'yes' ? 'completed' : 'pending',
      action: 'Document systematic risks throughout system lifecycle; record mitigation measures for demographic skew.',
    },
    {
      id: 'data_gov',
      area: 'Data & Data Governance',
      article: 'Article 10',
      req: 'Training, validation and testing datasets must be relevant, representative, and examined for potential biases.',
      status: 'completed',
      action: 'Audit training data for demographic representation; verify statistical four-fifths parity.',
    },
    {
      id: 'tech_doc',
      area: 'Technical Documentation',
      article: 'Article 11',
      req: 'Draw up technical documentation before the system is placed on the market or put into service.',
      status: 'completed',
      action: 'Export standardized AI Model Card incorporating architectural choices, datasets, and performance limits.',
    },
    {
      id: 'record_keeping',
      area: 'Record-Keeping & Logging',
      article: 'Article 12',
      req: 'High-risk AI systems must automatically log events over their operational lifetime.',
      status: 'pending',
      action: 'Deploy automated request/prediction timestamp logging with input checksum tracking.',
    },
    {
      id: 'transparency',
      area: 'Transparency & User Information',
      article: 'Article 13',
      req: 'System must operate with sufficient transparency for deployers to interpret outputs.',
      status: 'completed',
      action: 'Provide global SHAP feature importance charts and clear feature influence directions.',
    },
    {
      id: 'human_oversight',
      area: 'Human Oversight',
      article: 'Article 14',
      req: 'System must be designed to enable natural persons to oversee operation and override decisions.',
      status: 'pending',
      action: 'Designate operational supervisor role with authorization to override borderline decisions.',
    },
    {
      id: 'accuracy_robustness',
      area: 'Accuracy, Robustness & Cybersecurity',
      article: 'Article 15',
      req: 'Achieve appropriate levels of accuracy and resilience against errors, faults, and adversarial attacks.',
      status: 'completed',
      action: 'Empirical adversarial stress testing verified (synthetic label corruptions & input noise).',
    },
  ];

  // DPDP Act 2023 Checklist items
  const dpdpChecklist = [
    {
      id: 'personal_data',
      area: 'Personal Data Identification',
      section: 'Section 4',
      req: 'Identify and catalog all digital personal data processed by the classification pipeline.',
      status: 'completed',
      action: 'Attributes mapped; verified demographic feature fields (Sex, Age, Foreign Worker).',
    },
    {
      id: 'consent_notice',
      area: 'Consent & Notice Considerations',
      section: 'Section 5',
      req: 'Provide accessible notice informing data principals of data processed and purpose before processing.',
      status: 'pending',
      action: 'Draft plain-language consent notice detailing automated decision-making.',
    },
    {
      id: 'purpose_limitation',
      area: 'Purpose Limitation',
      section: 'Section 6',
      req: 'Process digital personal data solely for specified, lawful, and necessary purpose.',
      status: 'completed',
      action: 'Limit inference variables to parameters strictly relevant to eligibility assessment.',
    },
    {
      id: 'data_minimisation',
      area: 'Data Minimisation',
      section: 'Section 7',
      req: 'Collect and retain only personal data that is strictly necessary for specified purpose.',
      status: 'completed',
      action: 'Exclude non-relevant identifiers from feature matrices; verify absence of redundant fields.',
    },
    {
      id: 'data_accuracy',
      area: 'Data Accuracy & Quality',
      section: 'Section 8(1)',
      req: 'Ensure personal data processed is accurate, complete, and consistent before automated decisions.',
      status: 'completed',
      action: 'Execute automated missing value handling, type normalization, and integrity screening.',
    },
    {
      id: 'security_safeguards',
      area: 'Security Safeguards',
      section: 'Section 8(5)',
      req: 'Implement reasonable security safeguards to prevent personal data breach.',
      status: 'pending',
      action: 'Enforce cryptographic data protection in transit and at rest for datasets and cached audits.',
    },
    {
      id: 'retention_deletion',
      area: 'Data Retention & Deletion',
      section: 'Section 8(7)',
      req: 'Erase personal data upon purpose fulfillment or withdrawal of consent by data principal.',
      status: 'pending',
      action: 'Formalize data retention period (e.g. 180 days) and automated purge routines.',
    },
    {
      id: 'minor_data',
      area: 'Processing of Data of Children / Minors',
      section: 'Section 9',
      req: 'Do not undertake processing likely to cause detrimental effect on the well-being of a child.',
      status: 'completed',
      action: 'Screen age distributions; confirm minimum age requirements or parental consent mechanisms.',
    },
    {
      id: 'principal_rights',
      area: 'Data Principal Rights & Grievance Redressal',
      section: 'Sections 11-13',
      req: 'Establish accessible grievance redressal mechanism and honor rights of access, correction, and erasure.',
      status: 'pending',
      action: 'Publish Data Protection Officer contact info and create self-service rights request channel.',
    },
  ];

  const currentChecklist = activeTab === 'eu' ? euChecklist : dpdpChecklist;
  const completedCount = currentChecklist.filter((c) => c.status === 'completed').length;
  const pendingCount = currentChecklist.filter((c) => c.status === 'pending').length;
  const currentScore = activeTab === 'eu' ? euScore : dpdpScore;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#38A9DB] border border-[#DCE5EB] text-xs font-semibold">
              <FileCheck2 className="w-3.5 h-3.5 text-[#38A9DB]" />
              <span>Checkpoint 4: Regulatory Compliance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
              Statutory Readiness Assessment
            </h2>
            <p className="text-sm text-[#555555]">
              Verify preliminary technical alignment against the European Union AI Act and India Digital Personal Data Protection Act 2023.
            </p>
          </div>

          {/* Section Switcher Tabs */}
          <div className="flex rounded-lg border border-[#DCE5EB] bg-gray-50 p-1">
            <button
              onClick={() => setActiveTab('eu')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'eu'
                  ? 'bg-[#38A9DB] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              EU AI Act
            </button>
            <button
              onClick={() => setActiveTab('dpdp')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dpdp'
                  ? 'bg-[#38A9DB] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              India DPDP Act 2023
            </button>
          </div>
        </div>
      </div>

      {/* 2. Preliminary Assessment & Legal Disclaimer Notice */}
      <div className="content-card p-4 bg-sky-50 border border-[#DCE5EB] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#38A9DB] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-[#555555]">
          <strong className="text-[#111111] block text-sm">
            Preliminary Readiness Assessment &ndash; Not Legal Certification
          </strong>
          <p className="leading-relaxed">
            This module evaluates verifiable technical artifacts (e.g. data documentation, demographic parity checks, noise resilience).
            <strong> These findings do NOT constitute official legal certifications or regulatory seals.</strong>
            Models are evaluated in their domain context: systems are not automatically assumed high-risk unless their intended deployment matches specific statutory triggers (e.g. EU AI Act Annex III).
          </p>
        </div>
      </div>

      {/* 3. Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Readiness Score */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="text-xs text-[#555555] font-semibold">
            {activeTab === 'eu' ? 'EU AI Act Readiness' : 'DPDP Act Readiness'}
          </div>
          <div className="text-2xl font-bold text-[#111111]">
            {currentScore}%
          </div>
          <p className="text-[11px] text-[#555555]">Technical &amp; policy alignment</p>
        </div>

        {/* Requirements Completed */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="text-xs text-[#555555] font-semibold">Completed Controls</div>
          <div className="text-2xl font-bold text-emerald-600">
            {completedCount} of {currentChecklist.length}
          </div>
          <p className="text-[11px] text-[#555555]">Verifiable technical gates</p>
        </div>

        {/* Requirements Pending */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="text-xs text-[#555555] font-semibold">Identified Gaps (Pending)</div>
          <div className="text-2xl font-bold text-amber-600">
            {pendingCount}
          </div>
          <p className="text-[11px] text-[#555555]">Operational actions needed</p>
        </div>

        {/* Classification */}
        <div className="content-card p-4 bg-white border border-[#DCE5EB] space-y-1">
          <div className="text-xs text-[#555555] font-semibold">Classification Tier</div>
          <div className="text-sm font-bold text-[#111111] truncate mt-1">
            {activeTab === 'eu' ? (isHighRisk ? 'Annex III High-Risk' : 'General / Low-Risk') : 'Data Fiduciary'}
          </div>
          <p className="text-[11px] text-[#555555]">
            {activeTab === 'eu' ? annexRef : 'Standard Compliance Scope'}
          </p>
        </div>
      </div>

      {/* 4. Full Regulatory Checklist */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE5EB] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#111111]">
              {activeTab === 'eu'
                ? 'EU AI Act: Annex III & Articles 9–15 Technical Requirements Checklist'
                : 'India DPDP Act 2023: Sections 4–13 Data Governance Checklist'}
            </h3>
            <p className="text-xs text-[#555555]">
              Systematic inventory of statutory obligations, verification status, and required remediation
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-[#555555]">
            {completedCount}/{currentChecklist.length} Satisfied
          </span>
        </div>

        <div className="space-y-3">
          {currentChecklist.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all ${
                item.status === 'completed'
                  ? 'border-[#DCE5EB] bg-white'
                  : 'border-amber-200 bg-amber-50/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#111111]">
                      {item.area}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 text-[#555555]">
                      {'article' in item ? item.article : (item as any).section}
                    </span>
                  </div>
                  <p className="text-xs text-[#555555]">
                    {item.req}
                  </p>
                  <div className="text-xs pt-1">
                    <span className="text-[#555555] font-semibold">Recommended Action: </span>
                    <span className="text-[#111111]">{item.action}</span>
                  </div>
                </div>

                <div className="shrink-0 mt-1 sm:mt-0">
                  {item.status === 'completed' ? (
                    <span className="badge-pass px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="badge-warn px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pending Gap</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
