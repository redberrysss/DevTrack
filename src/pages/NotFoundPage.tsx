import { Compass, Home, LayoutDashboard, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { mainNavItems } from '@/config/navigation';
import { LinkButton } from '@/components/ui/LinkButton';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';

export default function NotFoundPage() {
  usePageMeta({
    title: 'Page not found — DevTrack',
    description: 'The page you were looking for does not exist in DevTrack.',
  });

  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-2xl text-center">
          <span
            aria-hidden
            className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-muted text-ink-subtle ring-1 ring-line-strong"
          >
            <Compass className="size-6" />
          </span>

          <p className="mt-5 text-sm font-semibold tracking-wide text-brand uppercase">Error 404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            We could not find that page
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            <code className="break-anywhere text-xs text-ink-subtle">{location.pathname}</code> does not match any route in
            DevTrack. It may have been renamed, or the link that brought you here may be out of date.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <LinkButton to="/dashboard" size="lg">
                Back to the dashboard
              </LinkButton>
            ) : (
              <LinkButton to="/" size="lg">
                Back to the home page
              </LinkButton>
            )}
            {isAuthenticated ? (
              <LinkButton to="/projects" variant="secondary" size="lg" leadingIcon={<Search className="size-4" aria-hidden />}>
                Go to projects
              </LinkButton>
            ) : (
              <LinkButton to="/login" variant="secondary" size="lg">
                Sign in
              </LinkButton>
            )}
          </div>

          {isAuthenticated ? (
            <Card className="mt-10 text-left">
              <CardHeader title="Where to next" description="These pages always exist." />
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {mainNavItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-line px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-hover"
                    >
                      <item.icon className="size-4 text-ink-subtle" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <p className="mt-8 inline-flex items-center gap-2 text-sm text-ink-muted">
              <Home className="size-4" aria-hidden />
              <Link to="/demo" className="font-medium text-brand hover:underline">
                Explore the demo
              </Link> if you just want to see what DevTrack does.
            </p>
          )}

          {isAuthenticated ? (
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink-muted">
              <LayoutDashboard className="size-4" aria-hidden />
              Looking for your projects? Open{' '}
              <Link to="/projects" className="font-medium text-brand hover:underline">
                Projects
              </Link>
              .
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
