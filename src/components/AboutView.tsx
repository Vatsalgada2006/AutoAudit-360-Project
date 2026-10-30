import React from 'react';
import {
  ShieldCheck,
  Target,
  Code2,
  BookOpen,
  FolderGit2,
  Scale,
  Search,
  ShieldAlert,
  FileCheck2,
  FileText,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-[#38A9DB] border border-[#DCE5EB] rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#38A9DB]" />
          <span>AI Governance, Policy &amp; Risk Management</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
          AutoAudit-360: End-to-End Trustworthy AI Audit &amp; Regulatory Compliance Suite
        </h2>
        <p className="text-base text-[#555555] leading-relaxed max-w-3xl">
          AutoAudit-360 is an integrated auditing suite designed to make machine learning classification systems
          more <strong>transparent, fair, robust, and accountable</strong>. By pairing empirical statistical evaluations
          with emerging statutory governance frameworks (such as the EU AI Act and India DPDP Act 2023), the platform
          bridges the gap between technical data science metrics and actionable regulatory compliance.
        </p>
      </div>

      {/* Grid: Objectives & Tech Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objectives */}
        <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DCE5EB] pb-3">
            <Target className="w-5 h-5 text-[#38A9DB]" />
            <h3 className="text-lg font-bold text-[#111111]">Project Objectives</h3>
          </div>
          <ul className="space-y-3 text-sm text-[#555555]">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111]">Automate Fairness Diagnostics:</strong> Compute demographic parity,
                disparate impact, selection rates, and intersectional cohort disparities across sensitive groups.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111]">Explain Black-Box Models:</strong> Provide global SHAP feature importance,
                quantify feature contributions, and screen for covert proxy variables.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111]">Stress Test Model Robustness:</strong> Measure model stability under
                synthetic label corruptions, Gaussian feature noise, and counterfactual identity swaps.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111]">Statutory Readiness Assessment:</strong> Translate legal requirements
                from the EU AI Act (Annex III &amp; Articles 9-15) and India DPDP Act 2023 into structured technical checklists.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111]">Standardized Model Cards:</strong> Automatically compile self-contained,
                reproducible audit reports in HTML, JSON, and print-ready PDF formats.
              </span>
            </li>
          </ul>
        </div>

        {/* Technologies Used */}
        <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DCE5EB] pb-3">
            <Code2 className="w-5 h-5 text-[#38A9DB]" />
            <h3 className="text-lg font-bold text-[#111111]">Technologies Used</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-1">
              <span className="font-semibold text-[#111111] block">Frontend Framework</span>
              <span className="text-[#555555]">React 19 + TypeScript (Vite 8 SPA)</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-1">
              <span className="font-semibold text-[#111111] block">Styling System</span>
              <span className="text-[#555555]">Tailwind CSS 4.0 (Design tokens &amp; layout)</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-1">
              <span className="font-semibold text-[#111111] block">Backend Runtime</span>
              <span className="text-[#555555]">Node.js 22 + Express (Full-stack API)</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-1">
              <span className="font-semibold text-[#111111] block">Data Engine</span>
              <span className="text-[#555555]">Multivariate audit engine (scikit-learn &amp; SHAP principles)</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-1">
              <span className="font-semibold text-[#111111] block">Visualizations</span>
              <span className="text-[#555555]">Chart.js &amp; React-Chartjs-2 (Radar &amp; Bars)</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-1">
              <span className="font-semibold text-[#111111] block">Export Engine</span>
              <span className="text-[#555555]">Self-contained HTML, JSON, and PDF generation</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-sky-50 border border-[#DCE5EB] text-xs text-[#555555] space-y-1">
            <span className="font-semibold text-[#111111] block">Architecture Principle:</span>
            <span>
              Real calculated metric outputs. When you run an audit on a custom CSV or demo benchmark, every metric
              is derived from actual test data, avoiding synthetic mock placeholders.
            </span>
          </div>
        </div>
      </div>

      {/* Syllabus Mapping: Modules 1 to 4 */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DCE5EB] pb-3">
          <BookOpen className="w-5 h-5 text-[#38A9DB]" />
          <h3 className="text-lg font-bold text-[#111111]">Syllabus Mapping: Core Course Modules</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1 */}
          <div className="p-4 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-[#38A9DB]">Module 1</span>
              <Scale className="w-4 h-4 text-[#38A9DB]" />
            </div>
            <h4 className="font-bold text-sm text-[#111111]">Trustworthy AI Pipeline</h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Empirical algorithmic fairness testing, disparate impact 80% rule screening, global SHAP feature attribution,
              and adversarial noise robustness testing.
            </p>
          </div>

          {/* Module 2 */}
          <div className="p-4 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Module 2</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-sm text-[#111111]">AI Model Card Generator</h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Automated synthesis of standardized model documentation (Mitchell et al. paradigm) with quantitative
              performance, operational limits, and reproducible export.
            </p>
          </div>

          {/* Module 3 */}
          <div className="p-4 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">Module 3</span>
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="font-bold text-sm text-[#111111]">EU AI Act Compliance</h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              High-Risk system classification under Annex III (e.g. credit scoring, employment) and verification
              of mandatory Articles 9-15 governance requirements.
            </p>
          </div>

          {/* Module 4 */}
          <div className="p-4 rounded-lg bg-gray-50 border border-[#DCE5EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Module 4</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="font-bold text-sm text-[#111111]">India DPDP Act 2023</h4>
            <p className="text-xs text-[#555555] leading-relaxed">
              Analysis under Sections 4-13: purpose limitation, data minimisation, data accuracy, security safeguards,
              retention rules, and data principal rights.
            </p>
          </div>
        </div>
      </div>

      {/* Project Deliverables */}
      <div className="content-card p-6 bg-white border border-[#DCE5EB] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DCE5EB] pb-3">
          <FolderGit2 className="w-5 h-5 text-[#38A9DB]" />
          <h3 className="text-lg font-bold text-[#111111]">Key Project Deliverables</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-[#DCE5EB] space-y-1.5">
            <span className="font-bold text-sm text-[#111111] block">1. Interactive Auditing UI</span>
            <p className="text-[#555555]">
              Clean, responsive web console allowing users to inspect preloaded benchmarks or upload custom CSV datasets
              and view interactive charts across all four audit stages.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-[#DCE5EB] space-y-1.5">
            <span className="font-bold text-sm text-[#111111] block">2. High-Fidelity Audit Engine</span>
            <p className="text-[#555555]">
              Statistically rigorous computation routines evaluating demographic parity difference, disparate impact,
              subgroup accuracy, noise perturbations, and label flip degradation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-[#DCE5EB] space-y-1.5">
            <span className="font-bold text-sm text-[#111111] block">3. Statutory Gap Reports</span>
            <p className="text-[#555555]">
              Preliminary statutory readiness gap reports identifying missing governance controls, completed articles,
              and concrete corrective actions before production deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer Notice */}
      <div className="content-card p-4 bg-sky-50 border border-[#DCE5EB] text-xs text-[#555555] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#38A9DB] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#111111] block">Educational &amp; Technical Audit Disclaimer</strong>
          AutoAudit-360 is an academic and technical assessment tool. The compliance scoring and gap analyses
          provide preliminary diagnostic readiness checks and do not substitute for formal legal counsel or
          official statutory conformity certification under European or Indian data authorities.
        </div>
      </div>
    </div>
  );
};
