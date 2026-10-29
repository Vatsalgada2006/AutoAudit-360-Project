import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pass' | 'warn' | 'fail' | 'pending' | 'green' | 'amber' | 'red';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const normalized = status === 'green' ? 'pass' : status === 'amber' ? 'warn' : status === 'red' ? 'fail' : status;

  let colorClass = 'bg-[#D5F36A]/25 text-[#201823] dark:text-[#D5F36A] border-[#D5F36A]/50';
  let Icon = CheckCircle2;
  let text = label || 'Good';

  if (normalized === 'warn') {
    colorClass = 'bg-[#FF705D]/20 text-[#201823] dark:text-[#FF705D] border-[#FF705D]/40';
    Icon = AlertTriangle;
    text = label || 'Needs attention';
  } else if (normalized === 'fail') {
    colorClass = 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40';
    Icon = XCircle;
    text = label || 'Problem';
  } else if (normalized === 'pending') {
    colorClass = 'bg-[#FAF2E8] dark:bg-[#332A37] text-stone-600 dark:text-stone-400 border-[#DED3D8] dark:border-[#332A37]';
    Icon = Clock;
    text = label || 'Pending';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span className={`inline-flex items-center font-mono font-semibold rounded-lg border ${colorClass} ${sizeClasses}`}>
      <Icon className={iconSizes} />
      <span>{text}</span>
    </span>
  );
};
