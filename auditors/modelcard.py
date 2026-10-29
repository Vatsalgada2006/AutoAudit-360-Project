"""
Auditors: AI Model Card Generator
Generates self-contained, printable, and downloadable HTML/JSON AI Model Cards.
Adheres to the Forensic Regulatory Scanner design concept and strict scoring integrity.
"""

import json
from typing import Dict, Any
from jinja2 import Template

MODEL_CARD_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Model Card: {{ meta.model_name }} | AutoAudit-360</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #201823;
      line-height: 1.45;
      font-size: 12px;
      background: #FAF2E8;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #DED3D8;
      border-radius: 8px;
      padding: 28px;
      box-shadow: 0 4px 12px rgba(32, 24, 35, 0.06);
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #201823;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .title-area h1 {
      margin: 0 0 4px 0;
      font-size: 22px;
      font-weight: 800;
      color: #201823;
      letter-spacing: -0.02em;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-green { background: #D5F36A; color: #201823; border: 1px solid #c0e050; }
    .badge-amber { background: #fff3ed; color: #c44030; border: 1px solid #FF705D; }
    .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .stamp {
      border: 2px dashed #201823;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stamp-green { border-color: #201823; color: #201823; background: #D5F36A; }
    .stamp-amber { border-color: #FF705D; color: #c44030; background: #fff3ed; }
    .stamp-red { border-color: #e11d48; color: #991b1b; background: #fee2e2; }

    .cap-alert {
      background: #fff1f2;
      border-left: 4px solid #FF705D;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 12px;
      color: #9f1239;
    }
    .disclaimer-banner {
      background: #FAF2E8;
      border-left: 4px solid #332A37;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 12px;
      color: #201823;
    }
    .exec-summary {
      background: #FAF2E8;
      border: 1px solid #DED3D8;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .exec-summary h3 {
      margin: 0 0 6px 0;
      font-size: 13px;
      font-weight: 700;
      color: #201823;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .card {
      border: 1px solid #DED3D8;
      border-radius: 6px;
      padding: 12px;
      background: #FAF2E8;
    }
    .card h3 {
      margin: 0 0 6px 0;
      font-size: 11px;
      font-weight: 700;
      color: #332A37;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .metric-value {
      font-size: 18px;
      font-weight: 800;
      font-family: monospace;
      color: #201823;
    }
    .metric-sub {
      font-size: 11px;
      color: #332A37;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 11px;
    }
    th, td {
      padding: 6px 8px;
      text-align: left;
      border-bottom: 1px solid #DED3D8;
    }
    th {
      background: #FAF2E8;
      color: #201823;
      font-weight: 700;
    }
    section {
      margin-bottom: 22px;
    }
    h2 {
      font-size: 14px;
      font-weight: 800;
      color: #201823;
      border-bottom: 1px solid #DED3D8;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .footer {
      border-top: 2px solid #201823;
      padding-top: 12px;
      margin-top: 24px;
      font-size: 11px;
      color: #332A37;
      display: flex;
      justify-content: space-between;
    }
    .print-hide {
      margin-bottom: 14px;
      display: flex;
      gap: 10px;
    }
    button {
      background: #332A37;
      color: #FAF2E8;
      border: 1px solid #FF705D;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: #201823; }

    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0;
      }
      .container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .print-hide { display: none !important; }
      .badge, .stamp {
        border: 1px solid #000000 !important;
        background: transparent !important;
        color: #000000 !important;
      }
      .cap-alert, .disclaimer-banner {
        border-left: 2px solid #000000 !important;
        background: #f8fafc !important;
        color: #000000 !important;
      }
      table, th, td {
        border-color: #94a3b8 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-hide">
      <button onclick="window.print()">Print / Save as PDF</button>
      <button onclick="downloadJson()">Download Full Audit JSON</button>
    </div>

    <!-- Header & Verdict -->
    <div class="header-bar">
      <div class="title-area">
        <h1>AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite</h1>
        <div style="font-size: 13px; font-weight: 700; color: #334155;">AI MODEL CARD & DIAGNOSTIC FINDINGS &bull; {{ meta.model_name }}</div>
        <div style="margin-top: 4px;">
          <span class="badge {% if scores.rag_status == 'green' %}badge-green{% elif scores.rag_status == 'amber' %}badge-amber{% else %}badge-red{% endif %}">
            RAG Status: {{ scores.rag_status | upper }} (Trust Score: {{ scores.overall_trust_score }}/100)
          </span>
          <span style="margin-left: 8px; font-size: 11px; color: #64748b; font-family: monospace;">Audit ID: {{ meta.audit_id }}</span>
          <span style="margin-left: 8px; font-size: 11px; color: #64748b;">Timestamp: {{ meta.timestamp }}</span>
        </div>
      </div>
      <div class="stamp {% if scores.rag_status == 'green' %}stamp-green{% elif scores.rag_status == 'amber' %}stamp-amber{% else %}stamp-red{% endif %}">
        {{ scores.stamp or 'READINESS: ACTION REQUIRED' }}
      </div>
    </div>

    <!-- Cap Reason Alert if present -->
    {% if scores.cap_reason %}
    <div class="cap-alert">
      <strong>WEAKEST-LINK SCORE CAP APPLIED:</strong> {{ scores.cap_reason }}
      <div style="font-size: 11px; margin-top: 3px; color: #881337;">
        Raw axis mean: {{ scores.raw_mean_score }}/100 &rarr; Enforced readiness ceiling: {{ scores.overall_trust_score }}/100.
      </div>
    </div>
    {% endif %}

    <!-- Executive Summary -->
    <div class="exec-summary">
      <h3>Executive Forensic Audit Summary</h3>
      <div>{{ scores.verdict_statement }}</div>
      <div style="font-size: 11px; color: #475569; margin-top: 6px;">
        <strong>Audit Mode:</strong> {{ meta.audit_mode | default('Surrogate Model Evaluation') }} &bull;
        <strong>Evaluated Test Set:</strong> Held-out test split (N={{ data_summary.test_sample_size | default(data_summary.total_rows) }}) &bull;
        <strong>Regulatory Context:</strong> {{ compliance.use_case.title }} ({{ compliance.eu_ai_act.classification }})
      </div>
    </div>

    <!-- Statutory Notice -->
    <div class="disclaimer-banner">
      <strong>Statutory Transparency Notice:</strong> Diagnostic audit based on the four-fifths rule and EU AI Act / DPDP Act checklists. Not legal certification. Findings reflect statistical bounds, empirical stress tests, and self-declared governance disclosures.
    </div>

    <!-- Section 1: Scope & Dataset -->
    <section>
      <h2>1. Model Details & Scope of Application</h2>
      <div class="grid-2">
        <div class="card">
          <h3>Architecture & Algorithm</h3>
          <div><strong>Model Framework:</strong> {{ meta.framework }}</div>
          <div><strong>Model Class:</strong> {{ meta.algorithm }}</div>
          <div><strong>Target Objective:</strong> {{ data_summary.target_column }} (Binary Classification)</div>
          <div><strong>Evaluation Split:</strong> {{ data_summary.train_sample_size | default('N/A') }} train / {{ data_summary.test_sample_size | default('N/A') }} test</div>
        </div>
        <div class="card">
          <h3>Intended & Out-of-Scope Use</h3>
          <div><strong>Intended Domain:</strong> {{ compliance.use_case.title }}</div>
          <div><strong>EU AI Act Tier:</strong> {{ compliance.eu_ai_act.classification }}</div>
          <div><strong>Prohibited Use:</strong> Fully autonomous adverse action without human-in-the-loop oversight.</div>
          <div><strong>Audit Engine:</strong> AutoAudit-360 Forensic Harness v2.0</div>
        </div>
      </div>
    </section>

    <!-- Section 2: Quantitative Performance -->
    <section>
      <h2>2. Quantitative Performance (Repeated 5-Seed Stratified CV)</h2>
      <div class="grid-4">
        <div class="card">
          <h3>Accuracy</h3>
          <div class="metric-value">{{ performance.accuracy }}</div>
          <div class="metric-sub">{% if performance.accuracy_std %}Std: &plusmn;{{ performance.accuracy_std }}{% else %}Hold-out test{% endif %}</div>
        </div>
        <div class="card">
          <h3>F1-Score</h3>
          <div class="metric-value">{{ performance.f1_score }}</div>
          <div class="metric-sub">{% if performance.f1_std %}Std: &plusmn;{{ performance.f1_std }}{% else %}Balanced: {{ performance.balanced_accuracy }}{% endif %}</div>
        </div>
        <div class="card">
          <h3>Precision / Recall</h3>
          <div class="metric-value">{{ performance.precision }} / {{ performance.recall }}</div>
          <div class="metric-sub">Decision Threshold: 0.50</div>
        </div>
        <div class="card">
          <h3>ROC-AUC</h3>
          <div class="metric-value">{{ performance.roc_auc }}</div>
          <div class="metric-sub">Discrimination index</div>
        </div>
      </div>
    </section>

    <!-- Section 3: Fairness & Intersectional Metrics -->
    <section>
      <h2>3. Algorithmic Fairness Assessment (Held-out Test Split, 500 Bootstrap Replications)</h2>
      <table>
        <thead>
          <tr>
            <th>Protected Attribute</th>
            <th>Groups (Privileged Group)</th>
            <th>Test Subgroup Samples</th>
            <th>Disparate Impact (DI) [95% CI]</th>
            <th>Demographic Parity Diff [95% CI]</th>
            <th>Equal Opportunity Diff [95% CI]</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {% for f in fairness %}
          {% if not f.is_intersectional %}
          <tr>
            <td><strong>{{ f.attribute }}</strong></td>
            <td>Priv: {{ f.privileged_group }}</td>
            <td style="font-family: monospace; font-size: 11px;">
              {% if f.subgroup_breakdown %}
                {% for grp, gdata in f.subgroup_breakdown.items() %}
                  {{ grp }}: n={{ gdata.size }}{% if not loop.last %}<br>{% endif %}
                {% endfor %}
              {% else %}
                Total Test N: {{ f.test_sample_size | default('N/A') }}
              {% endif %}
            </td>
            <td style="font-family: monospace;">
              {{ f.metrics.disparate_impact_ratio }}
              {% if f.confidence_intervals_95 and f.confidence_intervals_95.disparate_impact %}
                <br><small style="color: #64748b;">[{{ f.confidence_intervals_95.disparate_impact[0] }}, {{ f.confidence_intervals_95.disparate_impact[1] }}]</small>
              {% endif %}
            </td>
            <td style="font-family: monospace;">
              {{ (f.metrics.demographic_parity_difference * 100) | round(1) }}%
              {% if f.confidence_intervals_95 and f.confidence_intervals_95.demographic_parity_difference %}
                <br><small style="color: #64748b;">[{{ (f.confidence_intervals_95.demographic_parity_difference[0] * 100) | round(1) }}%, {{ (f.confidence_intervals_95.demographic_parity_difference[1] * 100) | round(1) }}%]</small>
              {% endif %}
            </td>
            <td style="font-family: monospace;">
              {{ (f.metrics.equal_opportunity_difference * 100) | round(1) }}%
              {% if f.confidence_intervals_95 and f.confidence_intervals_95.equal_opportunity_difference %}
                <br><small style="color: #64748b;">[{{ (f.confidence_intervals_95.equal_opportunity_difference[0] * 100) | round(1) }}%, {{ (f.confidence_intervals_95.equal_opportunity_difference[1] * 100) | round(1) }}%]</small>
              {% endif %}
            </td>
            <td>
              <span class="badge {% if f.status == 'pass' %}badge-green{% elif f.status == 'warn' %}badge-amber{% else %}badge-red{% endif %}">
                {{ f.status | upper }}
              </span>
            </td>
          </tr>
          {% endif %}
          {% endfor %}
        </tbody>
      </table>

      <!-- Intersectional Cohorts if available -->
      {% for f in fairness %}
      {% if f.is_intersectional %}
      <h3 style="margin-top: 12px; font-size: 11px; font-weight: 700; color: #334155;">
        INTERSECTIONAL COHORTS: {{ f.attribute }}
      </h3>
      <table>
        <thead>
          <tr>
            <th>Intersectional Subgroup</th>
            <th>Sample N</th>
            <th>Selection Rate (Fav Outcome)</th>
            <th>Sample Sufficiency</th>
          </tr>
        </thead>
        <tbody>
          {% for cohort, data in f.subgroup_breakdown.items() %}
          <tr>
            <td><strong>{{ cohort }}</strong></td>
            <td style="font-family: monospace;">{{ data.size }}</td>
            <td style="font-family: monospace;">{{ (data.selection_rate * 100) | round(1) }}%</td>
            <td>
              {% if data.size < 30 %}
                <span class="badge badge-amber">INSUFFICIENT SAMPLE (N&lt;30)</span>
              {% else %}
                <span class="badge badge-green">SUFFICIENT SAMPLE (N&ge;30)</span>
              {% endif %}
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
      {% endif %}
      {% endfor %}

      <!-- Mitigation summary if available -->
      {% if mitigation and mitigation.baseline %}
      <div class="card" style="margin-top: 10px;">
        <h3>Fairness Mitigation (Kamiran & Calders Reweighing Intervention)</h3>
        <div>
          Sensitive Attribute: <strong>{{ mitigation.sensitive_attribute }}</strong> &bull;
          Baseline Disparate Impact: <strong>{{ mitigation.baseline.disparate_impact }}</strong> &rarr;
          Post-Reweighing Disparate Impact: <strong>{{ mitigation.reweighed.disparate_impact }}</strong>
          (Baseline Acc: {{ (mitigation.baseline.accuracy * 100) | round(1) }}% &rarr; Reweighed Acc: {{ (mitigation.reweighed.accuracy * 100) | round(1) }}%)
        </div>
      </div>
      {% endif %}
    </section>

    <!-- Section 4: Explainability & Proxy Leakage -->
    <section>
      <h2>4. Explainability & Proxy Leakage Analysis (SHAP Attribution)</h2>
      <div class="card" style="margin-bottom: 10px;">
        <div><strong>Explainer Engine:</strong> {{ explain.explainer_type }} &bull; <strong>Attribution Success:</strong> {{ explain.status | upper }}</div>
        <div style="margin-top: 4px;">{{ explain.finding }}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Feature Name</th>
            <th>Attribution Score (|SHAP|)</th>
            <th>Protected / Proxy Leakage Status</th>
          </tr>
        </thead>
        <tbody>
          {% for feat in explain.top_features[:8] %}
          <tr>
            <td>#{{ loop.index }}</td>
            <td><strong>{{ feat.feature }}</strong></td>
            <td style="font-family: monospace;">{{ feat.importance }}</td>
            <td>
              {% if feat.is_sensitive %}
                <span class="badge badge-red">PROTECTED ATTRIBUTE</span>
              {% elif feat.is_proxy %}
                <span class="badge badge-amber">SUSPECTED PROXY (r={{ feat.proxy_correlation | default('high') }})</span>
              {% else %}
                <span class="badge badge-green">STANDARD COVARIATE</span>
              {% endif %}
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </section>

    <!-- Section 5: Adversarial Robustness -->
    <section>
      <h2>5. Adversarial Robustness & Perturbation Stress Testing</h2>
      <div class="grid-3">
        <div class="card">
          <h3>Counterfactual Sensitivity</h3>
          <div class="metric-value">
            {% if robustness.counterfactual_flip_rate is not none and robustness.counterfactual_flip_rate is defined %}
              {{ (robustness.counterfactual_flip_rate * 100) | round(1) }}%
            {% else %}N/A{% endif %}
          </div>
          <div class="metric-sub">Prediction flip on sensitive flip</div>
        </div>
        <div class="card">
          <h3>Worst-Case Perturbation (&epsilon;=0.10)</h3>
          <div class="metric-value">
            {% if robustness.worst_case_drop_eps10 is not none and robustness.worst_case_drop_eps10 is defined %}
              -{{ (robustness.worst_case_drop_eps10 * 100) | round(1) }}%
            {% elif robustness.metric_drop_10pct is not none and robustness.metric_drop_10pct is defined %}
              -{{ (robustness.metric_drop_10pct * 100) | round(1) }}%
            {% else %}N/A{% endif %}
          </div>
          <div class="metric-sub">Targeted coordinate search</div>
        </div>
        <div class="card">
          <h3>Fairness Stability (&Delta; DI)</h3>
          <div class="metric-value">
            {% if robustness.fairness_stability_delta is not none and robustness.fairness_stability_delta is defined %}
              &plusmn;{{ robustness.fairness_stability_delta }}
            {% else %}N/A{% endif %}
          </div>
          <div class="metric-sub">Max DI drift under noise</div>
        </div>
      </div>
      <div style="font-size: 11px; color: #475569;">{{ robustness.finding }}</div>
    </section>

    <!-- Section 6: Regulatory Compliance Readiness -->
    <section>
      <h2>6. Regulatory Compliance & Governance Readiness</h2>
      <div class="grid-3">
        <div class="card">
          <h3>EU AI Act (Annex III)</h3>
          <div class="metric-value">{{ compliance.eu_ai_act.score }} / 100</div>
          <div class="metric-sub">{{ compliance.eu_ai_act.earned_points }} / {{ compliance.eu_ai_act.max_points }} Points Verified</div>
        </div>
        <div class="card">
          <h3>India DPDP Act 2023</h3>
          <div class="metric-value">{{ compliance.dpdp_act_2023.score }} / 100</div>
          <div class="metric-sub">{{ compliance.dpdp_act_2023.earned_points }} / {{ compliance.dpdp_act_2023.max_points }} Points Verified</div>
        </div>
        <div class="card">
          <h3>Governance Disclosure</h3>
          <div class="metric-value">{{ scores.dimension_scores.get('Governance Disclosure', scores.dimension_scores.get('Documentation Completeness', 'N/A')) }} / 100</div>
          <div class="metric-sub">Unanswered declared items = 0 credit</div>
        </div>
      </div>
    </section>

    <!-- Section 7: Dimension Breakdown Table -->
    <section>
      <h2>7. AutoAudit-360 Trust Index Breakdown & Capping Rules</h2>
      <table>
        <thead>
          <tr>
            <th>Audit Dimension</th>
            <th>Score</th>
            <th>Passing Benchmark</th>
            <th>Assessment Rating</th>
          </tr>
        </thead>
        <tbody>
          {% for axis, val in scores.dimension_scores.items() %}
          <tr>
            <td><strong>{{ axis }}</strong></td>
            <td style="font-family: monospace; font-size: 13px;">
              {% if val is not none %}<strong>{{ val }} / 100</strong>{% else %}<strong>N/A</strong>{% endif %}
            </td>
            <td>&ge; 75.0 (Pass)</td>
            <td>
              {% if val is none %}
                <span class="badge" style="background: #f1f5f9; color: #64748b;">EXCLUDED (N/A)</span>
              {% elif val >= 75 %}
                <span class="badge badge-green">COMPLIANT</span>
              {% elif val >= 50 %}
                <span class="badge badge-amber">CONDITIONAL</span>
              {% else %}
                <span class="badge badge-red">CRITICAL RISK (&lt;50)</span>
              {% endif %}
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </section>

    <!-- Section 8: Limitations & Appendix -->
    <section>
      <h2>8. Limitations & Methodology Appendix</h2>
      <div class="card">
        <div><strong>Scoring Integrity Rule:</strong> Overall Trust Score is computed as the mean of valid axes, subject to strict weakest-link capping:</div>
        <ul style="padding-left: 18px; font-size: 11px; margin-top: 6px;">
          <li>Any single axis &lt; 50.0 &rarr; Overall score capped at 74.9 (READINESS: NEEDS REVIEW / Amber).</li>
          <li>Fairness &lt; 50.0 on a High-Risk use case OR two or more axes &lt; 50.0 &rarr; Overall score capped at 49.9 (READINESS: ACTION REQUIRED / Red).</li>
          <li>Missing or uncomputed results yield score = None ("N/A"), are excluded from the mean, and are logged in limitations.</li>
        </ul>
      </div>
      {% if limitations %}
      <h3 style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #b91c1c;">Identified Audit Limitations & Flags:</h3>
      <ul style="padding-left: 18px; font-size: 11px; color: #b91c1c;">
        {% for lim in limitations %}
        <li>{{ lim }}</li>
        {% endfor %}
      </ul>
      {% endif %}
    </section>

    <!-- Neutral Footer -->
    <div class="footer">
      <div>
        <strong>AutoAudit-360 | Academic prototype | Diagnostic findings, not legal certification.</strong><br>
        Domain: AI Governance, Policy &amp; Risk Management &bull; Modules 1–4
      </div>
      <div style="text-align: right;">
        Verification Stamp: {{ meta.dataset_hash[:16] }}...<br>
        Format: Self-contained Dossier &bull; ISO 8601 UTC
      </div>
    </div>
  </div>

  <script>
    const auditData = {{ raw_json | safe }};
    function downloadJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "autoaudit360_" + (auditData.meta ? auditData.meta.audit_id : "audit") + ".json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  </script>
</body>
</html>
"""

def generate_model_card_html(audit_result: Dict[str, Any]) -> str:
    """Compile audit results dictionary into a self-contained, printable HTML Model Card."""
    template = Template(MODEL_CARD_HTML_TEMPLATE)
    raw_json = json.dumps(audit_result)
    return template.render(**audit_result, raw_json=raw_json)
