import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  PlayCircle,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  FileCheck2,
  Sliders,
  Info,
  ArrowRight,
  Database
} from 'lucide-react';

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
  allowModelUpload?: boolean;
  onCancelAudit?: () => void;
}

export const NewAuditWorkflow: React.FC<NewAuditWorkflowProps> = ({
  onRunAudit,
  onLoadDemo,
  isAuditing,
  auditStage = 0,
  onCancelAudit,
}) => {
  // Mode: 'demo' or 'upload'
  const [mode, setMode] = useState<'demo' | 'upload'>('demo');
  const [selectedDemo, setSelectedDemo] = useState<'german_credit' | 'compas'>('german_credit');

  // Uploaded dataset state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active dataset meta
  const [datasetMeta, setDatasetMeta] = useState<DatasetSummary>({
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
    preview: [
      { Creditability: 1, Account_Balance: 1, Duration_of_Credit_monthly: 18, Sex: 'Female', Age: 21, Foreign_Worker: 'Yes' },
      { Creditability: 0, Account_Balance: 2, Duration_of_Credit_monthly: 9, Sex: 'Male', Age: 36, Foreign_Worker: 'No' },
      { Creditability: 1, Account_Balance: 4, Duration_of_Credit_monthly: 12, Sex: 'Male', Age: 23, Foreign_Worker: 'No' },
    ]
  });

  // Audit Parameters
  const [targetCol, setTargetCol] = useState('Creditability');
  const [positiveLabel, setPositiveLabel] = useState<string | number>(1);
  const [sensitiveCols, setSensitiveCols] = useState<string[]>(['Sex', 'Age', 'Foreign_Worker']);
  const [useCase, setUseCase] = useState('credit_scoring');
  const [modelType, setModelType] = useState<'random_forest' | 'logistic_regression' | 'pred_col'>('random_forest');
  const [predCol, setPredCol] = useState<string>('');

  // Update configuration when demo changes
  const handleSelectDemo = (name: 'german_credit' | 'compas') => {
    setSelectedDemo(name);
    setMode('demo');
    setUploadError(null);

    if (name === 'german_credit') {
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
        preview: [
          { Creditability: 1, Account_Balance: 1, Duration_of_Credit_monthly: 18, Sex: 'Female', Age: 21, Foreign_Worker: 'Yes' },
          { Creditability: 0, Account_Balance: 2, Duration_of_Credit_monthly: 9, Sex: 'Male', Age: 36, Foreign_Worker: 'No' },
        ]
      });
      setTargetCol('Creditability');
      setPositiveLabel(1);
      setSensitiveCols(['Sex', 'Age', 'Foreign_Worker']);
      setUseCase('credit_scoring');
    } else {
      setDatasetMeta({
        dataset_id: 'demo_compas',
        columns: [
          'two_year_recid', 'age', 'c_charge_degree', 'race', 'sex',
          'priors_count', 'juv_fel_count', 'juv_misd_count'
        ],
        dtypes: {
          'two_year_recid': 'int64',
          'age': 'int64',
          'c_charge_degree': 'object',
          'race': 'object',
          'sex': 'object',
          'priors_count': 'int64',
          'juv_fel_count': 'int64',
          'juv_misd_count': 'int64'
        },
        row_count: 6172,
        preview: [
          { two_year_recid: 0, age: 69, race: 'Other', sex: 'Male', priors_count: 0 },
          { two_year_recid: 1, age: 34, race: 'African-American', sex: 'Male', priors_count: 0 },
        ]
      });
      setTargetCol('two_year_recid');
      setPositiveLabel(0); // 0 = non-recidivating (favourable)
      setSensitiveCols(['race', 'sex', 'age']);
      setUseCase('law_enforcement_recidivism');
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file type: Please upload a valid .csv file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25 MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${resp.status} upload failed.`);
      }

      const data: DatasetSummary = await resp.json();
      setDatasetMeta(data);
      setMode('upload');

      // Sensible defaults from uploaded columns
      if (data.columns.length > 0) {
        setTargetCol(data.columns[0]);
        // Auto-detect common sensitive attributes
        const foundSensitive = data.columns.filter((c) =>
          ['sex', 'gender', 'age', 'race', 'ethnicity', 'foreign_worker'].includes(
            c.toLowerCase()
          )
        );
        setSensitiveCols(foundSensitive.length > 0 ? foundSensitive : [data.columns[data.columns.length - 1]]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload and parse CSV dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle sensitive attribute
  const toggleSensitive = (col: string) => {
    setSensitiveCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  // Submit Audit
  const handleStartAudit = () => {
    if (!targetCol) {
      setUploadError('Please select a Target Column.');
      return;
    }
    if (sensitiveCols.length === 0) {
      setUploadError('Please select at least one Sensitive Attribute for fairness auditing.');
      return;
    }

    onRunAudit({
      datasetId: datasetMeta.dataset_id,
      targetCol,
      sensitiveCols,
      useCase,
      positiveLabel,
      predCol: modelType === 'pred_col' ? predCol : undefined,
      questionnaire: {
        annex_iii_classification: useCase,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#38A9DB]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
            New AI Audit Configuration
          </h2>
        </div>
        <p className="text-sm text-[#555555]">
          Configure your dataset, select target labels and sensitive demographic attributes, and choose a classification model to initiate the 4-stage trustworthy AI evaluation.
        </p>
      </div>

      {/* Audit in Progress Banner */}
      {isAuditing && (
        <div className="content-card p-6 bg-sky-50 border border-[#38A9DB] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#38A9DB] animate-ping" />
              <h3 className="text-base font-bold text-[#111111]">
                Audit In Progress &ndash; Stage {auditStage} of 4
              </h3>
            </div>
            {onCancelAudit && (
              <button
                onClick={onCancelAudit}
                className="text-xs px-3 py-1 bg-white border border-[#DCE5EB] text-red-600 rounded font-semibold hover:bg-red-50 transition-colors"
              >
                Cancel Audit
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2.5 rounded-lg border ${auditStage >= 1 ? 'bg-white border-[#38A9DB] text-[#111111] font-semibold' : 'bg-white/50 border-gray-200 text-[#555555]'}`}>
              <span className="block text-[10px] text-[#38A9DB]">Stage 1</span>
              <span>Fairness Check</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${auditStage >= 2 ? 'bg-white border-[#38A9DB] text-[#111111] font-semibold' : 'bg-white/50 border-gray-200 text-[#555555]'}`}>
              <span className="block text-[10px] text-[#38A9DB]">Stage 2</span>
              <span>SHAP Explainability</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${auditStage >= 3 ? 'bg-white border-[#38A9DB] text-[#111111] font-semibold' : 'bg-white/50 border-gray-200 text-[#555555]'}`}>
              <span className="block text-[10px] text-[#38A9DB]">Stage 3</span>
              <span>Robustness Stress Tests</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${auditStage >= 4 ? 'bg-white border-[#38A9DB] text-[#111111] font-semibold' : 'bg-white/50 border-gray-200 text-[#555555]'}`}>
              <span className="block text-[10px] text-[#38A9DB]">Stage 4</span>
              <span>Regulatory Readiness</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Select or Upload Dataset */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE5EB] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#38A9DB] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-bold text-[#111111]">
              Select or Upload Dataset
            </h3>
          </div>
          <span className="text-xs text-[#555555]">
            Supports custom CSV or standard benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Demonstration Benchmark Datasets */}
          <div className={`p-4 rounded-xl border transition-all ${mode === 'demo' ? 'border-[#38A9DB] bg-sky-50/50' : 'border-[#DCE5EB] bg-white'}`}>
            <span className="text-xs font-bold text-[#111111] block mb-1">
              Option A: Pre-Loaded Demonstration Datasets
            </span>
            <p className="text-xs text-[#555555] mb-3">
              Instantly test the auditing workflow with standard public benchmarks.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('german_credit')}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedDemo === 'german_credit' && mode === 'demo'
                    ? 'border-[#38A9DB] bg-white text-[#111111] shadow-xs'
                    : 'border-[#DCE5EB] bg-white text-[#555555] hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-xs text-[#111111]">German Credit</div>
                <div className="text-[11px] text-[#555555]">1,000 credit cases</div>
                <div className="text-[10px] text-[#38A9DB] font-semibold mt-1">
                  Sex, Age, Foreign Worker
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('compas')}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedDemo === 'compas' && mode === 'demo'
                    ? 'border-[#38A9DB] bg-white text-[#111111] shadow-xs'
                    : 'border-[#DCE5EB] bg-white text-[#555555] hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-xs text-[#111111]">COMPAS Recidivism</div>
                <div className="text-[11px] text-[#555555]">6,172 criminal cases</div>
                <div className="text-[10px] text-[#38A9DB] font-semibold mt-1">
                  Race, Sex, Age
                </div>
              </button>
            </div>
          </div>

          {/* Option B: Upload Custom CSV */}
          <div className={`p-4 rounded-xl border transition-all ${mode === 'upload' ? 'border-[#38A9DB] bg-sky-50/50' : 'border-[#DCE5EB] bg-white'}`}>
            <span className="text-xs font-bold text-[#111111] block mb-1">
              Option B: Upload Your Own CSV
            </span>
            <p className="text-xs text-[#555555] mb-3">
              Evaluate your own machine learning dataset for compliance and bias.
            </p>

            <label className="border-2 border-dashed border-[#DCE5EB] hover:border-[#38A9DB] rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white">
              <UploadCloud className="w-6 h-6 text-[#38A9DB] mb-1" />
              <span className="text-xs font-semibold text-[#111111]">
                {isUploading ? 'Uploading & parsing CSV...' : uploadedFile ? uploadedFile.name : 'Click to browse or drop CSV'}
              </span>
              <span className="text-[11px] text-[#555555]">Max file size: 25 MB</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading || isAuditing}
                className="hidden"
              />
            </label>

            {uploadError && (
              <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dataset Preview */}
        {datasetMeta && (
          <div className="p-3.5 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#38A9DB]" />
                <span>Active Dataset: {datasetMeta.dataset_id}</span>
              </span>
              <span className="text-[#555555]">
                {datasetMeta.row_count.toLocaleString()} rows &bull; {datasetMeta.columns.length} columns
              </span>
            </div>

            {datasetMeta.preview.length > 0 && (
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left bg-white border border-[#DCE5EB] rounded">
                  <thead>
                    <tr className="bg-slate-100 text-[#555555]">
                      {datasetMeta.columns.slice(0, 6).map((c) => (
                        <th key={c} className="p-1.5 font-semibold border-b border-[#DCE5EB]">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datasetMeta.preview.slice(0, 2).map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 text-[#111111]">
                        {datasetMeta.columns.slice(0, 6).map((c) => (
                          <td key={c} className="p-1.5 truncate max-w-[120px]">
                            {String(row[c] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Target & Sensitive Configuration */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-5">
        <div className="flex items-center justify-between border-b border-[#DCE5EB] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#38A9DB] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-base font-bold text-[#111111]">
              Target, Sensitive &amp; Outcome Configuration
            </h3>
          </div>
          <span className="text-xs text-[#555555]">
            Configure model evaluation parameters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Column */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111111]">
                Target Column (Ground Truth)
              </label>
              <span className="text-[11px] text-[#555555]">Required</span>
            </div>
            <select
              value={targetCol}
              onChange={(e) => setTargetCol(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#DCE5EB] bg-white text-[#111111] focus:outline-none focus:border-[#38A9DB]"
            >
              {datasetMeta.columns.map((col) => (
                <option key={col} value={col}>
                  {col} ({datasetMeta.dtypes[col] || 'unknown'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#555555]">
              The binary outcome column your model predicts (e.g. Creditability, Approved, Recidivism).
            </p>
          </div>

          {/* Favourable Outcome Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111111]">
                Favourable Outcome (Positive Label)
              </label>
              <span className="text-[11px] text-[#555555]">Selection target</span>
            </div>
            <input
              type="text"
              value={String(positiveLabel)}
              onChange={(e) => setPositiveLabel(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#DCE5EB] bg-white text-[#111111] focus:outline-none focus:border-[#38A9DB]"
              placeholder="1 or Good or Yes"
            />
            <p className="text-[11px] text-[#555555]">
              The value representing a positive decision (e.g., 1 for Loan Approved, or 0 for Low Recidivism Risk).
            </p>
          </div>
        </div>

        {/* Sensitive Attributes Selection */}
        <div className="space-y-2 pt-2 border-t border-[#DCE5EB]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#111111]">
              Sensitive Demographic Attributes
            </label>
            <span className="text-[11px] text-[#555555]">
              {sensitiveCols.length} selected
            </span>
          </div>
          <p className="text-[11px] text-[#555555]">
            Protected demographic features audited for parity, selection disparity, and discrimination (e.g. Gender, Age, Race, Foreign Worker).
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {datasetMeta.columns
              .filter((c) => c !== targetCol)
              .map((col) => {
                const isSelected = sensitiveCols.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => toggleSensitive(col)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#38A9DB] text-white border-[#38A9DB]'
                        : 'bg-white text-[#111111] border-[#DCE5EB] hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {col}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-2 pt-2 border-t border-[#DCE5EB]">
          <label className="text-xs font-bold text-[#111111] block">
            Classification Model Configuration
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                modelType === 'random_forest'
                  ? 'border-[#38A9DB] bg-sky-50 text-[#111111]'
                  : 'border-[#DCE5EB] bg-white text-[#555555]'
              }`}
            >
              <input
                type="radio"
                name="modelType"
                value="random_forest"
                checked={modelType === 'random_forest'}
                onChange={() => setModelType('random_forest')}
                className="hidden"
              />
              <span className="font-bold text-xs text-[#111111] block">
                Random Forest (Baseline)
              </span>
              <span className="text-[11px] text-[#555555]">
                100 ensemble trees with Gini criterion &amp; full SHAP attribution
              </span>
            </label>

            <label
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                modelType === 'logistic_regression'
                  ? 'border-[#38A9DB] bg-sky-50 text-[#111111]'
                  : 'border-[#DCE5EB] bg-white text-[#555555]'
              }`}
            >
              <input
                type="radio"
                name="modelType"
                value="logistic_regression"
                checked={modelType === 'logistic_regression'}
                onChange={() => setModelType('logistic_regression')}
                className="hidden"
              />
              <span className="font-bold text-xs text-[#111111] block">
                Logistic Regression
              </span>
              <span className="text-[11px] text-[#555555]">
                Linear L2-regularized baseline with probability calibration
              </span>
            </label>

            <label
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                modelType === 'pred_col'
                  ? 'border-[#38A9DB] bg-sky-50 text-[#111111]'
                  : 'border-[#DCE5EB] bg-white text-[#555555]'
              }`}
            >
              <input
                type="radio"
                name="modelType"
                value="pred_col"
                checked={modelType === 'pred_col'}
                onChange={() => setModelType('pred_col')}
                className="hidden"
              />
              <span className="font-bold text-xs text-[#111111] block">
                Pre-Computed Predictions
              </span>
              <span className="text-[11px] text-[#555555]">
                Use existing prediction column from uploaded CSV
              </span>
            </label>
          </div>

          {modelType === 'pred_col' && (
            <div className="pt-2">
              <label className="text-xs font-semibold text-[#111111] block mb-1">
                Select Prediction Column:
              </label>
              <select
                value={predCol}
                onChange={(e) => setPredCol(e.target.value)}
                className="w-full text-xs p-2 rounded border border-[#DCE5EB] bg-white text-[#111111]"
              >
                <option value="">-- Choose column --</option>
                {datasetMeta.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Regulatory Domain Use Case */}
        <div className="space-y-1.5 pt-2 border-t border-[#DCE5EB]">
          <label className="text-xs font-bold text-[#111111]">
            Regulatory Domain Classification (EU AI Act Annex III)
          </label>
          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#DCE5EB] bg-white text-[#111111] focus:outline-none focus:border-[#38A9DB]"
          >
            <option value="credit_scoring">Credit Scoring &amp; Financial Eligibility (Annex III, Point 5b - High-Risk)</option>
            <option value="employment_recruitment">Employment &amp; Recruitment Candidate Filtering (Annex III, Point 4 - High-Risk)</option>
            <option value="law_enforcement_recidivism">Law Enforcement &amp; Recidivism Risk (Annex III, Point 6 - High-Risk)</option>
            <option value="education_admissions">Educational Admissions &amp; Grading (Annex III, Point 3 - High-Risk)</option>
            <option value="general_commercial">General Commercial / Low-Risk Decision System (Non-Annex III)</option>
          </select>
          <p className="text-[11px] text-[#555555]">
            Categorizes the model against EU AI Act risk tiers to generate targeted compliance checklists.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleSelectDemo('german_credit')}
            className="btn-secondary text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={handleStartAudit}
            disabled={isAuditing}
            className="btn-primary text-sm shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 text-white" />
            <span>{isAuditing ? 'Evaluating...' : 'Start AI Audit'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
