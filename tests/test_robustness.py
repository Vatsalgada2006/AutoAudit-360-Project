"""
Tests for Robustness Auditor: Label Poisoning, Gaussian Perturbation, and Fairness Stability.
"""

import pytest
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from auditors.robustness import audit_robustness

def test_robustness_perturbation():
    np.random.seed(42)
    n = 120
    X = pd.DataFrame({
        "num1": np.random.normal(0, 1, size=n),
        "num2": np.random.normal(5, 2, size=n),
        "cat1": np.random.choice(["A", "B"], size=n)
    })
    y = (X["num1"] + X["num2"] > 5).astype(int)
    
    # Simple numerical mapping for RF
    X_num = X.copy()
    X_num["cat1"] = (X_num["cat1"] == "A").astype(int)
    
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X_num, y)
    
    res = audit_robustness(
        model=model,
        X_train=X_num,
        y_train=y,
        X_test=X_num,
        y_test=y,
        sensitive_col="cat1"
    )
    
    assert "status" in res
    assert "metric_drop_10pct" in res
    assert "prediction_flip_rate_5pct" in res
    assert "fairness_stability_delta" in res
    assert len(res["label_flip_tests"]) == 3
    assert len(res["perturbation_tests"]) == 3
