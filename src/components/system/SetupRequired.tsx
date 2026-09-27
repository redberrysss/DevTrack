import { Database, ExternalLink, Terminal } from 'lucide-react';

import { FIREBASE_NOT_CONFIGURED_MESSAGE, firebaseConfigured } from '@/services/firebase/config';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';

const steps = [
  'Create a Firebase project and enable Email/Password authentication.',
  'Create a Cloud Firestore database in production mode.',
  'Register a Web app and copy the Firebase configuration values.',
  'Copy .env.example to .env.local, fill in the values, then restart the dev server.',
  'Deploy the security rules in /firestore.rules (see the README).',
];

/**
 * Shown instead of a blank screen when the Firebase environment variables are
 * missing — a much better first-run experience than a crash.
 */
export function SetupRequired() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Logo />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16 sm:px-6">
        <div className="w-full rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Database className="size-5" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Connect Firebase to continue</h1>
          <p className="mt-2 text-ink-muted">{FIREBASE_NOT_CONFIGURED_MESSAGE}</p>

          <ol className="mt-6 space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm text-ink-muted">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              leadingIcon={<Terminal className="size-4" aria-hidden />}
            >
              Reload the app
            </Button>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              Open Firebase console <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>

          <p className="mt-4 text-xs text-ink-subtle">
            {firebaseConfigured
              ? 'Configuration detected — reload to retry the connection.'
              : 'No Firebase configuration detected. Authentication and the database stay disabled until it is provided.'}
          </p>
        </div>
      </main>
    </div>
  );
}
