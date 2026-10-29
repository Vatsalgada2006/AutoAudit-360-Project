"""
Case-Study Runner: Generates German Credit and COMPAS audit runs
(Surrogate RF and COMPAS decile_score mode), creates Model Card HTMLs,
and generates outputs/comparison.json.
"""

import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from demo_data.loaders import get_german_credit_data, get_compas_data
from audit_model import run_audit
from auditors.modelcard import generate_model_card_html
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)

def run_case_studies():
    print("--- Running Case Study 1: German Credit (Surrogate RF) ---")
    df_german = get_german_credit_data()
    german_audit = run_audit(
        df=df_german,
        target_col="Creditability",
        sensitive_cols=["Sex", "Age", "Foreign_Worker"],
        positive_label=1,
        use_case="credit_scoring",
        audit_id="german_credit",
        privileged_groups={"Sex": "Male", "Age": "Over_25", "Foreign_Worker": "no"}
    )
    with open(os.path.join(OUTPUTS_DIR, "german_credit_audit.json"), "w", encoding="utf-8") as f:
        json.dump(german_audit, f, indent=2)
    with open(os.path.join(OUTPUTS_DIR, "german_credit.html"), "w", encoding="utf-8") as f:
        f.write(generate_model_card_html(german_audit))
    print(f"German Credit Trust Score: {german_audit['scores']['overall_trust_score']} (RAG: {german_audit['scores']['rag_status']}, Cap: {german_audit['scores'].get('cap_reason')})")

    print("\n--- Running Case Study 2: COMPAS (Surrogate RF) ---")
    df_compas = get_compas_data()
    compas_surrogate_audit = run_audit(
        df=df_compas,
        target_col="Low_Risk_Outcome",
        sensitive_cols=["race", "sex", "age"],
        positive_label=1,
        use_case="law_enforcement_recidivism",
        audit_id="compas_surrogate",
        privileged_groups={"race": "Caucasian", "sex": "Female", "age": "Greater than 45"}
    )
    with open(os.path.join(OUTPUTS_DIR, "compas_audit.json"), "w", encoding="utf-8") as f:
        json.dump(compas_surrogate_audit, f, indent=2)
    with open(os.path.join(OUTPUTS_DIR, "compas.html"), "w", encoding="utf-8") as f:
        f.write(generate_model_card_html(compas_surrogate_audit))
    print(f"COMPAS Surrogate Trust Score: {compas_surrogate_audit['scores']['overall_trust_score']} (RAG: {compas_surrogate_audit['scores']['rag_status']}, Cap: {compas_surrogate_audit['scores'].get('cap_reason')})")

    print("\n--- Running Case Study 3: COMPAS (Direct Predictions Column 'decile_score' >= 5) ---")
    # Low_Risk_Outcome is 1 if decile_score <= 4 (or favorable outcome). For high risk decile_score >= 5.
    # decile_score < 5 means Low_Risk (favorable outcome = 1). Let's audit decile_score <= 4 as 1.
    # In COMPAS df: decile_score is numeric 1-10.
    compas_pred_audit = run_audit(
        df=df_compas,
        target_col="Low_Risk_Outcome",
        sensitive_cols=["race", "sex", "age"],
        positive_label=1,
        use_case="law_enforcement_recidivism",
        audit_id="compas_decile_score",
        pred_col="decile_score",
        pred_threshold=5.0, # >= 5 means adverse/high risk
        privileged_groups={"race": "Caucasian", "sex": "Female", "age": "Greater than 45"}
    )
    with open(os.path.join(OUTPUTS_DIR, "compas_pred_col_audit.json"), "w", encoding="utf-8") as f:
        json.dump(compas_pred_audit, f, indent=2)
    with open(os.path.join(OUTPUTS_DIR, "compas_pred_col.html"), "w", encoding="utf-8") as f:
        f.write(generate_model_card_html(compas_pred_audit))
    print(f"COMPAS Direct Pred Col Trust Score: {compas_pred_audit['scores']['overall_trust_score']} (RAG: {compas_pred_audit['scores']['rag_status']}, Cap: {compas_pred_audit['scores'].get('cap_reason')})")

    # Generate comparison.json
    comparison = {
        "title": "AutoAudit-360 Hardened Benchmark Comparison",
        "benchmark_timestamp": german_audit["meta"]["timestamp"],
        "baseline_legacy_results": {
            "german_credit": {"overall_score": 81.4, "rag_status": "green", "verdict": "CERTIFIED TRUSTWORTHY - PASS"},
            "compas": {"overall_score": 84.9, "rag_status": "green", "verdict": "CERTIFIED TRUSTWORTHY - PASS"}
        },
        "hardened_results": {
            "german_credit_surrogate": {
                "overall_score": german_audit["scores"]["overall_trust_score"],
                "raw_mean": german_audit["scores"]["raw_mean_score"],
                "rag_status": german_audit["scores"]["rag_status"],
                "verdict": german_audit["scores"]["readiness_verdict"],
                "cap_reason": german_audit["scores"].get("cap_reason"),
                "axes": german_audit["scores"]["dimension_scores"]
            },
            "compas_surrogate": {
                "overall_score": compas_surrogate_audit["scores"]["overall_trust_score"],
                "raw_mean": compas_surrogate_audit["scores"]["raw_mean_score"],
                "rag_status": compas_surrogate_audit["scores"]["rag_status"],
                "verdict": compas_surrogate_audit["scores"]["readiness_verdict"],
                "cap_reason": compas_surrogate_audit["scores"].get("cap_reason"),
                "axes": compas_surrogate_audit["scores"]["dimension_scores"]
            },
            "compas_decile_score_mode": {
                "overall_score": compas_pred_audit["scores"]["overall_trust_score"],
                "raw_mean": compas_pred_audit["scores"]["raw_mean_score"],
                "rag_status": compas_pred_audit["scores"]["rag_status"],
                "verdict": compas_pred_audit["scores"]["readiness_verdict"],
                "cap_reason": compas_pred_audit["scores"].get("cap_reason"),
                "axes": compas_pred_audit["scores"]["dimension_scores"]
            }
        }
    }
    with open(os.path.join(OUTPUTS_DIR, "comparison.json"), "w", encoding="utf-8") as f:
        json.dump(comparison, f, indent=2)

    print("\nSuccessfully generated all case studies and outputs/comparison.json!")

if __name__ == "__main__":
    run_case_studies()
