import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-ink text-sm font-bold text-canvas',
        className,
      )}
    >
      D
    </span>
  );
}

export function Logo({
  to = '/',
  className,
  showText = true,
}: {
  to?: string;
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2 rounded-md font-semibold tracking-tight text-ink', className)}
    >
      <LogoMark />
      {showText ? <span className="text-[15px]">DevTrack</span> : null}
    </Link>
  );
}
