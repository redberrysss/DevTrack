import { cn } from '@/utils/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  tone?: 'brand' | 'success' | 'auto';
  className?: string;
  /** Screen-reader description, e.g. "12 of 30 tasks completed". */
  srDescription?: string;
}

const TONE_CLASSES = {
  brand: 'bg-brand',
  success: 'bg-positive',
  auto: 'bg-brand',
} as const;

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  tone = 'auto',
  className,
  srDescription,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);
  const filled = tone === 'auto' ? (percent >= 100 ? TONE_CLASSES.success : TONE_CLASSES.brand) : TONE_CLASSES[tone];

  return (
    <div className={cn('w-full', className)}>
      {label || showValue ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
          {label ? <span className="font-medium text-ink-muted">{label}</span> : <span />}
          {showValue ? (
            <span className="font-semibold text-ink tabular-nums">
              {percent}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? srDescription ?? 'Progress'}
        aria-valuetext={srDescription ?? `${percent}%`}
        className={cn('w-full overflow-hidden rounded-full bg-surface-muted', size === 'sm' ? 'h-1.5' : 'h-2')}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', filled)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {srDescription ? <span className="sr-only">{srDescription}</span> : null}
    </div>
  );
}
