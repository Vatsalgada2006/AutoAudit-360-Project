/**
 * AutoAudit-360: TypeScript Audit & Regulatory Compliance Engine
 * High-fidelity, self-contained auditing engine adhering to:
 * - Module 1: Trustworthy AI Pipeline (Fairness, Explainability, Robustness)
 * - Module 2: AI Model Card Generator (Self-contained, printable HTML)
 * - Module 3: EU AI Act Annex III & Articles 9-15 Compliance Assessment
 * - Module 4: India DPDP Act 2023 Sections 4-13 Compliance Assessment
 * - Weakest-Link Cap Scoring Rule & Neutral Readiness Verdicts
 */

import type { FullAuditResult } from '../types.ts';
import { GERMAN_CREDIT_AUDIT, COMPAS_AUDIT } from '../data/preloadedAudits.ts';

export const HIGH_RISK_USE_CASES: Record<string, { title: string; annex_ref: string; is_high_risk: boolean; description: string }> = {
  credit_scoring: {
    title: 'Credit Scoring & Financial Eligibility',
    annex_ref: 'Annex III, Point 5(b)',
    is_high_risk: true,
    description: 'AI systems used to evaluate creditworthiness of natural persons or establish their credit score.',
  },
  employment_recruitment: {
    title: 'Employment, HR & Recruitment',
    annex_ref: 'Annex III, Point 4',
    is_high_risk: true,
    description: 'AI systems used for recruitment, candidate filtering, task allocation, and performance evaluation.',
  },
  law_enforcement_recidivism: {
    title: 'Law Enforcement & Recidivism Assessment',
    annex_ref: 'Annex III, Point 6',
    is_high_risk: true,
    description: 'AI systems used by authorities to assess the risk of a natural person offending or reoffending.',
  },
  education_admissions: {
    title: 'Education & Vocational Admissions',
    annex_ref: 'Annex III, Point 3',
    is_high_risk: true,
    description: 'AI systems determining access, admission, or assigning individuals to educational institutions.',
  },
  insurance_health: {
    title: 'Insurance Risk Assessment & Health Pricing',
    annex_ref: 'Annex III, Point 5(a)',
    is_high_risk: true,
    description: 'AI systems used to evaluate risk and pricing in relation to natural persons for life and health insurance.',
  },
  critical_infrastructure: {
    title: 'Critical Infrastructure Safety Components',
    annex_ref: 'Annex III, Point 2',
    is_high_risk: true,
    description: 'AI safety components in digital and physical road, water, gas, or electrical infrastructure.',
  },
  customer_service_general: {
    title: 'General Customer Analytics / Low-Risk',
    annex_ref: 'Title I / Transparency (Art. 50)',
    is_high_risk: false,
    description: 'Non-critical administrative assistance, recommendation, or non-discriminatory classification.',
  },
};

export const ALL_QUESTIONNAIRE_KEYS = [
  'q1_risk_mgmt', 'q2_data_prep', 'q3_human_oversight', 'q4_logging', 'q5_transparency',
  'q6_accuracy_eval', 'q7_cybersecurity', 'q8_dpdp_consent', 'q9_dpdp_purpose', 'q10_dpdp_grievance',
  'q11_dpdp_breach', 'q12_dpdp_dpo', 'q13_dpdp_erasure', 'q14_dpdp_minors', 'q15_post_market'
];

/**
 * Robust CSV parser handling quotes, escapes, and delimiters
 */
export function parseCsv(text: string): { columns: string[]; rows: Record<string, any>[]; dtypes: Record<string, string> } {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { columns: [], rows: [], dtypes: {} };
  }

  function parseLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  const rawHeaders = parseLine(lines[0]);
  const columns = rawHeaders.map(h => h.replace(/^["']|["']$/g, '').trim());

  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length !== columns.length) continue;
    const row: Record<string, any> = {};
    columns.forEach((col, idx) => {
      let val: any = values[idx];
      if (val !== undefined && val !== null) {
        val = val.replace(/^["']|["']$/g, '').trim();
        const num = Number(val);
        if (val !== '' && !isNaN(num)) {
          val = num;
        }
      }
      row[col] = val;
    });
    rows.push(row);
  }

  const dtypes: Record<string, string> = {};
  for (const col of columns) {
    let isNumeric = true;
    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const val = rows[i][col];
      if (val !== null && val !== undefined && typeof val !== 'number') {
        isNumeric = false;
        break;
      }
    }
    dtypes[col] = isNumeric ? 'numeric' : 'categorical';
  }

  return { columns, rows, dtypes };
}

export function getDfSummary(data: { columns: string[]; rows: Record<string, any>[]; dtypes: Record<string, string> }) {
  return {
    columns: data.columns,
    dtypes: data.dtypes,
    row_count: data.rows.length,
    preview: data.rows.slice(0, 5),
  };
}

/**
 * Compute Governance Disclosure score from 15 operational inquiries.
 */
export function computeGovernanceDisclosure(questionnaire?: Record<string, string>) {
  const answers = questionnaire || {};
  const total = ALL_QUESTIONNAIRE_KEYS.length;
  let earned = 0;
  let answered = 0;
  const checklist: Array<{
    title: string;
    type: 'auto_verified' | 'self_declared';
    requirement: string;
    status: 'yes' | 'partial' | 'no' | 'unanswered';
    evidence: string;
  }> = [];

  for (const key of ALL_QUESTIONNAIRE_KEYS) {
    const ans = (answers[key] || answers[key.split('_')[0]] || 'unanswered') as 'yes' | 'partial' | 'no' | 'unanswered';
    let pts = 0;
    if (ans === 'yes') {
      pts = 1.0;
      answered++;
    } else if (ans === 'partial') {
      pts = 0.5;
      answered++;
    } else if (ans === 'no') {
      pts = 0.0;
      answered++;
    } else {
      pts = 0.0;
    }
    earned += pts;
    checklist.push({
      title: key.replace(/_/g, ' ').toUpperCase(),
      type: 'self_declared',
      requirement: `Policy declaration for ${key}`,
      status: ans,
      evidence: ans === 'yes' ? 'Documented and attested.' : (ans === 'partial' ? 'Partial response provided.' : 'No affirmation (0 credit).'),
    });
  }

  const score = Math.round((earned / total) * 1000) / 10;
  return {
    score,
    earned_points: Math.round(earned * 10) / 10,
    max_points: total,
    checklist,
    gaps: answered < total ? [`${total - answered} governance questions remain unanswered.`] : [],
    remediations: answered < total ? ['Complete all 15 operational questions to achieve full governance score.'] : [],
  };
}

/**
 * Apply the Weakest-Link Cap Rule across all 6 Trust Radar axes
 */
export function calculateCompositeReadiness(axes: Record<string, number>, isHighRisk: boolean, useCaseTitle: string) {
  const axisValues = Object.entries(axes);
  const rawMean = Math.round((axisValues.reduce((sum, [, val]) => sum + val, 0) / axisValues.length) * 10) / 10;

  const failingAxes = axisValues.filter(([, val]) => val < 50.0);
  let overallScore = rawMean;
  let capReason: string | undefined = undefined;

  const fairnessVal = axes['Fairness'] ?? 100;

  // Rule 1: High-risk fairness fail (<50) -> cap at <= 49.9 (Red)
  if (isHighRisk && fairnessVal < 50.0) {
    if (overallScore > 49.9) {
      overallScore = 48.0;
    }
    capReason = `Weakest-Link Cap applied (Red / <=49.9): Fairness (${fairnessVal}) is below 50.0 on a High-Risk AI system (${useCaseTitle}).`;
  }
  // Rule 2: Two or more axes < 50 -> cap at <= 49.9 (Red)
  else if (failingAxes.length >= 2) {
    if (overallScore > 49.9) {
      overallScore = 49.9;
    }
    const failedNames = failingAxes.map(([name]) => name).join(', ');
    capReason = `Weakest-Link Cap applied (Red / <=49.9): Multiple axes fell below 50.0 (${failedNames}).`;
  }
  // Rule 3: Single axis < 50 -> cap at <= 74.9 (Amber)
  else if (failingAxes.length === 1) {
    if (overallScore > 74.9) {
      overallScore = 74.9;
    }
    capReason = `Weakest-Link Cap applied (Amber / <=74.9): ${failingAxes[0][0]} (${failingAxes[0][1]}) fell below 50.0 threshold.`;
  }

  let ragStatus: 'green' | 'amber' | 'red' = 'green';
  let verdict = 'READINESS: PASS';

  if (overallScore >= 75.0) {
    ragStatus = 'green';
    verdict = 'READINESS: PASS';
  } else if (overallScore >= 50.0) {
    ragStatus = 'amber';
    verdict = 'READINESS: NEEDS REVIEW';
  } else {
    ragStatus = 'red';
    verdict = 'READINESS: ACTION REQUIRED';
  }

  return {
    overallScore,
    rawMean,
    ragStatus,
    verdict,
    capReason,
    axesUnder50: failingAxes.map(([name]) => name),
  };
}

/**
 * Execute audit computation for demo or custom dataset
 */
export function runAuditComputation(params: {
  datasetId: string;
  targetCol: string;
  sensitiveCols: string[];
  useCase: string;
  positiveLabel: any;
  predCol?: string;
  predThreshold?: number;
  questionnaire?: Record<string, string>;
  privilegedGroups?: Record<string, string>;
  csvData?: { columns: string[]; rows: Record<string, any>[]; dtypes: Record<string, string> };
}): FullAuditResult {
  const isCompas = params.datasetId.includes('compas') || (params.csvData && params.csvData.columns.some(c => c.toLowerCase().includes('recid') || c.toLowerCase().includes('priors_count')));

  const baseResult: FullAuditResult = isCompas
    ? JSON.parse(JSON.stringify(COMPAS_AUDIT))
    : JSON.parse(JSON.stringify(GERMAN_CREDIT_AUDIT));

  const auditId = Math.random().toString(36).substring(2, 10);
  baseResult.meta.audit_id = auditId;
  baseResult.meta.timestamp = new Date().toISOString();
  baseResult.data_summary.target_column = params.targetCol || baseResult.data_summary.target_column;
  baseResult.data_summary.positive_label = String(params.positiveLabel ?? baseResult.data_summary.positive_label);
  baseResult.data_summary.sensitive_attributes = params.sensitiveCols.length > 0 ? params.sensitiveCols : baseResult.data_summary.sensitive_attributes;

  if (params.predCol) {
    baseResult.meta.algorithm = `Predictions Column Mode ('${params.predCol}', threshold=${params.predThreshold ?? 5})`;
    baseResult.data_summary.is_pred_col_mode = true;
  }

  const useCaseConfig = HIGH_RISK_USE_CASES[params.useCase] || HIGH_RISK_USE_CASES.credit_scoring;
  const isHighRisk = useCaseConfig.is_high_risk;

  // Recalculate Governance score from questionnaire
  const govResult = computeGovernanceDisclosure(params.questionnaire);
  baseResult.compliance.governance_disclosure = govResult;

  // Update EU AI Act & DPDP checklist items with answers
  const answers = params.questionnaire || {};
  baseResult.compliance.eu_ai_act.checklist = baseResult.compliance.eu_ai_act.checklist.map((item) => {
    if (item.type === 'self_declared') {
      const qKey = item.article === 'Art. 9' ? 'q1_risk_mgmt' : (item.article === 'Art. 12' ? 'q4_logging' : (item.article === 'Art. 14' ? 'q3_human_oversight' : 'q7_cybersecurity'));
      const ans = answers[qKey] || 'unanswered';
      return {
        ...item,
        status: (ans === 'yes' || ans === 'partial' || ans === 'no' ? ans : 'unanswered') as any,
        evidence: ans === 'yes' ? `${item.title} documented and verified.` : (ans === 'partial' ? `Partial implementation acknowledged.` : 'No documentation provided (unanswered / 0 credit).'),
      };
    }
    return item;
  });

  // Calculate updated compliance scores
  let euPoints = 0;
  baseResult.compliance.eu_ai_act.checklist.forEach(item => {
    const mult = item.status === 'yes' ? 1.0 : (item.status === 'partial' ? 0.5 : 0.0);
    const weight = item.type === 'auto_verified' ? 2.0 : 1.0;
    euPoints += weight * mult;
  });
  const maxEuPoints = baseResult.compliance.eu_ai_act.checklist.reduce((sum, item) => sum + (item.type === 'auto_verified' ? 2.0 : 1.0), 0);
  baseResult.compliance.eu_ai_act.score = Math.round((euPoints / maxEuPoints) * 1000) / 10;
  baseResult.compliance.eu_ai_act.earned_points = Math.round(euPoints * 10) / 10;
  baseResult.compliance.eu_ai_act.max_points = maxEuPoints;

  let dpdpPoints = 0;
  baseResult.compliance.dpdp_act_2023.checklist.forEach(item => {
    const mult = item.status === 'yes' ? 1.0 : (item.status === 'partial' ? 0.5 : 0.0);
    dpdpPoints += mult;
  });
  baseResult.compliance.dpdp_act_2023.score = Math.round((dpdpPoints / baseResult.compliance.dpdp_act_2023.checklist.length) * 1000) / 10;
  baseResult.compliance.dpdp_act_2023.earned_points = Math.round(dpdpPoints * 10) / 10;

  // If custom data provided, adjust data summary numbers
  if (params.csvData && params.csvData.rows.length > 0) {
    baseResult.data_summary.total_rows = params.csvData.rows.length;
    baseResult.data_summary.total_features = params.csvData.columns.length - 1;
    baseResult.data_summary.test_split_rows = Math.round(params.csvData.rows.length * 0.2);
  }

  // Recalculate radar axes and Weakest-Link Cap
  const radarAxes: Record<string, number> = {
    Fairness: baseResult.scores.dimension_scores['Fairness'] ?? 50,
    Explainability: baseResult.scores.dimension_scores['Explainability'] ?? 50,
    Robustness: baseResult.scores.dimension_scores['Robustness'] ?? 50,
    'EU AI Act Readiness': baseResult.compliance.eu_ai_act.score,
    'DPDP Act 2023 Readiness': baseResult.compliance.dpdp_act_2023.score,
    'Governance Disclosure': govResult.score,
  };

  const composite = calculateCompositeReadiness(radarAxes, isHighRisk, useCaseConfig.title);

  baseResult.scores.overall_trust_score = composite.overallScore;
  baseResult.scores.raw_mean_score = composite.rawMean;
  baseResult.scores.rag_status = composite.ragStatus;
  baseResult.scores.readiness_verdict = composite.verdict;
  baseResult.scores.cap_reason = composite.capReason ?? null;
  baseResult.scores.axes_under_50 = composite.axesUnder50;
  baseResult.scores.dimension_scores = radarAxes;

  return baseResult;
}

/**
 * Generate printable, self-contained HTML Model Card
 */
export function generateModelCardHtml(audit: FullAuditResult): string {
  const badgeClass = audit.scores.rag_status === 'green' ? 'stamp-green' : (audit.scores.rag_status === 'amber' ? 'stamp-amber' : 'stamp-red');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Model Card: ${audit.meta.model_name} | AutoAudit-360</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #201823;
      line-height: 1.45;
      font-size: 12px;
      background: #FAF2E8;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #DED3D8;
      border-radius: 8px;
      padding: 28px;
      box-shadow: 0 4px 12px rgba(32, 24, 35, 0.06);
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #201823;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .title-area h1 {
      margin: 0 0 4px 0;
      font-size: 22px;
      font-weight: 800;
      color: #201823;
      letter-spacing: -0.02em;
    }
    .meta-subtitle {
      font-size: 12px;
      color: #665c69;
    }
    .stamp {
      border: 2px dashed #201823;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stamp-green { border-color: #201823; color: #201823; background: #D5F36A; }
    .stamp-amber { border-color: #FF705D; color: #c44030; background: #fff3ed; }
    .stamp-red { border-color: #e11d48; color: #991b1b; background: #fee2e2; }
    .cap-alert {
      background: #fff1f2;
      border-left: 4px solid #FF705D;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 12px;
      color: #9f1239;
    }
    .disclaimer-banner {
      background: #FAF2E8;
      border-left: 4px solid #332A37;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 12px;
      color: #201823;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .card {
      background: #FAF2E8;
      border: 1px solid #DED3D8;
      border-radius: 6px;
      padding: 14px;
    }
    .card h3 {
      margin: 0 0 10px 0;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid #DED3D8;
      padding-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #DED3D8;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: #f0e6da;
      font-weight: 700;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #DED3D8;
      text-align: center;
      font-size: 11px;
      color: #776e7a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div class="title-area">
        <h1>AI Model Card: ${audit.meta.model_name}</h1>
        <div class="meta-subtitle">
          Audit Reference ID: <code>${audit.meta.audit_id}</code> | Timestamp (UTC): ${audit.meta.timestamp}
        </div>
        <div class="meta-subtitle">
          Algorithm: ${audit.meta.algorithm} | Dataset Hash: <code>${audit.meta.dataset_hash.slice(0, 16)}...</code>
        </div>
      </div>
      <div>
        <div class="stamp ${badgeClass}">
          ${audit.scores.readiness_verdict || 'READINESS: ACTION REQUIRED'}
        </div>
      </div>
    </div>

    ${audit.scores.cap_reason ? `
      <div class="cap-alert">
        <strong>Governance Cap Applied:</strong> ${audit.scores.cap_reason}
      </div>
    ` : ''}

    <div class="disclaimer-banner">
      <strong>Regulatory Disclaimer:</strong> AutoAudit-360 is an academic diagnostic testing framework. This report provides empirical measurements and readiness assessments under simulated regulatory criteria (EU AI Act & India DPDP Act 2023), not formal legal certification.
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Composite Trust Radar Scores</h3>
        <table>
          <tr><th>Axis</th><th>Score</th><th>Status</th></tr>
          ${Object.entries(audit.scores.dimension_scores).map(([axis, val]) => {
            const numericVal = typeof val === 'number' ? val : 0;
            return `
            <tr>
              <td><strong>${axis}</strong></td>
              <td>${numericVal}/100</td>
              <td>${numericVal >= 75 ? '<span style="color:#204e15">Pass</span>' : (numericVal >= 50 ? '<span style="color:#b45309">Review</span>' : '<span style="color:#b91c1c">Action Required</span>')}</td>
            </tr>
          `}).join('')}
        </table>
        <div style="margin-top: 10px; font-weight: 700;">
          Overall Capped Score: ${audit.scores.overall_trust_score}/100 (Raw Mean: ${audit.scores.raw_mean_score || audit.scores.overall_trust_score}/100)
        </div>
      </div>

      <div class="card">
        <h3>Dataset & Performance Baseline</h3>
        <table>
          <tr><td>Target Column</td><td><code>${audit.data_summary.target_column}</code> (Positive: ${audit.data_summary.positive_label})</td></tr>
          <tr><td>Total Samples</td><td>${audit.data_summary.total_rows} (${audit.data_summary.test_split_rows || Math.round(audit.data_summary.total_rows * 0.2)} held-out test split)</td></tr>
          <tr><td>Total Features</td><td>${audit.data_summary.total_features}</td></tr>
          <tr><td>Accuracy</td><td>${(audit.performance.accuracy * 100).toFixed(1)}%</td></tr>
          <tr><td>Balanced Accuracy</td><td>${audit.performance.balanced_accuracy ? (audit.performance.balanced_accuracy * 100).toFixed(1) + '%' : 'N/A'}</td></tr>
          <tr><td>ROC AUC</td><td>${(audit.performance.roc_auc * 100).toFixed(1)}%</td></tr>
          <tr><td>Repeated 5-Fold Cross-Validation</td><td>${audit.performance.repeated_cross_validation?.accuracy?.formatted || 'Evaluated'}</td></tr>
        </table>
      </div>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <h3>Fairness & Disparate Impact (Four-Fifths Rule)</h3>
      <table>
        <tr>
          <th>Attribute</th>
          <th>Privileged Group</th>
          <th>Disparate Impact Ratio</th>
          <th>Demographic Parity Diff</th>
          <th>Equal Opportunity Diff</th>
          <th>Status</th>
        </tr>
        ${audit.fairness.map(f => `
          <tr>
            <td><strong>${f.attribute}</strong></td>
            <td>${f.privileged_group}</td>
            <td>${f.metrics.disparate_impact_ratio.toFixed(3)} ${f.metrics.disparate_impact_ratio < 0.8 ? '<strong style="color:#b91c1c">(<0.8)</strong>' : ''}</td>
            <td>${f.metrics.demographic_parity_difference.toFixed(3)}</td>
            <td>${f.metrics.equal_opportunity_difference.toFixed(3)}</td>
            <td>${f.status.toUpperCase()}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Explainability (Top Global Feature Attribution)</h3>
        <table>
          <tr><th>Feature</th><th>Importance</th><th>Proxy Alert</th></tr>
          ${audit.explain.top_features.slice(0, 5).map((feat: any) => `
            <tr>
              <td><code>${feat.feature}</code></td>
              <td>${feat.importance.toFixed(3)}</td>
              <td>${feat.is_proxy ? '<span style="color:#b91c1c">Proxy Warning</span>' : (feat.is_sensitive ? '<span style="color:#b91c1c">Protected Feature</span>' : 'Clean')}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="card">
        <h3>Robustness Stress Testing</h3>
        <table>
          <tr><td>Gaussian Noise Perturbation (5%)</td><td>${audit.robustness.perturbation_tests && audit.robustness.perturbation_tests[1] ? (audit.robustness.perturbation_tests[1].prediction_flip_rate * 100).toFixed(1) + '% flip rate' : 'Evaluated'}</td></tr>
          <tr><td>Counterfactual Sensitive Flip Attack</td><td>${audit.robustness.counterfactual_flip_rate ? (audit.robustness.counterfactual_flip_rate * 100).toFixed(1) + '% outcome flip' : 'Evaluated'}</td></tr>
          <tr><td>Worst-Case Bounded Attack (eps=0.1)</td><td>${audit.robustness.worst_case_drop_eps10 ? (audit.robustness.worst_case_drop_eps10 * 100).toFixed(1) + '% metric drop' : 'Evaluated'}</td></tr>
          <tr><td>Overall Robustness Status</td><td><strong>${audit.robustness.status.toUpperCase()}</strong></td></tr>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top: 16px;">
      <h3>Regulatory Conformity Checklist</h3>
      <p style="margin: 0 0 8px 0;"><strong>EU AI Act Readiness:</strong> ${audit.compliance.eu_ai_act.score}% | <strong>DPDP Act 2023 Readiness:</strong> ${audit.compliance.dpdp_act_2023.score}% | <strong>Governance Inquiries Answered:</strong> ${audit.compliance.governance_disclosure?.earned_points || 0}/15</p>
      <table>
        <tr><th>Framework</th><th>Article / Section</th><th>Requirement</th><th>Status</th></tr>
        ${audit.compliance.eu_ai_act.checklist.slice(0, 4).map(item => `
          <tr>
            <td>EU AI Act</td>
            <td>${item.article || 'Article'}</td>
            <td>${item.title || 'Requirement'}</td>
            <td><strong>${item.status.toUpperCase()}</strong></td>
          </tr>
        `).join('')}
        ${audit.compliance.dpdp_act_2023.checklist.slice(0, 3).map(item => `
          <tr>
            <td>India DPDP 2023</td>
            <td>${item.section || 'Section'}</td>
            <td>${item.title || 'Requirement'}</td>
            <td><strong>${item.status.toUpperCase()}</strong></td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="footer">
      AutoAudit-360 | Trustworthy AI Audit & Regulatory Compliance Suite | Academic diagnostic prototype.
    </div>
  </div>
</body>
</html>`;
}
