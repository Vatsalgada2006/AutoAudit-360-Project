"""
AutoAudit-360: Flask REST JSON API (Hardened v2.0)
Exposes trustworthy AI audits, background job execution, model card downloads,
demo datasets, and static SPA serving with zero personal identifiers.
"""

import os
import re
import uuid
import json
import logging
import threading
from typing import Dict, Any
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pandas as pd
import joblib

from config import UPLOAD_MAX_BYTES
from audit_model import run_audit
from auditors.modelcard import generate_model_card_html
from demo_data.loaders import get_german_credit_data, get_compas_data

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("AutoAudit-360")

# Security configuration
ALLOW_MODEL_UPLOAD = os.environ.get("ALLOW_MODEL_UPLOAD", "false").lower() in ("true", "1", "yes")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
ID_REGEX = re.compile(r"^[A-Za-z0-9_-]{1,40}$")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")
DATA_STORE_DIR = os.path.join(BASE_DIR, "data_store")
AUDIT_STORE_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(DATA_STORE_DIR, exist_ok=True)
os.makedirs(AUDIT_STORE_DIR, exist_ok=True)

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = UPLOAD_MAX_BYTES
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGIN}})

# In-memory caches and background job store
DATASETS_CACHE: Dict[str, Any] = {}
AUDITS_CACHE: Dict[str, Any] = {}
JOBS_STORE: Dict[str, Dict[str, Any]] = {}

def validate_identifier(val: str, field_name: str = "identifier") -> bool:
    """Ensure identifier matches ^[A-Za-z0-9_-]{1,40}$ to prevent path traversal."""
    if not val or not isinstance(val, str) or not ID_REGEX.match(val):
        return False
    return True

def get_df_summary(df: pd.DataFrame) -> dict:
    dtypes = {}
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            dtypes[col] = "numeric"
        else:
            dtypes[col] = "categorical"
    preview = df.head(5).to_dict(orient="records")
    return {
        "columns": list(df.columns),
        "dtypes": dtypes,
        "row_count": len(df),
        "preview": preview
    }

@app.route("/api/health", methods=["GET"])
def health():
    """Service health and security policy configuration."""
    return jsonify({
        "status": "healthy",
        "version": "2.0.0",
        "service": "AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite",
        "allow_model_upload": ALLOW_MODEL_UPLOAD
    })

@app.route("/api/upload", methods=["POST"])
def upload():
    """Upload dataset CSV and optional pickled scikit-learn model."""
    if "file" not in request.files:
        return jsonify({"error": "No CSV data file provided in 'file' field."}), 400
        
    csv_file = request.files["file"]
    if not csv_file.filename or not csv_file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files are accepted for dataset upload."}), 400

    dataset_id = str(uuid.uuid4())[:10]
    csv_path = os.path.join(DATA_STORE_DIR, f"{dataset_id}.csv")
    csv_file.save(csv_path)

    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        error_id = str(uuid.uuid4())[:8]
        logger.error(f"[Upload Error {error_id}] Failed to parse CSV: {e}")
        if os.path.exists(csv_path):
            os.remove(csv_path)
        return jsonify({"error": "Failed to parse CSV file. Ensure it is a valid delimiter-separated file.", "error_id": error_id}), 400

    # Optional model upload check
    model_path = None
    if "model" in request.files:
        m_file = request.files["model"]
        if m_file.filename:
            if not ALLOW_MODEL_UPLOAD:
                return jsonify({
                    "error": "Model file upload is disabled by server security policy. Use CLI mode or predictions column mode."
                }), 403
            
            m_name = secure_filename(m_file.filename)
            if not (m_name.lower().endswith(".joblib") or m_name.lower().endswith(".pkl")):
                return jsonify({"error": "Model file must have .joblib or .pkl extension."}), 400
            model_path = os.path.join(DATA_STORE_DIR, f"{dataset_id}_{m_name}")
            m_file.save(model_path)

    DATASETS_CACHE[dataset_id] = {
        "csv_path": csv_path,
        "model_path": model_path,
        "df": df
    }

    summary = get_df_summary(df)
    return jsonify({
        "dataset_id": dataset_id,
        "has_custom_model": model_path is not None,
        "columns": summary["columns"],
        "dtypes": summary["dtypes"],
        "row_count": summary["row_count"],
        "preview": summary["preview"]
    })

@app.route("/api/demo/<name>", methods=["GET"])
def demo_data(name: str):
    """One-click demo dataset loaders: german_credit or compas."""
    if not validate_identifier(name, "demo_name"):
        return jsonify({"error": "Invalid demo identifier format."}), 400

    dataset_id = f"demo_{name}"
    
    if name == "german_credit":
        df = get_german_credit_data()
        default_target = "Creditability"
        default_positive = 1
        default_sensitive = ["Sex", "Age", "Foreign_Worker"]
        default_use_case = "credit_scoring"
    elif name == "compas":
        df = get_compas_data()
        default_target = "Low_Risk_Outcome"
        default_positive = 1
        default_sensitive = ["race", "sex", "age"]
        default_use_case = "law_enforcement_recidivism"
    else:
        return jsonify({"error": f"Unknown demo '{name}'. Choose 'german_credit' or 'compas'."}), 404

    csv_path = os.path.join(DATA_STORE_DIR, f"{dataset_id}.csv")
    df.to_csv(csv_path, index=False)

    DATASETS_CACHE[dataset_id] = {
        "csv_path": csv_path,
        "model_path": None,
        "df": df
    }

    summary = get_df_summary(df)
    return jsonify({
        "dataset_id": dataset_id,
        "demo_name": name,
        "default_target": default_target,
        "default_positive": default_positive,
        "default_sensitive": default_sensitive,
        "default_use_case": default_use_case,
        "columns": summary["columns"],
        "dtypes": summary["dtypes"],
        "row_count": summary["row_count"],
        "preview": summary["preview"]
    })

@app.route("/api/demo-audit/<name>", methods=["GET"])
def get_precomputed_demo_audit(name: str):
    """Load precomputed case study audit results instantly."""
    if not validate_identifier(name, "demo_name"):
        return jsonify({"error": "Invalid demo name."}), 400

    filename = f"{name}_audit.json"
    file_path = os.path.join(AUDIT_STORE_DIR, filename)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            logger.error(f"Error loading precomputed demo {name}: {e}")
            
    return jsonify({"error": f"Precomputed audit for '{name}' not found."}), 404

def _execute_audit_worker(job_id: str, df: pd.DataFrame, target: str, sensitive: list,
                          custom_model: Any, positive_label: Any, use_case: str,
                          questionnaire: dict, privileged_groups: dict,
                          pred_col: Any, pred_threshold: Any):
    """Background worker for executing audits asynchronously."""
    def progress_cb(stage: str, pct: int):
        if job_id in JOBS_STORE:
            JOBS_STORE[job_id]["stage"] = stage
            JOBS_STORE[job_id]["progress"] = pct

    try:
        progress_cb("fairness", 20)
        audit_result = run_audit(
            df=df,
            target_col=target,
            sensitive_cols=sensitive,
            model=custom_model,
            positive_label=positive_label,
            use_case=use_case,
            questionnaire=questionnaire,
            privileged_groups=privileged_groups,
            audit_id=job_id,
            pred_col=pred_col,
            pred_threshold=pred_threshold,
            progress_callback=progress_cb
        )
        
        # Cache and persist result
        AUDITS_CACHE[job_id] = audit_result
        json_path = os.path.join(AUDIT_STORE_DIR, f"{job_id}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(audit_result, f, indent=2)

        html_path = os.path.join(AUDIT_STORE_DIR, f"{job_id}.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(generate_model_card_html(audit_result))

        JOBS_STORE[job_id]["status"] = "complete"
        JOBS_STORE[job_id]["stage"] = "complete"
        JOBS_STORE[job_id]["progress"] = 100
        JOBS_STORE[job_id]["result"] = audit_result

    except Exception as e:
        error_id = str(uuid.uuid4())[:8]
        logger.exception(f"[Audit Worker Job {job_id} Failure {error_id}]: {e}")
        JOBS_STORE[job_id]["status"] = "failed"
        JOBS_STORE[job_id]["stage"] = "failed"
        JOBS_STORE[job_id]["progress"] = 100
        JOBS_STORE[job_id]["error"] = f"Audit execution failure (Ref: {error_id})"

@app.route("/api/audit", methods=["POST"])
def audit():
    """Dispatch an audit run as a background job or synchronous request."""
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "Invalid JSON request body"}), 400

    dataset_id = data.get("dataset_id")
    if not validate_identifier(dataset_id, "dataset_id"):
        return jsonify({"error": "Invalid dataset_id format. Must match ^[A-Za-z0-9_-]{1,40}$."}), 400

    target = data.get("target")
    sensitive = data.get("sensitive", [])
    positive_label = data.get("positive_label", 1)
    use_case = data.get("use_case", "credit_scoring")
    questionnaire = data.get("questionnaire", {})
    privileged_groups = data.get("privileged_groups", {})
    pred_col = data.get("pred_col")
    pred_threshold = data.get("pred_threshold")
    is_sync = data.get("sync", False)

    if dataset_id not in DATASETS_CACHE:
        csv_disk = os.path.join(DATA_STORE_DIR, f"{dataset_id}.csv")
        if os.path.exists(csv_disk):
            try:
                df = pd.read_csv(csv_disk)
                DATASETS_CACHE[dataset_id] = {"csv_path": csv_disk, "model_path": None, "df": df}
            except Exception as e:
                return jsonify({"error": "Failed to read cached dataset from disk."}), 500
        else:
            return jsonify({"error": "Dataset ID not found. Upload data first or use a demo."}), 404

    cached = DATASETS_CACHE[dataset_id]
    df = cached["df"]
    
    if not target or target not in df.columns:
        return jsonify({"error": f"Target column '{target}' not present in dataset."}), 400

    if not sensitive or not isinstance(sensitive, list):
        return jsonify({"error": "At least one sensitive attribute must be specified in 'sensitive' list."}), 400

    try:
        positive_label = int(positive_label)
    except (ValueError, TypeError):
        pass

    custom_model = None
    if cached.get("model_path") and os.path.exists(cached["model_path"]):
        try:
            custom_model = joblib.load(cached["model_path"])
        except Exception as e:
            error_id = str(uuid.uuid4())[:8]
            logger.error(f"[Model Load Error {error_id}]: {e}")
            return jsonify({"error": "Failed to deserialize model file.", "error_id": error_id}), 400

    job_id = str(uuid.uuid4())[:8]

    if is_sync:
        try:
            audit_result = run_audit(
                df=df,
                target_col=target,
                sensitive_cols=sensitive,
                model=custom_model,
                positive_label=positive_label,
                use_case=use_case,
                questionnaire=questionnaire,
                privileged_groups=privileged_groups,
                audit_id=job_id,
                pred_col=pred_col,
                pred_threshold=pred_threshold
            )
            AUDITS_CACHE[job_id] = audit_result
            json_path = os.path.join(AUDIT_STORE_DIR, f"{job_id}.json")
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(audit_result, f, indent=2)
            html_path = os.path.join(AUDIT_STORE_DIR, f"{job_id}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(generate_model_card_html(audit_result))
            return jsonify(audit_result)
        except Exception as e:
            error_id = str(uuid.uuid4())[:8]
            logger.exception(f"[Sync Audit Error {error_id}]: {e}")
            return jsonify({"error": "Audit execution encountered an internal error.", "error_id": error_id}), 500

    # Async background job
    JOBS_STORE[job_id] = {
        "job_id": job_id,
        "status": "running",
        "stage": "initializing",
        "progress": 5,
        "result": None,
        "error": None
    }

    worker_thread = threading.Thread(
        target=_execute_audit_worker,
        args=(job_id, df, target, sensitive, custom_model, positive_label,
              use_case, questionnaire, privileged_groups, pred_col, pred_threshold),
        daemon=True
    )
    worker_thread.start()

    return jsonify({
        "job_id": job_id,
        "status": "running",
        "stage": "initializing",
        "progress": 5
    }), 202

@app.route("/api/audit/<path:job_id>", methods=["GET"])
def get_audit_job(job_id: str):
    """Poll audit job status, stage, progress, and result."""
    if not validate_identifier(job_id, "job_id"):
        return jsonify({"error": "Invalid job identifier format. Must match ^[A-Za-z0-9_-]{1,40}$."}), 400

    if job_id in JOBS_STORE:
        return jsonify(JOBS_STORE[job_id])

    # Check if audit already completed and persisted
    if job_id in AUDITS_CACHE:
        return jsonify({
            "job_id": job_id,
            "status": "complete",
            "stage": "complete",
            "progress": 100,
            "result": AUDITS_CACHE[job_id],
            "error": None
        })

    json_path = os.path.join(AUDIT_STORE_DIR, f"{job_id}.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                res = json.load(f)
            AUDITS_CACHE[job_id] = res
            return jsonify({
                "job_id": job_id,
                "status": "complete",
                "stage": "complete",
                "progress": 100,
                "result": res,
                "error": None
            })
        except Exception:
            pass

    return jsonify({"error": f"Audit job '{job_id}' not found."}), 404

@app.route("/api/modelcard/<audit_id>.<ext>", methods=["GET"])
def get_modelcard(audit_id: str, ext: str):
    """Download compiled Model Card in HTML or JSON format with traversal protection."""
    if not validate_identifier(audit_id, "audit_id"):
        return jsonify({"error": "Invalid audit identifier format. Must match ^[A-Za-z0-9_-]{1,40}$."}), 400

    ext = ext.lower()
    if ext not in ["html", "json"]:
        return jsonify({"error": "Extension must be 'html' or 'json'."}), 400

    file_path = os.path.join(AUDIT_STORE_DIR, f"{audit_id}.{ext}")
    
    if not os.path.exists(file_path):
        if audit_id in AUDITS_CACHE:
            audit_result = AUDITS_CACHE[audit_id]
            if ext == "html":
                content = generate_model_card_html(audit_result)
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
            else:
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(audit_result, f, indent=2)
        else:
            return jsonify({"error": f"Model Card with audit ID '{audit_id}' not found."}), 404

    if ext == "html":
        return send_file(file_path, mimetype="text/html", as_attachment=True, download_name=f"modelcard_{audit_id}.html")
    else:
        return send_file(file_path, mimetype="application/json", as_attachment=True, download_name=f"modelcard_{audit_id}.json")

@app.route("/api/comparison", methods=["GET"])
def get_comparison():
    """Retrieve precomputed side-by-side benchmark comparison."""
    comp_path = os.path.join(AUDIT_STORE_DIR, "comparison.json")
    if os.path.exists(comp_path):
        with open(comp_path, "r", encoding="utf-8") as f:
            return jsonify(json.load(f))
    return jsonify({"error": "Comparison benchmark not yet generated."}), 404

# Catch-all route to serve the built Vite React frontend in production
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"error": f"API endpoint '/{path}' not found."}), 404
    if os.path.exists(DIST_DIR):
        if path != "" and os.path.exists(os.path.join(DIST_DIR, path)):
            return send_from_directory(DIST_DIR, path)
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify({
        "message": "AutoAudit-360 API running. Build frontend via 'npm run build' to serve the SPA.",
        "status": "healthy"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
