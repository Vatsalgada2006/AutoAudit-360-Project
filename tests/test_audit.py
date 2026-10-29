"""
End-to-End Pipeline Tests for AutoAudit-360.
"""

import pytest
import pandas as pd
import numpy as np
from audit_model import run_audit

def test_full_pipeline_audit():
    np.random.seed(42)
    n = 100
    df = pd.DataFrame({
        "target": np.random.choice([0, 1], size=n),
        "gender": np.random.choice(["Male", "Female"], size=n),
        "age": np.random.randint(18, 70, size=n),
        "income": np.random.exponential(3000, size=n),
        "score": np.random.normal(650, 50, size=n)
    })

    audit_res = run_audit(
        df=df,
        target_col="target",
        sensitive_cols=["gender", "age"],
        positive_label=1,
        use_case="credit_scoring"
    )

    assert "scores" in audit_res
    assert "overall_trust_score" in audit_res["scores"]
    assert "rag_status" in audit_res["scores"]
    assert audit_res["scores"]["rag_status"] in ["green", "amber", "red"]
    assert len(audit_res["fairness"]) >= 2
    assert "performance" in audit_res
    assert "compliance" in audit_res
    assert "explain" in audit_res
    assert "robustness" in audit_res
