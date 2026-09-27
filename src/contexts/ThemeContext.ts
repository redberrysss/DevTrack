import { createContext } from 'react';

import type { ResolvedTheme, ThemePreference } from '@/types';

export interface ThemeContextValue {
  /** The user's choice, including `system`. */
  theme: ThemePreference;
  /** What is actually rendered right now. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
