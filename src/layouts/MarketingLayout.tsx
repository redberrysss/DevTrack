import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Github, Linkedin, Twitter } from '@/components/ui/BrandIcons';

import { productLinks, siteConfig } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { APP_NAME } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const navTargets = [
  { label: 'Features', href: '/#features' },
  { label: 'GitHub', href: '/#github' },
  { label: 'Projects', href: '/#projects' },
  { label: 'About', href: '/#about' },
];

export function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, status } = useAuth();
  const { resolvedTheme } = useTheme();

  // Navigating closes the mobile menu. Adjusting the state while rendering (rather
  // than in an effect) avoids a frame where the new page renders with the menu open.
  const routeKey = `${location.pathname}${location.hash}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (lastRouteKey !== routeKey) {
    setLastRouteKey(routeKey);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav aria-label="Primary" className="hidden flex-1 items-center gap-1 md:flex">
            {navTargets.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {status === 'authenticated' ? (
              <LinkButton to="/dashboard" size="sm">
                Open dashboard
              </LinkButton>
            ) : (
              <>
                <LinkButton to="/login" variant="ghost" size="sm">
                  Sign in
                </LinkButton>
                <LinkButton to="/register" size="sm">
                  Get started
                </LinkButton>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-marketing-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="px-2.5"
            >
              <Menu className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {menuOpen ? (
          <div id="mobile-marketing-nav" className="border-t border-line bg-surface md:hidden">
            <nav aria-label="Mobile" className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
              {navTargets.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                {isAuthenticated ? (
                  <LinkButton to="/dashboard" fullWidth onClick={() => setMenuOpen(false)}>
                    Open dashboard
                  </LinkButton>
                ) : (
                  <>
                    <LinkButton to="/login" variant="secondary" fullWidth>
                      Sign in
                    </LinkButton>
                    <LinkButton to="/register" fullWidth>
                      Get started
                    </LinkButton>
                  </>
                )}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-ink-muted">
                {siteConfig.description}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">Product</h2>
              <ul className="mt-3 space-y-2">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">Legal</h2>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-ink-muted transition-colors hover:text-ink">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-ink-muted transition-colors hover:text-ink">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">Elsewhere</h2>
              <ul className="mt-3 space-y-2">
                {siteConfig.githubUrl ? (
                  <li>
                    <a
                      href={siteConfig.githubUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      <Github className="size-4" aria-hidden /> GitHub
                    </a>
                  </li>
                ) : null}
                {siteConfig.linkedinUrl ? (
                  <li>
                    <a
                      href={siteConfig.linkedinUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      <Linkedin className="size-4" aria-hidden /> LinkedIn
                    </a>
                  </li>
                ) : null}
                {siteConfig.xUrl ? (
                  <li>
                    <a
                      href={siteConfig.xUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      <Twitter className="size-4" aria-hidden /> X
                    </a>
                  </li>
                ) : null}
                {siteConfig.githubUrl || siteConfig.linkedinUrl || siteConfig.xUrl ? null : (
                  <li className="text-sm text-ink-subtle">
                    Set <code className="text-xs">VITE_SITE_GITHUB_URL</code> in{' '}
                    <code className="text-xs">.env.local</code> to show your social links here.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 sm:flex-row sm:items-center">
            <p className="text-sm text-ink-subtle">
              © {new Date().getFullYear()} {APP_NAME}. Built with React, TypeScript and Firebase.
            </p>
            <p className="text-xs text-ink-subtle">
              Rendered in {resolvedTheme === 'dark' ? 'dark' : 'light'} mode
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
