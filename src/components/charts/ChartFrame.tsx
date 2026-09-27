import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/States';

export interface ChartFrameProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Rendered instead of the chart when there is nothing to visualise. */
  emptyTitle?: string;
  emptyDescription?: string;
  isEmpty: boolean;
  height?: number;
  children: ReactNode;
}

export function ChartFrame({
  title,
  description,
  action,
  emptyTitle = 'Not enough data yet',
  emptyDescription = 'Create a project and this chart fills in automatically.',
  isEmpty,
  height = 260,
  children,
}: ChartFrameProps) {
  return (
    <section className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
        </div>
        {action}
      </div>

      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} className="border-none bg-surface-muted/40 py-10" />
      ) : (
        <div className="min-w-0" style={{ height }}>
          {children}
        </div>
      )}
    </section>
  );
}

export interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ name?: string; value?: number | string; color?: string; payload?: { label?: string } }>;
  valueFormatter?: (value: number | string) => string;
}

export function ChartTooltip({ active, payload, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-xs shadow-[var(--shadow-raised)]">
      {payload.map((entry, index) => {
        const label = entry.payload?.label ?? entry.name ?? '';
        const value = valueFormatter ? valueFormatter(entry.value ?? 0) : String(entry.value ?? '');
        return (
          <p key={`${entry.name}-${index}`} className="flex items-center gap-2 text-ink">
            <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-ink-muted">{label}</span>
            <span className="ml-auto font-semibold tabular-nums">{value}</span>
          </p>
        );
      })}
    </div>
  );
}
