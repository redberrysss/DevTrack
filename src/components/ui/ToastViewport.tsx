import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

import type { Toast, ToastVariant } from '@/types';
import { cn } from '@/utils/cn';

const VARIANT_STYLES: Record<ToastVariant, { wrapper: string; icon: typeof Info }> = {
  success: { wrapper: 'border-emerald-200 bg-surface dark:border-emerald-500/40', icon: CheckCircle2 },
  error: { wrapper: 'border-red-200 bg-surface dark:border-red-500/40', icon: AlertCircle },
  info: { wrapper: 'border-line bg-surface', icon: Info },
};

const ICON_STYLES: Record<ToastVariant, string> = {
  success: 'text-positive',
  error: 'text-critical',
  info: 'text-brand',
};

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:bottom-0 sm:items-end sm:p-6"
    >
      {toasts.map((toast) => {
        const { wrapper, icon: Icon } = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-control)] border p-3 shadow-[var(--shadow-raised)]',
              'animate-toast-in',
              wrapper,
            )}
          >
            <Icon aria-hidden className={cn('mt-0.5 size-4.5 shrink-0', ICON_STYLES[toast.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink break-anywhere">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-sm text-ink-muted break-anywhere">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label={`Dismiss notification: ${toast.title}`}
              className="-mr-1 -mt-1 rounded p-1 text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
