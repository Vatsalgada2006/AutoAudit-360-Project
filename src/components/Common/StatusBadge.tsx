import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pass' | 'warn' | 'fail' | 'pending' | 'green' | 'amber' | 'red';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const normalized = status === 'green' ? 'pass' : status === 'amber' ? 'warn' : status === 'red' ? 'fail' : status;

  let colorClass = 'bg-[#1F9D6B]/15 text-[#1F9D6B] border-[#1F9D6B]/30';
  let Icon = CheckCircle2;
  let text = label || 'Good';

  if (normalized === 'warn') {
    colorClass = 'bg-[#F2B01E]/15 text-[#B27B0A] dark:text-[#F2B01E] border-[#F2B01E]/40';
    Icon = AlertTriangle;
    text = label || 'Needs attention';
  } else if (normalized === 'fail') {
    colorClass = 'bg-[#D6334A]/15 text-[#D6334A] border-[#D6334A]/30';
    Icon = XCircle;
    text = label || 'Problem';
  } else if (normalized === 'pending') {
    colorClass = 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700';
    Icon = Clock;
    text = label || 'Pending';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span className={`inline-flex items-center font-mono font-semibold rounded border ${colorClass} ${sizeClasses}`}>
      <Icon className={iconSizes} />
      <span>{text}</span>
    </span>
  );
};
