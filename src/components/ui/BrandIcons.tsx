import { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

/**
 * Brand marks are not part of the Lucide set any more, so the three marks DevTrack
 * links to are inlined here.
 *
 * They are built with `forwardRef` and accept `LucideProps`, which means they can
 * be used anywhere a `LucideIcon` is expected (navigation items, stat cards) and
 * they inherit `currentColor` like every other icon in the app.
 */
export const Github = forwardRef<SVGSVGElement, LucideProps>(function Github(props, ref) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53v-1.9c-3.06.66-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.67.08-.67 1.11.08 1.69 1.14 1.69 1.14.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.4.11-2.93 0 0 .92-.3 3.02 1.13a10.4 10.4 0 0 1 5.51 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.53.22 2.65.11 2.93.7.77 1.13 1.76 1.13 2.96 0 4.23-2.58 5.16-5.03 5.43.4.35.75 1.02.75 2.06v3.05c0 .3.2.64.76.53A11 11 0 0 0 23.01 11.5C23.01 5.24 18.27.5 12 .5Z" />
    </svg>
  );
});

export const Linkedin = forwardRef<SVGSVGElement, LucideProps>(function Linkedin(props, ref) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.9 9.75h4.16V21H2.9V9.75Zm6.9 0h3.98v1.54h.06c.55-1.05 1.9-2.16 3.92-2.16 4.19 0 4.96 2.76 4.96 6.35V21h-4.15v-5.02c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21H9.8V9.75Z" />
    </svg>
  );
});

export const Twitter = forwardRef<SVGSVGElement, LucideProps>(function Twitter(props, ref) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M18.9 2.4h3.3l-7.2 8.24L23.4 22h-6.63l-5.2-6.8L5.65 22H2.34l7.7-8.8L2 2.4h6.8l4.7 6.2 5.4-6.2Zm-1.16 17.7h1.83L7.66 4.2H5.7l12.04 15.9Z" />
    </svg>
  );
});
