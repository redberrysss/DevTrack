import { NavLink } from 'react-router-dom';

import { mainNavItems } from '@/config/navigation';
import { cn } from '@/utils/cn';

export function NavList({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return (
    <nav aria-label="Main" className={cn('flex flex-col gap-1', className)}>
      {mainNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-brand-soft text-brand'
                : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn('size-4 shrink-0', isActive ? 'text-brand' : 'text-ink-subtle group-hover:text-ink')}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
              {isActive ? <span className="sr-only">(current page)</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
