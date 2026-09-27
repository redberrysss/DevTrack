import { Outlet } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { siteConfig } from '@/config/site';

const promises = [
  'Track every project from planning to launch',
  'Break work into tasks and watch progress update',
  'Connect GitHub to see your real activity',
  'Keep your data private with per-user access rules',
];

/** Shared shell for sign in, register and password reset. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <section className="hidden lg:block">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              Your development work, in one place.
            </h1>
            <p className="mt-3 max-w-md text-ink-muted">{siteConfig.description}</p>
            <ul className="mt-8 space-y-3">
              {promises.map((promise) => (
                <li key={promise} className="flex items-start gap-3 text-sm text-ink-muted">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-positive" />
                  <span>{promise}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="w-full">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
              <Outlet />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
