import { useId, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/utils/cn';
import { LIMITS } from '@/utils/constants';

export interface TagInputProps {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  maxItems?: number;
  maxItemLength?: number;
  disabled?: boolean;
}

/**
 * Chip-style multi-value input used for project technologies and profile skills.
 * Values are added with Enter or comma, and removed with the chip button.
 */
export function TagInput({
  label,
  value,
  onChange,
  placeholder = 'Add and press Enter',
  hint,
  error,
  maxItems = LIMITS.technologies,
  maxItemLength = LIMITS.technologyLength,
  disabled = false,
}: TagInputProps) {
  const reactId = useId();
  const inputId = `tag-${reactId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [draft, setDraft] = useState('');

  const atCapacity = value.length >= maxItems;

  const commit = (raw: string) => {
    const item = raw.trim().replace(/,+$/, '');
    if (!item) return;
    if (item.length > maxItemLength) return;
    if (atCapacity) return;
    if (value.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, item]);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(draft);
      return;
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="text-xs text-ink-subtle">
          {value.length}/{maxItems}
        </span>
      </div>

      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-[var(--radius-control)] border bg-surface p-2 transition-colors',
          error ? 'border-critical' : 'border-line-strong focus-within:border-brand',
          disabled && 'opacity-60',
        )}
      >
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-md bg-surface-muted py-1 pl-2 pr-1 text-xs font-medium text-ink ring-1 ring-line-strong ring-inset"
          >
            <span className="max-w-40 truncate break-anywhere">{item}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((entry) => entry !== item))}
              disabled={disabled}
              aria-label={`Remove ${item}`}
              className="rounded p-0.5 text-ink-subtle transition-colors hover:bg-surface hover:text-critical"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={atCapacity ? 'Maximum reached' : value.length === 0 ? placeholder : 'Add more'}
          disabled={disabled || atCapacity}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          aria-label={value.length > 0 ? `Add to ${label}` : undefined}
          className="h-7 min-w-32 flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-ink-subtle focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      {hint ? (
        <p id={hintId} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface TagListProps {
  items: string[];
  max?: number;
  emptyLabel?: string;
  className?: string;
}

export function TagList({ items, max = 4, emptyLabel = 'None added', className }: TagListProps) {
  if (items.length === 0) {
    return <p className={cn('text-sm text-ink-subtle', className)}>{emptyLabel}</p>;
  }

  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {visible.map((item) => (
        <li
          key={item}
          className="max-w-full rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted ring-1 ring-line-strong ring-inset"
        >
          <span className="break-anywhere">{item}</span>
        </li>
      ))}
      {overflow > 0 ? (
        <li className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-subtle ring-1 ring-line-strong ring-inset">
          +{overflow} more
        </li>
      ) : null}
    </ul>
  );
}
