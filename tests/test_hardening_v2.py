"""
AutoAudit-360 Hardening v2 Test Suite
Tests scoring integrity, weakest-link capping, N/A handling, held-out test fairness,
bootstrap CIs, counterfactual flips, predictions column mode, path traversal rejection,
job API polling, questionnaire sensitivity, and zero personal identifiers.
"""

import os
import re
import json
import pytest
import numpy as np
import pandas as pd
from unittest.mock import patch

from audit_model import run_audit
from app import app, validate_identifier
from auditors.compliance import audit_compliance, compute_governance_disclosure_score
from auditors.fairness import compute_bootstrap_cis

@pytest.fixture
def sample_dataset():
    np.random.seed(42)
    n = 200
    df = pd.DataFrame({
        "target": np.random.choice([0, 1], size=n, p=[0.4, 0.6]),
        "Sex": np.random.choice(["Male", "Female"], size=n, p=[0.6, 0.4]),
        "Age": np.random.randint(18, 70, size=n),
        "credit_score": np.random.normal(650, 40, size=n),
        "income": np.random.exponential(4000, size=n),
        "decile_score": np.random.randint(1, 11, size=n)
    })
    return df

def test_weakest_link_cap_single_axis(sample_dataset):
    """Test weakest-link rule: any axis < 50 -> overall score capped at 74.9 (Amber)."""
    # Provide questionnaire with all 'no' so Governance Disclosure is 0
    zero_questionnaire = {f"q{i}": "no" for i in range(1, 16)}
    res = run_audit(
        df=sample_dataset,
        target_col="target",
        sensitive_cols=["Sex"],
        positive_label=1,
        use_case="customer_service_general", # Non-high-risk
        questionnaire=zero_questionnaire
    )
    scores = res["scores"]
    assert scores["overall_trust_score"] <= 74.9
    assert scores["rag_status"] in ["amber", "red"]
    assert scores["cap_reason"] is not None
    assert "Weakest-Link Cap applied" in scores["cap_reason"]

def test_weakest_link_cap_high_risk_fairness(sample_dataset):
    """Test weakest-link rule: fairness < 50 on High-Risk use case -> capped at 49.9 (Red)."""
    # Create extreme bias in target for Female
    df_biased = sample_dataset.copy()
    df_biased.loc[df_biased["Sex"] == "Female", "target"] = 0
    df_biased.loc[df_biased["Sex"] == "Male", "target"] = 1

    res = run_audit(
        df=df_biased,
        target_col="target",
        sensitive_cols=["Sex"],
        positive_label=1,
        use_case="credit_scoring", # High-risk Annex III 5(b)
        questionnaire={f"q{i}": "yes" for i in range(1, 16)}
    )
    scores = res["scores"]
    assert scores["overall_trust_score"] <= 49.9
    assert scores["rag_status"] == "red"
    assert "READINESS: ACTION REQUIRED" in scores["readiness_verdict"]
    assert "High-Risk" in scores["cap_reason"]

def test_na_handling_without_silent_defaults():
    """Missing or uncomputed results must produce None, shown as N/A and excluded from mean."""
    df_small = pd.DataFrame({
        "target": [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        "gender": ["M", "F", "M", "F", "M", "F", "M", "F", "M", "F"],
        "pred_score": [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
    })
    # Run in pred_col mode where SHAP and perturbation attacks are not executed
    res = run_audit(
        df=df_small,
        target_col="target",
        sensitive_cols=["gender"],
        positive_label=1,
        pred_col="pred_score"
    )
    dim_scores = res["scores"]["dimension_scores"]
    # Explainability and Robustness should be None
    assert dim_scores["Explainability"] is None
    assert dim_scores["Robustness"] is None
    # Limitations must flag them
    assert any("Explainability score could not be computed" in lim for lim in res["limitations"])
    assert any("Robustness score could not be computed" in lim for lim in res["limitations"])

def test_fairness_test_split_only(sample_dataset):
    """Fairness metrics must be computed strictly on held-out test split only with sample sizes & CIs."""
    res = run_audit(
        df=sample_dataset,
        target_col="target",
        sensitive_cols=["Sex"],
        positive_label=1,
        use_case="credit_scoring"
    )
    fairness = res["fairness"]
    assert len(fairness) >= 1
    item = fairness[0]
    assert "test_sample_size" in item
    assert item["test_sample_size"] == int(len(sample_dataset) * 0.20)
    assert "confidence_intervals_95" in item
    assert "disparate_impact" in item["confidence_intervals_95"]
    ci = item["confidence_intervals_95"]["disparate_impact"]
    assert len(ci) == 2
    assert ci[0] <= ci[1]

def test_bootstrap_ci_computation():
    """Verify bootstrap 95% CI algorithm bounds."""
    y_true = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 1] * 10)
    y_pred = np.array([1, 0, 1, 0, 0, 1, 0, 0, 1, 0] * 10)
    sensitive = pd.Series(["A", "B", "A", "B", "A", "B", "A", "B", "A", "B"] * 10)
    
    ci_results = compute_bootstrap_cis(y_true, y_pred, sensitive, priv_group="A", n_replications=100)
    assert "disparate_impact_ci_95" in ci_results
    assert "demographic_parity_diff_ci_95" in ci_results
    di_ci = ci_results["disparate_impact_ci_95"]
    assert di_ci[0] >= 0.0
    assert di_ci[0] <= di_ci[1]

def test_counterfactual_flip_and_perturbations(sample_dataset):
    """Verify adversarial robustness computes counterfactual flips and bounded coordinate attacks."""
    res = run_audit(
        df=sample_dataset,
        target_col="target",
        sensitive_cols=["Sex"],
        positive_label=1,
        use_case="credit_scoring"
    )
    rob = res["robustness"]
    assert "counterfactual_flip_rate" in rob
    assert rob["counterfactual_flip_rate"] is not None
    assert 0.0 <= rob["counterfactual_flip_rate"] <= 1.0
    assert "bounded_attack_tests" in rob
    assert len(rob["bounded_attack_tests"]) >= 1

def test_predictions_column_mode(sample_dataset):
    """Audit directly using dataset predictions column (--pred_col) without model file."""
    res = run_audit(
        df=sample_dataset,
        target_col="target",
        sensitive_cols=["Sex"],
        positive_label=1,
        pred_col="decile_score",
        pred_threshold=5.0
    )
    assert res["meta"]["is_pred_col_mode"] is True
    assert "decile_score" in res["meta"]["algorithm"]
    assert res["scores"]["overall_trust_score"] is not None

def test_questionnaire_sensitivity(sample_dataset):
    """Verify EU AI Act and DPDP scores change when questionnaire answers change; unanswered = 0 credit."""
    q_yes = {f"q{i}": "yes" for i in range(1, 16)}
    q_unanswered = {f"q{i}": "unanswered" for i in range(1, 16)}

    res_yes = audit_compliance(use_case_key="credit_scoring", fairness_results=[], explain_results={}, robustness_results={}, df=sample_dataset, questionnaire=q_yes)
    res_un = audit_compliance(use_case_key="credit_scoring", fairness_results=[], explain_results={}, robustness_results={}, df=sample_dataset, questionnaire=q_unanswered)

    # Score with full 'yes' must be significantly higher than full 'unanswered' (which awards 0 credit)
    assert res_yes["eu_ai_act"]["score"] > res_un["eu_ai_act"]["score"]
    assert res_yes["dpdp_act_2023"]["score"] > res_un["dpdp_act_2023"]["score"]
    assert res_yes["governance_disclosure"]["score"] == 100.0
    assert res_un["governance_disclosure"]["score"] == 0.0

def test_security_identifier_validation():
    """Verify regex ^[A-Za-z0-9_-]{1,40}$ blocks path traversal and malicious payloads."""
    assert validate_identifier("audit_1234") is True
    assert validate_identifier("german-credit_demo") is True
    
    # Path traversal and injection attacks must be rejected
    assert validate_identifier("../../etc/passwd") is False
    assert validate_identifier("../outputs/secret.json") is False
    assert validate_identifier("audit; rm -rf /") is False
    assert validate_identifier("audit<script>") is False
    assert validate_identifier("a" * 45) is False # > 40 chars
    assert validate_identifier("") is False

def test_job_polling_api():
    """Verify background job creation (202 Accepted) and polling endpoint."""
    client = app.test_client()
    
    # Check invalid identifier returns 400
    res_bad = client.get("/api/audit/invalid..id!!")
    assert res_bad.status_code == 400
    
    # Trigger demo load to ensure dataset exists in cache
    demo_res = client.get("/api/demo/german_credit")
    assert demo_res.status_code == 200
    data = demo_res.get_json()
    dataset_id = data["dataset_id"]

    # Dispatch async audit job
    audit_res = client.post("/api/audit", json={
        "dataset_id": dataset_id,
        "target": "Creditability",
        "sensitive": ["Sex"],
        "positive_label": 1
    })
    assert audit_res.status_code == 202
    job_info = audit_res.get_json()
    assert "job_id" in job_info
    job_id = job_info["job_id"]

    # Poll status
    poll_res = client.get(f"/api/audit/{job_id}")
    assert poll_res.status_code == 200
    poll_data = poll_res.get_json()
    assert "status" in poll_data
    assert "progress" in poll_data

def test_zero_personal_identifiers_in_repo():
    """
    Section G: Must fail if any personal or student details
    ('vatsal', 'gada', '124btai', 'roll no', 'ty-aids', 'sakec')
    appear in the codebase, UI, configs, or outputs.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prohibited_patterns = [
        re.compile(p, re.IGNORECASE)
        for p in [r"\bvatsal\b", r"\bgada\b", r"124btai", r"roll\s*no[:\s]*12", r"ty-aids", r"\bsakec\b"]
    ]

    extensions_to_check = {".py", ".ts", ".tsx", ".html", ".json", ".md", ".yml", ".yaml"}
    ignore_dirs = {".git", "node_modules", ".pytest_cache", "__pycache__", ".vscode", "dist"}

    offending_files = []

    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for f in files:
            # Skip this test file itself and git log/archives
            if f in ["test_hardening_v2.py", "autoaudit-360-complete.zip", "package-lock.json", "bun.lock"]:
                continue
            ext = os.path.splitext(f)[1].lower()
            if ext in extensions_to_check:
                file_path = os.path.join(root, f)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                        for pattern in prohibited_patterns:
                            if pattern.search(content):
                                offending_files.append((file_path, pattern.pattern))
                except Exception:
                    pass

    assert len(offending_files) == 0, f"Found personal identifiers in files: {offending_files}"
