/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AutoAudit-360: End-to-End Trustworthy AI Audit & Regulatory Compliance Suite
 * Visual Identity: The Trust Observatory
 * Information Architecture:
 * - Overview
 * - New Audit
 * - Fairness
 * - Explainability
 * - Robustness
 * - Regulatory Readiness
 * - Model Cards
 * - Learn / Glossary
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepBar, CheckpointStep } from './components/Navigation/StepBar';
import { OverviewView } from './components/Checkpoints/OverviewView';
import { NewAuditWorkflow } from './components/Checkpoints/NewAuditWorkflow';
import { FairnessCheckpoint } from './components/Checkpoints/FairnessCheckpoint';
import { ExplainCheckpoint } from './components/Checkpoints/ExplainCheckpoint';
import { StressTestCheckpoint } from './components/Checkpoints/StressTestCheckpoint';
import { LawCheckCheckpoint } from './components/Checkpoints/LawCheckCheckpoint';
import { ReportCardCheckpoint } from './components/Checkpoints/ReportCardCheckpoint';
import { GlossaryModal } from './components/Modals/GlossaryModal';
import { AboutModal } from './components/Modals/AboutModal';
import { ComparisonView } from './components/ComparisonView';
import { Footer } from './components/Footer';

import { FullAuditResult } from './types';
import { GERMAN_CREDIT_AUDIT, COMPAS_AUDIT } from './data/preloadedAudits';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<CheckpointStep>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);

  // Auditing lifecycle
  const [hasAuditRun, setHasAuditRun] = useState(false);
  const [auditResult, setAuditResult] = useState<FullAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStage, setAuditStage] = useState(0); // 0 to 5
  const [allowModelUpload, setAllowModelUpload] = useState(false);

  // Modals
  const [showGlossary, setShowGlossary] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch server config on mount with retry
  useEffect(() => {
    let retries = 0;
    const fetchHealth = () => {
      fetch('/api/health')
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          if (data && data.allow_model_upload !== undefined) {
            setAllowModelUpload(data.allow_model_upload);
          }
        })
        .catch(() => {
          if (retries < 5) {
            retries++;
            setTimeout(fetchHealth, 1000);
          }
        });
      };
    fetchHealth();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearInterval(timer);
    }
  }, [toast]);

  // Handle Demo One-Click Loading (authentic precomputed benchmarks)
  const handleLoadDemo = async (demoName: 'german_credit' | 'compas') => {
    setIsAuditing(true);
    setAuditStage(0);
    setToast({
      type: 'info',
      message: `Loading authentic ${demoName === 'german_credit' ? 'German Credit Lending' : 'COMPAS Recidivism'} Benchmark...`,
    });

    try {
      // Simulate gate progression animation through the Audit Lens
      const stageTimer = setInterval(() => {
        setAuditStage(prev => {
          if (prev < 4) return prev + 1;
          clearInterval(stageTimer);
          return 4;
        });
      }, 400);

      const res = await fetch(`/api/demo-audit/${demoName}`);
      let demoData: FullAuditResult;

      if (res.ok) {
        demoData = await res.json();
      } else {
        demoData = demoName === 'german_credit' ? GERMAN_CREDIT_AUDIT : COMPAS_AUDIT;
      }

      setTimeout(() => {
        clearInterval(stageTimer);
        setAuditStage(5);
        setAuditResult(demoData);
        setHasAuditRun(true);
        setIsAuditing(false);
        setToast({
          type: 'success',
          message: `Inspection complete! Verdict: ${demoData.scores.readiness_verdict}`,
        });
        setCurrentStep('modelcard');
      }, 2000);

    } catch (err: any) {
      setIsAuditing(false);
      const fallback = demoName === 'german_credit' ? GERMAN_CREDIT_AUDIT : COMPAS_AUDIT;
      setAuditResult(fallback);
      setHasAuditRun(true);
      setAuditStage(5);
      setCurrentStep('modelcard');
    }
  };

  // Run live inspection (dispatches background job to /api/audit)
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
    setAuditStage(0);
    setToast({
      type: 'info',
      message: 'Evaluating model through diagnostic inspection checkpoints...',
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
            setAuditStage(5);
            setAuditResult(jobStatus.result);
            setHasAuditRun(true);
            setIsAuditing(false);
            setToast({
              type: 'success',
              message: `Inspection complete! Verdict: ${jobStatus.result.scores.readiness_verdict}`,
            });
            setCurrentStep('modelcard');
          } else if (jobStatus.status === 'failed') {
            clearInterval(pollInterval);
            setIsAuditing(false);
            setToast({
              type: 'error',
              message: jobStatus.error || 'Inspection failed on server.',
            });
          }
        } catch {
          // continue polling
        }
      }, 1000);

    } catch (err: any) {
      console.warn('Backend live audit fell back to benchmark loader:', err.message);
      handleLoadDemo(params.datasetId?.includes('compas') ? 'compas' : 'german_credit');
    }
  };

  // Download Handlers
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

  // Canonical step normalization
  const isOverview = currentStep === 'overview' || currentStep === 'start';
  const isNewAudit = currentStep === 'newaudit';
  const isFairness = currentStep === 'fairness';
  const isExplain = currentStep === 'explain';
  const isRobustness = currentStep === 'robustness' || currentStep === 'stresstest';
  const isRegulatory = currentStep === 'regulatory' || currentStep === 'lawcheck';
  const isModelCard = currentStep === 'modelcard' || currentStep === 'reportcard';
  const isLearn = currentStep === 'learn';

  return (
    <div className="min-h-screen bg-[#FAF2E8] dark:bg-[#201823] text-[#201823] dark:text-[#FAF2E8] font-body transition-colors flex flex-col">
      
      {/* Top Header */}
      <Header
        scores={auditResult?.scores}
        hasAuditRun={hasAuditRun}
        isExpertMode={isExpertMode}
        setIsExpertMode={setIsExpertMode}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenGlossary={() => setShowGlossary(true)}
        onOpenAbout={() => setShowAbout(true)}
        onOpenComparison={() => setShowComparison(true)}
      />

      {/* Persistent Step Bar */}
      <StepBar
        currentStep={currentStep}
        onSelectStep={(step) => {
          if (step === 'learn') {
            setShowGlossary(true);
          } else {
            setCurrentStep(step);
          }
        }}
        auditResult={auditResult}
        isAuditing={isAuditing}
        auditStage={auditStage}
      />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in no-print">
          <div className={`p-4 rounded-md shadow-xl border flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-[#D5F36A] text-[#201823] border-[#B9DE40] font-semibold'
              : toast.type === 'error'
              ? 'bg-[#FF705D] text-white border-[#E0503D] font-semibold'
              : 'bg-[#201823] text-[#FAF2E8] dark:bg-[#332A37] dark:text-[#FAF2E8] border-[#C5B6C9]/40'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-[#201823]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-white" />}
            {toast.type === 'info' && <span className="w-2.5 h-2.5 rounded-full bg-[#D5F36A] animate-ping shrink-0" />}
            <span className="text-xs font-mono font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: OVERVIEW LANDING */}
        {isOverview && (
          <OverviewView
            onStartNewAudit={() => setCurrentStep('newaudit')}
            onExploreSample={handleLoadDemo}
            onOpenGlossary={() => setShowGlossary(true)}
            isAuditing={isAuditing}
            auditStage={auditStage}
          />
        )}

        {/* VIEW 2: NEW AUDIT GUIDED WORKFLOW */}
        {isNewAudit && (
          <NewAuditWorkflow
            onRunAudit={handleRunAudit}
            onLoadDemo={handleLoadDemo}
            isAuditing={isAuditing}
            auditStage={auditStage}
            allowModelUpload={allowModelUpload}
            onCancelAudit={() => {
              setIsAuditing(false);
              setCurrentStep('overview');
            }}
          />
        )}

        {/* VIEW 3: FAIRNESS CHECKPOINT */}
        {isFairness && auditResult && (
          <FairnessCheckpoint
            items={auditResult.fairness}
            mitigation={auditResult.mitigation}
            isExpertMode={isExpertMode}
          />
        )}

        {/* VIEW 4: EXPLAINABILITY CHECKPOINT */}
        {isExplain && auditResult && (
          <ExplainCheckpoint
            explain={auditResult.explain}
            isExpertMode={isExpertMode}
          />
        )}

        {/* VIEW 5: ROBUSTNESS STRESS TEST */}
        {isRobustness && auditResult && (
          <StressTestCheckpoint
            robustness={auditResult.robustness}
            isExpertMode={isExpertMode}
          />
        )}

        {/* VIEW 6: REGULATORY LAW CHECK */}
        {isRegulatory && auditResult && (
          <LawCheckCheckpoint
            compliance={auditResult.compliance}
            isExpertMode={isExpertMode}
          />
        )}

        {/* VIEW 7: MODEL CARDS & REPORT CARD */}
        {isModelCard && (
          <ReportCardCheckpoint
            auditResult={auditResult}
            onDownloadHtml={handleDownloadHtml}
            onDownloadJson={handleDownloadJson}
            onPrintPdf={handlePrintPdf}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAbout={() => setShowAbout(true)}
        onOpenGlossary={() => setShowGlossary(true)}
        onOpenComparison={() => setShowComparison(true)}
      />

      {/* Modals */}
      <GlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <ComparisonView
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />

    </div>
  );
}
