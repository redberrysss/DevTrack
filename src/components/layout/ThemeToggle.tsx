import { LogOut, Moon, Sun } from 'lucide-react';

import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

/** Icon-only on mobile header, labelled button inside the sidebar. */
export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'button' }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={label}
        aria-label={label}
        className="flex size-9 items-center justify-center rounded-[var(--radius-control)] border border-line text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
      >
        {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink',
      )}
    >
      {isDark ? <Sun className="size-4 shrink-0" aria-hidden /> : <Moon className="size-4 shrink-0" aria-hidden />}
      <span className="flex-1 text-left">{isDark ? 'Light theme' : 'Dark theme'}</span>
      <span className="text-xs text-ink-subtle">{isDark ? 'On' : 'Off'}</span>
    </button>
  );
}

export function LogoutButton({
  onLogout,
  pending = false,
  className,
}: {
  onLogout: () => void;
  pending?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      <span>{pending ? 'Logging out…' : 'Log out'}</span>
    </button>
  );
}
