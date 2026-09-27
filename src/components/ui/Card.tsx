import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  as?: 'div' | 'section' | 'article' | 'li';
}

export function Card({ children, className, padded = true, as: Element = 'div' }: CardProps) {
  return (
    <Element
      className={cn(
        'rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]',
        padded && 'p-5 sm:p-6',
        className,
      )}
    >
      {children}
    </Element>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
