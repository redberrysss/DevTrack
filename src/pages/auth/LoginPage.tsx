import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/hooks/useToast';
import { signInWithEmail } from '@/services/firebase/auth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { ErrorState } from '@/components/ui/States';
import { getFriendlyError } from '@/utils/errors';
import { hasErrors, validateLoginForm, type FieldErrors } from '@/utils/validation';

export default function LoginPage() {
  usePageMeta({ title: 'Sign in — DevTrack', description: 'Sign in to your DevTrack account.' });

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateLoginForm({ email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Welcome back', 'You are now signed in to DevTrack.');
      navigate(from, { replace: true });
    } catch (error) {
      const message = getFriendlyError(error, 'We could not sign you in. Please try again.');
      setFormError(message);
      toast.error('Sign in failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">Sign in to DevTrack</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Access your projects, tasks and GitHub activity.</p>

      {formError ? <ErrorState message={formError} className="mt-5" compact title="Sign in failed" /> : null}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field label="Email" required error={errors.email}>
          {(props) => (
            <Input
              {...props}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              invalid={Boolean(errors.email)}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
        </Field>

        <Field
          label="Password"
          required
          error={errors.password}
          labelAction={
            <Link to="/forgot-password" className="text-xs font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          }
        >
          {(props) => (
            <Input
              {...props}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              invalid={Boolean(errors.password)}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          loadingText="Signing in…"
          leadingIcon={<LogIn className="size-4" aria-hidden />}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to DevTrack?{' '}
        <Link to="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
