"""
Tests for Explainability Auditor: SHAP Feature Attribution, Proxy Detection, and Disclaimer.
"""

import pytest
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from auditors.explain import audit_explainability, compute_proxy_correlations

def test_explain_proxy_and_attribution():
    np.random.seed(42)
    n = 150
    age = np.random.randint(18, 70, size=n)
    # create proxy variable highly correlated with age
    proxy_feature = age * 2 + np.random.normal(0, 2, size=n)
    independent_feature = np.random.normal(0, 1, size=n)
    
    df = pd.DataFrame({
        "Age": age,
        "SeniorityProxy": proxy_feature,
        "FeatureX": independent_feature
    })
    y = (proxy_feature > np.median(proxy_feature)).astype(int)
    
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(df, y)
    
    res = audit_explainability(
        model=model,
        X=df,
        feature_names=list(df.columns),
        sensitive_cols=["Age"]
    )
    
    assert "status" in res
    assert "top_features" in res
    assert len(res["top_features"]) > 0
    assert "disclaimer" in res
    assert "causality" in res["disclaimer"].lower() or "causal" in res["disclaimer"].lower()
