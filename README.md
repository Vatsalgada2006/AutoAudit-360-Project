# AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite

> **Academic Prototype & Research Suite for Trustworthy and Responsible AI**  
> **Domain:** Algorithmic Governance, Statistical Bias Hardening & Regulatory Conformity  
> **Syllabus & Standard Mapping:** Modules 1–4 (Trustworthy AI Pipeline, AI Model Card, EU AI Act Annex III, India DPDP Act 2023)

---

## 1. Overview & Architecture

**AutoAudit-360** is an automated forensic assessment suite and CLI engine designed to rigorously stress-test arbitrary tabular machine learning models (`scikit-learn` Pipelines, estimators, or preprocessed `PyTorch` neural networks) and dataset distributions across four forensic pillars:

1. **Algorithmic Fairness & Intersectional Parity:** Evaluated strictly on held-out test splits with 500-iteration bootstrap 95% confidence intervals, sample size sufficiency flags ($n < 30$), four-fifths rule disparate impact, and intersectional demographic cross-products.
2. **Global Interpretability & Proxy Leakage:** TreeExplainer and permutation SHAP attributions, cross-correlation proxy detection with protected attributes ($r > 0.40$), and manifold causality disclaimers.
3. **Adversarial Robustness & Perturbation Stress Testing:** Real perturbation attacks including counterfactual sensitive-attribute flips, bounded coordinate worst-case attacks ($\pm\epsilon\sigma$ with $\epsilon \in \{0.05, 0.10, 0.20\}$), categorical random swap noise, and multi-attribute fairness drift.
4. **Regulatory Conformity Readiness:** Statutory cross-walk against the EU AI Act (Annex III High-Risk Classification & Articles 9–15) and the India Digital Personal Data Protection (DPDP) Act 2023 (Sections 4–13, PII pattern detection, minor safeguards).

The engine compiles an empirical **AI Model Card** conforming to international transparency standards (available as self-contained printable HTML, JSON, or PDF).

### Forensic Pipeline Architecture
```
Data (CSV) & Optional Model (.joblib / .pkl) or Preds Column
       │
       ▼
Data Ingestion & Cryptographic SHA-256 Digest
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
1. Fairness Battery (Held-out Test Split)  2. Explainability Battery
   - Disparate Impact (Four-Fifths 80%)       - Global SHAP Attribution
   - Demographic Parity & Equal Opp Gaps      - Protected Variable Leakage
   - 95% Bootstrap CIs (n=500)                - Proxy Detection (r > 0.40)
   - Intersectional Cohort Matrix             - Manifold Correlation Notice
       │                                         │
       ├─────────────────────────────────────────┘
       ▼
3. Adversarial Robustness Battery
   - Counterfactual Sensitive-Attribute Flips
   - Bounded Coordinate Perturbation (eps = 0.05, 0.10, 0.20)
   - Categorical Feature Swap Testing
   - Multi-Attribute Fairness Stability (Delta DI)
       │
       ▼
4. Regulatory Conformity Verification
   - EU AI Act: High-Risk Classification & Articles 9-15
   - India DPDP Act 2023: Sections 4-13, Consent, PII, Minors (<18)
   - Governance Disclosures (Unanswered items score 0 credit)
       │
       ▼
Scoring Integrity Engine & Weakest-Link Enforcements (6 Axes)
   - Any axis < 50.0  --> Overall score capped at 74.9 (Amber / REVIEW)
   - Fairness < 50.0 (High-Risk) OR >= 2 axes < 50.0 --> Overall capped at 49.9 (Red / ACTION REQUIRED)
       │
       ▼
AI Model Card Export (Self-contained HTML / JSON / Print-optimized Dossier)
```

---

## 2. Command Line Interface (CLI)

The CLI supports auditing external datasets with auto-trained surrogate models, custom pickled scikit-learn models, or direct predictions column mode:

```bash
# 1. Standard surrogate / custom model audit
python3 audit_model.py \
  --data demo_data/german_credit.csv \
  --target Creditability \
  --sensitive Sex,Age,Foreign_Worker \
  --positive_label 1 \
  --use_case credit_scoring \
  --out outputs/german_credit_report.html \
  --json_out outputs/german_credit_audit.json

# 2. Direct Predictions Column Mode (e.g. COMPAS decile_score >= 5 without a model file)
python3 audit_model.py \
  --data demo_data/compas.csv \
  --target Low_Risk_Outcome \
  --sensitive race,sex,age \
  --pred_col decile_score \
  --pred_threshold 5.0 \
  --use_case law_enforcement_recidivism \
  --out outputs/compas_pred_col.html \
  --json_out outputs/compas_pred_col_audit.json
```

### CLI Arguments
| Flag | Required | Default | Description |
|---|---|---|---|
| `--data` | Yes | - | Path to input dataset CSV file |
| `--target` | Yes | - | Target classification column name |
| `--sensitive` | Yes | - | Comma-separated sensitive attributes (e.g., `Sex,Age,Foreign_Worker`) |
| `--model` | No | `None` | Path to `.joblib` / `.pkl` scikit-learn model or preprocessor pipeline |
| `--pred_col` | No | `None` | Predictions column mode: evaluate precomputed score column directly |
| `--pred_threshold` | No | `None` | Decision threshold for predictions column (e.g. `5.0` for COMPAS deciles) |
| `--positive_label` | No | `1` | Favorable / positive outcome class label |
| `--use_case` | No | `credit_scoring` | Domain application key (`credit_scoring`, `employment_recruitment`, `law_enforcement_recidivism`, etc.) |
| `--out` | No | `report.html` | Destination path for printable Model Card HTML report |
| `--json_out` | No | `None` | Optional destination path for raw audit JSON payload |

---

## 3. PyTorch Model Wrapper with Scikit-Learn Preprocessor

AutoAudit-360 supports PyTorch neural network classifiers combined with fitted scikit-learn `ColumnTransformer` / `StandardScaler` preprocessors, allowing seamless categorical one-hot encoding and scaling:

```python
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import joblib

class PyTorchClassifierWrapper:
    """
    Production wrapper accepting a trained PyTorch model plus an optional
    fitted scikit-learn ColumnTransformer / Pipeline preprocessor.
    Exposes standard predict() and predict_proba() scikit-learn API methods.
    """
    def __init__(self, torch_model: nn.Module, preprocessor=None, feature_names=None, device: str = "cpu"):
        self.torch_model = torch_model.to(device)
        self.torch_model.eval()
        self.preprocessor = preprocessor
        self.feature_names = feature_names
        self.device = device

    def transform_features(self, X):
        if self.preprocessor is not None:
            if hasattr(self.preprocessor, "transform"):
                X_trans = self.preprocessor.transform(X)
            else:
                X_trans = X
        else:
            X_trans = X
            
        if hasattr(X_trans, "toarray"):
            X_trans = X_trans.toarray()
        return np.asarray(X_trans, dtype=np.float32)

    def predict_proba(self, X):
        X_arr = self.transform_features(X)
        tensor_x = torch.tensor(X_arr, device=self.device)
        with torch.no_grad():
            logits = self.torch_model(tensor_x)
            if logits.shape[1] == 1:
                p1 = torch.sigmoid(logits).cpu().numpy()
                probs = np.hstack([1.0 - p1, p1])
            else:
                probs = torch.softmax(logits, dim=1).cpu().numpy()
        return probs

    def predict(self, X):
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)

# Example serialization:
# wrapper = PyTorchClassifierWrapper(torch_net, preprocessor=fitted_column_transformer)
# joblib.dump(wrapper, "pytorch_credit_model.joblib")
```

---

## 4. Scoring Integrity & Weakest-Link Cap Rules

AutoAudit-360 replaces unweighted arithmetic smoothing with strict weakest-link capping to prevent averaging away severe civil rights or governance breaches:

### 1. Weakest-Link Cap Enforcement Rules
Let $S_k$ denote the score of each valid evaluated dimension $k \in \{1, \dots, 6\}$.
- **Raw Mean Calculation:**
  $$\text{Raw Mean} = \frac{1}{|K_{\text{valid}}|} \sum_{k \in K_{\text{valid}}} S_k$$
- **Single Axis Deficient ($S_k < 50.0$):**
  If any dimension falls below 50.0, the overall score is strictly capped at **74.9** (Amber / READINESS: NEEDS REVIEW).
- **High-Risk Fairness Deficient ($S_{\text{fairness}} < 50.0$):**
  If the fairness dimension falls below 50.0 on a High-Risk system (credit scoring, hiring, recidivism), the overall score is strictly capped at **49.9** (Red / READINESS: ACTION REQUIRED).
- **Multiple Deficiencies ($\ge 2$ axes $< 50.0$):**
  If two or more dimensions fall below 50.0, the overall score is strictly capped at **49.9** (Red / READINESS: ACTION REQUIRED).
- **Audit Cap Reason:** The exact causal reason is logged in `scores.cap_reason` and surfaced across the UI and Model Card header.

### 2. Dimension Formulations
- **Fairness Score (0–100):**
  $$\text{Fairness} = 100 \times \frac{1}{|A|} \sum_{a \in A} \left[ 0.5 \times \text{clamp}\left(\min\left(DI_a, \frac{1}{DI_a}\right), 0, 1\right) + 0.5 \times \left(1 - \min\left(1, \frac{\max(DPD_a, EOD_a)}{0.20}\right)\right) \right]$$
  Computed exclusively on the held-out test split (20%) with 500 bootstrap iterations. Subgroups with $n < 30$ are marked with low statistical power warnings.
- **Explainability Score (0–100):**
  $$\text{Explainability} = \min\left(100, \max\left(0, 100 - (20 \times N_{\text{sensitive/proxy}}) + 10\right)\right)$$
  Yields `None` (excluded from mean, flagged in limitations) if SHAP attributions fail or are inapplicable (such as in Predictions Column Mode).
- **Adversarial Robustness Score (0–100):**
  $$\text{Robustness} = \text{clamp}\left(100 - (\Delta_{10\% \text{ flips}} \times 120) - (\text{FlipRate}_{5\% \text{ noise}} \times 120) - (\text{FlipRate}_{\text{CF}} \times 50) - (\text{Drop}_{\epsilon=0.10} \times 50), 0, 100\right)$$
  Yields `None` if perturbation stress testing is bypassed.
- **Regulatory Readiness (EU AI Act & India DPDP Act 2023):**
  $$\text{Score}_{\text{Framework}} = 100 \times \frac{\sum (w_i \times m_i)}{\sum w_i}$$
  Auto-verified evidence ($w=2.0$), Self-declared answers ($w=1.0$).
  Multipliers: Yes ($m=1.0$), Partial ($m=0.5$), No ($m=0.0$), Unanswered ($m=0.0$). Unanswered items award 0 credit.
- **Governance Disclosure Score:** Evaluates self-declared operational responses; unanswered questions award 0 points.

### 3. Readiness Verdict Taxonomy
- **READINESS: PASS (Green):** Overall Score $\ge 75.0$ and no axis $< 50.0$.
- **READINESS: NEEDS REVIEW (Amber):** Overall Score $50.0 - 74.9$.
- **READINESS: ACTION REQUIRED (Red):** Overall Score $< 50.0$ or weakest-link cap triggered.

---

## 5. Environment Variables & Security Configuration

| Variable | Default | Purpose |
|---|---|---|
| `ALLOW_MODEL_UPLOAD` | `false` | When `false`, `/api/upload` rejects model files with HTTP 403, and the UI hides the upload field. Preserves CLI model loading. |
| `CORS_ORIGIN` | `*` | Configurable allowed origin for Flask-CORS. |
| `UPLOAD_MAX_BYTES` | `20971520` (20 MB) | Request payload ceiling enforced by Werkzeug. |

**Security Hardening Directives:**
- All dataset and audit IDs are strictly validated with regex `^[A-Za-z0-9_-]{1,40}$` to prevent directory traversal attacks.
- Raw server exception stack traces are masked from clients; an opaque `error_id` UUID is returned while full logs are captured server-side.
- Case-insensitive `.csv` validation and delimiter parsing before file persistence.

---

## 6. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health verification, version (`2.0.0`), and security policy state (`allow_model_upload`). |
| `POST` | `/api/upload` | Upload dataset CSV and optional pickled model (subject to `ALLOW_MODEL_UPLOAD`). |
| `GET` | `/api/demo/<name>` | Ingest pre-calibrated demo dataset metadata (`german_credit` or `compas`). |
| `GET` | `/api/demo-audit/<name>` | Instantly load precomputed deterministic audit results. |
| `POST` | `/api/audit` | Dispatch audit job in background (returns `{job_id, status: "running"}` with HTTP 202) or synchronous mode. |
| `GET` | `/api/audit/<job_id>` | Poll background audit job status, stage (`fairness`, `explain`, `robustness`, `compliance`, `modelcard`), progress (0–100%), and result payload. |
| `GET` | `/api/modelcard/<id>.<ext>` | Download compiled Model Card (`.html` or `.json`) with path traversal protection. |
| `GET` | `/api/comparison` | Retrieve side-by-side benchmark comparison data. |

---

## 7. Limitations & Statutory Boundaries

1. **Diagnostic Scope:** AutoAudit-360 produces empirical diagnostic indicators and statutory readiness scores based on the EEOC four-fifths rule, EU AI Act Annex III, and DPDP Act 2023 principles. Findings do **not** constitute formal legal certification or indemnity against regulatory enforcement.
2. **Held-out Split Variance:** Fairness metrics reflect sample distributions on the evaluated test split. While 500-iteration bootstrap confidence intervals quantify statistical bounds, unobserved out-of-distribution shifts may produce divergent behavior.
3. **Correlation vs. Causality in SHAP:** Global SHAP values measure empirical attribution within the trained estimator manifold. High attribution does not prove real-world causality or intentional discrimination.
4. **Self-Declared Questionnaires:** Governance disclosure scores rely on user attestations. Unanswered items receive 0 credit by default.

---

## 8. Deployment & Single-Service Architecture

AutoAudit-360 compiles the React SPA into static assets served directly by the hardened Flask daemon, enabling unified single-service deployments on Render or Docker:

```bash
# Build frontend static bundle
npm run build

# Run via Gunicorn production server (as configured in Procfile)
gunicorn app:app --workers 1 --threads 4 --timeout 180
```

---

## 9. Verification & Test Execution

Run the complete test suite:
```bash
python3 -m pytest -o pythonpath=. tests/ -v
```

The test harness validates:
- Weakest-link score capping (single axis, high-risk fairness, multi-axis).
- N/A handling without silent defaults.
- Held-out test split evaluation with 500 bootstrap replications.
- Bounded coordinate perturbations and counterfactual sensitive flips.
- Predictions Column Mode (`--pred_col`, `--pred_threshold`).
- Path traversal rejection on identifiers (`^[A-Za-z0-9_-]{1,40}$`).
- Background job polling API (`POST /api/audit` -> `GET /api/audit/<job_id>`).
- Questionnaire answer sensitivity and zero credit for unanswered items.
- Absence of personal or student identifiers across the entire repository.

---

AutoAudit-360 | Academic prototype | Diagnostic findings, not legal certification.
