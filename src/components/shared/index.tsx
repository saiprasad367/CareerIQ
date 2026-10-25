import React from 'react';
import { cn } from '@/lib/utils';
import { getScoreLabel } from '@/lib/scoring';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function MatchScore({ score, size = 'md', showLabel = false, className }: MatchScoreProps) {
  const { label, color } = getScoreLabel(score);

  const sizeMap = {
    sm: 'text-sm font-semibold',
    md: 'text-lg font-bold',
    lg: 'text-3xl font-bold',
  };

  const ringColor =
    score >= 80 ? 'stroke-[#1a6b3a]' :
    score >= 65 ? 'stroke-[#1a5fb4]' :
    score >= 45 ? 'stroke-[#d97706]' :
    'stroke-[#dc2626]';

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size === 'lg' ? 72 : size === 'md' ? 56 : 44}
          height={size === 'lg' ? 72 : size === 'md' ? 56 : 44}
          viewBox="0 0 56 56"
          className="rotate-[-90deg]"
        >
          <circle
            cx="28" cy="28" r={radius}
            fill="none"
            stroke="#EAEAEA"
            strokeWidth="3"
          />
          <circle
            cx="28" cy="28" r={radius}
            fill="none"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn('transition-all duration-700', ringColor)}
          />
        </svg>
        <span className={cn('absolute', sizeMap[size], color)}>
          {score}
        </span>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium mt-1', color)}>{label}</span>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  accentClass?: string;
  className?: string;
}

export function StatCard({ title, value, description, icon, accentClass = 'bg-[#EAF3FF]', className }: StatCardProps) {
  return (
    <div className={cn('card p-4 md:p-5', className)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-xs font-medium text-[#666666] uppercase tracking-wider">{title}</p>
        {icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', accentClass)}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#111111]">{value}</p>
      {description && <p className="text-xs text-[#858585] mt-1">{description}</p>}
    </div>
  );
}

interface SkillBadgeProps {
  skill: string;
  variant?: 'matched' | 'missing' | 'partial' | 'default';
  size?: 'sm' | 'md';
}

export function SkillBadge({ skill, variant = 'default', size = 'md' }: SkillBadgeProps) {
  const variantClasses = {
    matched: 'bg-[#E8F6EE] text-[#1a6b3a]',
    missing: 'bg-[#FFF3D9] text-[#92400e]',
    partial: 'bg-[#F0EDFF] text-[#4c1d95]',
    default: 'bg-[#F7F8FA] text-[#666666]',
  };
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', variantClasses[variant], sizeClasses[size])}>
      {skill}
    </span>
  );
}

interface SkillProgressBarProps {
  label: string;
  value: number; // 0-100
  className?: string;
}

export function SkillProgressBar({ label, value, className }: SkillProgressBarProps) {
  const barColor =
    value >= 80 ? 'bg-[#1a6b3a]' :
    value >= 60 ? 'bg-[#1a5fb4]' :
    value >= 40 ? 'bg-[#d97706]' :
    'bg-[#dc2626]';

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[#111111]">{label}</span>
        <span className="text-xs font-semibold text-[#111111]">{value}%</span>
      </div>
      <div className="h-1.5 bg-[#EAEAEA] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="mb-4 text-[#EAEAEA]">{icon}</div>}
      <h3 className="text-base font-semibold text-[#111111] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#666666] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        {badge && <span className="demo-badge mb-2 inline-flex">{badge}</span>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="section-subtitle mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-[#F7F8FA] rounded-lg', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <LoadingSkeleton className="h-4 w-1/3" />
      <LoadingSkeleton className="h-8 w-1/2" />
      <LoadingSkeleton className="h-3 w-full" />
      <LoadingSkeleton className="h-3 w-3/4" />
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  dangerous?: boolean;
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, dangerous = false,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/20" onClick={onCancel} />
      <div className="relative card max-w-sm w-full p-6 animate-slide-up">
        <h2 className="text-base font-semibold text-[#111111] mb-2">{title}</h2>
        <p className="text-sm text-[#666666] mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            className={dangerous
              ? 'inline-flex items-center justify-center rounded-lg bg-[#dc2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors'
              : 'btn-primary'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
