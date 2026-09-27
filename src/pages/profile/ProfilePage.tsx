import { useState } from 'react';
import { Briefcase, GraduationCap, Link as LinkIcon, MapPin, Pencil, Sparkles, User } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/hooks/useToast';
import { getFriendlyError } from '@/utils/errors';
import { formatIsoDate } from '@/utils/format';
import type { EducationEntry, ExperienceEntry } from '@/types';
import type { ProfileFormValues } from '@/utils/validation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/States';
import { TagList } from '@/components/ui/TagInput';
import { PageLoader } from '@/components/ui/Loading';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

function profileToForm(profile: {
  name: string;
  bio: string;
  location: string;
  githubUsername: string;
  linkedinUrl: string;
  portfolioUrl: string;
  avatar: string;
  skills: string[];
}): ProfileFormValues {
  return {
    name: profile.name,
    bio: profile.bio,
    location: profile.location,
    githubUsername: profile.githubUsername,
    linkedinUrl: profile.linkedinUrl,
    portfolioUrl: profile.portfolioUrl,
    avatar: profile.avatar,
    skills: [...profile.skills],
  };
}

interface ProfileDraft {
  profileId: string;
  values: ProfileFormValues;
  education: EducationEntry[];
  experience: ExperienceEntry[];
}

export default function ProfilePage() {
  usePageMeta({
    title: 'Profile — DevTrack',
    description: 'Manage the developer profile you showcase with DevTrack.',
  });

  const { profile, user, isProfileReady, profileError, saveProfile } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // The profile arrives from Firestore after the first render. Seeding the form
  // while rendering (keyed by profile id) avoids an effect and a stuck loader.
  const [form, setForm] = useState<ProfileDraft | null>(null);
  if (profile && form?.profileId !== profile.id) {
    setForm({
      profileId: profile.id,
      values: profileToForm(profile),
      education: profile.education,
      experience: profile.experience,
    });
  }

  const values = form?.values ?? null;
  const education = form?.education ?? [];
  const experience = form?.experience ?? [];
  const setValues = (next: ProfileFormValues) => setForm((current) => (current ? { ...current, values: next } : current));
  const setEducation = (next: EducationEntry[]) => setForm((current) => (current ? { ...current, education: next } : current));
  const setExperience = (next: ExperienceEntry[]) => setForm((current) => (current ? { ...current, experience: next } : current));
  const resetForm = () =>
    setForm(
      profile
        ? { profileId: profile.id, values: profileToForm(profile), education: profile.education, experience: profile.experience }
        : null,
    );

  if (!isProfileReady) return <PageLoader label="Loading your profile…" />;

  if (profileError && !profile) {
    return (
      <div>
        <PageHeader title="Profile" />
        <ErrorState message={profileError} title="We could not load your profile" />
      </div>
    );
  }

  if (!profile || !values) return <PageLoader label="Loading your profile…" />;

  const socialLinks = [
    profile.githubUsername
      ? { label: `github.com/${profile.githubUsername}`, href: `https://github.com/${profile.githubUsername}` }
      : null,
    profile.linkedinUrl ? { label: 'LinkedIn profile', href: profile.linkedinUrl } : null,
    profile.portfolioUrl ? { label: 'Portfolio website', href: profile.portfolioUrl } : null,
  ].filter((link): link is { label: string; href: string } => link !== null);

  const handleSave = async () => {
    if (!values) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveProfile({
        name: values.name.trim(),
        bio: values.bio.trim(),
        location: values.location.trim(),
        githubUsername: values.githubUsername.trim(),
        linkedinUrl: values.linkedinUrl.trim(),
        portfolioUrl: values.portfolioUrl.trim(),
        avatar: values.avatar.trim(),
        skills: values.skills.map((skill) => skill.trim()).filter(Boolean),
        education,
        experience,
      });
      toast.success('Profile saved', 'Your developer profile has been updated.');
      setEditing(false);
    } catch (error) {
      const message = getFriendlyError(error, 'We could not save your profile. Please try again.');
      setSaveError(message);
      toast.error('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (url: string) => {
    setValues(values ? { ...values, avatar: url } : values);
    try {
      await saveProfile({ avatar: url });
    } catch (error) {
      const message = getFriendlyError(error, 'We could not update your avatar.');
      setSaveError(message);
      toast.error('Avatar update failed', message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        description="The professional profile you showcase alongside your projects."
        actions={
          editing ? undefined : (
            <Button onClick={() => setEditing(true)} leadingIcon={<Pencil className="size-4" aria-hidden />}>
              Edit profile
            </Button>
          )
        }
      />

      {profileError ? (
        <ErrorState message={profileError} compact className="mb-6" title="Profile sync issue" />
      ) : null}

      {editing && values ? (
        <ProfileEditor
          values={values}
          education={education}
          experience={experience}
          submitting={saving}
          error={saveError}
          onChange={setValues}
          onEducationChange={setEducation}
          onExperienceChange={setExperience}
          onAvatarChange={handleAvatarChange}
          onSubmit={handleSave}
          onCancel={() => {
            resetForm();
            setSaveError(null);
            setEditing(false);
          }}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar name={profile.name || user?.displayName || 'Developer'} src={profile.avatar} size="xl" />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold tracking-tight text-ink break-anywhere">
                  {profile.name || 'Your name'}
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted break-anywhere">
                  {profile.bio || 'Add a short bio so people know what you build.'}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
                  {profile.location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" aria-hidden />
                      {profile.location}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-4" aria-hidden />
                    {profile.email}
                  </span>
                </div>

                {socialLinks.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-hover break-anywhere"
                        >
                          <LinkIcon className="size-3.5" aria-hidden />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Skills" description="Technologies you work with regularly." />
              <div className="mt-5">
                <TagList items={profile.skills} max={40} emptyLabel="No skills added yet. Use “Edit profile” to add some." />
              </div>
            </Card>

            <Card>
              <CardHeader title="Experience" description="Roles and freelance work." />
              <div className="mt-5 space-y-4">
                {profile.experience.length === 0 ? (
                  <p className="text-sm text-ink-subtle">No experience added yet.</p>
                ) : (
                  profile.experience.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-subtle"
                      >
                        <Briefcase className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink break-anywhere">{entry.role}</p>
                        <p className="text-sm text-ink-muted break-anywhere">{entry.company}</p>
                        <p className="mt-0.5 text-xs text-ink-subtle">
                          {entry.startDate ? formatIsoDate(entry.startDate) : 'Start not set'} —{' '}
                          {entry.current ? 'Present' : formatIsoDate(entry.endDate)}
                        </p>
                        {entry.description ? (
                          <p className="mt-1.5 text-sm text-ink-muted break-anywhere">{entry.description}</p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Education" description="Degrees, courses and certifications." />
            <div className="mt-5 space-y-4">
              {profile.education.length === 0 ? (
                <p className="text-sm text-ink-subtle">No education added yet.</p>
              ) : (
                profile.education.map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-subtle"
                    >
                      <GraduationCap className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink break-anywhere">{entry.degree}</p>
                      <p className="text-sm text-ink-muted break-anywhere">
                        {entry.institution}
                        {entry.field ? ` · ${entry.field}` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {entry.startYear || '—'} — {entry.endYear || 'Present'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {!profile.bio && profile.skills.length === 0 && profile.experience.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface p-6 text-center">
              <Sparkles aria-hidden className="mx-auto size-5 text-ink-subtle" />
              <p className="mt-2 text-sm font-medium text-ink">Your profile is a blank canvas</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
                Add a bio, skills, education and experience so the profile is ready to share with recruiters or on
                your portfolio.
              </p>
              <Button className="mt-4" onClick={() => setEditing(true)} leadingIcon={<Pencil className="size-4" aria-hidden />}>
                Complete your profile
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
