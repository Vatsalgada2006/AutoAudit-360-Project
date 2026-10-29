export interface MetricScore {
  accuracy: number;
  balanced_accuracy?: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  repeated_cross_validation?: {
    accuracy?: { mean: number; std: number; formatted: string };
    f1_score?: { mean: number; std: number; formatted: string };
    roc_auc?: { mean: number; std: number; formatted: string };
    seeds_evaluated?: number;
  };
}

export interface SubgroupStats {
  size: number;
  selection_rate: number;
  tpr: number;
  fpr: number;
  fnr: number;
  tnr: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface FairnessAuditItem {
  attribute: string;
  privileged_group: string;
  status: 'pass' | 'warn' | 'fail';
  severity: 'none' | 'low' | 'medium' | 'high';
  finding: string;
  is_intersectional?: boolean;
  test_sample_size?: number;
  metrics: {
    disparate_impact_ratio: number;
    demographic_parity_difference: number;
    equal_opportunity_difference: number;
    equalized_odds_gap: number;
    worst_fpr_gap: number;
  };
  confidence_intervals_95?: {
    disparate_impact: [number, number];
    demographic_parity_difference: [number, number];
    equal_opportunity_difference: [number, number];
  };
  subgroup_breakdown: Record<string, SubgroupStats>;
  di_per_subgroup: Record<string, number>;
  small_group_warnings: Array<{ group: string; size: number }>;
  chart_data: {
    labels: string[];
    selection_rates_pct: number[];
    ci_whiskers_pct?: Array<[number, number]>;
    eighty_percent_line_pct: number;
    privileged_rate_pct: number;
  };
}

export interface TopFeature {
  feature: string;
  importance: number;
  is_sensitive: boolean;
  is_proxy: boolean;
  proxy_correlation?: number;
}

export interface ExplainabilityAudit {
  status: 'pass' | 'warn' | 'fail';
  severity: 'none' | 'low' | 'medium' | 'high';
  explainer_type: string;
  shap_success: boolean;
  finding: string;
  disclaimer: string;
  top_features: TopFeature[];
  sensitive_in_top_5?: string[];
  proxies_in_top_5?: Array<{ feature: string; sensitive_attribute: string; correlation: number }>;
  flagged_count: number;
  chart_data: {
    labels: string[];
    values: number[];
  };
}

export interface LabelFlipTest {
  flip_rate_pct: number;
  accuracy: number;
  f1: number;
  roc_auc: number;
  accuracy_drop: number;
  f1_drop: number;
  roc_auc_drop: number;
  relative_metric_drop: number;
}

export interface PerturbationTest {
  noise_level_pct: number;
  prediction_flip_rate: number;
  accuracy: number;
  accuracy_drop: number;
  disparate_impact: number;
  di_delta: number;
}

export interface BoundedAttackTest {
  epsilon: number;
  prediction_flip_rate: number;
  accuracy: number;
  accuracy_drop: number;
}

export interface RobustnessAudit {
  status: 'pass' | 'warn' | 'fail';
  severity: 'none' | 'low' | 'medium' | 'high';
  finding: string;
  baseline_metrics?: { accuracy: number; f1: number; roc_auc: number };
  robustness_score?: number | null;
  metric_drop_10pct?: number | null;
  prediction_flip_rate_5pct?: number | null;
  counterfactual_flip_rate?: number | null;
  counterfactual_results?: Record<string, { total_tested: number; flips: number; flip_rate: number }>;
  categorical_swap_flips?: number | null;
  worst_case_drop_eps10?: number | null;
  fairness_stability_delta?: number | null;
  multi_attribute_stability?: Record<string, number>;
  bounded_attack_tests?: BoundedAttackTest[];
  label_flip_tests?: LabelFlipTest[];
  perturbation_tests?: PerturbationTest[];
  chart_data?: {
    label_flips?: {
      x_labels: string[];
      accuracy: number[];
      f1: number[];
      roc_auc: number[];
    };
    perturbation?: {
      x_labels: string[];
      flip_rates: number[];
      di_stability?: number[];
    };
  };
}

export interface ChecklistItem {
  article?: string;
  section?: string;
  title?: string;
  principle?: string;
  type: 'auto_verified' | 'self_declared';
  requirement: string;
  status: 'yes' | 'partial' | 'no' | 'unanswered';
  evidence: string;
}

export interface ComplianceFrameworkResult {
  score: number;
  earned_points: number;
  max_points: number;
  checklist: ChecklistItem[];
  gaps: string[];
  remediations: string[];
}

export interface ComplianceAudit {
  use_case: {
    title: string;
    annex_ref: string;
    is_high_risk: boolean;
    description: string;
  };
  is_high_risk: boolean;
  pii_and_sensitive_signals: {
    detected_pii_columns: string[];
    has_aadhaar_pattern: boolean;
    has_minors: boolean;
    minors_count: number;
    age_column: string | null;
  };
  eu_ai_act: ComplianceFrameworkResult & { classification: string };
  dpdp_act_2023: ComplianceFrameworkResult;
  governance_disclosure?: ComplianceFrameworkResult;
}

export interface AuditScores {
  overall_trust_score: number;
  raw_mean_score?: number;
  rag_status: 'green' | 'amber' | 'red';
  readiness_verdict?: string;
  stamp?: string;
  verdict_statement?: string;
  verdict_summary?: string;
  cap_reason?: string | null;
  axes_under_50?: string[];
  dimension_scores: Record<string, number | null>;
}

export interface MitigationResult {
  sensitive_attribute: string;
  privileged_group: string;
  baseline: {
    disparate_impact: number;
    demographic_parity_diff: number;
    equal_opportunity_diff: number;
    accuracy: number;
    recall: number;
  };
  reweighed: {
    disparate_impact: number;
    demographic_parity_diff: number;
    equal_opportunity_diff: number;
    accuracy: number;
    recall: number;
    di_improvement: number;
  };
  threshold_adjustments?: Array<{
    threshold: number;
    disparate_impact: number;
    demographic_parity_diff: number;
    accuracy: number;
    recall: number;
  }>;
}

export interface AuditMeta {
  audit_id: string;
  timestamp: string;
  model_name: string;
  system?: string;
  algorithm: string;
  is_default_trained: boolean;
  framework: string;
  random_seed: number;
  dataset_hash: string;
  audit_mode?: string;
  author: {
    system: string;
    version: string;
    framework: string;
    academic_affiliation: string;
  };
}

export interface DataSummary {
  total_rows: number;
  test_split_rows?: number;
  total_features: number;
  target_column: string;
  positive_label: string;
  positive_rate: number;
  sensitive_attributes: string[];
  missing_percentage: number;
  is_pred_col_mode?: boolean;
}

export interface FullAuditResult {
  meta: AuditMeta;
  data_summary: DataSummary;
  performance: MetricScore;
  fairness: FairnessAuditItem[];
  explain: ExplainabilityAudit;
  robustness: RobustnessAudit;
  compliance: ComplianceAudit;
  scores: AuditScores;
  mitigation?: MitigationResult | null;
  limitations: string[];
}
