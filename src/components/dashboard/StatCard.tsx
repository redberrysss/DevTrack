import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Loading';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: ReactNode;
  loading?: boolean;
  /** Rendered under the value, e.g. a mini progress bar. */
  footer?: ReactNode;
  to?: string;
}

export function StatCard({ label, value, icon: Icon, hint, loading = false, footer, to }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-subtle">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums break-anywhere">{value}</p>
      )}
      {hint && !loading ? <p className="mt-1 text-xs text-ink-subtle break-anywhere">{hint}</p> : null}
      {footer && !loading ? <div className="mt-3">{footer}</div> : null}
    </>
  );

  const baseClass = cn(
    'block rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]',
    to && 'transition-shadow duration-200 hover:shadow-[var(--shadow-raised)]',
  );

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}
