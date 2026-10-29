import React, { useState } from 'react';
import { Play, UploadCloud, CheckCircle2, Sliders, ShieldCheck, FileSpreadsheet, AlertCircle, Scale, Search, ShieldAlert, FileText } from 'lucide-react';
import { Tooltip } from '../Common/Tooltip';

interface StartCheckpointProps {
  onRunAudit: (params: {
    datasetId?: string;
    targetCol: string;
    sensitiveCols: string[];
    useCase: string;
    positiveLabel: any;
    predCol?: string;
    predThreshold?: number;
    questionnaire: Record<string, string>;
  }) => void;
  onLoadDemo: (demoName: 'german_credit' | 'compas') => void;
  isAuditing: boolean;
  allowModelUpload: boolean;
}

export const StartCheckpoint: React.FC<StartCheckpointProps> = ({
  onRunAudit,
  onLoadDemo,
  isAuditing,
  allowModelUpload,
}) => {
  const [selectedDemo, setSelectedDemo] = useState<'german_credit' | 'compas'>('german_credit');
  const [targetCol, setTargetCol] = useState('Creditability');
  const [sensitiveCols, setSensitiveCols] = useState<string[]>(['Sex', 'Age', 'Foreign_Worker']);
  const [useCase, setUseCase] = useState('credit_scoring');
  const [positiveLabel, setPositiveLabel] = useState<number | string>(1);
  const [usePredColMode, setUsePredColMode] = useState(false);
  const [predCol, setPredCol] = useState('decile_score');
  const [predThreshold, setPredThreshold] = useState<number>(5);

  // 15 Governance Questionnaire questions
  const [questionnaire, setQuestionnaire] = useState<Record<string, string>>({
    q1_risk_mgmt: 'unanswered',
    q2_data_prep: 'unanswered',
    q3_human_oversight: 'unanswered',
    q4_logging: 'unanswered',
    q5_transparency: 'unanswered',
    q6_accuracy_eval: 'unanswered',
    q7_cybersecurity: 'unanswered',
    q8_dpdp_consent: 'unanswered',
    q9_dpdp_purpose: 'unanswered',
    q10_dpdp_grievance: 'unanswered',
    q11_dpdp_breach: 'unanswered',
    q12_dpdp_dpo: 'unanswered',
    q13_dpdp_erasure: 'unanswered',
    q14_dpdp_minors: 'unanswered',
    q15_post_market: 'unanswered',
  });

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Switch demo preset
  const handleSelectDemo = (demo: 'german_credit' | 'compas') => {
    setSelectedDemo(demo);
    if (demo === 'german_credit') {
      setTargetCol('Creditability');
      setSensitiveCols(['Sex', 'Age', 'Foreign_Worker']);
      setUseCase('credit_scoring');
      setPositiveLabel(1);
      setUsePredColMode(false);
    } else {
      setTargetCol('Low_Risk_Outcome');
      setSensitiveCols(['race', 'sex', 'age']);
      setUseCase('law_enforcement_recidivism');
      setPositiveLabel(1);
      setUsePredColMode(false);
      setPredCol('decile_score');
      setPredThreshold(5);
    }
  };

  const handleStartInspection = () => {
    onRunAudit({
      datasetId: `demo_${selectedDemo}`,
      targetCol,
      sensitiveCols,
      useCase,
      positiveLabel,
      predCol: usePredColMode ? predCol : undefined,
      predThreshold: usePredColMode ? predThreshold : undefined,
      questionnaire,
    });
  };

  const answeredCount = Object.values(questionnaire).filter(v => v !== 'unanswered').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      
      {/* Hero Section */}
      <div className="text-center space-y-3 py-4">
        <span className="inline-block px-3 py-1 bg-[#FF6B2C]/10 text-[#FF6B2C] border border-[#FF6B2C]/30 rounded-full font-mono text-xs font-bold uppercase tracking-wider">
          Diagnostic Fitness Station
        </span>
        <h2 className="font-display font-black text-3xl sm:text-5xl text-[#1B1B1F] dark:text-[#F6F1E7] tracking-tight">
          A health check-up for AI decisions.
        </h2>
        <p className="font-body text-base sm:text-lg text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70 max-w-2xl mx-auto">
          AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite
        </p>
      </div>

      {/* 4-Icon Strip: Four Checkpoints at a glance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ticket-card p-4 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#FF6B2C]/15 text-[#FF6B2C] flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div className="font-display font-bold text-sm">1. Fairness</div>
          <p className="text-xs text-[#1B1B1F]/65 dark:text-[#F6F1E7]/65 leading-tight">
            Checks if demographic groups receive equal approval rates.
          </p>
        </div>

        <div className="ticket-card p-4 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#FF6B2C]/15 text-[#FF6B2C] flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div className="font-display font-bold text-sm">2. Explain</div>
          <p className="text-xs text-[#1B1B1F]/65 dark:text-[#F6F1E7]/65 leading-tight">
            Reveals which features drive decisions and catches hidden proxies.
          </p>
        </div>

        <div className="ticket-card p-4 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#FF6B2C]/15 text-[#FF6B2C] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="font-display font-bold text-sm">3. Stress Test</div>
          <p className="text-xs text-[#1B1B1F]/65 dark:text-[#F6F1E7]/65 leading-tight">
            Attacks model with label noise, perturbations, and identity flips.
          </p>
        </div>

        <div className="ticket-card p-4 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#FF6B2C]/15 text-[#FF6B2C] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div className="font-display font-bold text-sm">4. Law Check</div>
          <p className="text-xs text-[#1B1B1F]/65 dark:text-[#F6F1E7]/65 leading-tight">
            Evaluates readiness against EU AI Act & India DPDP Act 2023.
          </p>
        </div>
      </div>

      {/* Two Large Demo Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-[#1B1B1F] dark:text-[#F6F1E7]">
            Select an AI System to Inspect
          </h3>
          <span className="font-mono text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
            Step 1 of 5
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Demo 1: German Credit Lending */}
          <div
            onClick={() => handleSelectDemo('german_credit')}
            className={`ticket-card p-5 cursor-pointer transition-all border-2 relative ${
              selectedDemo === 'german_credit'
                ? 'border-[#FF6B2C] ring-2 ring-[#FF6B2C]/20 shadow-md'
                : 'border-transparent hover:border-[#1B1B1F]/20'
            }`}
          >
            {selectedDemo === 'german_credit' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center text-xs">
                ✓
              </span>
            )}
            <div className="font-display font-extrabold text-xl text-[#1B1B1F] dark:text-[#F6F1E7] mb-1">
              Loan Approvals (German Credit)
            </div>
            <p className="text-sm text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70 mb-3">
              1,000 retail credit applications assessed by a banking risk surrogate model.
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 rounded">Target: Creditability</span>
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 rounded">Sensitive: Sex, Age, Foreign_Worker</span>
              <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 rounded">Annex III: Credit Scoring</span>
            </div>
          </div>

          {/* Demo 2: COMPAS Recidivism */}
          <div
            onClick={() => handleSelectDemo('compas')}
            className={`ticket-card p-5 cursor-pointer transition-all border-2 relative ${
              selectedDemo === 'compas'
                ? 'border-[#FF6B2C] ring-2 ring-[#FF6B2C]/20 shadow-md'
                : 'border-transparent hover:border-[#1B1B1F]/20'
            }`}
          >
            {selectedDemo === 'compas' && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center text-xs">
                ✓
              </span>
            )}
            <div className="font-display font-extrabold text-xl text-[#1B1B1F] dark:text-[#F6F1E7] mb-1">
              Criminal Re-Offence Risk (COMPAS)
            </div>
            <p className="text-sm text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70 mb-3">
              6,172 criminal justice records evaluated for recidivism risk across racial groups.
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 rounded">Target: Low_Risk_Outcome</span>
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 rounded">Sensitive: race, sex, age</span>
              <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 rounded">Annex III: Law Enforcement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options: Predictions Column Mode & Governance Questionnaire */}
      <div className="ticket-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF6B2C]" />
            <span className="font-display font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]">
              Inspection Configuration & Disclosures
            </span>
          </div>
          <span className="font-mono text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
            {answeredCount}/15 Questions Answered (Unanswered = 0 credit)
          </span>
        </div>

        {/* Predictions Column Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#F6F1E7]/60 dark:bg-[#16161A]/60 rounded border border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10">
          <div>
            <div className="font-bold text-sm text-[#1B1B1F] dark:text-[#F6F1E7]">
              Predictions Column Mode
            </div>
            <p className="text-xs text-[#1B1B1F]/65 dark:text-[#F6F1E7]/65">
              Audit precomputed model outputs directly from dataset column without requiring a model binary.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={usePredColMode}
              onChange={(e) => setUsePredColMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B2C]"></div>
          </label>
        </div>

        {usePredColMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-stone-900 rounded border border-[#FF6B2C]/30">
            <div>
              <label className="block text-xs font-mono font-bold mb-1">Predictions Column Name</label>
              <input
                type="text"
                value={predCol}
                onChange={(e) => setPredCol(e.target.value)}
                className="w-full text-xs font-mono p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold mb-1">Score Threshold (e.g. &gt;= 5)</label>
              <input
                type="number"
                value={predThreshold}
                onChange={(e) => setPredThreshold(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800"
              />
            </div>
          </div>
        )}

        {/* Collapsible Governance Questionnaire */}
        <div>
          <button
            onClick={() => setShowQuestionnaire(!showQuestionnaire)}
            className="text-xs font-mono text-[#FF6B2C] hover:underline flex items-center gap-1"
          >
            {showQuestionnaire ? '▼ Hide' : '▶ Expand'} 15-Question Operational Governance Disclosure Checklist ({answeredCount}/15 completed)
          </button>

          {showQuestionnaire && (
            <div className="mt-3 space-y-3 pt-3 border-t border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 max-h-72 overflow-y-auto pr-2">
              {[
                { key: 'q1_risk_mgmt', label: '1. Art. 9: Continuous risk management system implemented?' },
                { key: 'q2_data_prep', label: '2. Art. 10: Training & testing data sets validated for bias?' },
                { key: 'q3_human_oversight', label: '3. Art. 14: Human-in-the-loop kill switch available?' },
                { key: 'q4_logging', label: '4. Art. 12: Automated immutable audit event logging enabled?' },
                { key: 'q5_transparency', label: '5. Art. 13: Interpretable instructions for use provided?' },
                { key: 'q6_accuracy_eval', label: '6. Art. 15: Accuracy and robustness benchmarks established?' },
                { key: 'q7_cybersecurity', label: '7. Art. 15: Adversarial cybersecurity safeguards deployed?' },
                { key: 'q8_dpdp_consent', label: '8. DPDP Sec 6: Explicit consent collected for personal data?' },
                { key: 'q9_dpdp_purpose', label: '9. DPDP Sec 7: Purpose limitation strictly enforced?' },
                { key: 'q10_dpdp_grievance', label: '10. DPDP Sec 11-13: Data principal grievance mechanism established?' },
                { key: 'q11_dpdp_breach', label: '11. DPDP Sec 8(6): Breach notification protocol configured?' },
                { key: 'q12_dpdp_dpo', label: '12. DPDP Sec 10: India-resident DPO & DPIA appointed?' },
                { key: 'q13_dpdp_erasure', label: '13. DPDP Sec 12: Right to erasure/correction functional?' },
                { key: 'q14_dpdp_minors', label: '14. DPDP Sec 9: Verifiable parental consent for minors?' },
                { key: 'q15_post_market', label: '15. Post-market monitoring & drift alerts active?' },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-[#F6F1E7]/40 dark:bg-[#16161A]/40 text-xs">
                  <span className="font-body text-[#1B1B1F] dark:text-[#F6F1E7]">{label}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {['yes', 'partial', 'no', 'unanswered'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setQuestionnaire(prev => ({ ...prev, [key]: val }))}
                        className={`px-2 py-0.5 rounded uppercase font-mono text-[10px] transition-colors border ${
                          questionnaire[key] === val
                            ? val === 'yes' ? 'bg-[#1F9D6B] text-white border-[#1F9D6B]'
                            : val === 'partial' ? 'bg-[#F2B01E] text-white border-[#F2B01E]'
                            : val === 'no' ? 'bg-[#D6334A] text-white border-[#D6334A]'
                            : 'bg-stone-500 text-white border-stone-500'
                            : 'bg-white dark:bg-stone-800 text-[#1B1B1F] dark:text-[#F6F1E7] border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar: Run Inspection */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 ticket-card bg-[#FF6B2C]/5 border-[#FF6B2C]/30">
        <div>
          <div className="font-display font-bold text-base text-[#1B1B1F] dark:text-[#F6F1E7]">
            Ready to dispatch AI Model through Checkpoints?
          </div>
          <p className="text-xs text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70">
            Real background computation: Fairness, Global SHAP, Stress Tests & Regulatory Checklist.
          </p>
        </div>

        <button
          onClick={handleStartInspection}
          disabled={isAuditing}
          className="w-full sm:w-auto px-6 py-3 bg-[#FF6B2C] hover:bg-[#E55A1F] text-white font-display font-extrabold text-base rounded shadow-md transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAuditing ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Inspection in Progress...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Run Inspection</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
