import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, Send } from 'lucide-react';

import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/hooks/useToast';
import { requestPasswordReset } from '@/services/firebase/auth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { ErrorState, InlineNotice } from '@/components/ui/States';
import { getFriendlyError } from '@/utils/errors';
import { hasErrors, validateForgotPasswordForm, type FieldErrors } from '@/utils/validation';

export default function ForgotPasswordPage() {
  usePageMeta({
    title: 'Reset your password — DevTrack',
    description: 'Request a password reset email for your DevTrack account.',
  });

  const toast = useToast();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateForgotPasswordForm({ email });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success('Reset email sent', 'Check your inbox for a link to choose a new password.');
    } catch (error) {
      const message = getFriendlyError(error, 'We could not send the reset email. Please try again.');
      setFormError(message);
      toast.error('Reset failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">Reset your password</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Enter the email address for your account and we will send you a reset link.
      </p>

      {sent ? (
        <div className="mt-6 space-y-4">
          <InlineNotice tone="success">
            <span className="flex items-start gap-2">
              <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                If an account exists for <strong className="font-semibold break-anywhere">{email}</strong>, a reset
                email is on its way. The link expires after one hour.
              </span>
            </span>
          </InlineNotice>
          <Link
            to="/login"
            className="inline-flex text-sm font-medium text-brand hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          {formError ? <ErrorState message={formError} className="mt-5" compact title="Could not send email" /> : null}

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

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
              loadingText="Sending…"
              leadingIcon={<Send className="size-4" aria-hidden />}
            >
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
