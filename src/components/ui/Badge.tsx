import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'caution' | 'critical' | 'muted';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted ring-line-strong',
  brand: 'bg-brand-soft text-brand ring-brand/25',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25',
  caution: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25',
  critical: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/25',
  muted: 'bg-surface-muted text-ink-subtle ring-line',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  dotClassName?: string;
  className?: string;
  title?: string;
}

export function Badge({ children, tone = 'neutral', dot = false, dotClassName, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot ? <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', dotClassName ?? 'bg-current')} /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
