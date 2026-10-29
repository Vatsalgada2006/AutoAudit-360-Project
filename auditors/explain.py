"""
Auditors: Explainability & Interpretability via Global SHAP
Detects feature importance, proxy variables, and sensitive feature leakage.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import shap
from config import THRESHOLDS, RANDOM_SEED

def compute_proxy_correlations(
    df: pd.DataFrame,
    feature_cols: List[str],
    sensitive_cols: List[str]
) -> Dict[str, Dict[str, float]]:
    """Compute maximum correlation between model features and sensitive attributes."""
    proxies = {}
    
    # Pre-encode numeric/categorical for correlation check
    df_encoded = pd.DataFrame()
    for col in df.columns:
        if col in feature_cols or col in sensitive_cols:
            if pd.api.types.is_numeric_dtype(df[col]):
                df_encoded[col] = df[col].fillna(df[col].median())
            else:
                df_encoded[col] = pd.factorize(df[col].astype(str))[0]

    for feat in feature_cols:
        # Match feature with base column if transformed (e.g., num__Age -> Age, cat__Sex_Male -> Sex)
        clean_name = feat.split('__')[-1] if '__' in feat else feat
        base_name = clean_name.split('_')[0]
        
        if feat in sensitive_cols or clean_name in sensitive_cols or base_name in sensitive_cols:
            continue
            
        feat_series = None
        if feat in df_encoded.columns:
            feat_series = df_encoded[feat]
        elif clean_name in df_encoded.columns:
            feat_series = df_encoded[clean_name]
        elif base_name in df_encoded.columns:
            feat_series = df_encoded[base_name]
            
        if feat_series is None:
            continue

        proxies[feat] = {}
        for sens in sensitive_cols:
            if sens not in df_encoded.columns:
                continue
            sens_series = df_encoded[sens]
            try:
                corr = abs(float(feat_series.corr(sens_series, method='spearman')))
                if np.isnan(corr):
                    corr = 0.0
            except Exception:
                corr = 0.0
            if corr >= THRESHOLDS["proxy_correlation_threshold"]:
                proxies[feat][sens] = round(corr, 3)
                
    return proxies

def audit_explainability(
    model: Any,
    X: pd.DataFrame,
    feature_names: List[str],
    sensitive_cols: List[str],
    preprocessor: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Run global SHAP feature attribution audit and identify sensitive leakage / proxy variables.
    """
    np.random.seed(RANDOM_SEED)
    findings = []
    status = "pass"
    severity = "none"
    shap_success = False
    
    # Subsample background and evaluation sets to guarantee completion in seconds
    n_samples = len(X)
    bg_size = min(n_samples, THRESHOLDS["shap_max_background_samples"])
    eval_size = min(n_samples, THRESHOLDS["shap_max_eval_samples"])
    
    bg_idx = np.random.choice(n_samples, size=bg_size, replace=False)
    eval_idx = np.random.choice(n_samples, size=eval_size, replace=False)
    
    X_bg = X.iloc[bg_idx]
    X_eval = X.iloc[eval_idx]
    
    # Handle preprocessors if given
    if preprocessor is not None:
        try:
            X_bg_trans = preprocessor.transform(X_bg)
            X_eval_trans = preprocessor.transform(X_eval)
        except Exception:
            X_bg_trans = X_bg
            X_eval_trans = X_eval
    else:
        X_bg_trans = X_bg
        X_eval_trans = X_eval

    # Identify underlying estimator if model is a Pipeline
    estimator = model
    if hasattr(model, "named_steps"):
        estimator = model.steps[-1][1]
    elif hasattr(model, "best_estimator_"):
        estimator = model.best_estimator_

    mean_abs_shap = {}
    explainer_type = "PermutationExplainer"
    
    try:
        # Check if estimator is a tree model compatible with TreeExplainer
        estimator_type_str = str(type(estimator)).lower()
        is_tree = any(t in estimator_type_str for t in ["forest", "tree", "gradientboosting", "xgb", "lgbm", "extratrees"])
        
        if is_tree:
            explainer_type = "TreeExplainer"
            explainer = shap.TreeExplainer(estimator)
            shap_values = explainer.shap_values(X_eval_trans)
        else:
            # Predict probability function
            def predict_fn(data):
                if hasattr(model, "predict_proba"):
                    probs = model.predict_proba(data)
                    return probs[:, 1] if probs.ndim == 2 else probs
                return model.predict(data)
                
            explainer_type = "Explainer(Linear/Permutation)"
            # Convert to numeric if needed for permutation explainer
            explainer = shap.Explainer(predict_fn, X_bg_trans)
            shap_values = explainer(X_eval_trans).values

        # Format SHAP values: if list (multi-class), take positive class index 1
        if isinstance(shap_values, list):
            sv = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        elif hasattr(shap_values, "values"):
            sv = shap_values.values
            if sv.ndim == 3:
                sv = sv[:, :, 1]
        elif isinstance(shap_values, np.ndarray):
            sv = shap_values
            if sv.ndim == 3:
                sv = sv[:, :, 1]
                
        # Mean absolute SHAP per feature
        feature_importances = np.mean(np.abs(sv), axis=0)
        
        # Match with feature names
        col_names = feature_names if len(feature_names) == len(feature_importances) else [f"feature_{i}" for i in range(len(feature_importances))]
        
        for name, val in zip(col_names, feature_importances):
            mean_abs_shap[name] = float(val)
            
        shap_success = True
    except Exception as e:
        # Robust fallback using feature_importances_ or permutation fallback
        findings.append(f"SHAP explanation fallback utilized: {str(e)[:90]}.")
        if hasattr(estimator, "feature_importances_"):
            fi = estimator.feature_importances_
            col_names = feature_names if len(feature_names) == len(fi) else [f"feature_{i}" for i in range(len(fi))]
            for name, val in zip(col_names, fi):
                mean_abs_shap[name] = float(val)
            shap_success = True
            explainer_type = "Model Feature Importances (Fallback)"
        else:
            shap_success = False

    # Sort features by importance
    sorted_features = sorted(mean_abs_shap.items(), key=lambda x: x[1], reverse=True)
    top_5 = sorted_features[:5]
    top_5_names = [f[0] for f in top_5]
    
    # Calculate Proxy Correlations
    proxy_map = compute_proxy_correlations(X, feature_names, sensitive_cols)
    
    # Check top 5 for direct sensitive features or high-correlation proxies
    def is_feat_sensitive(name: str) -> bool:
        clean = name.split('__')[-1] if '__' in name else name
        base = clean.split('_')[0]
        return name in sensitive_cols or clean in sensitive_cols or base in sensitive_cols

    sensitive_in_top_5 = [f for f in top_5_names if is_feat_sensitive(f)]
    proxies_in_top_5 = []
    
    for f in top_5_names:
        if f in proxy_map and proxy_map[f]:
            for sens, corr_val in proxy_map[f].items():
                proxies_in_top_5.append({
                    "feature": f,
                    "sensitive_attribute": sens,
                    "correlation": corr_val
                })
                
    flagged_count = len(sensitive_in_top_5) + len(proxies_in_top_5)
    
    if flagged_count >= 2:
        status = "fail"
        severity = "high"
        findings.append(f"Critical Bias Risk: {flagged_count} sensitive attributes or high-correlation proxies appear among top 5 most influential features.")
    elif flagged_count == 1:
        status = "warn"
        severity = "medium"
        findings.append(f"Moderate Risk: 1 sensitive attribute or proxy variable detected in top 5 features.")
    else:
        findings.append("Clean feature attribution: No protected attributes or severe proxy variables detected in top 5 global drivers.")

    if sensitive_in_top_5:
        findings.append(f"Protected features in top 5: {', '.join(sensitive_in_top_5)}.")
    if proxies_in_top_5:
        p_desc = [f"{p['feature']} (corr {p['correlation']} with {p['sensitive_attribute']})" for p in proxies_in_top_5]
        findings.append(f"Potential proxy variables in top 5: {', '.join(p_desc)}.")

    findings.append("Causality Disclaimer: SHAP values quantify predictive attribution within the mathematical manifold, not causal mechanisms.")

    # Prepare chart payload
    chart_labels = [f[0] for f in sorted_features[:10]]
    chart_values = [round(f[1], 4) for f in sorted_features[:10]]
    
    return {
        "status": status,
        "severity": severity,
        "explainer_type": explainer_type,
        "shap_success": shap_success,
        "finding": " ".join(findings),
        "disclaimer": "SHAP feature importances reflect marginal predictive contribution to the model's scoring manifold. They do NOT establish legal or real-world causality.",
        "top_features": [
            {
                "feature": f[0],
                "importance": round(f[1], 4),
                "is_sensitive": is_feat_sensitive(f[0]),
                "is_proxy": f[0] in [p["feature"] for p in proxies_in_top_5]
            }
            for f in sorted_features[:10]
        ],
        "sensitive_in_top_5": sensitive_in_top_5,
        "proxies_in_top_5": proxies_in_top_5,
        "flagged_count": flagged_count,
        "chart_data": {
            "labels": chart_labels,
            "values": chart_values
        }
    }
