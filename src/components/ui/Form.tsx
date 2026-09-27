import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/utils/cn';

const CONTROL_BASE =
  'w-full rounded-[var(--radius-control)] border bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted';

const CONTROL_STATE = (invalid: boolean) =>
  invalid
    ? 'border-critical focus:border-critical'
    : 'border-line-strong hover:border-ink-subtle/60 focus:border-brand';

export interface FieldRenderProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
  'aria-required': boolean | undefined;
}

export interface FieldProps {
  label: string;
  children: (props: FieldRenderProps) => ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  /** Rendered on the right of the label row (e.g. an optional marker). */
  labelAction?: ReactNode;
}

export function Field({ label, children, error, hint, required, className, labelAction }: FieldProps) {
  const reactId = useId();
  const id = `field-${reactId}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-0.5 text-critical" aria-hidden>
              *
            </span>
          ) : null}
        </label>
        {labelAction}
      </div>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })}
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

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className, leadingSlot, ...props },
  ref,
) {
  const control = (
    <input
      ref={ref}
      className={cn(CONTROL_BASE, CONTROL_STATE(invalid), 'h-10', leadingSlot ? 'pl-9' : undefined, className)}
      {...props}
    />
  );

  if (!leadingSlot) return control;

  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-ink-subtle">
        {leadingSlot}
      </span>
      {control}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(CONTROL_BASE, CONTROL_STATE(invalid), 'resize-y py-2 leading-relaxed', className)}
      {...props}
    />
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  selectSize?: number;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid = false, className, children, selectSize, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        size={selectSize}
        className={cn(
          CONTROL_BASE,
          CONTROL_STATE(invalid),
          'h-10 cursor-pointer appearance-none pr-9',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
      />
    </div>
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, ...props },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `checkbox-${reactId}`;
  const descriptionId = `${inputId}-description`;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded border border-line-strong bg-surface checked:border-brand checked:bg-brand"
          {...props}
        />
        <Check
          aria-hidden
          className="pointer-events-none absolute size-3.5 text-brand-contrast opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      <span className="min-w-0">
        <label htmlFor={inputId} className="cursor-pointer text-sm text-ink select-none">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="text-xs text-ink-subtle">
            {description}
          </p>
        ) : null}
      </span>
    </div>
  );
});
