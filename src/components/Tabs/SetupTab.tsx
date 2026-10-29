import React, { useState } from 'react';
import { Upload, FileSpreadsheet, ShieldAlert, Sparkles, CheckCircle, HelpCircle, Layers, Play, Database, Sliders, AlertTriangle } from 'lucide-react';

interface SetupTabProps {
  columns: string[];
  dtypes: Record<string, string>;
  targetCol: string;
  setTargetCol: (col: string) => void;
  positiveLabel: string;
  setPositiveLabel: (lbl: string) => void;
  sensitiveCols: string[];
  setSensitiveCols: (cols: string[]) => void;
  useCase: string;
  setUseCase: (uc: string) => void;
  questionnaire: Record<string, string>;
  setQuestionnaire: (q: Record<string, string>) => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadModel?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRunAudit: () => void;
  onRunDemo: (name: 'german_credit' | 'compas') => void;
  isAuditing: boolean;
  uploadedFileName?: string;
  uploadedModelName?: string;
  allowModelUpload?: boolean;
  predCol?: string;
  setPredCol?: (col: string) => void;
  predThreshold?: number;
  setPredThreshold?: (thresh: number) => void;
  isPredColMode?: boolean;
  setIsPredColMode?: (val: boolean) => void;
}

const USE_CASES = [
  { key: 'credit_scoring', name: 'Credit Scoring & Financial Eligibility', annex: 'Annex III, Point 5(b)', highRisk: true },
  { key: 'employment_recruitment', name: 'Employment, HR & Candidate Filtering', annex: 'Annex III, Point 4', highRisk: true },
  { key: 'law_enforcement_recidivism', name: 'Law Enforcement & Recidivism Assessment', annex: 'Annex III, Point 6', highRisk: true },
  { key: 'education_admissions', name: 'Education & Vocational Admissions', annex: 'Annex III, Point 3', highRisk: true },
  { key: 'insurance_health', name: 'Insurance Risk Assessment & Health Pricing', annex: 'Annex III, Point 5(a)', highRisk: true },
  { key: 'critical_infrastructure', name: 'Critical Infrastructure Safety Components', annex: 'Annex III, Point 2', highRisk: true },
  { key: 'customer_service_general', name: 'General Customer Analytics / Low-Risk', annex: 'Title I / Art. 50', highRisk: false },
];

const QUESTIONNAIRE_ITEMS = [
  { id: 'q1_risk_mgmt', text: 'Art. 9: Is a documented, iterative risk management system actively maintained?' },
  { id: 'q2_data_prep', text: 'Art. 10: Are training & test datasets examined for historical bias and labeling gaps?' },
  { id: 'q3_human_oversight', text: 'Art. 14: Does a human supervisor have operational tools to override model decisions?' },
  { id: 'q4_logging', text: 'Art. 12: Are model inference logs and audit trails recorded automatically?' },
  { id: 'q5_transparency', text: 'Art. 13: Are model limits, instructions, and performance disclaimers published?' },
  { id: 'q6_cybersecurity', text: 'Art. 15: Have cybersecurity, poison-resistance, and data access safeguards been tested?' },
  { id: 'q7_dpdp_notice', text: 'DPDP Sec 5: Is an itemized notice provided to Data Principals before data collection?' },
  { id: 'q8_dpdp_consent', text: 'DPDP Sec 6: Is consent free, informed, unconditional, and withdrawable anytime?' },
  { id: 'q9_dpdp_erasure', text: 'DPDP Sec 12: Can data principals request correction or erasure of personal records?' },
  { id: 'q10_dpdp_grievance', text: 'DPDP Sec 13: Is a designated Grievance Redressal Officer published and reachable?' },
  { id: 'q11_dpdp_breach', text: 'DPDP Sec 8(6): Is there a formal protocol to notify the Board & Principals within 72h of a breach?' },
  { id: 'q12_dpdp_dpo', text: 'DPDP Sec 10: Has a qualified Data Protection Officer resident in India been appointed?' },
  { id: 'q13_dpdp_dpia', text: 'DPDP Sec 10: Is a periodic Data Protection Impact Assessment (DPIA) conducted?' },
  { id: 'q14_dpdp_minors', text: 'DPDP Sec 9: Are parental consent safeguards enforced for minors (<18 yrs) with zero tracking?' },
  { id: 'q15_human_training', text: 'Art. 14: Have operating staff received training on cognitive bias and AI drift?' },
];

const PROXY_KEYWORDS = ['housing', 'personal_status', 'foreign', 'priors', 'charge', 'c_charge', 'zip', 'postcode', 'marital', 'relation', 'telephone'];

export const SetupTab: React.FC<SetupTabProps> = ({
  columns,
  dtypes,
  targetCol,
  setTargetCol,
  positiveLabel,
  setPositiveLabel,
  sensitiveCols,
  setSensitiveCols,
  useCase,
  setUseCase,
  questionnaire,
  setQuestionnaire,
  onUploadFile,
  onUploadModel,
  onRunAudit,
  onRunDemo,
  isAuditing,
  uploadedFileName,
  uploadedModelName,
  allowModelUpload = false,
  predCol = '',
  setPredCol,
  predThreshold = 0.5,
  setPredThreshold,
  isPredColMode = false,
  setIsPredColMode
}) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const toggleSensitiveCol = (col: string) => {
    if (sensitiveCols.includes(col)) {
      setSensitiveCols(sensitiveCols.filter(c => c !== col));
    } else {
      setSensitiveCols([...sensitiveCols, col]);
    }
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setQuestionnaire({ ...questionnaire, [qId]: val });
  };

  const answeredCount = Object.values(questionnaire).filter(v => v === 'yes' || v === 'partial' || v === 'no').length;
  const selectedCaseObj = USE_CASES.find(u => u.key === useCase) || USE_CASES[0];

  const isProxyRisk = (colName: string) => {
    const lower = colName.toLowerCase();
    return PROXY_KEYWORDS.some(kw => lower.includes(kw));
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Benchmarks & Ingestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-white text-base">
                1. Ingest Dataset &amp; Audit Target
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload tabular dataset CSV. Audit a model or evaluate direct predictions using Predictions Column Mode.
            </p>

            <div className="space-y-3">
              {/* CSV Input */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Dataset File (CSV):</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={onUploadFile}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer border border-slate-800 rounded-lg p-1 bg-slate-950"
                />
                {uploadedFileName && (
                  <span className="text-[11px] font-mono text-emerald-400 mt-1 block">
                    Active dataset: {uploadedFileName}
                  </span>
                )}
              </div>

              {/* Predictions Column Mode Toggle */}
              {setIsPredColMode && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg mt-3">
                  <label className="flex items-center gap-2 text-xs font-mono text-cyan-300 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={isPredColMode}
                      onChange={e => setIsPredColMode(e.target.checked)}
                      className="rounded text-cyan-500 focus:ring-0"
                    />
                    Predictions Column Mode (--pred_col)
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Audit existing dataset predictions (e.g. COMPAS decile_score &ge; 5) without needing a pickled model.
                  </p>

                  {isPredColMode && setPredCol && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Score Column:</label>
                        <select
                          value={predCol}
                          onChange={e => setPredCol(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono text-white"
                        >
                          <option value="">Select column...</option>
                          {columns.filter(c => c !== targetCol).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 mb-1">Threshold (Adverse):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={predThreshold}
                          onChange={e => setPredThreshold && setPredThreshold(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Model File Input (Disabled if ALLOW_MODEL_UPLOAD=false) */}
              {!isPredColMode && (
                <div>
                  {allowModelUpload ? (
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Optional Model File (.joblib / .pkl):
                      </label>
                      <input
                        type="file"
                        accept=".joblib,.pkl"
                        onChange={onUploadModel}
                        className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer border border-slate-800 rounded-lg p-1 bg-slate-950"
                      />
                      {uploadedModelName && (
                        <span className="text-[11px] font-mono text-cyan-400 mt-1 block">
                          Custom model: {uploadedModelName}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-400 flex items-start gap-2">
                      <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-300 font-bold">Model file upload disabled:</span> Server security policy enforces CLI model loading or Predictions Column Mode. Auto-training surrogate Random Forest baseline.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Benchmarks Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-white text-base">
                Instant Regulatory Benchmarks
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Pre-calibrated regulatory case studies from Trustworthy AI: German Credit Lending (Annex III 5b) &amp; COMPAS Recidivism (Annex III 6).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* German Credit */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-amber-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-white text-sm">German Credit</span>
                    <span className="text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded">
                      High-Risk 5(b)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    1,000 credit records. Evaluates Sex, Age, Foreign Worker. Pre-selected demographic features.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRunDemo('german_credit')}
                  disabled={isAuditing}
                  className="w-full py-2 px-3 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play size={14} /> Audit German Credit
                </button>
              </div>

              {/* COMPAS */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-white text-sm">COMPAS Recidivism</span>
                    <span className="text-[10px] font-mono bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-1.5 py-0.5 rounded">
                      High-Risk 6
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    1,200 criminal defendant profiles. Evaluates race, sex, age. Famous recidivism disparity audit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRunDemo('compas')}
                  disabled={isAuditing}
                  className="w-full py-2 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play size={14} /> Audit COMPAS Recidivism
                </button>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2.5">
            Pre-computed benchmarks loaded with zero mock data. Real held-out test split evaluation.
          </div>
        </div>

      </div>

      {/* Column Mapping & Regulatory Classification */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <h3 className="font-display font-bold text-white text-base mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          2. Column Mapping &amp; Regulatory Classification
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Select target classification label, define favorable outcome, and choose protected sensitive attributes. Features with proxy risk are automatically tagged.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Target Column */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
              Target Classification Column:
            </label>
            <select
              value={targetCol}
              onChange={e => setTargetCol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            >
              {columns.map(c => (
                <option key={c} value={c}>
                  {c} ({dtypes[c] || 'unknown'})
                </option>
              ))}
            </select>
          </div>

          {/* Positive Label */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
              Favorable / Positive Class Label:
            </label>
            <input
              type="text"
              value={positiveLabel}
              onChange={e => setPositiveLabel(e.target.value)}
              placeholder="e.g. 1 or Good"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Use Case */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
              Application Domain (EU AI Act):
            </label>
            <select
              value={useCase}
              onChange={e => setUseCase(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {USE_CASES.map(u => (
                <option key={u.key} value={u.key}>
                  {u.name} {u.highRisk ? '⚠️ [High-Risk Annex III]' : ''}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                selectedCaseObj.highRisk
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
              }`}>
                {selectedCaseObj.highRisk ? 'HIGH-RISK AI SYSTEM' : 'MINIMAL RISK AI'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedCaseObj.annex}
              </span>
            </div>
          </div>

        </div>

        {/* Sensitive Attributes Multi-Select */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <label className="block text-xs font-mono text-slate-300 mb-2 font-semibold">
            Protected Sensitive Attributes (Select 1 or more):
          </label>
          <div className="flex flex-wrap gap-2">
            {columns.filter(c => c !== targetCol).map(c => {
              const isSelected = sensitiveCols.includes(c);
              const isNumeric = dtypes[c] === 'numeric';
              const proxyFlag = isProxyRisk(c);

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleSensitiveCol(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400 shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{c}</span>
                  {proxyFlag && !isSelected && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-700/50">
                      PROXY RISK
                    </span>
                  )}
                  {isNumeric && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${isSelected ? 'bg-amber-600/40 text-amber-950' : 'bg-slate-800 text-slate-400'}`}>
                      binned
                    </span>
                  )}
                  {isSelected && <CheckCircle size={13} className="text-slate-950" />}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-mono">
            Selected attributes: {sensitiveCols.length > 0 ? sensitiveCols.join(', ') : 'None selected (select at least one)'}
          </span>
        </div>

      </div>

      {/* Governance Disclosures Questionnaire (15 Items) with Progress Ring */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              3. Regulatory Governance Disclosures (15 Questions)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Unanswered items strictly count as 0 credit. Answered: {answeredCount}/15.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono px-2.5 py-1 rounded border font-bold ${
              answeredCount === 15
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            }`}>
              {answeredCount}/15 Answered ({Math.round((answeredCount / 15) * 100)}%)
            </span>
            <button
              type="button"
              onClick={() => setShowQuestionnaire(!showQuestionnaire)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded bg-cyan-950/30"
            >
              {showQuestionnaire ? 'Hide Disclosures' : 'Edit Disclosures (15)'}
            </button>
          </div>
        </div>

        {showQuestionnaire && (
          <div className="mt-5 space-y-3 pt-4 border-t border-slate-800">
            {QUESTIONNAIRE_ITEMS.map((item, idx) => {
              const currentVal = questionnaire[item.id] || 'unanswered';
              return (
                <div key={item.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-xs text-slate-300 font-sans">
                    <strong>Q{idx + 1}.</strong> {item.text}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {['yes', 'partial', 'no', 'unanswered'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(item.id, opt)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                          currentVal === opt
                            ? opt === 'yes'
                              ? 'bg-emerald-500 text-slate-950'
                              : opt === 'partial'
                              ? 'bg-amber-500 text-slate-950'
                              : opt === 'no'
                              ? 'bg-rose-500 text-slate-950'
                              : 'bg-slate-700 text-white'
                            : 'bg-slate-800/80 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RUN AUDIT CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/30 p-6 rounded-xl">
        <div>
          <h4 className="font-display font-bold text-white text-lg">
            Ready to Run Forensic AI Audit
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Executes held-out test split fairness, 500 bootstrap replications, SHAP attribution, and adversarial stress testing.
          </p>
        </div>

        <button
          type="button"
          onClick={onRunAudit}
          disabled={isAuditing || sensitiveCols.length === 0}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play size={18} className="fill-current" />
          {isAuditing ? 'AUDIT IN PROGRESS...' : 'RUN FULL AUDIT BATTERY'}
        </button>
      </div>

    </div>
  );
};
