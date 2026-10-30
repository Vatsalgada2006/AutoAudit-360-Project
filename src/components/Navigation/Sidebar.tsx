import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Scale,
  Search,
  ShieldAlert,
  FileCheck2,
  FileText,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Play
} from 'lucide-react';
import { FullAuditResult } from '../../types';

export type NavSection =
  | 'dashboard'
  | 'newaudit'
  | 'fairness'
  | 'explain'
  | 'robustness'
  | 'regulatory'
  | 'modelcard'
  | 'about';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  auditResult?: FullAuditResult | null;
  isAuditing?: boolean;
  auditStage?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLoadDemo: (demoName: 'german_credit' | 'compas') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  auditResult,
  isAuditing,
  auditStage = 0,
  isOpenMobile,
  onCloseMobile,
  onLoadDemo,
}) => {
  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ElementType;
    badge?: string;
    statusIcon?: React.ReactNode;
  }> = [
    {
      id: 'dashboard',
      label: '1. Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'newaudit',
      label: '2. New AI Audit',
      icon: PlusCircle,
      badge: isAuditing ? `Stage ${auditStage}/4` : undefined,
    },
    {
      id: 'fairness',
      label: '3. Fairness Audit',
      icon: Scale,
      statusIcon: auditResult?.fairness?.[0] ? (
        auditResult.fairness[0].status === 'pass' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        )
      ) : null,
    },
    {
      id: 'explain',
      label: '4. Explainability',
      icon: Search,
      statusIcon: auditResult?.explain?.shap_success ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      ) : null,
    },
    {
      id: 'robustness',
      label: '5. Robustness Testing',
      icon: ShieldAlert,
      statusIcon: auditResult?.robustness?.status ? (
        auditResult.robustness.status === 'pass' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        )
      ) : null,
    },
    {
      id: 'regulatory',
      label: '6. Regulatory Compliance',
      icon: FileCheck2,
      statusIcon: auditResult?.compliance?.eu_ai_act ? (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          EU &bull; DPDP
        </span>
      ) : null,
    },
    {
      id: 'modelcard',
      label: '7. AI Model Card',
      icon: FileText,
      badge: auditResult ? 'Ready' : undefined,
    },
    {
      id: 'about',
      label: '8. About Project',
      icon: Info,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#DCE5EB] w-64 select-none">
      {/* Branding Header */}
      <div className="p-4 border-b border-[#DCE5EB] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38A9DB] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              360
            </div>
            <div>
              <h1 className="font-bold text-base text-[#111111] leading-tight tracking-tight">
                AutoAudit-360
              </h1>
              <p className="text-[11px] text-[#555555] font-medium">
                Trustworthy AI Suite
              </p>
            </div>
          </div>
        </div>
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold text-[#555555] px-3 py-1.5 tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#38A9DB] text-white shadow-xs'
                  : 'text-[#111111] hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-[#555555]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.statusIcon && !isActive && item.statusIcon}
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-blue-50 text-[#38A9DB] border border-[#DCE5EB]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Current Model & Demo Quick-Actions */}
      <div className="p-3 border-t border-[#DCE5EB] bg-slate-50/60 space-y-2">
        <div className="text-[10px] uppercase font-bold text-[#555555] px-1 tracking-wider">
          Active Model
        </div>
        <div className="p-2.5 rounded-lg bg-white border border-[#DCE5EB] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111111] truncate">
              {auditResult ? auditResult.meta.model_name : 'No model loaded'}
            </span>
            {auditResult && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  auditResult.scores.rag_status === 'green'
                    ? 'badge-pass'
                    : auditResult.scores.rag_status === 'amber'
                    ? 'badge-warn'
                    : 'badge-fail'
                }`}
              >
                {auditResult.scores.rag_status}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#555555] truncate">
            {auditResult
              ? auditResult.meta.algorithm
              : 'Load a dataset or demo to begin'}
          </p>
        </div>

        {/* Quick Demo Load Buttons */}
        <div className="space-y-1 pt-1">
          <div className="text-[10px] font-semibold text-[#555555] px-1">
            Demo Datasets:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onLoadDemo('german_credit')}
              disabled={isAuditing}
              className="text-xs px-2 py-1.5 bg-white hover:bg-sky-50 text-[#111111] hover:text-[#38A9DB] border border-[#DCE5EB] rounded font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-[#38A9DB]" />
              <span>German Credit</span>
            </button>
            <button
              onClick={() => onLoadDemo('compas')}
              disabled={isAuditing}
              className="text-xs px-2 py-1.5 bg-white hover:bg-sky-50 text-[#111111] hover:text-[#38A9DB] border border-[#DCE5EB] rounded font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-[#38A9DB]" />
              <span>COMPAS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
