import { Link } from 'react-router-dom';
import { MailCheck, MailWarning } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Logo } from './Logo';
import { NavList } from './NavList';
import { LogoutButton, ThemeToggle } from './ThemeToggle';

export interface SidebarProps {
  onLogout: () => void;
  onEmailVerification: () => void;
  signingOut?: boolean;
}

export function Sidebar({ onLogout, onEmailVerification, signingOut = false }: SidebarProps) {
  const { profile, user } = useAuth();
  const displayName = profile?.name?.trim() || user?.displayName || 'Developer';
  const email = profile?.email || user?.email || '';
  const verified = user?.emailVerified ?? false;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Logo to="/dashboard" />
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <NavList />
      </div>

      <div className="border-t border-line p-3">
        <Link
          to="/settings"
          className="mb-2 flex items-center gap-3 rounded-[var(--radius-control)] p-2 transition-colors hover:bg-surface-hover"
        >
          <Avatar name={displayName} src={profile?.avatar} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{displayName}</span>
            <span className="block truncate text-xs text-ink-subtle">{email}</span>
          </span>
        </Link>

        {!verified && email ? (
          <button
            type="button"
            onClick={onEmailVerification}
            className="mb-2 flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
          >
            <MailWarning className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">Verify your email</span>
          </button>
        ) : (
          <Badge tone="success" className="mb-2 w-full justify-center py-1">
            <MailCheck className="size-3.5" aria-hidden />
            Email verified
          </Badge>
        )}

        <ThemeToggle variant="button" />
        <LogoutButton onLogout={onLogout} pending={signingOut} />
      </div>
    </aside>
  );
}
