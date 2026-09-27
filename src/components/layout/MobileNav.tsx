import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Logo } from './Logo';
import { NavList } from './NavList';
import { ThemeToggle } from './ThemeToggle';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { profile, user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const displayName = profile?.name?.trim() || user?.displayName || 'Developer';

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-slate-950/50" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        className="relative z-10 flex h-dvh w-[85%] max-w-xs flex-col border-r border-line bg-surface shadow-[var(--shadow-raised)]"
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Logo to="/dashboard" />
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close menu" className="px-2">
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          <NavList onNavigate={onClose} />
        </div>

        <div className="border-t border-line p-3">
          <Link
            to="/settings"
            onClick={onClose}
            className="mb-2 flex items-center gap-3 rounded-[var(--radius-control)] p-2 transition-colors hover:bg-surface-hover"
          >
            <Avatar name={displayName} src={profile?.avatar} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{displayName}</span>
              <span className="block truncate text-xs text-ink-subtle">Account settings</span>
            </span>
          </Link>
          <ThemeToggle variant="button" />
        </div>
      </div>
    </div>
  );
}
