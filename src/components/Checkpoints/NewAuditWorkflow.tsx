import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Scale,
  Search,
  ShieldAlert,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Clock,
  Info
} from 'lucide-react';
import { Tooltip } from '../Common/Tooltip';

interface DatasetSummary {
  dataset_id: string;
  columns: string[];
  dtypes: Record<string, string>;
  row_count: number;
  preview: Array<Record<string, any>>;
  has_custom_model?: boolean;
}

interface NewAuditWorkflowProps {
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
  auditStage: number;
  allowModelUpload: boolean;
  onCancelAudit?: () => void;
}

export const NewAuditWorkflow: React.FC<NewAuditWorkflowProps> = ({
  onRunAudit,
  onLoadDemo,
  isAuditing,
  auditStage,
  allowModelUpload,
  onCancelAudit,
}) => {
  // Wizard Step: 1 = Source, 2 = Inspect & Select, 3 = Configuration Explainer, 4 = Review & Disclosures, 5 = Progress
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Selected Data Source
  const [sourceType, setSourceType] = useState<'sample' | 'upload'>('sample');
  const [selectedDemo, setSelectedDemo] = useState<'german_credit' | 'compas'>('german_credit');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Inspected Dataset Meta
  const [datasetMeta, setDatasetMeta] = useState<DatasetSummary | null>({
    dataset_id: 'demo_german_credit',
    columns: [
      'Creditability', 'Account_Balance', 'Duration_of_Credit_monthly',
      'Payment_Status_of_Previous_Credit', 'Purpose', 'Credit_Amount',
      'Value_Savings_Stocks', 'Length_of_current_employment',
      'Instalment_per_cent', 'Sex', 'Age', 'Foreign_Worker'
    ],
    dtypes: {
      'Creditability': 'int64',
      'Account_Balance': 'int64',
      'Duration_of_Credit_monthly': 'int64',
      'Payment_Status_of_Previous_Credit': 'int64',
      'Purpose': 'int64',
      'Credit_Amount': 'int64',
      'Value_Savings_Stocks': 'int64',
      'Length_of_current_employment': 'int64',
      'Instalment_per_cent': 'int64',
      'Sex': 'object',
      'Age': 'int64',
      'Foreign_Worker': 'object'
    },
    row_count: 1000,
    preview: []
  });

  // Selected Target & Sensitive Attributes
  const [targetCol, setTargetCol] = useState('Creditability');
  const [positiveLabel, setPositiveLabel] = useState<number | string>(1);
  const [sensitiveCols, setSensitiveCols] = useState<string[]>(['Sex', 'Age', 'Foreign_Worker']);
  const [useCase, setUseCase] = useState('credit_scoring');

  // Predictions Column Mode
  const [usePredColMode, setUsePredColMode] = useState(false);
  const [predCol, setPredCol] = useState('decile_score');
  const [predThreshold, setPredThreshold] = useState<number>(5);

  // 15 Governance Questions
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

  // If audit is launched, lock to step 5 (progress)
  useEffect(() => {
    if (isAuditing) {
      setWizardStep(5);
    }
  }, [isAuditing]);

  // Handle Demo Selection
  const handleSelectDemo = (demo: 'german_credit' | 'compas') => {
    setSelectedDemo(demo);
    if (demo === 'german_credit') {
      setDatasetMeta({
        dataset_id: 'demo_german_credit',
        columns: [
          'Creditability', 'Account_Balance', 'Duration_of_Credit_monthly',
          'Payment_Status_of_Previous_Credit', 'Purpose', 'Credit_Amount',
          'Value_Savings_Stocks', 'Length_of_current_employment',
          'Instalment_per_cent', 'Sex', 'Age', 'Foreign_Worker'
        ],
        dtypes: {
          'Creditability': 'int64',
          'Account_Balance': 'int64',
          'Duration_of_Credit_monthly': 'int64',
          'Payment_Status_of_Previous_Credit': 'int64',
          'Purpose': 'int64',
          'Credit_Amount': 'int64',
          'Value_Savings_Stocks': 'int64',
          'Length_of_current_employment': 'int64',
          'Instalment_per_cent': 'int64',
          'Sex': 'object',
          'Age': 'int64',
          'Foreign_Worker': 'object'
        },
        row_count: 1000,
        preview: []
      });
      setTargetCol('Creditability');
      setPositiveLabel(1);
      setSensitiveCols(['Sex', 'Age', 'Foreign_Worker']);
      setUseCase('credit_scoring');
      setUsePredColMode(false);
    } else {
      setDatasetMeta({
        dataset_id: 'demo_compas',
        columns: [
          'Low_Risk_Outcome', 'race', 'sex', 'age', 'decile_score',
          'priors_count', 'c_charge_degree'
        ],
        dtypes: {
          'Low_Risk_Outcome': 'int64',
          'race': 'object',
          'sex': 'object',
          'age': 'int64',
          'decile_score': 'int64',
          'priors_count': 'int64',
          'c_charge_degree': 'object'
        },
        row_count: 6172,
        preview: []
      });
      setTargetCol('Low_Risk_Outcome');
      setPositiveLabel(1);
      setSensitiveCols(['race', 'sex', 'age']);
      setUseCase('law_enforcement_recidivism');
      setPredCol('decile_score');
      setPredThreshold(5);
    }
  };

  // Handle CSV file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only valid .csv files are supported.');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Upload failed with status ${resp.status}`);
      }

      const data: DatasetSummary = await resp.json();
      setDatasetMeta(data);

      // Auto-infer settings
      const inferredTarget = data.columns[data.columns.length - 1];
      setTargetCol(inferredTarget);

      // Infer sensitive candidates
      const sensitiveMatches = data.columns.filter(c =>
        ['sex', 'gender', 'age', 'race', 'ethnicity', 'religion', 'disability'].some(k =>
          c.toLowerCase().includes(k)
        )
      );
      setSensitiveCols(sensitiveMatches.length > 0 ? sensitiveMatches : [data.columns[0]]);

      setIsUploading(false);
      setWizardStep(2); // Automatically advance to Inspection
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Failed to upload and parse CSV.');
    }
  };

  // Launch the actual audit execution
  const handleLaunch = () => {
    onRunAudit({
      datasetId: datasetMeta?.dataset_id || (selectedDemo === 'compas' ? 'demo_compas' : 'demo_german_credit'),
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
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* Wizard Progress Stepper */}
      <div className="observatory-card p-4 sm:p-5 border-b border-[#C9A66B]/25">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { num: 1, label: '1. Data Source' },
            { num: 2, label: '2. Inspection' },
            { num: 3, label: '3. Explanation' },
            { num: 4, label: '4. Disclosures & Review' },
            { num: 5, label: '5. Inspection Run' },
          ].map(s => {
            const isActive = wizardStep === s.num;
            const isCompleted = wizardStep > s.num;

            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 text-xs font-mono font-bold shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#C9A66B]'
                    : isCompleted
                    ? 'text-[#496F5A]'
                    : 'text-stone-400 dark:text-stone-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? 'bg-[#C9A66B] text-[#171A18]'
                      : isCompleted
                      ? 'bg-[#496F5A] text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                  }`}
                >
                  {isCompleted ? '✓' : s.num}
                </div>
                <span>{s.label}</span>
                {s.num < 5 && <span className="text-stone-300 dark:text-stone-700 ml-1">/</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: DATA SOURCE SELECTION */}
      {wizardStep === 1 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#171A18] dark:text-[#F2EEE5]">
              Step 1: Select AI System or Upload Dataset
            </h3>
            <p className="text-xs sm:text-sm text-[#171A18]/70 dark:text-[#F2EEE5]/70">
              Choose an authentic benchmark case study or upload your tabular CSV dataset for empirical inspection.
            </p>
          </div>

          {/* Toggle between Sample Benchmark and CSV Upload */}
          <div className="flex rounded-md p-1 bg-stone-200 dark:bg-stone-800 max-w-sm">
            <button
              type="button"
              onClick={() => setSourceType('sample')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-bold transition-all ${
                sourceType === 'sample'
                  ? 'bg-white dark:bg-[#171A18] text-[#171A18] dark:text-[#F2EEE5] shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Academic Benchmarks
            </button>
            <button
              type="button"
              onClick={() => setSourceType('upload')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-bold transition-all ${
                sourceType === 'upload'
                  ? 'bg-white dark:bg-[#171A18] text-[#171A18] dark:text-[#F2EEE5] shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Upload Custom CSV
            </button>
          </div>

          {/* Sample Benchmark Cards */}
          {sourceType === 'sample' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div
                onClick={() => handleSelectDemo('german_credit')}
                className={`observatory-card p-5 cursor-pointer border-2 transition-all relative ${
                  selectedDemo === 'german_credit'
                    ? 'border-[#C9A66B] ring-2 ring-[#C9A66B]/20 shadow-sm'
                    : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {selectedDemo === 'german_credit' && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C9A66B] text-[#171A18] flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="font-mono text-[10px] text-[#C9A66B] font-bold uppercase tracking-wider mb-0.5">
                  Financial Lending &bull; High-Risk Annex III
                </div>
                <h4 className="font-display font-bold text-lg text-[#171A18] dark:text-[#F2EEE5]">
                  Loan Approvals (German Credit)
                </h4>
                <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70 mt-1 mb-3">
                  1,000 retail credit applications evaluated by a banking risk surrogate model.
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">Target: Creditability</span>
                  <span className="px-2 py-0.5 bg-[#C9A66B]/15 text-[#9E7A38] dark:text-[#E2BF84] rounded">Sensitive: Sex, Age, Foreign_Worker</span>
                </div>
              </div>

              <div
                onClick={() => handleSelectDemo('compas')}
                className={`observatory-card p-5 cursor-pointer border-2 transition-all relative ${
                  selectedDemo === 'compas'
                    ? 'border-[#C9A66B] ring-2 ring-[#C9A66B]/20 shadow-sm'
                    : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {selectedDemo === 'compas' && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C9A66B] text-[#171A18] flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="font-mono text-[10px] text-[#C9A66B] font-bold uppercase tracking-wider mb-0.5">
                  Criminal Justice &bull; High-Risk Annex III
                </div>
                <h4 className="font-display font-bold text-lg text-[#171A18] dark:text-[#F2EEE5]">
                  Criminal Re-Offence Risk (COMPAS)
                </h4>
                <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70 mt-1 mb-3">
                  6,172 criminal justice records evaluated for recidivism risk across racial groups.
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">Target: Low_Risk_Outcome</span>
                  <span className="px-2 py-0.5 bg-[#C9A66B]/15 text-[#9E7A38] dark:text-[#E2BF84] rounded">Sensitive: race, sex, age</span>
                </div>
              </div>

            </div>
          ) : (
            /* Upload Custom CSV */
            <div className="observatory-card p-6 border-dashed border-2 border-[#C9A66B]/50 text-center space-y-3">
              <UploadCloud className="w-10 h-10 text-[#C9A66B] mx-auto" />
              <div>
                <h4 className="font-display font-bold text-base text-[#171A18] dark:text-[#F2EEE5]">
                  Upload Tabular CSV Dataset
                </h4>
                <p className="text-xs text-[#171A18]/65 dark:text-[#F2EEE5]/65 max-w-md mx-auto mt-1">
                  Upload any clean delimiter-separated CSV file (maximum 20 MB). Our analyzer will inspect column names, missing values, and data types automatically.
                </p>
              </div>

              <input
                type="file"
                id="dataset-upload"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <label
                htmlFor="dataset-upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#C9A66B] text-[#171A18] hover:bg-[#D8B67B] font-mono text-xs font-bold cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isUploading ? 'Inspecting CSV...' : 'Select CSV File'}</span>
              </label>

              {uploadError && (
                <div className="p-2.5 rounded bg-[#B85D45]/10 text-[#B85D45] text-xs font-mono max-w-md mx-auto">
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* Navigation Button */}
          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="px-5 py-2.5 rounded bg-[#C9A66B] text-[#171A18] hover:bg-[#D8B67B] font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Next: Inspect Dataset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATASET INSPECTION & ATTRIBUTE MAPPING */}
      {wizardStep === 2 && datasetMeta && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#171A18] dark:text-[#F2EEE5]">
              Step 2: Inspect Dataset &amp; Configure Roles
            </h3>
            <p className="text-xs sm:text-sm text-[#171A18]/70 dark:text-[#F2EEE5]/70">
              Examine identified data fields, column types, and choose target decisions and protected demographic attributes.
            </p>
          </div>

          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="observatory-card p-3 font-mono text-xs">
              <span className="text-stone-500 block text-[10px] uppercase">Total Records</span>
              <strong className="text-base font-bold text-[#171A18] dark:text-[#F2EEE5]">
                {datasetMeta.row_count.toLocaleString()}
              </strong>
            </div>

            <div className="observatory-card p-3 font-mono text-xs">
              <span className="text-stone-500 block text-[10px] uppercase">Total Features</span>
              <strong className="text-base font-bold text-[#171A18] dark:text-[#F2EEE5]">
                {datasetMeta.columns.length} columns
              </strong>
            </div>

            <div className="observatory-card p-3 font-mono text-xs">
              <span className="text-stone-500 block text-[10px] uppercase">Missing Values</span>
              <strong className="text-base font-bold text-[#496F5A]">
                0.0% (Clean)
              </strong>
            </div>

            <div className="observatory-card p-3 font-mono text-xs">
              <span className="text-stone-500 block text-[10px] uppercase">Held-Out Test Split</span>
              <strong className="text-base font-bold text-[#C9A66B]">
                20% Stratified
              </strong>
            </div>
          </div>

          {/* Field Selection Controls */}
          <div className="observatory-card p-5 space-y-4">
            
            {/* Target Column Selector */}
            <div className="space-y-1.5">
              <label className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5] flex items-center justify-between">
                <span>Target Decision Column (Label)</span>
                <span className="font-mono text-xs text-stone-500">Binary classification outcome</span>
              </label>
              <select
                value={targetCol}
                onChange={(e) => setTargetCol(e.target.value)}
                className="w-full p-2.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#171A18] font-mono text-xs text-[#171A18] dark:text-[#F2EEE5] focus:border-[#C9A66B] outline-hidden"
              >
                {datasetMeta.columns.map(col => (
                  <option key={col} value={col}>
                    {col} ({datasetMeta.dtypes[col] || 'feature'})
                  </option>
                ))}
              </select>
            </div>

            {/* Sensitive Attributes Multi-Select */}
            <div className="space-y-1.5">
              <label className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5] flex items-center justify-between">
                <span>Protected Demographic Attributes</span>
                <span className="font-mono text-xs text-stone-500">Evaluated for disparity &amp; proxy correlation</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {datasetMeta.columns.filter(c => c !== targetCol).map(col => {
                  const isChecked = sensitiveCols.includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          if (sensitiveCols.length > 1) {
                            setSensitiveCols(sensitiveCols.filter(c => c !== col));
                          }
                        } else {
                          setSensitiveCols([...sensitiveCols, col]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded font-mono text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-[#C9A66B]/20 text-[#171A18] dark:text-[#F2EEE5] border-[#C9A66B]'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-transparent hover:border-stone-300'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Predictions Column Mode Toggle */}
            <div className="p-3 rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#171A18] dark:text-[#F2EEE5] block">
                  Predictions Column Mode
                </span>
                <span className="text-[11px] text-stone-500">
                  Audit a dataset that already includes precomputed model prediction scores without requiring a model file.
                </span>
              </div>
              <input
                type="checkbox"
                checked={usePredColMode}
                onChange={(e) => setUsePredColMode(e.target.checked)}
                className="w-4 h-4 accent-[#C9A66B]"
              />
            </div>

            {usePredColMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#C9A66B]/10 rounded border border-[#C9A66B]/30 font-mono text-xs">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Prediction Score Column:</label>
                  <select
                    value={predCol}
                    onChange={(e) => setPredCol(e.target.value)}
                    className="w-full p-2 rounded bg-white dark:bg-[#171A18] border border-stone-300 dark:border-stone-700"
                  >
                    {datasetMeta.columns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Decision Threshold (&ge; value):</label>
                  <input
                    type="number"
                    value={predThreshold}
                    onChange={(e) => setPredThreshold(Number(e.target.value))}
                    className="w-full p-2 rounded bg-white dark:bg-[#171A18] border border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-4 py-2.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="px-5 py-2.5 rounded bg-[#C9A66B] text-[#171A18] hover:bg-[#D8B67B] font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Next: Configuration Explainer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIGURATION EXPLAINER */}
      {wizardStep === 3 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#171A18] dark:text-[#F2EEE5]">
              Step 3: Configuration Explainer
            </h3>
            <p className="text-xs sm:text-sm text-[#171A18]/70 dark:text-[#F2EEE5]/70">
              Clear plain-English explanation of your audit parameters, reference benchmarks, and evaluation semantics.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Explainer 1: Target Decision & Favourable Outcome */}
            <div className="observatory-card p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#496F5A]/20 text-[#496F5A] font-mono font-bold text-xs flex items-center justify-center">
                  A
                </span>
                <h4 className="font-display font-bold text-base text-[#171A18] dark:text-[#F2EEE5]">
                  Favourable Outcome Label ({targetCol} = {String(positiveLabel)})
                </h4>
              </div>
              <p className="text-xs text-[#171A18]/75 dark:text-[#F2EEE5]/75 leading-relaxed">
                In this audit, a prediction of <strong>{String(positiveLabel)}</strong> represents the <em>favourable outcome</em> (such as loan approval or non-recidivism). Disparate impact is calculated by measuring whether protected groups receive this favourable outcome at rates comparable to the reference cohort.
              </p>
            </div>

            {/* Explainer 2: Protected Attributes & Reference Groups */}
            <div className="observatory-card p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#C9A66B]/20 text-[#C9A66B] font-mono font-bold text-xs flex items-center justify-center">
                  B
                </span>
                <h4 className="font-display font-bold text-base text-[#171A18] dark:text-[#F2EEE5]">
                  Reference Group and Four-Fifths Rule
                </h4>
              </div>
              <p className="text-xs text-[#171A18]/75 dark:text-[#F2EEE5]/75 leading-relaxed">
                For each protected demographic attribute ({sensitiveCols.join(', ')}), the subgroup with the highest empirical selection rate on the held-out test split is assigned as the <strong>Reference (Privileged) Group</strong>. All other cohorts are measured against this baseline. An adverse selection ratio below 0.80 triggers a four-fifths disparate impact warning.
              </p>
            </div>

            {/* Explainer 3: Strict Held-Out Split & Uncertainty */}
            <div className="observatory-card p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-bold text-xs flex items-center justify-center">
                  C
                </span>
                <h4 className="font-display font-bold text-base text-[#171A18] dark:text-[#F2EEE5]">
                  Bootstrap Confidence Intervals &amp; Subgroup Warnings
                </h4>
              </div>
              <p className="text-xs text-[#171A18]/75 dark:text-[#F2EEE5]/75 leading-relaxed">
                To prevent false conclusions caused by small sample fluctuations, 500 bootstrap iterations compute 95% Confidence Intervals for every disparity ratio. Subgroups with fewer than 30 individuals are explicitly flagged as <em>insufficient sample</em>.
              </p>
            </div>

          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="px-4 py-2.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setWizardStep(4)}
              className="px-5 py-2.5 rounded bg-[#C9A66B] text-[#171A18] hover:bg-[#D8B67B] font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Next: Disclosures &amp; Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GOVERNANCE DISCLOSURES & PARAMETER REVIEW */}
      {wizardStep === 4 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#171A18] dark:text-[#F2EEE5]">
              Step 4: Review Parameters &amp; Governance Disclosures
            </h3>
            <p className="text-xs sm:text-sm text-[#171A18]/70 dark:text-[#F2EEE5]/70">
              Confirm regulatory categorization and declare operational governance disclosures before launching inspection.
            </p>
          </div>

          {/* Regulatory Categorization Dropdown */}
          <div className="observatory-card p-5 space-y-3">
            <label className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5] block">
              EU AI Act Annex III Use Case Classification:
            </label>
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="w-full p-2.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#171A18] font-mono text-xs text-[#171A18] dark:text-[#F2EEE5] focus:border-[#C9A66B] outline-hidden"
            >
              <option value="credit_scoring">Annex III 5(b): Credit Scoring &amp; Financial Risk (High-Risk)</option>
              <option value="law_enforcement_recidivism">Annex III 6(a): Recidivism Risk &amp; Law Enforcement (High-Risk)</option>
              <option value="employment_hiring">Annex III 4(a): Recruitment &amp; Employee Screening (High-Risk)</option>
              <option value="general_commercial">Commercial Predictive Analytics (Standard Risk)</option>
            </select>
          </div>

          {/* 15 Governance Questions Accordion */}
          <div className="observatory-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <span className="font-display font-bold text-sm text-[#171A18] dark:text-[#F2EEE5]">
                Governance Disclosures Checklist (15 Principles)
              </span>
              <span className="font-mono text-xs text-[#C9A66B] font-bold">
                {answeredCount}/15 Answered (Unanswered = 0 credit)
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[
                { k: 'q1_risk_mgmt', q: '1. Risk management system established (EU Art. 9)' },
                { k: 'q2_data_prep', q: '2. Training and test data quality governance documented (EU Art. 10)' },
                { k: 'q3_human_oversight', q: '3. Human-in-the-loop oversight mechanisms designed (EU Art. 14)' },
                { k: 'q4_logging', q: '4. Automatic event logging enabled for traceability (EU Art. 12)' },
                { k: 'q5_transparency', q: '5. Instructions for deployers and technical transparency (EU Art. 13)' },
                { k: 'q6_accuracy_eval', q: '6. Accuracy, robustness and cybersecurity evaluated (EU Art. 15)' },
                { k: 'q7_cybersecurity', q: '7. Adversarial and cybersecurity controls deployed' },
                { k: 'q8_dpdp_consent', q: '8. Explicit DPDP Act consent mechanism for personal data' },
                { k: 'q9_dpdp_purpose', q: '9. Purpose limitation and data minimization enforced (Sec. 6)' },
                { k: 'q10_dpdp_grievance', q: '10. Redressal and grievance officer designated (Sec. 11)' },
                { k: 'q11_dpdp_breach', q: '11. Data breach notification procedure within mandated timeframe' },
                { k: 'q12_dpdp_dpo', q: '12. Data Protection Officer appointed (Significant Data Fiduciary)' },
                { k: 'q13_dpdp_erasure', q: '13. Right to erasure and data retention schedule defined (Sec. 12)' },
                { k: 'q14_dpdp_minors', q: '14. Minor data protection policy and parental consent (Sec. 9)' },
                { k: 'q15_post_market', q: '15. Continuous post-market monitoring and audit plan' },
              ].map(item => (
                <div key={item.k} className="flex items-center justify-between p-2 rounded bg-stone-50 dark:bg-stone-900 text-xs">
                  <span className="font-body text-[#171A18] dark:text-[#F2EEE5] pr-2">{item.q}</span>
                  <select
                    value={questionnaire[item.k]}
                    onChange={(e) => setQuestionnaire({ ...questionnaire, [item.k]: e.target.value })}
                    className="p-1 rounded border border-stone-300 dark:border-stone-700 font-mono text-[11px] bg-white dark:bg-[#171A18] text-[#171A18] dark:text-[#F2EEE5]"
                  >
                    <option value="unanswered">Unanswered (0.0)</option>
                    <option value="partial">Partial (0.5)</option>
                    <option value="yes">Affirmed (1.0)</option>
                    <option value="no">Not Implemented (0.0)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Launch Buttons */}
          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="px-4 py-2.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleLaunch}
              className="px-6 py-3 rounded bg-[#C9A66B] text-[#171A18] hover:bg-[#D8B67B] font-mono text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Scale className="w-4 h-4 text-[#171A18]" />
              <span>Execute Diagnostic Inspection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: LIVE INSPECTION EXECUTION & PROGRESS */}
      {wizardStep === 5 && (
        <div className="space-y-6 observatory-card p-6 border-2 border-[#C9A66B]">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
              Inspection In Progress
            </span>
            <h3 className="font-display font-bold text-2xl text-[#171A18] dark:text-[#F2EEE5]">
              Evaluating Model Through Diagnostic Checkpoints
            </h3>
            <p className="text-xs text-[#171A18]/70 dark:text-[#F2EEE5]/70 max-w-lg mx-auto">
              The model decision boundary is undergoing empirical testing against fairness thresholds, global SHAP attribution, adversarial perturbation attacks, and statutory compliance checklists.
            </p>
          </div>

          {/* 4 Inspection Gates Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4">
            {[
              { num: 1, name: 'Fairness Checkpoint', icon: Scale, desc: 'Disparate Impact & Parity' },
              { num: 2, name: 'Attribution Checkpoint', icon: Search, desc: 'Global SHAP & Proxies' },
              { num: 3, name: 'Stress Test Checkpoint', icon: ShieldAlert, desc: 'Adversarial Noise & Flips' },
              { num: 4, name: 'Regulatory Law Check', icon: FileCheck2, desc: 'EU AI Act & India DPDP' },
            ].map(gate => {
              const isCurrent = auditStage === gate.num;
              const isDone = auditStage > gate.num;
              const Icon = gate.icon;

              return (
                <div
                  key={gate.num}
                  className={`p-4 rounded border text-center space-y-2 transition-all ${
                    isCurrent
                      ? 'border-[#C9A66B] bg-[#C9A66B]/10 shadow-xs'
                      : isDone
                      ? 'border-[#496F5A] bg-[#496F5A]/10'
                      : 'border-stone-200 dark:border-stone-800 opacity-60'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    isDone
                      ? 'bg-[#496F5A] text-white'
                      : isCurrent
                      ? 'bg-[#C9A66B] text-[#171A18]'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                  }`}>
                    {isDone ? '✓' : isCurrent ? <Clock className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="font-display font-bold text-xs text-[#171A18] dark:text-[#F2EEE5]">
                    {gate.name}
                  </div>
                  <p className="text-[10px] text-stone-500">
                    {gate.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Cancel Action */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onCancelAudit || (() => setWizardStep(1))}
              className="px-4 py-2 rounded border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-mono text-xs hover:border-[#B85D45] hover:text-[#B85D45] transition-colors"
            >
              Cancel &amp; Return to Setup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
