import { createContext } from 'react';

import type { Toast } from '@/types';

export interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  clear: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
