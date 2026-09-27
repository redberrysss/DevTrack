import { useState, type FormEvent } from 'react';
import { Plus, Save, X } from 'lucide-react';

import type { EducationEntry, ExperienceEntry } from '@/types';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Form';
import { ErrorState } from '@/components/ui/States';
import { TagInput } from '@/components/ui/TagInput';
import { AvatarEditor } from './AvatarEditor';
import {
  hasErrors,
  validateEducationEntry,
  validateExperienceEntry,
  validateProfileForm,
  type FieldErrors,
  type ProfileFormValues,
} from '@/utils/validation';
import { LIMITS } from '@/utils/constants';
import { toIsoDateInput } from '@/utils/format';

export interface ProfileEditorProps {
  values: ProfileFormValues;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  submitting: boolean;
  error?: string | null;
  onChange: (values: ProfileFormValues) => void;
  onEducationChange: (entries: EducationEntry[]) => void;
  onExperienceChange: (entries: ExperienceEntry[]) => void;
  onAvatarChange: (url: string) => Promise<void>;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const newEducation = (): EducationEntry => ({
  id: `education-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  institution: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
  description: '',
});

const newExperience = (): ExperienceEntry => ({
  id: `experience-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

export function ProfileEditor({
  values,
  education,
  experience,
  submitting,
  error,
  onChange,
  onEducationChange,
  onExperienceChange,
  onAvatarChange,
  onSubmit,
  onCancel,
}: ProfileEditorProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [educationErrors, setEducationErrors] = useState<Record<string, FieldErrors>>({});
  const [experienceErrors, setExperienceErrors] = useState<Record<string, FieldErrors>>({});

  const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    onChange({ ...values, [key]: value });
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateProfileForm(values);
    const nextEducationErrors: Record<string, FieldErrors> = {};
    const nextExperienceErrors: Record<string, FieldErrors> = {};

    education.forEach((entry) => {
      const entryErrors = validateEducationEntry(entry);
      if (hasErrors(entryErrors)) nextEducationErrors[entry.id] = entryErrors;
    });
    experience.forEach((entry) => {
      const entryErrors = validateExperienceEntry(entry);
      if (hasErrors(entryErrors)) nextExperienceErrors[entry.id] = entryErrors;
    });

    setErrors(nextErrors);
    setEducationErrors(nextEducationErrors);
    setExperienceErrors(nextExperienceErrors);

    if (hasErrors(nextErrors) || Object.keys(nextEducationErrors).length > 0 || Object.keys(nextExperienceErrors).length > 0) {
      const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error ? <ErrorState message={error} compact title="Could not save your profile" /> : null}

      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="text-[15px] font-semibold text-ink">Basics</h2>
        <p className="mt-0.5 text-sm text-ink-muted">How you appear across DevTrack.</p>

        <div className="mt-5">
          <AvatarEditor
            name={values.name}
            avatar={values.avatar}
            onAvatarChange={onAvatarChange}
            disabled={submitting}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required error={errors.name}>
            {(props) => (
              <Input
                {...props}
                value={values.name}
                maxLength={LIMITS.name}
                invalid={Boolean(errors.name)}
                onChange={(event) => set('name', event.target.value)}
              />
            )}
          </Field>

          <Field label="Location" error={errors.location} hint="City and country, or “Remote”.">
            {(props) => (
              <Input
                {...props}
                value={values.location}
                maxLength={80}
                placeholder="Amsterdam, Netherlands"
                invalid={Boolean(errors.location)}
                onChange={(event) => set('location', event.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Bio" error={errors.bio} hint={`${values.bio.length}/${LIMITS.bio} characters`}>
            {(props) => (
              <Textarea
                {...props}
                rows={4}
                value={values.bio}
                maxLength={LIMITS.bio}
                placeholder="Full-stack developer focused on developer tools and data-heavy interfaces."
                invalid={Boolean(errors.bio)}
                onChange={(event) => set('bio', event.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="GitHub username" error={errors.githubUsername} hint="Used to show your public repositories.">
            {(props) => (
              <Input
                {...props}
                value={values.githubUsername}
                autoComplete="off"
                spellCheck={false}
                placeholder="octocat"
                invalid={Boolean(errors.githubUsername)}
                onChange={(event) => set('githubUsername', event.target.value)}
              />
            )}
          </Field>

          <Field label="LinkedIn URL" error={errors.linkedinUrl}>
            {(props) => (
              <Input
                {...props}
                type="url"
                inputMode="url"
                value={values.linkedinUrl}
                placeholder="https://www.linkedin.com/in/you"
                invalid={Boolean(errors.linkedinUrl)}
                onChange={(event) => set('linkedinUrl', event.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Portfolio URL" error={errors.portfolioUrl}>
            {(props) => (
              <Input
                {...props}
                type="url"
                inputMode="url"
                value={values.portfolioUrl}
                placeholder="https://your-site.dev"
                invalid={Boolean(errors.portfolioUrl)}
                onChange={(event) => set('portfolioUrl', event.target.value)}
              />
            )}
          </Field>

          <Field label="Avatar URL" error={errors.avatar} hint="Optional — a direct image link.">
            {(props) => (
              <Input
                {...props}
                type="url"
                inputMode="url"
                value={values.avatar}
                placeholder="https://…"
                invalid={Boolean(errors.avatar)}
                onChange={(event) => set('avatar', event.target.value)}
              />
            )}
          </Field>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="text-[15px] font-semibold text-ink">Skills</h2>
        <p className="mt-0.5 text-sm text-ink-muted">The tools and technologies you work with.</p>
        <div className="mt-5">
          <TagInput
            label="Your skills"
            value={values.skills}
            onChange={(next) => set('skills', next)}
            error={errors.skills}
            maxItems={LIMITS.skills}
            maxItemLength={LIMITS.skillLength}
            hint="Press Enter after each skill."
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Experience</h2>
            <p className="mt-0.5 text-sm text-ink-muted">Roles, internships and freelance work.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onExperienceChange([...experience, newExperience()])}
            leadingIcon={<Plus className="size-3.5" aria-hidden />}
          >
            Add role
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {experience.length === 0 ? (
            <p className="text-sm text-ink-subtle">No experience added yet.</p>
          ) : (
            experience.map((entry, index) => {
              const entryErrors = experienceErrors[entry.id] ?? {};
              return (
                <div key={entry.id} className="rounded-[var(--radius-control)] border border-line bg-surface-muted/50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">Role {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onExperienceChange(experience.filter((item) => item.id !== entry.id))}
                      aria-label={`Remove role ${index + 1}`}
                      className="px-2 text-ink-muted hover:text-critical"
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Role" required error={entryErrors.role}>
                      {(props) => (
                        <Input
                          {...props}
                          value={entry.role}
                          maxLength={LIMITS.role}
                          placeholder="Frontend Engineer"
                          invalid={Boolean(entryErrors.role)}
                          onChange={(event) =>
                            onExperienceChange(
                              experience.map((item) =>
                                item.id === entry.id ? { ...item, role: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>

                    <Field label="Company" required error={entryErrors.company}>
                      {(props) => (
                        <Input
                          {...props}
                          value={entry.company}
                          maxLength={LIMITS.company}
                          placeholder="Acme Labs"
                          invalid={Boolean(entryErrors.company)}
                          onChange={(event) =>
                            onExperienceChange(
                              experience.map((item) =>
                                item.id === entry.id ? { ...item, company: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Start date" error={entryErrors.startDate}>
                      {(props) => (
                        <Input
                          {...props}
                          type="date"
                          value={toIsoDateInput(entry.startDate)}
                          invalid={Boolean(entryErrors.startDate)}
                          onChange={(event) =>
                            onExperienceChange(
                              experience.map((item) =>
                                item.id === entry.id ? { ...item, startDate: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>

                    <Field
                      label="End date"
                      error={entryErrors.endDate}
                      labelAction={
                        <Checkbox
                          label="Current"
                          checked={entry.current}
                          onChange={(event) =>
                            onExperienceChange(
                              experience.map((item) =>
                                item.id === entry.id
                                  ? { ...item, current: event.target.checked, endDate: '' }
                                  : item,
                              ),
                            )
                          }
                        />
                      }
                    >
                      {(props) => (
                        <Input
                          {...props}
                          type="date"
                          value={toIsoDateInput(entry.endDate)}
                          disabled={entry.current}
                          invalid={Boolean(entryErrors.endDate)}
                          onChange={(event) =>
                            onExperienceChange(
                              experience.map((item) =>
                                item.id === entry.id ? { ...item, endDate: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="What did you do?" hint="Optional — a short summary.">
                      {(props) => (
                        <Textarea
                          {...props}
                          rows={2}
                          value={entry.description}
                          onChange={(event) =>
                            onExperienceChange(
                              experience.map((item) =>
                                item.id === entry.id ? { ...item, description: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Education</h2>
            <p className="mt-0.5 text-sm text-ink-muted">Degrees, courses and certifications.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onEducationChange([...education, newEducation()])}
            leadingIcon={<Plus className="size-3.5" aria-hidden />}
          >
            Add education
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {education.length === 0 ? (
            <p className="text-sm text-ink-subtle">No education added yet.</p>
          ) : (
            education.map((entry, index) => {
              const entryErrors = educationErrors[entry.id] ?? {};
              return (
                <div key={entry.id} className="rounded-[var(--radius-control)] border border-line bg-surface-muted/50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">Education {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEducationChange(education.filter((item) => item.id !== entry.id))}
                      aria-label={`Remove education ${index + 1}`}
                      className="px-2 text-ink-muted hover:text-critical"
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </div>

                  <Field label="Institution" required error={entryErrors.institution}>
                    {(props) => (
                      <Input
                        {...props}
                        value={entry.institution}
                        maxLength={LIMITS.institution}
                        placeholder="University of Twente"
                        invalid={Boolean(entryErrors.institution)}
                        onChange={(event) =>
                          onEducationChange(
                            education.map((item) =>
                              item.id === entry.id ? { ...item, institution: event.target.value } : item,
                            ),
                          )
                        }
                      />
                    )}
                  </Field>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Degree" required error={entryErrors.degree}>
                      {(props) => (
                        <Input
                          {...props}
                          value={entry.degree}
                          placeholder="BSc Computer Science"
                          invalid={Boolean(entryErrors.degree)}
                          onChange={(event) =>
                            onEducationChange(
                              education.map((item) =>
                                item.id === entry.id ? { ...item, degree: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>

                    <Field label="Field of study" hint="Optional">
                      {(props) => (
                        <Input
                          {...props}
                          value={entry.field}
                          placeholder="Human–Computer Interaction"
                          onChange={(event) =>
                            onEducationChange(
                              education.map((item) =>
                                item.id === entry.id ? { ...item, field: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Start year" error={entryErrors.startYear}>
                      {(props) => (
                        <Input
                          {...props}
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="2019"
                          invalid={Boolean(entryErrors.startYear)}
                          onChange={(event) =>
                            onEducationChange(
                              education.map((item) =>
                                item.id === entry.id ? { ...item, startYear: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>

                    <Field label="End year" error={entryErrors.endYear} hint="Leave blank if ongoing.">
                      {(props) => (
                        <Input
                          {...props}
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="2022"
                          invalid={Boolean(entryErrors.endYear)}
                          onChange={(event) =>
                            onEducationChange(
                              education.map((item) =>
                                item.id === entry.id ? { ...item, endYear: event.target.value } : item,
                              ),
                            )
                          }
                        />
                      )}
                    </Field>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} loadingText="Saving…" leadingIcon={<Save className="size-4" aria-hidden />}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
