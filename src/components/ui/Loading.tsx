import { Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2 text-ink-muted', className)}>
      <Loader2 aria-hidden className="size-4 animate-spin" />
      {label ? <span className="text-sm">{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-surface-muted', className)} />;
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-muted">
      <Loader2 aria-hidden className="size-6 animate-spin text-brand" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="mt-5 h-2 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

export function SkeletonChart({ height = 240 }: { height?: number }) {
  const bars = [42, 68, 34, 88, 56, 76, 48, 92, 62];
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-1.5 h-3 w-48" />
      <div className="mt-6 flex items-end gap-2" style={{ height }} aria-hidden>
        {bars.map((value, index) => (
          <div
            key={index}
            className="flex-1 animate-pulse rounded-t-md bg-surface-muted"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>
    </div>
  );
}
