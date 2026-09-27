import { useState, type FormEvent } from 'react';
import { KeyRound, LogOut, Monitor, Moon, Palette, Save, Sun, Unplug, User as UserIcon } from 'lucide-react';
import { Github } from '@/components/ui/BrandIcons';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { changePassword, resendVerificationEmail, signOut, updateDisplayName } from '@/services/firebase/auth';
import { normaliseUsername } from '@/services/github/githubService';
import { getFriendlyError } from '@/utils/errors';
import { hasErrors, validateGithubUsernameField, validatePasswordChangeForm, type FieldErrors } from '@/utils/validation';
import { LIMITS } from '@/utils/constants';
import type { ThemePreference } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Form';
import { InlineNotice } from '@/components/ui/States';
import { cn } from '@/utils/cn';

const themeOptions: Array<{ value: ThemePreference; label: string; icon: typeof Sun; hint: string }> = [
  { value: 'light', label: 'Light', icon: Sun, hint: 'Always light' },
  { value: 'dark', label: 'Dark', icon: Moon, hint: 'Always dark' },
  { value: 'system', label: 'System', icon: Monitor, hint: 'Follow my device' },
];

interface ProfileDraft {
  profileId: string;
  name: string;
  githubUsername: string;
}

export default function SettingsPage() {
  usePageMeta({ title: 'Settings — DevTrack', description: 'Manage your account, appearance and security in DevTrack.' });

  const navigate = useNavigate();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { profile, user, saveProfile } = useAuth();

  // The profile document arrives from Firestore after the first render, so the
  // drafts are seeded while rendering and keyed by the profile id.
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  if (profile && profileDraft?.profileId !== profile.id) {
    setProfileDraft({ profileId: profile.id, name: profile.name, githubUsername: profile.githubUsername });
  }

  const name = profileDraft?.name ?? '';
  const setName = (value: string) =>
    setProfileDraft((current) => (current ? { ...current, name: value } : current));
  const githubUsername = profileDraft?.githubUsername ?? '';
  const setGithubUsername = (value: string) =>
    setProfileDraft((current) => (current ? { ...current, githubUsername: value } : current));

  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [savingName, setSavingName] = useState(false);

  const [githubError, setGithubError] = useState<string | undefined>(undefined);
  const [savingGithub, setSavingGithub] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const email = profile?.email || user?.email || '';
  const displayName = profile?.name || user?.displayName || 'Developer';

  const handleSaveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required.');
      return;
    }
    if (trimmed.length > LIMITS.name) {
      setNameError(`Keep it under ${LIMITS.name} characters.`);
      return;
    }

    setNameError(undefined);
    setSavingName(true);
    try {
      await saveProfile({ name: trimmed });
      if (user && user.displayName !== trimmed) await updateDisplayName(trimmed);
      toast.success('Name updated', 'Your account name has been changed.');
    } catch (error) {
      const message = getFriendlyError(error, 'We could not update your name.');
      setNameError(message);
      toast.error('Update failed', message);
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveGithub = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateGithubUsernameField(githubUsername, { required: false });
    setGithubError(error);
    if (error) return;

    setSavingGithub(true);
    try {
      const value = githubUsername.trim();
      await saveProfile({ githubUsername: value });
      toast.success(
        value ? 'GitHub username saved' : 'GitHub disconnected',
        value
          ? `DevTrack will now track @${normaliseUsername(value)} on your dashboard.`
          : 'GitHub data has been removed from your dashboard.',
      );
    } catch (error) {
      const message = getFriendlyError(error, 'We could not save your GitHub username.');
      setGithubError(message);
      toast.error('Update failed', message);
    } finally {
      setSavingGithub(false);
    }
  };

  const handleDisconnectGithub = async () => {
    setSavingGithub(true);
    try {
      await saveProfile({ githubUsername: '' });
      setGithubUsername('');
      setGithubError(undefined);
      toast.success('GitHub disconnected', 'Your dashboard no longer tracks GitHub data.');
    } catch (error) {
      const message = getFriendlyError(error, 'We could not disconnect GitHub.');
      toast.error('Update failed', message);
    } finally {
      setSavingGithub(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validatePasswordChangeForm(passwords);
    setPasswordErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated', 'Use your new password the next time you sign in.');
    } catch (error) {
      const message = getFriendlyError(error, 'We could not change your password.');
      setPasswordErrors({ currentPassword: message });
      toast.error('Password not changed', message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out', 'You have been logged out of DevTrack.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Could not sign out', getFriendlyError(error, 'Please try again.'));
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      await resendVerificationEmail(user);
      toast.success('Verification email sent', 'Check your inbox to confirm your address.');
    } catch (error) {
      toast.error('Could not send the email', getFriendlyError(error, 'Please try again later.'));
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Your account, appearance and security in one place." />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Account" description="Your sign-in details." />
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Avatar name={displayName} src={profile?.avatar} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink break-anywhere">{displayName}</p>
              <p className="text-sm text-ink-muted break-anywhere">{email}</p>
            </div>
            {user && !user.emailVerified ? (
              <Button variant="secondary" size="sm" onClick={handleResendVerification} className="ml-auto">
                Verify email
              </Button>
            ) : null}
          </div>

          {user && !user.emailVerified ? (
            <InlineNotice tone="caution" className="mt-4">
              Your email address is not verified yet. Verify it to protect your account and enable every Firebase
              feature.
            </InlineNotice>
          ) : null}

          <form onSubmit={handleSaveName} noValidate className="mt-6 space-y-4 border-t border-line pt-5">
            <Field label="Display name" required error={nameError} hint="Shown across the app and used in your profile.">
              {(props) => (
                <Input
                  {...props}
                  value={name}
                  maxLength={LIMITS.name}
                  autoComplete="name"
                  invalid={Boolean(nameError)}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(undefined);
                  }}
                />
              )}
            </Field>

            <Field label="Email address" hint="Contact support to change the address on your account.">
              {(props) => <Input {...props} value={email} readOnly disabled />}
            </Field>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={savingName}
                loadingText="Saving…"
                leadingIcon={<Save className="size-4" aria-hidden />}
              >
                Save account
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Palette className="size-4" aria-hidden />
                Appearance
              </span>
            }
            description="Choose how DevTrack looks. Your choice is remembered on this device."
          />

          <div role="radiogroup" aria-label="Theme" className="mt-5 grid gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const selected = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-[var(--radius-control)] border p-4 text-left transition-colors',
                    selected
                      ? 'border-brand bg-brand-soft'
                      : 'border-line-strong bg-surface hover:bg-surface-hover',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <option.icon className="size-4" aria-hidden />
                    {option.label}
                  </span>
                  <span className="text-xs text-ink-muted">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Github className="size-4" aria-hidden />
                GitHub
              </span>
            }
            description="Connect an account to show repositories, stars and languages across DevTrack."
          />

          <form onSubmit={handleSaveGithub} noValidate className="mt-5 space-y-4">
            <Field
              label="GitHub username"
              error={githubError}
              hint="Leave empty and save to disconnect. Public data only — no GitHub sign-in required."
            >
              {(props) => (
                <Input
                  {...props}
                  value={githubUsername}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="octocat"
                  invalid={Boolean(githubError)}
                  onChange={(event) => {
                    setGithubUsername(event.target.value);
                    setGithubError(undefined);
                  }}
                />
              )}
            </Field>

            <div className="flex flex-wrap justify-end gap-2">
              {profile?.githubUsername ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDisconnectGithub}
                  loading={savingGithub}
                  leadingIcon={<Unplug className="size-3.5" aria-hidden />}
                >
                  Disconnect
                </Button>
              ) : null}
              <Button
                type="submit"
                loading={savingGithub}
                loadingText="Saving…"
                leadingIcon={<Save className="size-4" aria-hidden />}
              >
                Save GitHub username
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <KeyRound className="size-4" aria-hidden />
                Security
              </span>
            }
            description="Change your password and manage your session."
          />

          <form onSubmit={handleChangePassword} noValidate className="mt-5 space-y-4">
            <Field label="Current password" required error={passwordErrors.currentPassword}>
              {(props) => (
                <Input
                  {...props}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  invalid={Boolean(passwordErrors.currentPassword)}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, currentPassword: event.target.value }))
                  }
                />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="New password"
                required
                error={passwordErrors.newPassword}
                hint={`At least ${LIMITS.passwordMin} characters with a letter and a number.`}
              >
                {(props) => (
                  <Input
                    {...props}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    invalid={Boolean(passwordErrors.newPassword)}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, newPassword: event.target.value }))
                    }
                  />
                )}
              </Field>

              <Field label="Confirm new password" required error={passwordErrors.confirmPassword}>
                {(props) => (
                  <Input
                    {...props}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    invalid={Boolean(passwordErrors.confirmPassword)}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                  />
                )}
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={savingPassword} loadingText="Updating…">
                Update password
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-sm text-ink-muted">Signed in as {email || 'your account'}.</p>
            <Button
              variant="secondary"
              onClick={handleLogout}
              leadingIcon={<LogOut className="size-4" aria-hidden />}
            >
              Log out
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <UserIcon className="size-4" aria-hidden />
                Data & privacy
              </span>
            }
            description="Where your information lives and how it is protected."
          />
          <ul className="mt-5 space-y-2 text-sm text-ink-muted">
            <li>• Your projects, tasks and profile are stored in Cloud Firestore.</li>
            <li>• Security rules ensure only you can read or write your own data.</li>
            <li>• GitHub data is read from the public API and never written back to GitHub.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
