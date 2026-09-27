import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <span aria-hidden className="mb-4 flex size-11 items-center justify-center rounded-full bg-surface-muted text-ink-subtle">
          {icon}
        </span>
      ) : null}
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-[var(--radius-card)] border border-red-200 bg-red-50 text-left dark:border-red-500/30 dark:bg-red-500/10',
        compact ? 'p-4' : 'p-6',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-critical" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted break-anywhere">{message}</p>
          {onRetry ? (
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={onRetry}
              leadingIcon={<RefreshCw className="size-3.5" aria-hidden />}
            >
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InlineNotice({
  children,
  tone = 'info',
  className,
}: {
  children: ReactNode;
  tone?: 'info' | 'caution' | 'success';
  className?: string;
}) {
  const tones = {
    info: 'border-line bg-surface-muted text-ink-muted',
    caution: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  } as const;

  return (
    <div className={cn('rounded-[var(--radius-control)] border px-3 py-2 text-sm', tones[tone], className)}>
      {children}
    </div>
  );
}
