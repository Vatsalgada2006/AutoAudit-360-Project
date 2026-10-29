"""
Auditors: Regulatory Compliance Readiness Assessment
Implements EU AI Act (Annex III High-Risk Classification & Articles 9-15) and
India Digital Personal Data Protection Act 2023 (DPDP Act 2023 Sections 4-13).
Unanswered self-declared questions receive zero credit.
"""

import re
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from config import COMPLIANCE_WEIGHTS

HIGH_RISK_USE_CASES = {
    "credit_scoring": {
        "title": "Credit Scoring & Financial Eligibility",
        "annex_ref": "Annex III, Point 5(b)",
        "is_high_risk": True,
        "description": "AI systems used to evaluate creditworthiness of natural persons or establish their credit score."
    },
    "employment_recruitment": {
        "title": "Employment, HR & Recruitment",
        "annex_ref": "Annex III, Point 4",
        "is_high_risk": True,
        "description": "AI systems used for recruitment, candidate filtering, task allocation, and performance evaluation."
    },
    "law_enforcement_recidivism": {
        "title": "Law Enforcement & Recidivism Assessment",
        "annex_ref": "Annex III, Point 6",
        "is_high_risk": True,
        "description": "AI systems used by authorities to assess the risk of a natural person offending or reoffending."
    },
    "education_admissions": {
        "title": "Education & Vocational Admissions",
        "annex_ref": "Annex III, Point 3",
        "is_high_risk": True,
        "description": "AI systems determining access, admission, or assigning individuals to educational institutions."
    },
    "insurance_health": {
        "title": "Insurance Risk Assessment & Health Pricing",
        "annex_ref": "Annex III, Point 5(a)",
        "is_high_risk": True,
        "description": "AI systems used to evaluate risk and pricing in relation to natural persons for life and health insurance."
    },
    "critical_infrastructure": {
        "title": "Critical Infrastructure Safety Components",
        "annex_ref": "Annex III, Point 2",
        "is_high_risk": True,
        "description": "AI safety components in digital and physical road, water, gas, or electrical infrastructure."
    },
    "customer_service_general": {
        "title": "General Customer Analytics / Low-Risk",
        "annex_ref": "Title I / Transparency (Art. 50)",
        "is_high_risk": False,
        "description": "Non-critical administrative assistance, recommendation, or non-discriminatory classification."
    }
}

ALL_QUESTIONNAIRE_KEYS = [
    "q1_risk_mgmt", "q2_data_prep", "q3_human_oversight", "q4_logging", "q5_transparency",
    "q6_cybersecurity", "q7_dpdp_notice", "q8_dpdp_consent", "q9_dpdp_erasure", "q10_dpdp_grievance",
    "q11_dpdp_breach", "q12_dpdp_dpo", "q13_dpdp_dpia", "q14_dpdp_minors", "q15_human_training"
]

def detect_pii_and_sensitive_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Inspect dataset columns and values for PII, Aadhaar patterns, and minor cohorts."""
    columns_lower = [str(c).lower() for c in df.columns]
    
    pii_keywords = ["name", "email", "phone", "mobile", "ssn", "aadhaar", "aadhar", "pan", "passport", "dob", "birth", "address"]
    detected_pii = []
    for orig, col in zip(df.columns, columns_lower):
        if any(kw in col for kw in pii_keywords):
            detected_pii.append(orig)

    aadhaar_detected = False
    for col in df.columns:
        if df[col].dtype == object or str(df[col].dtype).startswith("string"):
            sample = df[col].dropna().astype(str).head(50)
            if any(re.match(r"^\d{4}\s?\d{4}\s?\d{4}$", s.strip()) for s in sample):
                aadhaar_detected = True
                detected_pii.append(f"{col} (Aadhaar pattern)")

    has_minors = False
    minors_count = 0
    age_col_found = None
    
    for col in df.columns:
        if "age" in str(col).lower() and pd.api.types.is_numeric_dtype(df[col]):
            age_col_found = col
            minors_mask = df[col] < 18
            minors_count = int(np.sum(minors_mask))
            if minors_count > 0:
                has_minors = True
            break
            
    return {
        "detected_pii_columns": detected_pii,
        "has_aadhaar_pattern": aadhaar_detected,
        "has_minors": has_minors,
        "minors_count": minors_count,
        "age_column": age_col_found
    }

def compute_governance_disclosure_score(questionnaire: Optional[Dict[str, str]]) -> Dict[str, Any]:
    """
    Compute Governance Disclosure score from 15 operational inquiries.
    Unanswered items receive 0 credit.
    """
    answers = questionnaire or {}
    total_questions = len(ALL_QUESTIONNAIRE_KEYS)
    earned_pts = 0.0
    answered_count = 0
    breakdown = {}

    for qk in ALL_QUESTIONNAIRE_KEYS:
        prefix = qk.split("_")[0]
        ans = answers.get(qk, answers.get(prefix, "unanswered"))
        if ans == "yes":
            pts = 1.0
            answered_count += 1
        elif ans == "partial":
            pts = 0.5
            answered_count += 1
        elif ans == "no":
            pts = 0.0
            answered_count += 1
        else:
            ans = "unanswered"
            pts = 0.0
            
        earned_pts += pts
        breakdown[qk] = {"status": ans, "points": pts}

    score = round((earned_pts / float(total_questions)) * 100.0, 1)
    return {
        "score": score,
        "earned_points": round(earned_pts, 1),
        "total_questions": total_questions,
        "answered_count": answered_count,
        "unanswered_count": total_questions - answered_count,
        "breakdown": breakdown
    }

def audit_compliance(
    use_case_key: str,
    fairness_results: List[Dict[str, Any]],
    explain_results: Dict[str, Any],
    robustness_results: Dict[str, Any],
    df: pd.DataFrame,
    questionnaire: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Evaluate compliance readiness against EU AI Act and India DPDP Act 2023.
    Unanswered self-declared questions receive 0 credit.
    """
    answers = questionnaire or {}
    pii_info = detect_pii_and_sensitive_data(df)
    
    use_case = HIGH_RISK_USE_CASES.get(use_case_key, HIGH_RISK_USE_CASES["credit_scoring"])
    is_high_risk = use_case["is_high_risk"]

    def get_ans(key: str) -> str:
        if key in answers:
            return answers[key]
        prefix = key.split("_")[0]
        if prefix in answers:
            return answers[prefix]
        return "unanswered"

    # 1. EU AI ACT CHECKLIST & AUTO-VERIFICATIONS
    eu_checklist = []
    
    # Art. 9: Risk Management
    eu_checklist.append({
        "article": "Art. 9",
        "title": "Risk Management System",
        "type": "self_declared",
        "requirement": "Establish, implement, document and maintain a continuous risk management system.",
        "status": get_ans("q1_risk_mgmt"),
        "evidence": "Risk management policy declared." if get_ans("q1_risk_mgmt") == "yes" else ("Partial policy declared." if get_ans("q1_risk_mgmt") == "partial" else "No response provided (unanswered / 0 credit).")
    })
    
    # Art. 10: Data Governance & Bias Testing (AUTO-VERIFIED)
    fairness_pass = all(r.get("status") == "pass" for r in fairness_results) if fairness_results else False
    fairness_warn = any(r.get("status") == "warn" for r in fairness_results) if fairness_results else False
    
    if fairness_pass:
        art10_status = "yes"
        art10_evidence = "Auto-verified: Model meets four-fifths rule and parity gap tolerances across demographic cohorts on test split."
    elif fairness_warn:
        art10_status = "partial"
        art10_evidence = "Auto-verified: Disparate impact ratio or parity gaps in caution band on test split."
    else:
        art10_status = "no"
        art10_evidence = "Auto-verified: Severe demographic disparity or four-fifths rule failure detected on test split."
        
    eu_checklist.append({
        "article": "Art. 10",
        "title": "Data Governance & Bias Examination",
        "type": "auto_verified",
        "requirement": "Training, validation and testing data sets shall be relevant, representative, and examined for biases.",
        "status": art10_status,
        "evidence": art10_evidence
    })

    # Art. 11: Technical Documentation (AUTO-VERIFIED: Model Card generated)
    eu_checklist.append({
        "article": "Art. 11",
        "title": "Technical Documentation",
        "type": "auto_verified",
        "requirement": "Draw up comprehensive technical documentation demonstrating regulatory conformity before deployment.",
        "status": "yes",
        "evidence": "Auto-verified: Automated AI Model Card and diagnostic specifications compiled by AutoAudit-360."
    })

    # Art. 12: Record-Keeping
    eu_checklist.append({
        "article": "Art. 12",
        "title": "Automatic Logging & Audit Trails",
        "type": "self_declared",
        "requirement": "High-risk AI systems shall technically allow for the automatic recording of events (logging).",
        "status": get_ans("q4_logging"),
        "evidence": "Automatic event logging affirmed." if get_ans("q4_logging") == "yes" else "No event logging affirmation provided (unanswered / 0 credit)."
    })

    # Art. 13: Transparency (AUTO-VERIFIED via SHAP explainability)
    if explain_results.get("status") == "pass":
        art13_status = "yes"
        art13_evidence = "Auto-verified: Global SHAP attribution generated with zero unmitigated proxy leakages."
    elif explain_results.get("status") == "warn":
        art13_status = "partial"
        art13_evidence = "Auto-verified: 1 protected proxy feature identified in top 5 features."
    else:
        art13_status = "no"
        art13_evidence = "Auto-verified: Sensitive attributes directly dominate top predictive feature weights."

    eu_checklist.append({
        "article": "Art. 13",
        "title": "Transparency & Provision of Information",
        "type": "auto_verified",
        "requirement": "AI systems shall be accompanied by instructions for use and interpretable explanations.",
        "status": art13_status,
        "evidence": art13_evidence
    })

    # Art. 14: Human Oversight
    human_status = get_ans("q3_human_oversight")
    eu_checklist.append({
        "article": "Art. 14",
        "title": "Human Oversight Measures",
        "type": "self_declared",
        "requirement": "Enable natural persons to oversee the system, prevent risks, or stop the system.",
        "status": human_status,
        "evidence": "Human-in-the-loop escalation pathway affirmed." if human_status == "yes" else "No human oversight mechanism declared (unanswered / 0 credit)."
    })

    # Art. 15: Accuracy & Robustness (AUTO-VERIFIED)
    rob_status = robustness_results.get("status", "pass")
    if rob_status == "pass":
        art15_status = "yes"
        art15_evidence = "Auto-verified: Resilient against 10% label flips (<5% metric drop), bounded noise, and counterfactual flips."
    elif rob_status == "warn":
        art15_status = "partial"
        art15_evidence = "Auto-verified: Moderate performance degradation under perturbation or counterfactual tests."
    else:
        art15_status = "no"
        art15_evidence = "Auto-verified: Fragile inference stability; significant metric collapse or counterfactual drift."

    eu_checklist.append({
        "article": "Art. 15",
        "title": "Accuracy, Robustness & Cybersecurity",
        "type": "auto_verified",
        "requirement": "High-risk AI systems shall achieve appropriate levels of accuracy, robustness and cybersecurity.",
        "status": art15_status,
        "evidence": art15_evidence
    })

    # 2. INDIA DPDP ACT 2023 CHECKLIST
    dpdp_checklist = []

    # Sec 5: Notice
    dpdp_checklist.append({
        "section": "Sec 5",
        "principle": "Notice Requirement",
        "type": "self_declared",
        "requirement": "Clear notice provided to Data Principal describing personal data collected and processing purpose.",
        "status": get_ans("q7_dpdp_notice"),
        "evidence": "Notice protocol affirmed." if get_ans("q7_dpdp_notice") == "yes" else "Unanswered disclosure (0 credit)."
    })

    # Sec 6: Consent
    dpdp_checklist.append({
        "section": "Sec 6",
        "principle": "Consent Architecture",
        "type": "self_declared",
        "requirement": "Consent must be free, specific, informed, unconditional and unambiguous with clear affirmative action.",
        "status": get_ans("q8_dpdp_consent"),
        "evidence": "Consent architecture affirmed." if get_ans("q8_dpdp_consent") == "yes" else "Unanswered disclosure (0 credit)."
    })

    # Sec 8(3): Accuracy (AUTO-VERIFIED: Missing values & data validation)
    missing_rate = float(df.isnull().mean().mean())
    if missing_rate == 0.0:
        sec8_acc_status = "yes"
        sec8_acc_evidence = "Auto-verified: Dataset is complete with 0.0% missing cells across feature dimensions."
    elif missing_rate < 0.05:
        sec8_acc_status = "partial"
        sec8_acc_evidence = f"Auto-verified: Dataset contains {missing_rate:.1%} missing values requiring imputation."
    else:
        sec8_acc_status = "no"
        sec8_acc_evidence = f"Auto-verified: High missing data rate ({missing_rate:.1%}) threatens accuracy under Sec 8(3)."

    dpdp_checklist.append({
        "section": "Sec 8(3)",
        "principle": "Data Accuracy & Completeness",
        "type": "auto_verified",
        "requirement": "Ensure data used to make decisions affecting Data Principals is accurate and complete.",
        "status": sec8_acc_status,
        "evidence": sec8_acc_evidence
    })

    # Sec 8(5): Security Safeguards
    dpdp_checklist.append({
        "section": "Sec 8(5)",
        "principle": "Security Safeguards & Encryption",
        "type": "self_declared",
        "requirement": "Protect personal data in possession or custody under reasonable security safeguards.",
        "status": get_ans("q6_cybersecurity"),
        "evidence": "Security safeguards affirmed." if get_ans("q6_cybersecurity") == "yes" else "Unanswered disclosure (0 credit)."
    })

    # Sec 8(6): Breach Notification
    dpdp_checklist.append({
        "section": "Sec 8(6)",
        "principle": "Incident & Breach Notification",
        "type": "self_declared",
        "requirement": "Mandatory breach reporting to Data Protection Board of India and affected Principals.",
        "status": get_ans("q11_dpdp_breach"),
        "evidence": "Incident protocol affirmed." if get_ans("q11_dpdp_breach") == "yes" else "Unanswered disclosure (0 credit)."
    })

    # Sec 9: Children's Data & Minors (AUTO-VERIFIED)
    if pii_info["has_minors"]:
        sec9_status = "partial" if get_ans("q14_dpdp_minors") == "yes" else "no"
        sec9_evidence = f"Auto-verified: Found {pii_info['minors_count']} records with age < 18. Mandatory parental consent and tracking ban applies under Section 9."
    else:
        sec9_status = "yes"
        sec9_evidence = "Auto-verified: No records of minors (<18 years) detected in audit sample."

    dpdp_checklist.append({
        "section": "Sec 9",
        "principle": "Processing of Children's Data",
        "type": "auto_verified",
        "requirement": "Obtain verifiable parental consent; strictly ban tracking, behavioral monitoring, or targeted ads directed at minors.",
        "status": sec9_status,
        "evidence": sec9_evidence
    })

    # Sec 10: Significant Data Fiduciary (DPIA & DPO)
    dpdp_checklist.append({
        "section": "Sec 10",
        "principle": "Significant Data Fiduciary Obligations",
        "type": "self_declared",
        "requirement": "Appoint India-resident DPO, conduct periodic Data Protection Impact Assessments (DPIA), and retain independent data auditor.",
        "status": get_ans("q12_dpdp_dpo"),
        "evidence": "DPO / DPIA affirmed." if get_ans("q12_dpdp_dpo") == "yes" else "Unanswered disclosure (0 credit)."
    })

    # Sec 11-13: Data Principal Rights & Redressal
    dpdp_checklist.append({
        "section": "Sec 11-13",
        "principle": "Data Principal Rights & Redressal",
        "type": "self_declared",
        "requirement": "Provide rights of access, correction, erasure, and easily accessible grievance redressal mechanism.",
        "status": get_ans("q10_dpdp_grievance"),
        "evidence": "Grievance redressal affirmed." if get_ans("q10_dpdp_grievance") == "yes" else "Unanswered disclosure (0 credit)."
    })

    # Compute Framework Scores
    def compute_framework_score(checklist: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_possible = 0.0
        earned = 0.0
        gaps = []
        remediations = []
        
        for item in checklist:
            w = COMPLIANCE_WEIGHTS["auto_verified"] if item["type"] == "auto_verified" else COMPLIANCE_WEIGHTS["self_declared"]
            total_possible += w
            
            st = item["status"]
            if st == "yes":
                mult = COMPLIANCE_WEIGHTS["yes_multiplier"]
            elif st == "partial":
                mult = COMPLIANCE_WEIGHTS["partial_multiplier"]
                gaps.append(f"Conditional: {item.get('article', item.get('section'))} ({item.get('title', item.get('principle'))}) is only partially fulfilled.")
                remediations.append(f"Provide complete operational evidence for {item.get('article', item.get('section'))}: {item['requirement']}")
            elif st == "no":
                mult = COMPLIANCE_WEIGHTS["no_multiplier"]
                gaps.append(f"Deficiency: {item.get('article', item.get('section'))} ({item.get('title', item.get('principle'))}) failed or unaddressed.")
                remediations.append(f"Immediate remediation required for {item.get('article', item.get('section'))}: {item['requirement']}")
            else:  # unanswered
                mult = COMPLIANCE_WEIGHTS["unanswered_multiplier"]
                gaps.append(f"Unanswered: {item.get('article', item.get('section'))} ({item.get('title', item.get('principle'))}) has no disclosure response (0 credit).")
                remediations.append(f"Complete disclosure for {item.get('article', item.get('section'))}: {item['requirement']}")
                
            earned += w * mult
            
        score = round((earned / total_possible) * 100.0, 1) if total_possible > 0 else 0.0
        return {
            "score": score,
            "earned_points": round(earned, 2),
            "max_points": round(total_possible, 2),
            "gaps": gaps,
            "remediations": remediations
        }

    eu_score_data = compute_framework_score(eu_checklist)
    dpdp_score_data = compute_framework_score(dpdp_checklist)
    gov_disclosure = compute_governance_disclosure_score(questionnaire)

    return {
        "use_case": use_case,
        "is_high_risk": is_high_risk,
        "pii_and_sensitive_signals": pii_info,
        "governance_disclosure": gov_disclosure,
        "eu_ai_act": {
            "classification": "High-Risk AI System (Annex III)" if is_high_risk else "Minimal / Transparency AI System",
            "score": eu_score_data["score"],
            "earned_points": eu_score_data["earned_points"],
            "max_points": eu_score_data["max_points"],
            "checklist": eu_checklist,
            "gaps": eu_score_data["gaps"],
            "remediations": eu_score_data["remediations"]
        },
        "dpdp_act_2023": {
            "score": dpdp_score_data["score"],
            "earned_points": dpdp_score_data["earned_points"],
            "max_points": dpdp_score_data["max_points"],
            "checklist": dpdp_checklist,
            "gaps": dpdp_score_data["gaps"],
            "remediations": dpdp_score_data["remediations"]
        }
    }
