"""
Tests for Fairness Auditor: Four-Fifths Rule, Demographic Parity, Equal Opportunity, and Equalized Odds.
"""

import pytest
import pandas as pd
import numpy as np
from auditors.fairness import audit_fairness, bin_continuous_attribute

def test_bin_continuous_attribute():
    ages = pd.Series([20, 22, 35, 45, 65, 70], name="Age")
    binned = bin_continuous_attribute(ages)
    assert binned.iloc[0] == "Young (<25)"
    assert binned.iloc[2] == "Prime (25-60)"
    assert binned.iloc[4] == "Senior (>60)"

def test_audit_fairness_synthetic():
    np.random.seed(42)
    n = 200
    df = pd.DataFrame({
        "Sex": np.random.choice(["Male", "Female"], size=n, p=[0.5, 0.5]),
        "y": np.random.choice([0, 1], size=n, p=[0.4, 0.6])
    })
    y_pred = df["y"].values
    
    results = audit_fairness(
        df=df,
        target_col="y",
        y_pred=y_pred,
        sensitive_cols=["Sex"],
        positive_label=1
    )
    
    assert len(results) == 1
    res = results[0]
    assert res["attribute"] == "Sex"
    assert "metrics" in res
    assert "disparate_impact_ratio" in res["metrics"]
    assert "demographic_parity_difference" in res["metrics"]
    assert "chart_data" in res
    assert res["status"] in ["pass", "warn", "fail"]
