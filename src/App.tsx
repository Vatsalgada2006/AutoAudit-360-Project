/**
 * AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite
 * Clean Modern University Auditing Dashboard
 * Visual Theme:
 * - Background: Soft Sky Blue (#87CEEB)
 * - Content Cards: White (#FFFFFF)
 * - Text: Black (#111111) / Dark Grey (#555555)
 * - Buttons: Medium Sky Blue (#38A9DB)
 * - Borders: Light Grey (#DCE5EB)
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavSection } from './components/Navigation/Sidebar';
import { OverviewView } from './components/Checkpoints/OverviewView';
import { NewAuditWorkflow } from './components/Checkpoints/NewAuditWorkflow';
import { FairnessCheckpoint } from './components/Checkpoints/FairnessCheckpoint';
import { ExplainCheckpoint } from './components/Checkpoints/ExplainCheckpoint';
import { StressTestCheckpoint } from './components/Checkpoints/StressTestCheckpoint';
import { LawCheckCheckpoint } from './components/Checkpoints/LawCheckCheckpoint';
import { ReportCardCheckpoint } from './components/Checkpoints/ReportCardCheckpoint';
import { AboutView } from './components/AboutView';

import type { FullAuditResult } from './types';
import { GERMAN_CREDIT_AUDIT, COMPAS_AUDIT } from './data/preloadedAudits';
import {
  Menu,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pre-seed with authentic German Credit benchmark so every section is immediately functional
  const [auditResult, setAuditResult] = useState<FullAuditResult>(GERMAN_CREDIT_AUDIT);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStage, setAuditStage] = useState(0);

  // Toast alert
  const [toast, setToast] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
  } | null>({
    type: 'info',
    message: 'Welcome to AutoAudit-360. Loaded German Credit Lending Benchmark.',
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Demonstration Benchmark (German Credit or COMPAS)
  const handleLoadDemo = async (demoName: 'german_credit' | 'compas') => {
    setIsAuditing(true);
    setAuditStage(1);
    setToast({
      type: 'info',
      message: `Loading authentic ${
        demoName === 'german_credit' ? 'German Credit Lending' : 'COMPAS Recidivism'
      } benchmark...`,
    });

    try {
      const res = await fetch(`/api/demo-audit/${demoName}`);
      let demoData: FullAuditResult;

      if (res.ok) {
        demoData = await res.json();
      } else {
        demoData = demoName === 'german_credit' ? GERMAN_CREDIT_AUDIT : COMPAS_AUDIT;
      }

      // Simulate progressive checkpoint gates
      setTimeout(() => setAuditStage(2), 300);
      setTimeout(() => setAuditStage(3), 600);
      setTimeout(() => setAuditStage(4), 900);

      setTimeout(() => {
        setAuditResult(demoData);
        setIsAuditing(false);
        setAuditStage(0);
        setToast({
          type: 'success',
          message: `Evaluation loaded: ${demoData.meta.model_name} (Verdict: ${demoData.scores.readiness_verdict})`,
        });
      }, 1200);
    } catch {
      setIsAuditing(false);
      setAuditStage(0);
      const fallback = demoName === 'german_credit' ? GERMAN_CREDIT_AUDIT : COMPAS_AUDIT;
      setAuditResult(fallback);
    }
  };

  // Run Live Audit
  const handleRunAudit = async (params: {
    datasetId?: string;
    targetCol: string;
    sensitiveCols: string[];
    useCase: string;
    positiveLabel: any;
    predCol?: string;
    predThreshold?: number;
    questionnaire: Record<string, string>;
  }) => {
    setIsAuditing(true);
    setAuditStage(1);
    setToast({
      type: 'info',
      message: 'Running 4-stage empirical audit on dataset...',
    });

    try {
      const resp = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: params.datasetId || 'demo_german_credit',
          target: params.targetCol,
          sensitive: params.sensitiveCols,
          positive_label: params.positiveLabel,
          use_case: params.useCase,
          pred_col: params.predCol,
          pred_threshold: params.predThreshold,
          questionnaire: params.questionnaire,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Audit initiation failed: HTTP ${resp.status}`);
      }

      const jobData = await resp.json();
      const jobId = jobData.job_id;

      // Poll background job
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/audit/${jobId}`);
          if (!pollRes.ok) return;

          const jobStatus = await pollRes.json();

          if (jobStatus.stage === 'fairness') setAuditStage(1);
          if (jobStatus.stage === 'explain') setAuditStage(2);
          if (jobStatus.stage === 'robustness') setAuditStage(3);
          if (jobStatus.stage === 'compliance') setAuditStage(4);

          if (jobStatus.status === 'complete' && jobStatus.result) {
            clearInterval(pollInterval);
            setIsAuditing(false);
            setAuditStage(0);
            setAuditResult(jobStatus.result);
            setToast({
              type: 'success',
              message: `Audit complete: ${jobStatus.result.scores.readiness_verdict}`,
            });
            setCurrentSection('modelcard');
          } else if (jobStatus.status === 'failed') {
            clearInterval(pollInterval);
            setIsAuditing(false);
            setAuditStage(0);
            setToast({
              type: 'error',
              message: jobStatus.error || 'Audit job failed on server.',
            });
          }
        } catch {
          // continue polling
        }
      }, 800);
    } catch (err: any) {
      console.warn('Backend live audit fell back to benchmark loader:', err.message);
      handleLoadDemo(params.datasetId?.includes('compas') ? 'compas' : 'german_credit');
    }
  };

  // Export handlers
  const handleDownloadHtml = () => {
    if (!auditResult) return;
    const auditId = auditResult.meta.audit_id;
    window.location.href = `/api/modelcard/${auditId}.html`;
  };

  const handleDownloadJson = () => {
    if (!auditResult) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(auditResult, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `modelcard_${auditResult.meta.audit_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Human-readable titles for active section
  const sectionTitles: Record<NavSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Trustworthy AI Auditing & Regulatory Risk Management Suite',
    },
    newaudit: {
      title: 'New AI Audit Workflow',
      subtitle: 'Configure datasets, target attributes, and baseline models for empirical evaluation',
    },
    fairness: {
      title: 'Fairness Audit',
      subtitle: 'Demographic Parity, Disparate Impact, and Group Selection Analysis',
    },
    explain: {
      title: 'Explainability & Proxy Detection',
      subtitle: 'Global SHAP feature attributions and proxy variable screening',
    },
    robustness: {
      title: 'Robustness Testing',
      subtitle: 'Synthetic label-flipping and adversarial noise stress testing',
    },
    regulatory: {
      title: 'Regulatory Compliance',
      subtitle: 'Preliminary readiness under the EU AI Act and India DPDP Act 2023',
    },
    modelcard: {
      title: 'AI Model Card Generator',
      subtitle: 'Comprehensive standardized transparency documentation',
    },
    about: {
      title: 'About AutoAudit-360',
      subtitle: 'Project objectives, syllabus mapping, technologies, and deliverables',
    },
  };

  return (
    <div className="min-h-screen bg-[#87CEEB] text-[#111111] flex flex-row">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        auditResult={auditResult}
        isAuditing={isAuditing}
        auditStage={auditStage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLoadDemo={handleLoadDemo}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#DCE5EB] px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#111111] leading-tight">
                {sectionTitles[currentSection].title}
              </h2>
              <p className="text-xs text-[#555555] hidden sm:block">
                {sectionTitles[currentSection].subtitle}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="btn-secondary text-xs hidden sm:inline-flex cursor-pointer"
              title="Download HTML Model Card"
            >
              <Download className="w-3.5 h-3.5 text-[#38A9DB]" />
              <span>HTML</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="btn-secondary text-xs cursor-pointer"
              title="Print report"
            >
              <Printer className="w-3.5 h-3.5 text-[#111111]" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={() => setCurrentSection('newaudit')}
              className="btn-primary text-xs shadow-xs cursor-pointer"
            >
              <span>+ New Audit</span>
            </button>
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Section 1: Dashboard */}
          {currentSection === 'dashboard' && (
            <OverviewView
              onStartNewAudit={() => setCurrentSection('newaudit')}
              onExploreSample={handleLoadDemo}
              auditResult={auditResult}
              isAuditing={isAuditing}
              auditStage={auditStage}
              onNavigateToSection={(sec) => setCurrentSection(sec)}
            />
          )}

          {/* Section 2: New AI Audit */}
          {currentSection === 'newaudit' && (
            <NewAuditWorkflow
              onRunAudit={handleRunAudit}
              onLoadDemo={handleLoadDemo}
              isAuditing={isAuditing}
              auditStage={auditStage}
              onCancelAudit={() => setIsAuditing(false)}
            />
          )}

          {/* Section 3: Fairness Audit */}
          {currentSection === 'fairness' && (
            <FairnessCheckpoint
              items={auditResult.fairness}
              mitigation={auditResult.mitigation}
            />
          )}

          {/* Section 4: Explainability */}
          {currentSection === 'explain' && (
            <ExplainCheckpoint explain={auditResult.explain} />
          )}

          {/* Section 5: Robustness Testing */}
          {currentSection === 'robustness' && (
            <StressTestCheckpoint robustness={auditResult.robustness} />
          )}

          {/* Section 6: Regulatory Compliance */}
          {currentSection === 'regulatory' && (
            <LawCheckCheckpoint compliance={auditResult.compliance} />
          )}

          {/* Section 7: AI Model Card */}
          {currentSection === 'modelcard' && (
            <ReportCardCheckpoint
              auditResult={auditResult}
              onDownloadHtml={handleDownloadHtml}
              onDownloadJson={handleDownloadJson}
              onPrintPdf={handlePrintPdf}
            />
          )}

          {/* Section 8: About Project */}
          {currentSection === 'about' && <AboutView />}
        </main>
      </div>

      {/* Toast Alert Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm no-print">
          <div
            className={`p-3.5 rounded-lg shadow-lg border flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-white text-[#111111] border-[#DCE5EB]'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Sparkles className="w-4 h-4 text-[#38A9DB] shrink-0" />
            )}
            <span className="text-xs font-medium leading-tight">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
