import type { Timestamp } from 'firebase/firestore';

function toDate(value: Date | string | Timestamp | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const millis = (value as Timestamp).toMillis?.();
  if (typeof millis === 'number') {
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const DATE_WITH_YEAR_FORMAT = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
});

export function formatDate(value: Date | string | Timestamp | null | undefined): string {
  const date = toDate(value);
  return date ? DATE_FORMAT.format(date) : '—';
}

export function formatDateShort(value: Date | string | Timestamp | null | undefined): string {
  const date = toDate(value);
  return date ? DATE_WITH_YEAR_FORMAT.format(date) : '—';
}

/** `2025-04-02` → `2 Apr 2025`, tolerating empty input. */
export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return 'Not set';
  const date = toDate(iso);
  return date ? DATE_FORMAT.format(date) : 'Not set';
}

export function formatDateRange(start: string, end: string): string {
  const from = formatIsoDate(start);
  const to = end ? formatIsoDate(end) : 'Present';
  if (start === 'Not set' && end) return `— → ${to}`;
  return `${from} → ${to}`;
}

export function formatRelativeTime(
  value: Date | string | Timestamp | null | undefined,
  now: number = Date.now(),
): string {
  const date = toDate(value);
  if (!date) return '—';

  const diffSeconds = Math.round((date.getTime() - now) / 1000);
  const absolute = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absolute < 60) return 'just now';
  if (absolute < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute');
  if (absolute < 86400) return formatter.format(Math.round(diffSeconds / 3600), 'hour');
  if (absolute < 86400 * 30) return formatter.format(Math.round(diffSeconds / 86400), 'day');
  if (absolute < 86400 * 365) return formatter.format(Math.round(diffSeconds / (86400 * 30)), 'month');
  return formatter.format(Math.round(diffSeconds / (86400 * 365)), 'year');
}

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) < 1000) return String(value);
  return compactFormatter.format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en').format(Number.isFinite(value) ? value : 0);
}

export function toIsoDateInput(value: Date | string | Timestamp | null | undefined): string {
  const date = toDate(value);
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
