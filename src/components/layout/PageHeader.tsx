import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

/** Single source of truth for page titles so every page aligns identically. */
export function PageHeader({ title, description, actions, backTo, backLabel, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 sm:mb-7', className)}>
      {backTo ? (
        <Link
          to={backTo}
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {backLabel ?? 'Back'}
        </Link>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-ink break-anywhere sm:text-2xl">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm text-ink-muted break-anywhere">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
