import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';
import type { ButtonSize, ButtonVariant } from './Button';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-contrast hover:bg-brand-hover border border-transparent shadow-xs',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-hover',
  ghost: 'bg-transparent text-ink-muted border border-transparent hover:bg-surface-hover hover:text-ink',
  subtle: 'bg-brand-soft text-brand border border-transparent hover:brightness-97 dark:hover:brightness-125',
  danger: 'bg-critical text-white border border-transparent hover:brightness-95 dark:hover:brightness-110',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-[var(--radius-control)]',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-[var(--radius-control)]',
};

const BASE_CLASSES =
  'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors duration-150';

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

/** Internal navigation styled as a button (renders a real anchor). */
export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </Link>
  );
}

export interface ExternalLinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export function ExternalLinkButton({
  href,
  variant = 'secondary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  className,
  children,
  ...props
}: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </a>
  );
}
