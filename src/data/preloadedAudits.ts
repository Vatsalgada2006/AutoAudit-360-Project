import { FullAuditResult } from "../types.ts";

export const GERMAN_CREDIT_AUDIT: FullAuditResult = {
  "meta": {
    "audit_id": "german_credit",
    "timestamp": "2026-10-27T20:49:27.409695+00:00",
    "model_name": "Model_german_credit",
    "algorithm": "RandomForestClassifier (Auto-trained baseline)",
    "is_default_trained": true,
    "is_pred_col_mode": false,
    "framework": "scikit-learn / PyTorch compatible",
    "random_seed": 42,
    "dataset_hash": "b131337be558d082ca5a949b914123b520620677ada79e5c7f1526d45f376ed0",
    "system": "AutoAudit-360: Trustworthy AI Audit & Regulatory Compliance Suite"
  },
  "data_summary": {
    "total_rows": 1000,
    "test_split_rows": 200,
    "total_features": 11,
    "target_column": "Creditability",
    "positive_label": "1",
    "positive_rate": 46.2,
    "sensitive_attributes": [
      "Sex",
      "Age",
      "Foreign_Worker"
    ],
    "missing_percentage": 0.0,
    "is_pred_col_mode": false
  },
  "performance": {
    "accuracy": 0.62,
    "balanced_accuracy": 0.6087,
    "precision": 0.6143,
    "recall": 0.4674,
    "f1_score": 0.5309,
    "roc_auc": 0.6695,
    "repeated_cross_validation": {
      "accuracy": {
        "mean": 0.617,
        "std": 0.0181,
        "formatted": "0.617 \u00b1 0.018"
      },
      "balanced_accuracy": {
        "mean": 0.6079,
        "std": 0.0207,
        "formatted": "0.608 \u00b1 0.021"
      },
      "precision": {
        "mean": 0.6011,
        "std": 0.0184,
        "formatted": "0.601 \u00b1 0.018"
      },
      "recall": {
        "mean": 0.4935,
        "std": 0.0582,
        "formatted": "0.493 \u00b1 0.058"
      },
      "f1_score": {
        "mean": 0.5406,
        "std": 0.0417,
        "formatted": "0.541 \u00b1 0.042"
      },
      "roc_auc": {
        "mean": 0.6596,
        "std": 0.0272,
        "formatted": "0.660 \u00b1 0.027"
      },
      "seeds_evaluated": 5
    }
  },
  "fairness": [
    {
      "attribute": "Sex",
      "is_intersectional": false,
      "privileged_group": "Male",
      "status": "fail",
      "severity": "high",
      "finding": "Disparate Impact (0.66) violates EEOC four-fifths rule (<0.7).",
      "test_sample_size": 200,
      "metrics": {
        "disparate_impact_ratio": 0.6623,
        "demographic_parity_difference": 0.1345,
        "equal_opportunity_difference": 0.179,
        "equalized_odds_gap": 0.179,
        "worst_fpr_gap": 0.0676
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.3904,
          1.0541
        ],
        "demographic_parity_difference": [
          0.0159,
          0.256
        ],
        "equal_opportunity_difference": [
          0.0124,
          0.3921
        ]
      },
      "subgroup_breakdown": {
        "Female": {
          "size": 72,
          "selection_rate": 0.2639,
          "tpr": 0.3448,
          "fpr": 0.2093,
          "fnr": 0.6552,
          "tnr": 0.7907,
          "tp": 10,
          "fp": 9,
          "fn": 19,
          "tn": 34
        },
        "Male": {
          "size": 128,
          "selection_rate": 0.3984,
          "tpr": 0.5238,
          "fpr": 0.2769,
          "fnr": 0.4762,
          "tnr": 0.7231,
          "tp": 33,
          "fp": 18,
          "fn": 30,
          "tn": 47
        }
      },
      "di_per_subgroup": {
        "Female": 0.6623
      },
      "small_group_warnings": [],
      "chart_data": {
        "labels": [
          "Female",
          "Male"
        ],
        "selection_rates_pct": [
          26.39,
          39.84
        ],
        "ci_whiskers_pct": [
          [
            15.7,
            37.1
          ],
          [
            30.7,
            48.0
          ]
        ],
        "eighty_percent_line_pct": 31.88,
        "privileged_rate_pct": 39.84
      }
    },
    {
      "attribute": "Age",
      "is_intersectional": false,
      "privileged_group": "Senior (>60)",
      "status": "fail",
      "severity": "high",
      "finding": "Disparate Impact (0.07) violates EEOC four-fifths rule (<0.7). Demographic Parity Difference (71.3%) exceeds 20% tolerance. Equal Opportunity Difference (61.7%) indicates substantial recall gap.",
      "test_sample_size": 200,
      "metrics": {
        "disparate_impact_ratio": 0.0705,
        "demographic_parity_difference": 0.7126,
        "equal_opportunity_difference": 0.6167,
        "equalized_odds_gap": 0.8,
        "worst_fpr_gap": 0.8
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.0,
          0.1869
        ],
        "demographic_parity_difference": [
          0.5238,
          0.8851
        ],
        "equal_opportunity_difference": [
          0.3239,
          0.8751
        ]
      },
      "subgroup_breakdown": {
        "Prime (25-60)": {
          "size": 133,
          "selection_rate": 0.3383,
          "tpr": 0.4561,
          "fpr": 0.25,
          "fnr": 0.5439,
          "tnr": 0.75,
          "tp": 26,
          "fp": 19,
          "fn": 31,
          "tn": 57
        },
        "Senior (>60)": {
          "size": 30,
          "selection_rate": 0.7667,
          "tpr": 0.75,
          "fpr": 0.8,
          "fnr": 0.25,
          "tnr": 0.2,
          "tp": 15,
          "fp": 8,
          "fn": 5,
          "tn": 2
        },
        "Young (<25)": {
          "size": 37,
          "selection_rate": 0.0541,
          "tpr": 0.1333,
          "fpr": 0.0,
          "fnr": 0.8667,
          "tnr": 1.0,
          "tp": 2,
          "fp": 0,
          "fn": 13,
          "tn": 22
        }
      },
      "di_per_subgroup": {
        "Prime (25-60)": 0.4413,
        "Young (<25)": 0.0705
      },
      "small_group_warnings": [],
      "chart_data": {
        "labels": [
          "Prime (25-60)",
          "Senior (>60)",
          "Young (<25)"
        ],
        "selection_rates_pct": [
          33.83,
          76.67,
          5.41
        ],
        "ci_whiskers_pct": [
          [
            25.7,
            42.1
          ],
          [
            59.8,
            91.7
          ],
          [
            0.0,
            14.3
          ]
        ],
        "eighty_percent_line_pct": 61.33,
        "privileged_rate_pct": 76.67
      }
    },
    {
      "attribute": "Foreign_Worker",
      "is_intersectional": false,
      "privileged_group": "Yes",
      "status": "fail",
      "severity": "high",
      "finding": "Equal Opportunity Difference (54.4%) indicates substantial recall gap. Small-sample notice: 1 group(s) have <30 observations in test split (marked insufficient sample).",
      "test_sample_size": 200,
      "metrics": {
        "disparate_impact_ratio": 0.951,
        "demographic_parity_difference": 0.0172,
        "equal_opportunity_difference": 0.5444,
        "equalized_odds_gap": 0.5444,
        "worst_fpr_gap": 0.2596
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.0,
          2.0927
        ],
        "demographic_parity_difference": [
          0.0034,
          0.4038
        ],
        "equal_opportunity_difference": [
          0.3941,
          0.6386
        ]
      },
      "subgroup_breakdown": {
        "No": {
          "size": 6,
          "selection_rate": 0.3333,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 2,
          "fp": 0,
          "fn": 0,
          "tn": 4
        },
        "Yes": {
          "size": 194,
          "selection_rate": 0.3505,
          "tpr": 0.4556,
          "fpr": 0.2596,
          "fnr": 0.5444,
          "tnr": 0.7404,
          "tp": 41,
          "fp": 27,
          "fn": 49,
          "tn": 77
        }
      },
      "di_per_subgroup": {
        "No": 0.951
      },
      "small_group_warnings": [
        {
          "group": "No",
          "size": 6,
          "warning": "insufficient sample (<30)"
        }
      ],
      "chart_data": {
        "labels": [
          "No",
          "Yes"
        ],
        "selection_rates_pct": [
          33.33,
          35.05
        ],
        "ci_whiskers_pct": [
          [
            0.0,
            73.4
          ],
          [
            28.3,
            41.6
          ]
        ],
        "eighty_percent_line_pct": 28.04,
        "privileged_rate_pct": 35.05
      }
    },
    {
      "attribute": "Sex x Age",
      "is_intersectional": true,
      "privileged_group": "Male / Senior (>60)",
      "status": "fail",
      "severity": "high",
      "finding": "Disparate Impact (0.00) violates EEOC four-fifths rule (<0.7). Demographic Parity Difference (87.5%) exceeds 20% tolerance. Equal Opportunity Difference (90.0%) indicates substantial recall gap. Small-sample notice: 4 group(s) have <30 observations in test split (marked insufficient sample).",
      "test_sample_size": 200,
      "metrics": {
        "disparate_impact_ratio": 0.0,
        "demographic_parity_difference": 0.875,
        "equal_opportunity_difference": 0.9,
        "equalized_odds_gap": 0.9,
        "worst_fpr_gap": 0.8333
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.0,
          0.0
        ],
        "demographic_parity_difference": [
          0.7,
          1.0
        ],
        "equal_opportunity_difference": [
          0.6667,
          1.0
        ]
      },
      "subgroup_breakdown": {
        "Female / Prime (25-60)": {
          "size": 43,
          "selection_rate": 0.2326,
          "tpr": 0.2667,
          "fpr": 0.2143,
          "fnr": 0.7333,
          "tnr": 0.7857,
          "tp": 4,
          "fp": 6,
          "fn": 11,
          "tn": 22
        },
        "Female / Senior (>60)": {
          "size": 14,
          "selection_rate": 0.6429,
          "tpr": 0.6,
          "fpr": 0.75,
          "fnr": 0.4,
          "tnr": 0.25,
          "tp": 6,
          "fp": 3,
          "fn": 4,
          "tn": 1
        },
        "Female / Young (<25)": {
          "size": 15,
          "selection_rate": 0.0,
          "tpr": 0.0,
          "fpr": 0.0,
          "fnr": 1.0,
          "tnr": 1.0,
          "tp": 0,
          "fp": 0,
          "fn": 4,
          "tn": 11
        },
        "Male / Prime (25-60)": {
          "size": 90,
          "selection_rate": 0.3889,
          "tpr": 0.5238,
          "fpr": 0.2708,
          "fnr": 0.4762,
          "tnr": 0.7292,
          "tp": 22,
          "fp": 13,
          "fn": 20,
          "tn": 35
        },
        "Male / Senior (>60)": {
          "size": 16,
          "selection_rate": 0.875,
          "tpr": 0.9,
          "fpr": 0.8333,
          "fnr": 0.1,
          "tnr": 0.1667,
          "tp": 9,
          "fp": 5,
          "fn": 1,
          "tn": 1
        },
        "Male / Young (<25)": {
          "size": 22,
          "selection_rate": 0.0909,
          "tpr": 0.1818,
          "fpr": 0.0,
          "fnr": 0.8182,
          "tnr": 1.0,
          "tp": 2,
          "fp": 0,
          "fn": 9,
          "tn": 11
        }
      },
      "di_per_subgroup": {
        "Female / Prime (25-60)": 0.2658,
        "Female / Senior (>60)": 0.7347,
        "Female / Young (<25)": 0.0,
        "Male / Prime (25-60)": 0.4444,
        "Male / Young (<25)": 0.1039
      },
      "small_group_warnings": [
        {
          "group": "Female / Senior (>60)",
          "size": 14,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Female / Young (<25)",
          "size": 15,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Male / Senior (>60)",
          "size": 16,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Male / Young (<25)",
          "size": 22,
          "warning": "insufficient sample (<30)"
        }
      ],
      "chart_data": {
        "labels": [
          "Female / Prime (25-60)",
          "Female / Senior (>60)",
          "Female / Young (<25)",
          "Male / Prime (25-60)",
          "Male / Senior (>60)",
          "Male / Young (<25)"
        ],
        "selection_rates_pct": [
          23.26,
          64.29,
          0.0,
          38.89,
          87.5,
          9.09
        ],
        "ci_whiskers_pct": [
          [
            11.1,
            36.5
          ],
          [
            36.4,
            90.5
          ],
          [
            0.0,
            0.0
          ],
          [
            28.0,
            49.0
          ],
          [
            70.0,
            100.0
          ],
          [
            0.0,
            22.7
          ]
        ],
        "eighty_percent_line_pct": 70.0,
        "privileged_rate_pct": 87.5
      }
    }
  ],
  "explain": {
    "status": "warn",
    "severity": "medium",
    "explainer_type": "TreeExplainer",
    "shap_success": true,
    "finding": "Moderate Risk: 1 sensitive attribute or proxy variable detected in top 5 features. Protected features in top 5: num__Age. Causality Disclaimer: SHAP values quantify predictive attribution within the mathematical manifold, not causal mechanisms.",
    "disclaimer": "SHAP feature importances reflect marginal predictive contribution to the model's scoring manifold. They do NOT establish legal or real-world causality.",
    "top_features": [
      {
        "feature": "num__Age",
        "importance": 0.0594,
        "is_sensitive": true,
        "is_proxy": false
      },
      {
        "feature": "num__Credit_Amount",
        "importance": 0.0465,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__Account_Status_No checking",
        "importance": 0.0194,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__Credit_History_Existing paid",
        "importance": 0.0141,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__Savings_Account_<100 DM",
        "importance": 0.0134,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "num__Duration_Months",
        "importance": 0.0123,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__Sex_Male",
        "importance": 0.0109,
        "is_sensitive": true,
        "is_proxy": false
      },
      {
        "feature": "cat__Account_Status_<0 DM",
        "importance": 0.0105,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__Housing_Rent",
        "importance": 0.0102,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__Sex_Female",
        "importance": 0.0087,
        "is_sensitive": true,
        "is_proxy": false
      }
    ],
    "sensitive_in_top_5": [
      "num__Age"
    ],
    "proxies_in_top_5": [],
    "flagged_count": 1,
    "chart_data": {
      "labels": [
        "num__Age",
        "num__Credit_Amount",
        "cat__Account_Status_No checking",
        "cat__Credit_History_Existing paid",
        "cat__Savings_Account_<100 DM",
        "num__Duration_Months",
        "cat__Sex_Male",
        "cat__Account_Status_<0 DM",
        "cat__Housing_Rent",
        "cat__Sex_Female"
      ],
      "values": [
        0.0594,
        0.0465,
        0.0194,
        0.0141,
        0.0134,
        0.0123,
        0.0109,
        0.0105,
        0.0102,
        0.0087
      ]
    }
  },
  "robustness": {
    "status": "warn",
    "severity": "medium",
    "finding": "Moderate robustness: model exhibits acceptable degradation under stress, but some inferences drift under noise or counterfactual inspection. Counterfactual alert: 8.5% of test predictions flip solely when protected identity attributes are swapped. Fairness drift: Disparate Impact shifts by up to 0.48 across sensitive attributes under 5% feature noise.",
    "robustness_score": 91.8,
    "baseline_metrics": {
      "accuracy": 0.62,
      "f1": 0.5309,
      "roc_auc": 0.6695
    },
    "metric_drop_10pct": 0.0075,
    "prediction_flip_rate_5pct": 0.025,
    "counterfactual_flip_rate": 0.085,
    "counterfactual_results": {
      "Sex": {
        "counterfactual_flip_rate": 0.1,
        "swapped_groups": {
          "Male": "Female",
          "Female": "Male"
        }
      },
      "Foreign_Worker": {
        "counterfactual_flip_rate": 0.07,
        "swapped_groups": {
          "Yes": "No",
          "No": "Yes"
        }
      }
    },
    "worst_case_drop_eps10": 0.0,
    "bounded_attack_tests": [
      {
        "epsilon": 0.05,
        "prediction_flip_rate": 0.04,
        "accuracy": 0.61,
        "accuracy_drop": 0.01
      },
      {
        "epsilon": 0.1,
        "prediction_flip_rate": 0.035,
        "accuracy": 0.635,
        "accuracy_drop": 0.0
      },
      {
        "epsilon": 0.2,
        "prediction_flip_rate": 0.09,
        "accuracy": 0.61,
        "accuracy_drop": 0.01
      }
    ],
    "categorical_swap_flips": 0.075,
    "fairness_stability_deltas": {
      "Sex": 0.0132,
      "Age": 0.0084,
      "Foreign_Worker": 0.4755
    },
    "label_flip_tests": [
      {
        "flip_rate_pct": 5,
        "accuracy": 0.6,
        "f1": 0.5062,
        "roc_auc": 0.5,
        "accuracy_drop": 0.02,
        "relative_metric_drop": 0.0224
      },
      {
        "flip_rate_pct": 10,
        "accuracy": 0.605,
        "f1": 0.538,
        "roc_auc": 0.5,
        "accuracy_drop": 0.015,
        "relative_metric_drop": 0.0075
      },
      {
        "flip_rate_pct": 20,
        "accuracy": 0.57,
        "f1": 0.5743,
        "roc_auc": 0.5,
        "accuracy_drop": 0.05,
        "relative_metric_drop": 0.025
      }
    ],
    "perturbation_tests": [
      {
        "noise_level_pct": 1,
        "prediction_flip_rate": 0.005,
        "accuracy": 0.625,
        "accuracy_drop": 0.0,
        "di_shifts": {
          "Sex": 0.0349,
          "Age": 0.009,
          "Foreign_Worker": 0.0138
        }
      },
      {
        "noise_level_pct": 5,
        "prediction_flip_rate": 0.025,
        "accuracy": 0.625,
        "accuracy_drop": 0.0,
        "di_shifts": {
          "Sex": 0.0132,
          "Age": 0.0084,
          "Foreign_Worker": 0.4755
        }
      },
      {
        "noise_level_pct": 10,
        "prediction_flip_rate": 0.055,
        "accuracy": 0.625,
        "accuracy_drop": 0.0,
        "di_shifts": {
          "Sex": 0.0349,
          "Age": 0.0353,
          "Foreign_Worker": 0.4891
        }
      }
    ],
    "chart_data": {
      "label_flips": {
        "x_labels": [
          "5%",
          "10%",
          "20%"
        ],
        "accuracy": [
          0.6,
          0.605,
          0.57
        ],
        "f1": [
          0.5062,
          0.538,
          0.5743
        ],
        "roc_auc": [
          0.5,
          0.5,
          0.5
        ]
      },
      "perturbation": {
        "x_labels": [
          "1% Noise",
          "5% Noise",
          "10% Noise"
        ],
        "flip_rates": [
          0.5,
          2.5,
          5.5
        ]
      },
      "bounded_attacks": {
        "x_labels": [
          "eps=0.05",
          "eps=0.1",
          "eps=0.2"
        ],
        "flip_rates": [
          4.0,
          3.5,
          9.0
        ],
        "drops": [
          1.0,
          0.0,
          1.0
        ]
      }
    }
  },
  "compliance": {
    "use_case": {
      "title": "Credit Scoring & Financial Eligibility",
      "annex_ref": "Annex III, Point 5(b)",
      "is_high_risk": true,
      "description": "AI systems used to evaluate creditworthiness of natural persons or establish their credit score."
    },
    "is_high_risk": true,
    "pii_and_sensitive_signals": {
      "detected_pii_columns": [],
      "has_aadhaar_pattern": false,
      "has_minors": false,
      "minors_count": 0,
      "age_column": "Age"
    },
    "governance_disclosure": {
      "score": 0.0,
      "earned_points": 0.0,
      "total_questions": 15,
      "answered_count": 0,
      "unanswered_count": 15,
      "breakdown": {
        "q1_risk_mgmt": {
          "status": "unanswered",
          "points": 0.0
        },
        "q2_data_prep": {
          "status": "unanswered",
          "points": 0.0
        },
        "q3_human_oversight": {
          "status": "unanswered",
          "points": 0.0
        },
        "q4_logging": {
          "status": "unanswered",
          "points": 0.0
        },
        "q5_transparency": {
          "status": "unanswered",
          "points": 0.0
        },
        "q6_cybersecurity": {
          "status": "unanswered",
          "points": 0.0
        },
        "q7_dpdp_notice": {
          "status": "unanswered",
          "points": 0.0
        },
        "q8_dpdp_consent": {
          "status": "unanswered",
          "points": 0.0
        },
        "q9_dpdp_erasure": {
          "status": "unanswered",
          "points": 0.0
        },
        "q10_dpdp_grievance": {
          "status": "unanswered",
          "points": 0.0
        },
        "q11_dpdp_breach": {
          "status": "unanswered",
          "points": 0.0
        },
        "q12_dpdp_dpo": {
          "status": "unanswered",
          "points": 0.0
        },
        "q13_dpdp_dpia": {
          "status": "unanswered",
          "points": 0.0
        },
        "q14_dpdp_minors": {
          "status": "unanswered",
          "points": 0.0
        },
        "q15_human_training": {
          "status": "unanswered",
          "points": 0.0
        }
      }
    },
    "eu_ai_act": {
      "classification": "High-Risk AI System (Annex III)",
      "score": 36.4,
      "earned_points": 4.0,
      "max_points": 11.0,
      "checklist": [
        {
          "article": "Art. 9",
          "title": "Risk Management System",
          "type": "self_declared",
          "requirement": "Establish, implement, document and maintain a continuous risk management system.",
          "status": "unanswered",
          "evidence": "No response provided (unanswered / 0 credit)."
        },
        {
          "article": "Art. 10",
          "title": "Data Governance & Bias Examination",
          "type": "auto_verified",
          "requirement": "Training, validation and testing data sets shall be relevant, representative, and examined for biases.",
          "status": "no",
          "evidence": "Auto-verified: Severe demographic disparity or four-fifths rule failure detected on test split."
        },
        {
          "article": "Art. 11",
          "title": "Technical Documentation",
          "type": "auto_verified",
          "requirement": "Draw up comprehensive technical documentation demonstrating regulatory conformity before deployment.",
          "status": "yes",
          "evidence": "Auto-verified: Automated AI Model Card and diagnostic specifications compiled by AutoAudit-360."
        },
        {
          "article": "Art. 12",
          "title": "Automatic Logging & Audit Trails",
          "type": "self_declared",
          "requirement": "High-risk AI systems shall technically allow for the automatic recording of events (logging).",
          "status": "unanswered",
          "evidence": "No event logging affirmation provided (unanswered / 0 credit)."
        },
        {
          "article": "Art. 13",
          "title": "Transparency & Provision of Information",
          "type": "auto_verified",
          "requirement": "AI systems shall be accompanied by instructions for use and interpretable explanations.",
          "status": "partial",
          "evidence": "Auto-verified: 1 protected proxy feature identified in top 5 features."
        },
        {
          "article": "Art. 14",
          "title": "Human Oversight Measures",
          "type": "self_declared",
          "requirement": "Enable natural persons to oversee the system, prevent risks, or stop the system.",
          "status": "unanswered",
          "evidence": "No human oversight mechanism declared (unanswered / 0 credit)."
        },
        {
          "article": "Art. 15",
          "title": "Accuracy, Robustness & Cybersecurity",
          "type": "auto_verified",
          "requirement": "High-risk AI systems shall achieve appropriate levels of accuracy, robustness and cybersecurity.",
          "status": "partial",
          "evidence": "Auto-verified: Moderate performance degradation under perturbation or counterfactual tests."
        }
      ],
      "gaps": [
        "Unanswered: Art. 9 (Risk Management System) has no disclosure response (0 credit).",
        "Deficiency: Art. 10 (Data Governance & Bias Examination) failed or unaddressed.",
        "Unanswered: Art. 12 (Automatic Logging & Audit Trails) has no disclosure response (0 credit).",
        "Conditional: Art. 13 (Transparency & Provision of Information) is only partially fulfilled.",
        "Unanswered: Art. 14 (Human Oversight Measures) has no disclosure response (0 credit).",
        "Conditional: Art. 15 (Accuracy, Robustness & Cybersecurity) is only partially fulfilled."
      ],
      "remediations": [
        "Complete disclosure for Art. 9: Establish, implement, document and maintain a continuous risk management system.",
        "Immediate remediation required for Art. 10: Training, validation and testing data sets shall be relevant, representative, and examined for biases.",
        "Complete disclosure for Art. 12: High-risk AI systems shall technically allow for the automatic recording of events (logging).",
        "Provide complete operational evidence for Art. 13: AI systems shall be accompanied by instructions for use and interpretable explanations.",
        "Complete disclosure for Art. 14: Enable natural persons to oversee the system, prevent risks, or stop the system.",
        "Provide complete operational evidence for Art. 15: High-risk AI systems shall achieve appropriate levels of accuracy, robustness and cybersecurity."
      ]
    },
    "dpdp_act_2023": {
      "score": 40.0,
      "earned_points": 4.0,
      "max_points": 10.0,
      "checklist": [
        {
          "section": "Sec 5",
          "principle": "Notice Requirement",
          "type": "self_declared",
          "requirement": "Clear notice provided to Data Principal describing personal data collected and processing purpose.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 6",
          "principle": "Consent Architecture",
          "type": "self_declared",
          "requirement": "Consent must be free, specific, informed, unconditional and unambiguous with clear affirmative action.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 8(3)",
          "principle": "Data Accuracy & Completeness",
          "type": "auto_verified",
          "requirement": "Ensure data used to make decisions affecting Data Principals is accurate and complete.",
          "status": "yes",
          "evidence": "Auto-verified: Dataset is complete with 0.0% missing cells across feature dimensions."
        },
        {
          "section": "Sec 8(5)",
          "principle": "Security Safeguards & Encryption",
          "type": "self_declared",
          "requirement": "Protect personal data in possession or custody under reasonable security safeguards.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 8(6)",
          "principle": "Incident & Breach Notification",
          "type": "self_declared",
          "requirement": "Mandatory breach reporting to Data Protection Board of India and affected Principals.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 9",
          "principle": "Processing of Children's Data",
          "type": "auto_verified",
          "requirement": "Obtain verifiable parental consent; strictly ban tracking, behavioral monitoring, or targeted ads directed at minors.",
          "status": "yes",
          "evidence": "Auto-verified: No records of minors (<18 years) detected in audit sample."
        },
        {
          "section": "Sec 10",
          "principle": "Significant Data Fiduciary Obligations",
          "type": "self_declared",
          "requirement": "Appoint India-resident DPO, conduct periodic Data Protection Impact Assessments (DPIA), and retain independent data auditor.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 11-13",
          "principle": "Data Principal Rights & Redressal",
          "type": "self_declared",
          "requirement": "Provide rights of access, correction, erasure, and easily accessible grievance redressal mechanism.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        }
      ],
      "gaps": [
        "Unanswered: Sec 5 (Notice Requirement) has no disclosure response (0 credit).",
        "Unanswered: Sec 6 (Consent Architecture) has no disclosure response (0 credit).",
        "Unanswered: Sec 8(5) (Security Safeguards & Encryption) has no disclosure response (0 credit).",
        "Unanswered: Sec 8(6) (Incident & Breach Notification) has no disclosure response (0 credit).",
        "Unanswered: Sec 10 (Significant Data Fiduciary Obligations) has no disclosure response (0 credit).",
        "Unanswered: Sec 11-13 (Data Principal Rights & Redressal) has no disclosure response (0 credit)."
      ],
      "remediations": [
        "Complete disclosure for Sec 5: Clear notice provided to Data Principal describing personal data collected and processing purpose.",
        "Complete disclosure for Sec 6: Consent must be free, specific, informed, unconditional and unambiguous with clear affirmative action.",
        "Complete disclosure for Sec 8(5): Protect personal data in possession or custody under reasonable security safeguards.",
        "Complete disclosure for Sec 8(6): Mandatory breach reporting to Data Protection Board of India and affected Principals.",
        "Complete disclosure for Sec 10: Appoint India-resident DPO, conduct periodic Data Protection Impact Assessments (DPIA), and retain independent data auditor.",
        "Complete disclosure for Sec 11-13: Provide rights of access, correction, erasure, and easily accessible grievance redressal mechanism."
      ]
    }
  },
  "mitigation": {
    "sensitive_attribute": "Sex",
    "privileged_group": "Male",
    "baseline": {
      "disparate_impact": 0.6623,
      "demographic_parity_diff": 0.1345,
      "equal_opportunity_diff": 0.179,
      "accuracy": 0.62,
      "recall": 0.4674
    },
    "reweighed": {
      "disparate_impact": 0.8322,
      "demographic_parity_diff": 0.0616,
      "equal_opportunity_diff": 0.15,
      "accuracy": 0.575,
      "recall": 0.413,
      "di_improvement": 0.1699
    },
    "threshold_adjustments": [
      {
        "threshold": 0.3,
        "disparate_impact": 0.86,
        "demographic_parity_diff": 0.134,
        "accuracy": 0.525,
        "recall": 0.967
      },
      {
        "threshold": 0.4,
        "disparate_impact": 0.808,
        "demographic_parity_diff": 0.132,
        "accuracy": 0.62,
        "recall": 0.783
      },
      {
        "threshold": 0.5,
        "disparate_impact": 0.662,
        "demographic_parity_diff": 0.135,
        "accuracy": 0.62,
        "recall": 0.467
      },
      {
        "threshold": 0.6,
        "disparate_impact": 0.479,
        "demographic_parity_diff": 0.106,
        "accuracy": 0.575,
        "recall": 0.217
      },
      {
        "threshold": 0.7,
        "disparate_impact": 0.593,
        "demographic_parity_diff": 0.019,
        "accuracy": 0.56,
        "recall": 0.065
      }
    ]
  },
  "scores": {
    "overall_trust_score": 48.0,
    "raw_mean_score": 48.0,
    "rag_status": "red",
    "readiness_verdict": "READINESS: ACTION REQUIRED",
    "stamp": "READINESS: ACTION REQUIRED",
    "verdict_statement": "Deficiencies detected in: Fairness, EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure. Four-fifths fairness tolerance breached. Weakest-Link Cap applied (Red / <=49.9): Fairness (29.8) is below 50.0 on a High-Risk AI system (credit_scoring).",
    "verdict_summary": "Deficiencies detected in: Fairness, EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure. Four-fifths fairness tolerance breached. Weakest-Link Cap applied (Red / <=49.9): Fairness (29.8) is below 50.0 on a High-Risk AI system (credit_scoring).",
    "cap_reason": "Weakest-Link Cap applied (Red / <=49.9): Fairness (29.8) is below 50.0 on a High-Risk AI system (credit_scoring).",
    "axes_under_50": [
      "Fairness",
      "EU AI Act Readiness",
      "DPDP Act 2023 Readiness",
      "Governance Disclosure"
    ],
    "dimension_scores": {
      "Fairness": 29.8,
      "Explainability": 90.0,
      "Robustness": 91.8,
      "EU AI Act Readiness": 36.4,
      "DPDP Act 2023 Readiness": 40.0,
      "Governance Disclosure": 0.0
    }
  },
  "limitations": [
    "Diagnostic audit based on the four-fifths rule and EU AI Act / DPDP Act checklists. Not legal certification.",
    "Audit findings reflect sample distribution characteristics and do not guarantee out-of-distribution parity.",
    "SHAP values measure empirical correlation in the trained estimator manifold, not causal necessity.",
    "Note: Model was trained automatically using a standard baseline RandomForest pipeline as no external model file was supplied.",
    "Score Cap: Weakest-Link Cap applied (Red / <=49.9): Fairness (29.8) is below 50.0 on a High-Risk AI system (credit_scoring)."
  ]
} as unknown as FullAuditResult;

export const COMPAS_AUDIT: FullAuditResult = {
  "meta": {
    "audit_id": "compas_surrogate",
    "timestamp": "2026-10-27T20:49:33.934926+00:00",
    "model_name": "Model_compas_surrogate",
    "algorithm": "RandomForestClassifier (Auto-trained baseline)",
    "is_default_trained": true,
    "is_pred_col_mode": false,
    "framework": "scikit-learn / PyTorch compatible",
    "random_seed": 42,
    "dataset_hash": "805bd8314af7bfab7cff8800c196beac7a98db62b343896102fb8db0bf97075b",
    "system": "AutoAudit-360: Trustworthy AI Audit & Regulatory Compliance Suite"
  },
  "data_summary": {
    "total_rows": 1200,
    "test_split_rows": 240,
    "total_features": 9,
    "target_column": "Low_Risk_Outcome",
    "positive_label": "1",
    "positive_rate": 50.33,
    "sensitive_attributes": [
      "race",
      "sex",
      "age"
    ],
    "missing_percentage": 0.0,
    "is_pred_col_mode": false
  },
  "performance": {
    "accuracy": 1.0,
    "balanced_accuracy": 1.0,
    "precision": 1.0,
    "recall": 1.0,
    "f1_score": 1.0,
    "roc_auc": 1.0,
    "repeated_cross_validation": {
      "accuracy": {
        "mean": 1.0,
        "std": 0.0,
        "formatted": "1.000 \u00b1 0.000"
      },
      "balanced_accuracy": {
        "mean": 1.0,
        "std": 0.0,
        "formatted": "1.000 \u00b1 0.000"
      },
      "precision": {
        "mean": 1.0,
        "std": 0.0,
        "formatted": "1.000 \u00b1 0.000"
      },
      "recall": {
        "mean": 1.0,
        "std": 0.0,
        "formatted": "1.000 \u00b1 0.000"
      },
      "f1_score": {
        "mean": 1.0,
        "std": 0.0,
        "formatted": "1.000 \u00b1 0.000"
      },
      "roc_auc": {
        "mean": 1.0,
        "std": 0.0,
        "formatted": "1.000 \u00b1 0.000"
      },
      "seeds_evaluated": 5
    }
  },
  "fairness": [
    {
      "attribute": "race",
      "is_intersectional": false,
      "privileged_group": "Caucasian",
      "status": "warn",
      "severity": "medium",
      "finding": "Disparate Impact (0.80) is in caution band [0.70, 0.80). Demographic Parity gap (11.3%) exceeds 10% target. Small-sample notice: 2 group(s) have <30 observations in test split (marked insufficient sample).",
      "test_sample_size": 240,
      "metrics": {
        "disparate_impact_ratio": 0.7987,
        "demographic_parity_difference": 0.1128,
        "equal_opportunity_difference": 0.0,
        "equalized_odds_gap": 0.0,
        "worst_fpr_gap": 0.0
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.5588,
          1.0555
        ],
        "demographic_parity_difference": [
          0.0659,
          0.368
        ],
        "equal_opportunity_difference": [
          0.0,
          0.0
        ]
      },
      "subgroup_breakdown": {
        "African-American": {
          "size": 134,
          "selection_rate": 0.4478,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 60,
          "fp": 0,
          "fn": 0,
          "tn": 74
        },
        "Caucasian": {
          "size": 66,
          "selection_rate": 0.5606,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 37,
          "fp": 0,
          "fn": 0,
          "tn": 29
        },
        "Hispanic": {
          "size": 24,
          "selection_rate": 0.5833,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 14,
          "fp": 0,
          "fn": 0,
          "tn": 10
        },
        "Other": {
          "size": 16,
          "selection_rate": 0.625,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 10,
          "fp": 0,
          "fn": 0,
          "tn": 6
        }
      },
      "di_per_subgroup": {
        "African-American": 0.7987,
        "Hispanic": 1.0405,
        "Other": 1.1149
      },
      "small_group_warnings": [
        {
          "group": "Hispanic",
          "size": 24,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Other",
          "size": 16,
          "warning": "insufficient sample (<30)"
        }
      ],
      "chart_data": {
        "labels": [
          "African-American",
          "Caucasian",
          "Hispanic",
          "Other"
        ],
        "selection_rates_pct": [
          44.78,
          56.06,
          58.33,
          62.5
        ],
        "ci_whiskers_pct": [
          [
            36.2,
            53.3
          ],
          [
            43.4,
            68.9
          ],
          [
            39.1,
            77.8
          ],
          [
            35.3,
            85.7
          ]
        ],
        "eighty_percent_line_pct": 44.85,
        "privileged_rate_pct": 56.06
      }
    },
    {
      "attribute": "sex",
      "is_intersectional": false,
      "privileged_group": "Female",
      "status": "pass",
      "severity": "none",
      "finding": "Disparate impact (DI 1.01) and parity metrics satisfy test thresholds.",
      "test_sample_size": 240,
      "metrics": {
        "disparate_impact_ratio": 1.0103,
        "demographic_parity_difference": 0.0052,
        "equal_opportunity_difference": 0.0,
        "equalized_odds_gap": 0.0,
        "worst_fpr_gap": 0.0
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.7514,
          1.4477
        ],
        "demographic_parity_difference": [
          0.0022,
          0.1718
        ],
        "equal_opportunity_difference": [
          0.0,
          0.0
        ]
      },
      "subgroup_breakdown": {
        "Female": {
          "size": 46,
          "selection_rate": 0.5,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 23,
          "fp": 0,
          "fn": 0,
          "tn": 23
        },
        "Male": {
          "size": 194,
          "selection_rate": 0.5052,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 98,
          "fp": 0,
          "fn": 0,
          "tn": 96
        }
      },
      "di_per_subgroup": {
        "Male": 1.0103
      },
      "small_group_warnings": [],
      "chart_data": {
        "labels": [
          "Female",
          "Male"
        ],
        "selection_rates_pct": [
          50.0,
          50.52
        ],
        "ci_whiskers_pct": [
          [
            35.5,
            64.2
          ],
          [
            43.7,
            58.4
          ]
        ],
        "eighty_percent_line_pct": 40.0,
        "privileged_rate_pct": 50.0
      }
    },
    {
      "attribute": "age",
      "is_intersectional": false,
      "privileged_group": "Senior (>60)",
      "status": "warn",
      "severity": "medium",
      "finding": "Disparate Impact (0.71) is in caution band [0.70, 0.80). Demographic Parity gap (17.5%) exceeds 10% target. Small-sample notice: 1 group(s) have <30 observations in test split (marked insufficient sample).",
      "test_sample_size": 240,
      "metrics": {
        "disparate_impact_ratio": 0.7083,
        "demographic_parity_difference": 0.175,
        "equal_opportunity_difference": 0.0,
        "equalized_odds_gap": 0.0,
        "worst_fpr_gap": 0.0
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.3992,
          1.2057
        ],
        "demographic_parity_difference": [
          0.0297,
          0.4329
        ],
        "equal_opportunity_difference": [
          0.0,
          0.0
        ]
      },
      "subgroup_breakdown": {
        "Prime (25-60)": {
          "size": 180,
          "selection_rate": 0.5111,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 92,
          "fp": 0,
          "fn": 0,
          "tn": 88
        },
        "Senior (>60)": {
          "size": 20,
          "selection_rate": 0.6,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 12,
          "fp": 0,
          "fn": 0,
          "tn": 8
        },
        "Young (<25)": {
          "size": 40,
          "selection_rate": 0.425,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 17,
          "fp": 0,
          "fn": 0,
          "tn": 23
        }
      },
      "di_per_subgroup": {
        "Prime (25-60)": 0.8519,
        "Young (<25)": 0.7083
      },
      "small_group_warnings": [
        {
          "group": "Senior (>60)",
          "size": 20,
          "warning": "insufficient sample (<30)"
        }
      ],
      "chart_data": {
        "labels": [
          "Prime (25-60)",
          "Senior (>60)",
          "Young (<25)"
        ],
        "selection_rates_pct": [
          51.11,
          60.0,
          42.5
        ],
        "ci_whiskers_pct": [
          [
            44.2,
            58.9
          ],
          [
            36.8,
            81.5
          ],
          [
            27.8,
            57.3
          ]
        ],
        "eighty_percent_line_pct": 48.0,
        "privileged_rate_pct": 60.0
      }
    },
    {
      "attribute": "race x sex",
      "is_intersectional": true,
      "privileged_group": "Other / Female",
      "status": "fail",
      "severity": "high",
      "finding": "Disparate Impact (0.36) violates EEOC four-fifths rule (<0.7). Demographic Parity Difference (63.6%) exceeds 20% tolerance. Small-sample notice: 6 group(s) have <30 observations in test split (marked insufficient sample).",
      "test_sample_size": 240,
      "metrics": {
        "disparate_impact_ratio": 0.3636,
        "demographic_parity_difference": 0.6364,
        "equal_opportunity_difference": 0.0,
        "equalized_odds_gap": 0.0,
        "worst_fpr_gap": 0.0
      },
      "confidence_intervals_95": {
        "disparate_impact": [
          0.0,
          0.4707
        ],
        "demographic_parity_difference": [
          0.5293,
          0.9286
        ],
        "equal_opportunity_difference": [
          0.0,
          1.0
        ]
      },
      "subgroup_breakdown": {
        "African-American / Female": {
          "size": 22,
          "selection_rate": 0.3636,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 8,
          "fp": 0,
          "fn": 0,
          "tn": 14
        },
        "African-American / Male": {
          "size": 112,
          "selection_rate": 0.4643,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 52,
          "fp": 0,
          "fn": 0,
          "tn": 60
        },
        "Caucasian / Female": {
          "size": 15,
          "selection_rate": 0.6,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 9,
          "fp": 0,
          "fn": 0,
          "tn": 6
        },
        "Caucasian / Male": {
          "size": 51,
          "selection_rate": 0.549,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 28,
          "fp": 0,
          "fn": 0,
          "tn": 23
        },
        "Hispanic / Female": {
          "size": 7,
          "selection_rate": 0.5714,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 4,
          "fp": 0,
          "fn": 0,
          "tn": 3
        },
        "Hispanic / Male": {
          "size": 17,
          "selection_rate": 0.5882,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 10,
          "fp": 0,
          "fn": 0,
          "tn": 7
        },
        "Other / Female": {
          "size": 2,
          "selection_rate": 1.0,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 0.0,
          "tp": 2,
          "fp": 0,
          "fn": 0,
          "tn": 0
        },
        "Other / Male": {
          "size": 14,
          "selection_rate": 0.5714,
          "tpr": 1.0,
          "fpr": 0.0,
          "fnr": 0.0,
          "tnr": 1.0,
          "tp": 8,
          "fp": 0,
          "fn": 0,
          "tn": 6
        }
      },
      "di_per_subgroup": {
        "African-American / Female": 0.3636,
        "African-American / Male": 0.4643,
        "Caucasian / Female": 0.6,
        "Caucasian / Male": 0.549,
        "Hispanic / Female": 0.5714,
        "Hispanic / Male": 0.5882,
        "Other / Male": 0.5714
      },
      "small_group_warnings": [
        {
          "group": "African-American / Female",
          "size": 22,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Caucasian / Female",
          "size": 15,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Hispanic / Female",
          "size": 7,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Hispanic / Male",
          "size": 17,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Other / Female",
          "size": 2,
          "warning": "insufficient sample (<30)"
        },
        {
          "group": "Other / Male",
          "size": 14,
          "warning": "insufficient sample (<30)"
        }
      ],
      "chart_data": {
        "labels": [
          "African-American / Female",
          "African-American / Male",
          "Caucasian / Female",
          "Caucasian / Male",
          "Hispanic / Female",
          "Hispanic / Male",
          "Other / Female",
          "Other / Male"
        ],
        "selection_rates_pct": [
          36.36,
          46.43,
          60.0,
          54.9,
          57.14,
          58.82,
          100.0,
          57.14
        ],
        "ci_whiskers_pct": [
          [
            17.0,
            55.1
          ],
          [
            37.4,
            55.9
          ],
          [
            33.3,
            83.8
          ],
          [
            40.8,
            69.2
          ],
          [
            17.4,
            100.0
          ],
          [
            35.3,
            81.2
          ],
          [
            100.0,
            100.0
          ],
          [
            27.5,
            84.4
          ]
        ],
        "eighty_percent_line_pct": 80.0,
        "privileged_rate_pct": 100.0
      }
    }
  ],
  "explain": {
    "status": "fail",
    "severity": "high",
    "explainer_type": "TreeExplainer",
    "shap_success": true,
    "finding": "Critical Bias Risk: 3 sensitive attributes or high-correlation proxies appear among top 5 most influential features. Protected features in top 5: cat__race_African-American, num__age, cat__age_cat_Greater than 45. Causality Disclaimer: SHAP values quantify predictive attribution within the mathematical manifold, not causal mechanisms.",
    "disclaimer": "SHAP feature importances reflect marginal predictive contribution to the model's scoring manifold. They do NOT establish legal or real-world causality.",
    "top_features": [
      {
        "feature": "num__two_year_recid",
        "importance": 0.4145,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "num__priors_count",
        "importance": 0.0313,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__race_African-American",
        "importance": 0.0156,
        "is_sensitive": true,
        "is_proxy": false
      },
      {
        "feature": "num__age",
        "importance": 0.0145,
        "is_sensitive": true,
        "is_proxy": false
      },
      {
        "feature": "cat__age_cat_Greater than 45",
        "importance": 0.0098,
        "is_sensitive": true,
        "is_proxy": false
      },
      {
        "feature": "num__juv_fel_count",
        "importance": 0.005,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__age_cat_25 - 45",
        "importance": 0.0041,
        "is_sensitive": true,
        "is_proxy": false
      },
      {
        "feature": "num__juv_misd_count",
        "importance": 0.0033,
        "is_sensitive": false,
        "is_proxy": false
      },
      {
        "feature": "cat__race_Hispanic",
        "importance": 0.0029,
        "is_sensitive": true,
        "is_proxy": false
      },
      {
        "feature": "cat__sex_Female",
        "importance": 0.0027,
        "is_sensitive": true,
        "is_proxy": false
      }
    ],
    "sensitive_in_top_5": [
      "cat__race_African-American",
      "num__age",
      "cat__age_cat_Greater than 45"
    ],
    "proxies_in_top_5": [],
    "flagged_count": 3,
    "chart_data": {
      "labels": [
        "num__two_year_recid",
        "num__priors_count",
        "cat__race_African-American",
        "num__age",
        "cat__age_cat_Greater than 45",
        "num__juv_fel_count",
        "cat__age_cat_25 - 45",
        "num__juv_misd_count",
        "cat__race_Hispanic",
        "cat__sex_Female"
      ],
      "values": [
        0.4145,
        0.0313,
        0.0156,
        0.0145,
        0.0098,
        0.005,
        0.0041,
        0.0033,
        0.0029,
        0.0027
      ]
    }
  },
  "robustness": {
    "status": "pass",
    "severity": "none",
    "finding": "Robust model boundary: resilient against label poisoning, bounded perturbations, and counterfactual flips.",
    "robustness_score": 99.5,
    "baseline_metrics": {
      "accuracy": 1.0,
      "f1": 1.0,
      "roc_auc": 1.0
    },
    "metric_drop_10pct": 0.0041,
    "prediction_flip_rate_5pct": 0.0,
    "counterfactual_flip_rate": 0.0,
    "counterfactual_results": {
      "race": {
        "counterfactual_flip_rate": 0.0,
        "swapped_groups": {
          "Hispanic": "African-American",
          "African-American": "Caucasian",
          "Caucasian": "Other",
          "Other": "Hispanic"
        }
      },
      "sex": {
        "counterfactual_flip_rate": 0.0,
        "swapped_groups": {
          "Female": "Male",
          "Male": "Female"
        }
      }
    },
    "worst_case_drop_eps10": 0.0,
    "bounded_attack_tests": [
      {
        "epsilon": 0.05,
        "prediction_flip_rate": 0.0,
        "accuracy": 1.0,
        "accuracy_drop": 0.0
      },
      {
        "epsilon": 0.1,
        "prediction_flip_rate": 0.0,
        "accuracy": 1.0,
        "accuracy_drop": 0.0
      },
      {
        "epsilon": 0.2,
        "prediction_flip_rate": 0.0,
        "accuracy": 1.0,
        "accuracy_drop": 0.0
      }
    ],
    "categorical_swap_flips": 0.0,
    "fairness_stability_deltas": {
      "race": 0.0,
      "sex": 0.0,
      "age": 0.0319
    },
    "label_flip_tests": [
      {
        "flip_rate_pct": 5,
        "accuracy": 0.9958,
        "f1": 0.9959,
        "roc_auc": 0.5,
        "accuracy_drop": 0.0042,
        "relative_metric_drop": 0.0041
      },
      {
        "flip_rate_pct": 10,
        "accuracy": 0.9958,
        "f1": 0.9959,
        "roc_auc": 0.5,
        "accuracy_drop": 0.0042,
        "relative_metric_drop": 0.0041
      },
      {
        "flip_rate_pct": 20,
        "accuracy": 0.9708,
        "f1": 0.9717,
        "roc_auc": 0.5,
        "accuracy_drop": 0.0292,
        "relative_metric_drop": 0.0287
      }
    ],
    "perturbation_tests": [
      {
        "noise_level_pct": 1,
        "prediction_flip_rate": 0.0,
        "accuracy": 1.0,
        "accuracy_drop": 0.0,
        "di_shifts": {
          "race": 0.0,
          "sex": 0.0,
          "age": 0.0087
        }
      },
      {
        "noise_level_pct": 5,
        "prediction_flip_rate": 0.0,
        "accuracy": 1.0,
        "accuracy_drop": 0.0,
        "di_shifts": {
          "race": 0.0,
          "sex": 0.0,
          "age": 0.0319
        }
      },
      {
        "noise_level_pct": 10,
        "prediction_flip_rate": 0.0,
        "accuracy": 1.0,
        "accuracy_drop": 0.0,
        "di_shifts": {
          "race": 0.0,
          "sex": 0.0,
          "age": 0.009
        }
      }
    ],
    "chart_data": {
      "label_flips": {
        "x_labels": [
          "5%",
          "10%",
          "20%"
        ],
        "accuracy": [
          0.9958,
          0.9958,
          0.9708
        ],
        "f1": [
          0.9959,
          0.9959,
          0.9717
        ],
        "roc_auc": [
          0.5,
          0.5,
          0.5
        ]
      },
      "perturbation": {
        "x_labels": [
          "1% Noise",
          "5% Noise",
          "10% Noise"
        ],
        "flip_rates": [
          0.0,
          0.0,
          0.0
        ]
      },
      "bounded_attacks": {
        "x_labels": [
          "eps=0.05",
          "eps=0.1",
          "eps=0.2"
        ],
        "flip_rates": [
          0.0,
          0.0,
          0.0
        ],
        "drops": [
          0.0,
          0.0,
          0.0
        ]
      }
    }
  },
  "compliance": {
    "use_case": {
      "title": "Law Enforcement & Recidivism Assessment",
      "annex_ref": "Annex III, Point 6",
      "is_high_risk": true,
      "description": "AI systems used by authorities to assess the risk of a natural person offending or reoffending."
    },
    "is_high_risk": true,
    "pii_and_sensitive_signals": {
      "detected_pii_columns": [],
      "has_aadhaar_pattern": false,
      "has_minors": false,
      "minors_count": 0,
      "age_column": "age"
    },
    "governance_disclosure": {
      "score": 0.0,
      "earned_points": 0.0,
      "total_questions": 15,
      "answered_count": 0,
      "unanswered_count": 15,
      "breakdown": {
        "q1_risk_mgmt": {
          "status": "unanswered",
          "points": 0.0
        },
        "q2_data_prep": {
          "status": "unanswered",
          "points": 0.0
        },
        "q3_human_oversight": {
          "status": "unanswered",
          "points": 0.0
        },
        "q4_logging": {
          "status": "unanswered",
          "points": 0.0
        },
        "q5_transparency": {
          "status": "unanswered",
          "points": 0.0
        },
        "q6_cybersecurity": {
          "status": "unanswered",
          "points": 0.0
        },
        "q7_dpdp_notice": {
          "status": "unanswered",
          "points": 0.0
        },
        "q8_dpdp_consent": {
          "status": "unanswered",
          "points": 0.0
        },
        "q9_dpdp_erasure": {
          "status": "unanswered",
          "points": 0.0
        },
        "q10_dpdp_grievance": {
          "status": "unanswered",
          "points": 0.0
        },
        "q11_dpdp_breach": {
          "status": "unanswered",
          "points": 0.0
        },
        "q12_dpdp_dpo": {
          "status": "unanswered",
          "points": 0.0
        },
        "q13_dpdp_dpia": {
          "status": "unanswered",
          "points": 0.0
        },
        "q14_dpdp_minors": {
          "status": "unanswered",
          "points": 0.0
        },
        "q15_human_training": {
          "status": "unanswered",
          "points": 0.0
        }
      }
    },
    "eu_ai_act": {
      "classification": "High-Risk AI System (Annex III)",
      "score": 45.5,
      "earned_points": 5.0,
      "max_points": 11.0,
      "checklist": [
        {
          "article": "Art. 9",
          "title": "Risk Management System",
          "type": "self_declared",
          "requirement": "Establish, implement, document and maintain a continuous risk management system.",
          "status": "unanswered",
          "evidence": "No response provided (unanswered / 0 credit)."
        },
        {
          "article": "Art. 10",
          "title": "Data Governance & Bias Examination",
          "type": "auto_verified",
          "requirement": "Training, validation and testing data sets shall be relevant, representative, and examined for biases.",
          "status": "partial",
          "evidence": "Auto-verified: Disparate impact ratio or parity gaps in caution band on test split."
        },
        {
          "article": "Art. 11",
          "title": "Technical Documentation",
          "type": "auto_verified",
          "requirement": "Draw up comprehensive technical documentation demonstrating regulatory conformity before deployment.",
          "status": "yes",
          "evidence": "Auto-verified: Automated AI Model Card and diagnostic specifications compiled by AutoAudit-360."
        },
        {
          "article": "Art. 12",
          "title": "Automatic Logging & Audit Trails",
          "type": "self_declared",
          "requirement": "High-risk AI systems shall technically allow for the automatic recording of events (logging).",
          "status": "unanswered",
          "evidence": "No event logging affirmation provided (unanswered / 0 credit)."
        },
        {
          "article": "Art. 13",
          "title": "Transparency & Provision of Information",
          "type": "auto_verified",
          "requirement": "AI systems shall be accompanied by instructions for use and interpretable explanations.",
          "status": "no",
          "evidence": "Auto-verified: Sensitive attributes directly dominate top predictive feature weights."
        },
        {
          "article": "Art. 14",
          "title": "Human Oversight Measures",
          "type": "self_declared",
          "requirement": "Enable natural persons to oversee the system, prevent risks, or stop the system.",
          "status": "unanswered",
          "evidence": "No human oversight mechanism declared (unanswered / 0 credit)."
        },
        {
          "article": "Art. 15",
          "title": "Accuracy, Robustness & Cybersecurity",
          "type": "auto_verified",
          "requirement": "High-risk AI systems shall achieve appropriate levels of accuracy, robustness and cybersecurity.",
          "status": "yes",
          "evidence": "Auto-verified: Resilient against 10% label flips (<5% metric drop), bounded noise, and counterfactual flips."
        }
      ],
      "gaps": [
        "Unanswered: Art. 9 (Risk Management System) has no disclosure response (0 credit).",
        "Conditional: Art. 10 (Data Governance & Bias Examination) is only partially fulfilled.",
        "Unanswered: Art. 12 (Automatic Logging & Audit Trails) has no disclosure response (0 credit).",
        "Deficiency: Art. 13 (Transparency & Provision of Information) failed or unaddressed.",
        "Unanswered: Art. 14 (Human Oversight Measures) has no disclosure response (0 credit)."
      ],
      "remediations": [
        "Complete disclosure for Art. 9: Establish, implement, document and maintain a continuous risk management system.",
        "Provide complete operational evidence for Art. 10: Training, validation and testing data sets shall be relevant, representative, and examined for biases.",
        "Complete disclosure for Art. 12: High-risk AI systems shall technically allow for the automatic recording of events (logging).",
        "Immediate remediation required for Art. 13: AI systems shall be accompanied by instructions for use and interpretable explanations.",
        "Complete disclosure for Art. 14: Enable natural persons to oversee the system, prevent risks, or stop the system."
      ]
    },
    "dpdp_act_2023": {
      "score": 40.0,
      "earned_points": 4.0,
      "max_points": 10.0,
      "checklist": [
        {
          "section": "Sec 5",
          "principle": "Notice Requirement",
          "type": "self_declared",
          "requirement": "Clear notice provided to Data Principal describing personal data collected and processing purpose.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 6",
          "principle": "Consent Architecture",
          "type": "self_declared",
          "requirement": "Consent must be free, specific, informed, unconditional and unambiguous with clear affirmative action.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 8(3)",
          "principle": "Data Accuracy & Completeness",
          "type": "auto_verified",
          "requirement": "Ensure data used to make decisions affecting Data Principals is accurate and complete.",
          "status": "yes",
          "evidence": "Auto-verified: Dataset is complete with 0.0% missing cells across feature dimensions."
        },
        {
          "section": "Sec 8(5)",
          "principle": "Security Safeguards & Encryption",
          "type": "self_declared",
          "requirement": "Protect personal data in possession or custody under reasonable security safeguards.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 8(6)",
          "principle": "Incident & Breach Notification",
          "type": "self_declared",
          "requirement": "Mandatory breach reporting to Data Protection Board of India and affected Principals.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 9",
          "principle": "Processing of Children's Data",
          "type": "auto_verified",
          "requirement": "Obtain verifiable parental consent; strictly ban tracking, behavioral monitoring, or targeted ads directed at minors.",
          "status": "yes",
          "evidence": "Auto-verified: No records of minors (<18 years) detected in audit sample."
        },
        {
          "section": "Sec 10",
          "principle": "Significant Data Fiduciary Obligations",
          "type": "self_declared",
          "requirement": "Appoint India-resident DPO, conduct periodic Data Protection Impact Assessments (DPIA), and retain independent data auditor.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        },
        {
          "section": "Sec 11-13",
          "principle": "Data Principal Rights & Redressal",
          "type": "self_declared",
          "requirement": "Provide rights of access, correction, erasure, and easily accessible grievance redressal mechanism.",
          "status": "unanswered",
          "evidence": "Unanswered disclosure (0 credit)."
        }
      ],
      "gaps": [
        "Unanswered: Sec 5 (Notice Requirement) has no disclosure response (0 credit).",
        "Unanswered: Sec 6 (Consent Architecture) has no disclosure response (0 credit).",
        "Unanswered: Sec 8(5) (Security Safeguards & Encryption) has no disclosure response (0 credit).",
        "Unanswered: Sec 8(6) (Incident & Breach Notification) has no disclosure response (0 credit).",
        "Unanswered: Sec 10 (Significant Data Fiduciary Obligations) has no disclosure response (0 credit).",
        "Unanswered: Sec 11-13 (Data Principal Rights & Redressal) has no disclosure response (0 credit)."
      ],
      "remediations": [
        "Complete disclosure for Sec 5: Clear notice provided to Data Principal describing personal data collected and processing purpose.",
        "Complete disclosure for Sec 6: Consent must be free, specific, informed, unconditional and unambiguous with clear affirmative action.",
        "Complete disclosure for Sec 8(5): Protect personal data in possession or custody under reasonable security safeguards.",
        "Complete disclosure for Sec 8(6): Mandatory breach reporting to Data Protection Board of India and affected Principals.",
        "Complete disclosure for Sec 10: Appoint India-resident DPO, conduct periodic Data Protection Impact Assessments (DPIA), and retain independent data auditor.",
        "Complete disclosure for Sec 11-13: Provide rights of access, correction, erasure, and easily accessible grievance redressal mechanism."
      ]
    }
  },
  "mitigation": {
    "sensitive_attribute": "race",
    "privileged_group": "Other",
    "baseline": {
      "disparate_impact": 0.7164,
      "demographic_parity_diff": 0.1772,
      "equal_opportunity_diff": 0.0,
      "accuracy": 1.0,
      "recall": 1.0
    },
    "reweighed": {
      "disparate_impact": 0.7164,
      "demographic_parity_diff": 0.1772,
      "equal_opportunity_diff": 0.0,
      "accuracy": 1.0,
      "recall": 1.0,
      "di_improvement": 0.0
    },
    "threshold_adjustments": [
      {
        "threshold": 0.3,
        "disparate_impact": 0.716,
        "demographic_parity_diff": 0.177,
        "accuracy": 1.0,
        "recall": 1.0
      },
      {
        "threshold": 0.4,
        "disparate_impact": 0.716,
        "demographic_parity_diff": 0.177,
        "accuracy": 1.0,
        "recall": 1.0
      },
      {
        "threshold": 0.5,
        "disparate_impact": 0.716,
        "demographic_parity_diff": 0.177,
        "accuracy": 1.0,
        "recall": 1.0
      },
      {
        "threshold": 0.6,
        "disparate_impact": 0.716,
        "demographic_parity_diff": 0.177,
        "accuracy": 1.0,
        "recall": 1.0
      },
      {
        "threshold": 0.7,
        "disparate_impact": 0.716,
        "demographic_parity_diff": 0.177,
        "accuracy": 1.0,
        "recall": 1.0
      }
    ]
  },
  "scores": {
    "overall_trust_score": 49.9,
    "raw_mean_score": 50.4,
    "rag_status": "red",
    "readiness_verdict": "READINESS: ACTION REQUIRED",
    "stamp": "READINESS: ACTION REQUIRED",
    "verdict_statement": "Deficiencies detected in: EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure. Weakest-Link Cap applied (Red / <=49.9): Multiple axes fell below 50.0 (EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure).",
    "verdict_summary": "Deficiencies detected in: EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure. Weakest-Link Cap applied (Red / <=49.9): Multiple axes fell below 50.0 (EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure).",
    "cap_reason": "Weakest-Link Cap applied (Red / <=49.9): Multiple axes fell below 50.0 (EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure).",
    "axes_under_50": [
      "EU AI Act Readiness",
      "DPDP Act 2023 Readiness",
      "Governance Disclosure"
    ],
    "dimension_scores": {
      "Fairness": 67.2,
      "Explainability": 50.0,
      "Robustness": 99.5,
      "EU AI Act Readiness": 45.5,
      "DPDP Act 2023 Readiness": 40.0,
      "Governance Disclosure": 0.0
    }
  },
  "limitations": [
    "Diagnostic audit based on the four-fifths rule and EU AI Act / DPDP Act checklists. Not legal certification.",
    "Audit findings reflect sample distribution characteristics and do not guarantee out-of-distribution parity.",
    "SHAP values measure empirical correlation in the trained estimator manifold, not causal necessity.",
    "Note: Model was trained automatically using a standard baseline RandomForest pipeline as no external model file was supplied.",
    "Score Cap: Weakest-Link Cap applied (Red / <=49.9): Multiple axes fell below 50.0 (EU AI Act Readiness, DPDP Act 2023 Readiness, Governance Disclosure)."
  ]
} as unknown as FullAuditResult;
