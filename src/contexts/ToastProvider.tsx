import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Toast, ToastVariant } from '@/types';
import { ToastContext, type ToastContextValue } from './ToastContext';
import { ToastViewport } from '@/components/ui/ToastViewport';

const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback<ToastContextValue['push']>(
    ({ title, description, variant, duration }) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      const toast: Toast = {
        id,
        title,
        variant,
        duration: duration ?? DEFAULT_DURATION,
        ...(description ? { description } : {}),
      };
      setToasts((current) => [...current, toast].slice(-MAX_VISIBLE));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), toast.duration),
      );
      return id;
    },
    [dismiss],
  );

  const clear = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => {
    const make = (variant: ToastVariant) => (title: string, description?: string) =>
      push({ title, variant, ...(description ? { description } : {}) });

    return {
      toasts,
      push,
      dismiss,
      clear,
      success: make('success'),
      error: make('error'),
      info: make('info'),
    };
  }, [toasts, push, dismiss, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
