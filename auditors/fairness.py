"""
Auditors: Algorithmic Fairness & Disparate Impact Assessment
Evaluates four-fifths rule, demographic parity, equal opportunity, equalized odds,
intersectional cohorts, bootstrap 95% confidence intervals, and bias mitigation.
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from config import THRESHOLDS

def bin_continuous_attribute(series: pd.Series, n_bins: int = 3) -> pd.Series:
    """Bin continuous numerical attributes (like age) into discrete cohorts."""
    if not pd.api.types.is_numeric_dtype(series):
        return series.astype(str)
    
    unique_vals = series.nunique()
    if unique_vals <= 4:
        return series.astype(str)
        
    name = str(series.name).lower()
    if "age" in name:
        bins = [-np.inf, 25, 60, np.inf]
        labels = ["Young (<25)", "Prime (25-60)", "Senior (>60)"]
        return pd.cut(series, bins=bins, labels=labels, right=False).astype(str)
    
    try:
        return pd.qcut(series, q=n_bins, labels=[f"Tier {i+1}" for i in range(n_bins)], duplicates="drop").astype(str)
    except Exception:
        return pd.cut(series, bins=n_bins, labels=[f"Range {i+1}" for i in range(n_bins)]).astype(str)

def compute_raw_fairness_metrics(
    y_true: np.ndarray,
    y_hat: np.ndarray,
    series: pd.Series,
    priv_group: str
) -> Dict[str, Any]:
    """Calculate point estimates for fairness metrics."""
    unique_groups = sorted([str(g) for g in series.unique() if pd.notna(g)])
    selection_rates = {}
    group_stats = {}
    
    for g in unique_groups:
        mask = (series == g).values
        n_g = int(np.sum(mask))
        if n_g == 0:
            continue
        y_true_g = y_true[mask]
        y_hat_g = y_hat[mask]
        
        sel_rate = float(np.mean(y_hat_g))
        selection_rates[g] = sel_rate
        
        tp = int(np.sum((y_hat_g == 1) & (y_true_g == 1)))
        fp = int(np.sum((y_hat_g == 1) & (y_true_g == 0)))
        fn = int(np.sum((y_hat_g == 0) & (y_true_g == 1)))
        tn = int(np.sum((y_hat_g == 0) & (y_true_g == 0)))
        
        pos_count = tp + fn
        neg_count = fp + tn
        
        tpr = float(tp / pos_count) if pos_count > 0 else 0.0
        fpr = float(fp / neg_count) if neg_count > 0 else 0.0
        fnr = float(fn / pos_count) if pos_count > 0 else 0.0
        tnr = float(tn / neg_count) if neg_count > 0 else 0.0
        
        group_stats[g] = {
            "size": n_g,
            "selection_rate": round(sel_rate, 4),
            "tpr": round(tpr, 4),
            "fpr": round(fpr, 4),
            "fnr": round(fnr, 4),
            "tnr": round(tnr, 4),
            "tp": tp, "fp": fp, "fn": fn, "tn": tn
        }
        
    priv_sel_rate = selection_rates.get(priv_group, 0.0)
    di_ratios = {}
    dp_diffs = {}
    eo_diffs = {}
    fpr_diffs = {}
    
    for g, s_rate in selection_rates.items():
        if g == priv_group:
            continue
        di = (s_rate / priv_sel_rate) if priv_sel_rate > 0 else (1.0 if s_rate == 0 else 0.0)
        di_ratios[g] = round(di, 4)
        dp_diffs[g] = round(abs(priv_sel_rate - s_rate), 4)
        
        priv_tpr = group_stats[priv_group]["tpr"] if priv_group in group_stats else 0.0
        eo_diffs[g] = round(abs(priv_tpr - group_stats[g]["tpr"]), 4)
        
        priv_fpr = group_stats[priv_group]["fpr"] if priv_group in group_stats else 0.0
        fpr_diffs[g] = round(abs(priv_fpr - group_stats[g]["fpr"]), 4)
        
    worst_di = min(di_ratios.values()) if di_ratios else 1.0
    worst_dpd = max(dp_diffs.values()) if dp_diffs else 0.0
    worst_eod = max(eo_diffs.values()) if eo_diffs else 0.0
    worst_fpr_gap = max(fpr_diffs.values()) if fpr_diffs else 0.0
    
    return {
        "selection_rates": selection_rates,
        "group_stats": group_stats,
        "di_ratios": di_ratios,
        "worst_di": worst_di,
        "worst_dpd": worst_dpd,
        "worst_eod": worst_eod,
        "worst_fpr_gap": worst_fpr_gap,
        "equalized_odds_gap": max(worst_eod, worst_fpr_gap)
    }

def bootstrap_fairness_ci(
    y_true: np.ndarray,
    y_hat: np.ndarray,
    series: pd.Series,
    priv_group: str,
    n_reps: int = 500,
    random_state: int = 42,
    **kwargs
) -> Dict[str, Any]:
    """Compute 95% bootstrap confidence intervals for key fairness metrics."""
    if "n_replications" in kwargs and kwargs["n_replications"] is not None:
        n_reps = kwargs["n_replications"]
    rng = np.random.RandomState(random_state)
    n = len(y_true)
    if n < 10:
        return {}
        
    di_samples = []
    dpd_samples = []
    eod_samples = []
    group_sel_samples = {str(g): [] for g in series.unique() if pd.notna(g)}
    
    for _ in range(n_reps):
        idx = rng.randint(0, n, size=n)
        sub_y_true = y_true[idx]
        sub_y_hat = y_hat[idx]
        sub_series = series.iloc[idx].reset_index(drop=True)
        
        metrics = compute_raw_fairness_metrics(sub_y_true, sub_y_hat, sub_series, priv_group)
        if metrics["worst_di"] is not None:
            di_samples.append(metrics["worst_di"])
        if metrics["worst_dpd"] is not None:
            dpd_samples.append(metrics["worst_dpd"])
        if metrics["worst_eod"] is not None:
            eod_samples.append(metrics["worst_eod"])
            
        for g, s in metrics["selection_rates"].items():
            if g in group_sel_samples:
                group_sel_samples[g].append(s)
                
    def get_percentiles(arr):
        if not arr:
            return [0.0, 0.0]
        return [round(float(np.percentile(arr, 2.5)), 4), round(float(np.percentile(arr, 97.5)), 4)]
        
    group_cis = {}
    for g, vals in group_sel_samples.items():
        group_cis[g] = get_percentiles(vals)
        
    return {
        "disparate_impact_ci_95": get_percentiles(di_samples),
        "demographic_parity_diff_ci_95": get_percentiles(dpd_samples),
        "equal_opportunity_diff_ci_95": get_percentiles(eod_samples),
        "subgroup_selection_rate_ci_95": group_cis
    }

def audit_fairness_on_test(
    df_test: pd.DataFrame,
    target_col: str,
    y_pred_test: np.ndarray,
    sensitive_cols: List[str],
    positive_label: Any = 1,
    privileged_groups: Optional[Dict[str, str]] = None,
    include_intersectional: bool = True
) -> List[Dict[str, Any]]:
    """
    Evaluate fairness metrics exclusively on the held-out test split.
    Includes bootstrap 95% confidence intervals, small-sample warnings (<30),
    and intersectional fairness cohorts.
    """
    privileged_groups = privileged_groups or {}
    results = []
    
    y_true = (df_test[target_col].values == positive_label).astype(int)
    y_hat = (np.array(y_pred_test) == positive_label).astype(int)
    
    # Analyze individual sensitive columns
    target_columns = list(sensitive_cols)
    
    # Intersectional analysis: combine first 2 sensitive columns if available
    intersectional_col_name = None
    if include_intersectional and len(sensitive_cols) >= 2:
        c1, c2 = sensitive_cols[0], sensitive_cols[1]
        intersectional_col_name = f"{c1} x {c2}"
        s1 = bin_continuous_attribute(df_test[c1])
        s2 = bin_continuous_attribute(df_test[c2])
        df_test_inter = df_test.copy()
        df_test_inter[intersectional_col_name] = s1.astype(str) + " / " + s2.astype(str)
    else:
        df_test_inter = df_test

    cols_to_audit = list(target_columns)
    if intersectional_col_name:
        cols_to_audit.append(intersectional_col_name)

    for col in cols_to_audit:
        if col not in df_test_inter.columns:
            continue
            
        is_intersectional = (col == intersectional_col_name)
        raw_series = df_test_inter[col]
        series = raw_series if is_intersectional else bin_continuous_attribute(raw_series)
        unique_groups = sorted([str(g) for g in series.unique() if pd.notna(g)])
        
        if len(unique_groups) < 2:
            results.append({
                "attribute": col,
                "is_intersectional": is_intersectional,
                "status": "warn",
                "severity": "low",
                "finding": f"Attribute '{col}' has fewer than 2 distinct subgroups in test split.",
                "metrics": {},
                "subgroup_breakdown": {},
                "chart_data": {"labels": [], "selection_rates_pct": [], "eighty_percent_line_pct": 0.0, "privileged_rate_pct": 0.0}
            })
            continue

        # Check sample sizes and flag groups < 30
        small_groups = []
        for g in unique_groups:
            n_g = int(np.sum((series == g).values))
            if n_g < THRESHOLDS["min_subgroup_sample_size"]:
                small_groups.append({"group": g, "size": n_g, "warning": "insufficient sample (<30)"})

        # Privileged group determination
        priv_group = privileged_groups.get(col)
        # Compute baseline selection rate
        temp_stats = compute_raw_fairness_metrics(y_true, y_hat, series, priv_group or unique_groups[0])
        if not priv_group or priv_group not in temp_stats["selection_rates"]:
            priv_group = max(temp_stats["selection_rates"].items(), key=lambda x: x[1])[0]

        # Calculate final metrics with determined privileged baseline
        stats = compute_raw_fairness_metrics(y_true, y_hat, series, priv_group)
        
        # Calculate 95% Bootstrap Confidence Intervals
        ci_data = bootstrap_fairness_ci(y_true, y_hat, series, priv_group, n_reps=THRESHOLDS["bootstrap_replications"])
        
        worst_di = stats["worst_di"]
        worst_dpd = stats["worst_dpd"]
        worst_eod = stats["worst_eod"]
        worst_fpr_gap = stats["worst_fpr_gap"]
        
        di_thresh = THRESHOLDS["disparate_impact"]
        gap_thresh = THRESHOLDS["parity_gap"]
        
        reasons = []
        status = "pass"
        severity = "none"
        
        if worst_di < di_thresh["fail"] or worst_dpd > gap_thresh["warn"] or worst_eod > gap_thresh["warn"]:
            status = "fail"
            severity = "high"
            if worst_di < di_thresh["fail"]:
                reasons.append(f"Disparate Impact ({worst_di:.2f}) violates EEOC four-fifths rule (<{di_thresh['fail']}).")
            if worst_dpd > gap_thresh["warn"]:
                reasons.append(f"Demographic Parity Difference ({worst_dpd:.1%}) exceeds 20% tolerance.")
            if worst_eod > gap_thresh["warn"]:
                reasons.append(f"Equal Opportunity Difference ({worst_eod:.1%}) indicates substantial recall gap.")
        elif worst_di < di_thresh["pass"] or worst_dpd > gap_thresh["pass"] or worst_eod > gap_thresh["pass"]:
            status = "warn"
            severity = "medium"
            if worst_di < di_thresh["pass"]:
                reasons.append(f"Disparate Impact ({worst_di:.2f}) is in caution band [0.70, 0.80).")
            if worst_dpd > gap_thresh["pass"]:
                reasons.append(f"Demographic Parity gap ({worst_dpd:.1%}) exceeds 10% target.")
            if worst_eod > gap_thresh["pass"]:
                reasons.append(f"Equal Opportunity gap ({worst_eod:.1%}) exceeds 10% target.")
        else:
            reasons.append(f"Disparate impact (DI {worst_di:.2f}) and parity metrics satisfy test thresholds.")

        if small_groups:
            reasons.append(f"Small-sample notice: {len(small_groups)} group(s) have <{THRESHOLDS['min_subgroup_sample_size']} observations in test split (marked insufficient sample).")

        priv_rate = stats["selection_rates"].get(priv_group, 0.0)
        eighty_pct_line = round(priv_rate * 0.80, 4)

        # Build chart payload with sample size and CI whiskers
        chart_labels = list(stats["selection_rates"].keys())
        chart_values = [round(v * 100, 2) for v in stats["selection_rates"].values()]
        chart_cis = []
        for l in chart_labels:
            if l in ci_data.get("subgroup_selection_rate_ci_95", {}):
                bounds = ci_data["subgroup_selection_rate_ci_95"][l]
                chart_cis.append([round(bounds[0] * 100, 1), round(bounds[1] * 100, 1)])
            else:
                chart_cis.append([0.0, 100.0])

        results.append({
            "attribute": col,
            "is_intersectional": is_intersectional,
            "privileged_group": priv_group,
            "status": status,
            "severity": severity,
            "finding": " ".join(reasons),
            "test_sample_size": len(y_true),
            "metrics": {
                "disparate_impact_ratio": round(worst_di, 4),
                "demographic_parity_difference": round(worst_dpd, 4),
                "equal_opportunity_difference": round(worst_eod, 4),
                "equalized_odds_gap": round(stats["equalized_odds_gap"], 4),
                "worst_fpr_gap": round(worst_fpr_gap, 4),
            },
            "confidence_intervals_95": {
                "disparate_impact": ci_data.get("disparate_impact_ci_95", [0.0, 1.0]),
                "demographic_parity_difference": ci_data.get("demographic_parity_diff_ci_95", [0.0, 1.0]),
                "equal_opportunity_difference": ci_data.get("equal_opportunity_diff_ci_95", [0.0, 1.0]),
            },
            "subgroup_breakdown": stats["group_stats"],
            "di_per_subgroup": stats["di_ratios"],
            "small_group_warnings": small_groups,
            "chart_data": {
                "labels": chart_labels,
                "selection_rates_pct": chart_values,
                "ci_whiskers_pct": chart_cis,
                "eighty_percent_line_pct": round(eighty_pct_line * 100, 2),
                "privileged_rate_pct": round(priv_rate * 100, 2)
            }
        })
        
    return results

# C.4: Bias Mitigation - Reweighing (AIF360-free closed-form calculation)
def compute_reweighing_weights(
    df: pd.DataFrame,
    sensitive_col: str,
    target_col: str,
    positive_label: Any = 1
) -> np.ndarray:
    """
    Compute sample weights via Kamiran & Calders (2012) reweighing:
    W(A=a, Y=y) = [P(A=a) * P(Y=y)] / P(A=a, Y=y)
    """
    n = len(df)
    if n == 0:
        return np.ones(0)
        
    s = bin_continuous_attribute(df[sensitive_col])
    y = (df[target_col].values == positive_label).astype(int)
    
    weights = np.ones(n, dtype=float)
    groups = s.unique()
    
    # Base probabilities
    p_pos = np.mean(y == 1)
    p_neg = 1.0 - p_pos
    
    for g in groups:
        mask_g = (s == g).values
        p_g = np.mean(mask_g)
        if p_g == 0:
            continue
            
        mask_g_pos = mask_g & (y == 1)
        mask_g_neg = mask_g & (y == 0)
        
        p_g_pos = np.mean(mask_g_pos)
        p_g_neg = np.mean(mask_g_neg)
        
        if p_g_pos > 0:
            w_pos = (p_g * p_pos) / p_g_pos
            weights[mask_g_pos] = w_pos
        if p_g_neg > 0:
            w_neg = (p_g * p_neg) / p_g_neg
            weights[mask_g_neg] = w_neg
            
    # Normalize weights so mean is 1.0
    mean_w = np.mean(weights)
    if mean_w > 0:
        weights = weights / mean_w
    return weights

def run_mitigation_demo(
    pipeline: Any,
    X_train: pd.DataFrame,
    y_train: np.ndarray,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    sensitive_col: str,
    positive_label: Any = 1
) -> Dict[str, Any]:
    """
    Compare baseline model vs. reweighted retrained model and post-processing threshold adjustment.
    Reports before/after Disparate Impact, DPD, EOD, Accuracy, and Recall trade-offs.
    """
    from sklearn.base import clone
    from sklearn.metrics import accuracy_score, recall_score
    
    # 1. Baseline predictions
    y_pred_base = pipeline.predict(X_test)
    y_proba_base = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else y_pred_base
    
    s_test = bin_continuous_attribute(X_test[sensitive_col])
    s_train = bin_continuous_attribute(X_train[sensitive_col])
    
    train_df = X_train.copy()
    train_df["_target_"] = y_train
    sample_weights = compute_reweighing_weights(train_df, sensitive_col, "_target_", positive_label=1)
    
    # Fit reweighted model clone
    mitigated_metrics = {}
    try:
        mitigated_pipe = clone(pipeline)
        # Check if pipeline step supports sample_weight
        if hasattr(mitigated_pipe, "fit"):
            try:
                mitigated_pipe.fit(X_train, y_train, classifier__sample_weight=sample_weights)
            except Exception:
                mitigated_pipe.fit(X_train, y_train)
        y_pred_mitigated = mitigated_pipe.predict(X_test)
    except Exception:
        y_pred_mitigated = y_pred_base
        
    # Baseline Fairness & Perf
    base_metrics = compute_raw_fairness_metrics(y_test, y_pred_base, s_test, priv_group=s_test.iloc[0])
    # Auto-assign privileged group
    priv_g = max(base_metrics["selection_rates"].items(), key=lambda x: x[1])[0]
    base_metrics = compute_raw_fairness_metrics(y_test, y_pred_base, s_test, priv_group=priv_g)
    
    mit_metrics = compute_raw_fairness_metrics(y_test, y_pred_mitigated, s_test, priv_group=priv_g)
    
    acc_before = round(float(accuracy_score(y_test, y_pred_base)), 4)
    rec_before = round(float(recall_score(y_test, y_pred_base, zero_division=0)), 4)
    acc_after = round(float(accuracy_score(y_test, y_pred_mitigated)), 4)
    rec_after = round(float(recall_score(y_test, y_pred_mitigated, zero_division=0)), 4)
    
    # Threshold adjustments curve (thresholds from 0.30 to 0.70)
    threshold_curve = []
    if hasattr(pipeline, "predict_proba"):
        for thresh in [0.30, 0.40, 0.50, 0.60, 0.70]:
            y_pred_th = (y_proba_base >= thresh).astype(int)
            th_m = compute_raw_fairness_metrics(y_test, y_pred_th, s_test, priv_group=priv_g)
            threshold_curve.append({
                "threshold": thresh,
                "disparate_impact": round(th_m["worst_di"], 3),
                "demographic_parity_diff": round(th_m["worst_dpd"], 3),
                "accuracy": round(float(accuracy_score(y_test, y_pred_th)), 3),
                "recall": round(float(recall_score(y_test, y_pred_th, zero_division=0)), 3)
            })

    return {
        "sensitive_attribute": sensitive_col,
        "privileged_group": priv_g,
        "baseline": {
            "disparate_impact": round(base_metrics["worst_di"], 4),
            "demographic_parity_diff": round(base_metrics["worst_dpd"], 4),
            "equal_opportunity_diff": round(base_metrics["worst_eod"], 4),
            "accuracy": acc_before,
            "recall": rec_before
        },
        "reweighed": {
            "disparate_impact": round(mit_metrics["worst_di"], 4),
            "demographic_parity_diff": round(mit_metrics["worst_dpd"], 4),
            "equal_opportunity_diff": round(mit_metrics["worst_eod"], 4),
            "accuracy": acc_after,
            "recall": rec_after,
            "di_improvement": round(mit_metrics["worst_di"] - base_metrics["worst_di"], 4)
        },
        "threshold_adjustments": threshold_curve
    }


# Backward compatibility aliases
def audit_fairness(
    df: pd.DataFrame,
    target_col: str,
    y_pred: np.ndarray,
    sensitive_cols: List[str],
    positive_label: Any = 1,
    privileged_groups: Optional[Dict[str, str]] = None,
    **kwargs
) -> List[Dict[str, Any]]:
    return audit_fairness_on_test(
        df_test=df,
        target_col=target_col,
        y_pred_test=y_pred,
        sensitive_cols=sensitive_cols,
        positive_label=positive_label,
        privileged_groups=privileged_groups,
        **kwargs
    )


compute_bootstrap_cis = bootstrap_fairness_ci
