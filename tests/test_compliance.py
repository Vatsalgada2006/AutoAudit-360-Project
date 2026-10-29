"""
Tests for Compliance Auditor: EU AI Act Annex III and India DPDP Act 2023.
"""

import pytest
import pandas as pd
from auditors.compliance import audit_compliance, detect_pii_and_sensitive_data

def test_detect_pii_and_minors():
    df = pd.DataFrame({
        "customer_name": ["Alice", "Bob", "Charlie"],
        "email_address": ["a@ex.com", "b@ex.com", "c@ex.com"],
        "age": [16, 25, 42]
    })
    
    signals = detect_pii_and_sensitive_data(df)
    assert len(signals["detected_pii_columns"]) >= 2
    assert signals["has_minors"] is True
    assert signals["minors_count"] == 1

def test_compliance_scoring():
    df = pd.DataFrame({"x": [1, 2, 3], "y": [0, 1, 1]})
    res = audit_compliance(
        use_case_key="credit_scoring",
        fairness_results=[{"status": "pass"}],
        explain_results={"status": "pass"},
        robustness_results={"status": "pass"},
        df=df
    )
    
    assert res["is_high_risk"] is True
    assert 0 <= res["eu_ai_act"]["score"] <= 100
    assert 0 <= res["dpdp_act_2023"]["score"] <= 100
    assert len(res["eu_ai_act"]["checklist"]) >= 7
    assert len(res["dpdp_act_2023"]["checklist"]) >= 7
