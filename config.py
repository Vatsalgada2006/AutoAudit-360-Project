"""
AutoAudit-360 Configuration & Scoring Specification
Domain: AI Governance, Policy & Risk Management
Architecture: Trustworthy AI Audit & Regulatory Compliance Suite
"""

# Thresholds for Algorithmic Fairness & Disparate Impact (Four-Fifths Rule)
THRESHOLDS = {
    # Disparate Impact (EEOC 80% Rule)
    "disparate_impact": {
        "pass": 0.80,
        "warn": 0.70,  # [0.70, 0.80) is warning
        "fail": 0.70,  # < 0.70 is fail
    },
    # Demographic Parity Difference (DPD) & Equal Opportunity Difference (EOD)
    "parity_gap": {
        "pass": 0.10,
        "warn": 0.20,  # (0.10, 0.20] is warning
        "fail": 0.20,  # > 0.20 is fail
    },
    # Robustness Metric Drop at 10% synthetic label flips
    "robustness_metric_drop_10pct": {
        "pass": 0.05,  # <= 5% drop is pass
        "warn": 0.12,  # 5% to 12% is warn, > 12% is fail
    },
    # Perturbation Flip Rate at 5% noise
    "perturbation_flip_rate_5pct": {
        "pass": 0.08,
        "warn": 0.18,
    },
    # Counterfactual Sensitive Flip Rate Tolerance
    "counterfactual_flip_rate": {
        "pass": 0.05,
        "warn": 0.15,
    },
    # Worst-case bounded perturbation drop (eps=0.10)
    "worst_case_drop_eps10": {
        "pass": 0.08,
        "warn": 0.18,
    },
    # Minimum sample size per demographic subgroup to prevent statistical noise
    "min_subgroup_sample_size": 30,
    # Bootstrap replications for 95% Confidence Intervals
    "bootstrap_replications": 500,
    # Correlation threshold to consider a non-sensitive feature as a "proxy" attribute
    "proxy_correlation_threshold": 0.40,
    # Max samples for SHAP background to stay within execution budget
    "shap_max_background_samples": 80,
    "shap_max_eval_samples": 200,
}

PROJECT_TITLE = "AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite"
PROJECT_SUBTITLE = "Domain: AI Governance, Policy & Risk Management | Modules 1-4: Trustworthy AI pipeline, AI Model Card, EU AI Act, India DPDP Act 2023"
NEUTRAL_FOOTER = "AutoAudit-360 | Academic prototype | Diagnostic findings, not legal certification."

# RAG Status Thresholds
RAG_THRESHOLDS = {
    "green": 75.0,  # Score >= 75: Green (Readiness: Pass)
    "amber": 50.0,  # Score 50 - 74.9: Amber (Readiness: Needs Review)
    "red": 0.0,     # Score < 50: Red (Readiness: Action Required)
}

# Verdict / Stamp Definitions (Neutral readiness terminology - no legal certification claims)
VERDICTS = {
    "green": "READINESS: PASS",
    "amber": "READINESS: NEEDS REVIEW",
    "red": "READINESS: ACTION REQUIRED"
}

# Weakest-link Cap Rules
CAP_RULES = {
    "single_axis_fail_cap": 74.9,       # Any axis < 50 -> overall capped at 74.9 (Amber)
    "high_risk_fairness_cap": 49.9,     # Fairness < 50 on High-Risk use case -> capped at 49.9 (Red)
    "multi_axis_fail_cap": 49.9,        # Two or more axes < 50 -> capped at 49.9 (Red)
}

# Weights for Regulatory Compliance Checklist
COMPLIANCE_WEIGHTS = {
    "auto_verified": 2.0,
    "self_declared": 1.0,
    "yes_multiplier": 1.0,
    "partial_multiplier": 0.5,
    "no_multiplier": 0.0,
    "unanswered_multiplier": 0.0,
}

# 6 Trust Radar Axes
RADAR_AXES = [
    "Fairness",
    "Explainability",
    "Robustness",
    "EU AI Act Readiness",
    "DPDP Act 2023 Readiness",
    "Governance Disclosure"
]

RANDOM_SEED = 42
UPLOAD_MAX_BYTES = 20 * 1024 * 1024  # 20 MB limit
ALLOW_MODEL_UPLOAD_DEFAULT = False
