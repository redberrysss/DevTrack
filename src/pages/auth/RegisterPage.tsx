import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/hooks/useToast';
import { registerWithEmail } from '@/services/firebase/auth';
import { createUserProfile } from '@/services/firebase/profile';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { ErrorState } from '@/components/ui/States';
import { getFriendlyError } from '@/utils/errors';
import { LIMITS } from '@/utils/constants';
import { hasErrors, validateRegisterForm, type FieldErrors } from '@/utils/validation';

export default function RegisterPage() {
  usePageMeta({
    title: 'Create your account — DevTrack',
    description: 'Create a DevTrack account to manage projects, tasks and your GitHub profile.',
  });

  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateRegisterForm({ name, email, password, confirmPassword });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const credential = await registerWithEmail({ name, email, password });
      await createUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL,
      });
      toast.success('Account created', 'Welcome to DevTrack — let us set up your first project.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = getFriendlyError(error, 'We could not create your account. Please try again.');
      setFormError(message);
      toast.error('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Start tracking your projects in under a minute. No credit card required.
      </p>

      {formError ? <ErrorState message={formError} className="mt-5" compact title="Could not create account" /> : null}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field label="Name" required error={errors.name}>
          {(props) => (
            <Input
              {...props}
              name="name"
              autoComplete="name"
              maxLength={LIMITS.name}
              placeholder="Ada Lovelace"
              value={name}
              invalid={Boolean(errors.name)}
              onChange={(event) => setName(event.target.value)}
            />
          )}
        </Field>

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
          hint={`At least ${LIMITS.passwordMin} characters, including a letter and a number.`}
        >
          {(props) => (
            <Input
              {...props}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              invalid={Boolean(errors.password)}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>

        <Field label="Confirm password" required error={errors.confirmPassword}>
          {(props) => (
            <Input
              {...props}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              invalid={Boolean(errors.confirmPassword)}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          )}
        </Field>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          loadingText="Creating account…"
          leadingIcon={<UserPlus className="size-4" aria-hidden />}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
