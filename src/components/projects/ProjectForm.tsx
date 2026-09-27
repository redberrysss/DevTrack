import { useMemo, useState, type FormEvent } from 'react';
import { Calculator, Save } from 'lucide-react';

import type { Project, ProjectStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/Form';
import { TagInput } from '@/components/ui/TagInput';
import { ErrorState } from '@/components/ui/States';
import { LIMITS, PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/utils/constants';
import { todayIso } from '@/utils/format';
import { hasErrors, validateProjectForm, type FieldErrors, type ProjectFormValues } from '@/utils/validation';

const emptyValues: ProjectFormValues = {
  name: '',
  description: '',
  category: PROJECT_CATEGORIES[0],
  status: 'planning',
  technologies: [],
  githubUrl: '',
  liveUrl: '',
  imageUrl: '',
  progress: 0,
  progressMode: 'manual',
  startDate: todayIso(),
  endDate: '',
};

function projectToFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    description: project.description,
    category: project.category,
    status: project.status,
    technologies: [...project.technologies],
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    imageUrl: project.imageUrl,
    progress: project.progress,
    progressMode: project.progressMode,
    startDate: project.startDate,
    endDate: project.endDate,
  };
}

export interface ProjectFormProps {
  project?: Project | null;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({ project, submitting = false, error, onSubmit, onCancel }: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(() =>
    project ? projectToFormValues(project) : emptyValues,
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  const progressMode = values.progressMode;
  const taskDerived = progressMode === 'tasks';

  const hint = useMemo(
    () =>
      project
        ? 'Leave the description empty only if you are still shaping the idea.'
        : 'Short summary of what you are building and why.',
    [project],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateProjectForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      const firstField = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstField?.focus();
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error ? <ErrorState message={error} compact title="Could not save the project" /> : null}

      <Field label="Project name" required error={errors.name}>
        {(props) => (
          <Input
            {...props}
            value={values.name}
            maxLength={LIMITS.projectName}
            placeholder="DevTrack"
            invalid={Boolean(errors.name)}
            onChange={(event) => set('name', event.target.value)}
          />
        )}
      </Field>

      <Field label="Description" required error={errors.description} hint={hint}>
        {(props) => (
          <Textarea
            {...props}
            value={values.description}
            rows={3}
            maxLength={LIMITS.projectDescription}
            placeholder="A developer productivity dashboard built with React and Firebase."
            invalid={Boolean(errors.description)}
            onChange={(event) => set('description', event.target.value)}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" required error={errors.category}>
          {(props) => (
            <Select
              {...props}
              value={values.category}
              invalid={Boolean(errors.category)}
              onChange={(event) => set('category', event.target.value)}
            >
              {PROJECT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Status" required error={errors.status}>
          {(props) => (
            <Select
              {...props}
              value={values.status}
              invalid={Boolean(errors.status)}
              onChange={(event) => set('status', event.target.value as ProjectStatus)}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <TagInput
        label="Technologies"
        value={values.technologies}
        onChange={(next) => set('technologies', next)}
        error={errors.technologies}
        hint="Type a technology and press Enter, or paste a comma separated list into the field."
        maxItems={LIMITS.technologies}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" required error={errors.startDate}>
          {(props) => (
            <Input
              {...props}
              type="date"
              value={values.startDate}
              invalid={Boolean(errors.startDate)}
              onChange={(event) => set('startDate', event.target.value)}
            />
          )}
        </Field>

        <Field
          label="End date"
          error={errors.endDate}
          hint={taskDerived ? 'Optional — useful once the project is shipped.' : undefined}
        >
          {(props) => (
            <Input
              {...props}
              type="date"
              value={values.endDate}
              min={values.startDate || undefined}
              invalid={Boolean(errors.endDate)}
              onChange={(event) => set('endDate', event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="rounded-[var(--radius-control)] border border-line bg-surface-muted/60 p-4">
        <Checkbox
          label="Calculate progress from tasks"
          description="Keep this project's progress in sync automatically as tasks are completed."
          checked={taskDerived}
          onChange={(event) => set('progressMode', event.target.checked ? 'tasks' : 'manual')}
        />

        <div className="mt-4">
          {taskDerived ? (
            <p className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
              <Calculator className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                Progress is recalculated as completed tasks ÷ total tasks every time you tick a task on the project
                page.
              </span>
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="project-progress" className="text-sm font-medium text-ink">
                  Progress
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={values.progress}
                    onChange={(event) => set('progress', Number(event.target.value))}
                    aria-label="Progress percentage"
                    className="h-8 w-20 rounded-md border border-line-strong bg-surface px-2 text-right text-sm text-ink tabular-nums"
                  />
                  <span className="text-sm text-ink-subtle">%</span>
                </div>
              </div>
              <input
                id="project-progress"
                type="range"
                min={0}
                max={100}
                step={1}
                value={Number.isFinite(values.progress) ? values.progress : 0}
                onChange={(event) => set('progress', Number(event.target.value))}
                aria-describedby={errors.progress ? 'project-progress-error' : undefined}
                aria-invalid={errors.progress ? true : undefined}
                className="mt-3 w-full accent-[var(--brand)]"
              />
              {errors.progress ? (
                <p id="project-progress-error" role="alert" className="text-xs font-medium text-critical">
                  {errors.progress}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="GitHub URL" error={errors.githubUrl}>
          {(props) => (
            <Input
              {...props}
              type="url"
              inputMode="url"
              placeholder="https://github.com/you/project"
              value={values.githubUrl}
              invalid={Boolean(errors.githubUrl)}
              onChange={(event) => set('githubUrl', event.target.value)}
            />
          )}
        </Field>

        <Field label="Live demo URL" error={errors.liveUrl}>
          {(props) => (
            <Input
              {...props}
              type="url"
              inputMode="url"
              placeholder="https://project.dev"
              value={values.liveUrl}
              invalid={Boolean(errors.liveUrl)}
              onChange={(event) => set('liveUrl', event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field
        label="Image URL"
        error={errors.imageUrl}
        hint="Optional. Paste a direct link to a screenshot or preview image."
      >
        {(props) => (
          <Input
            {...props}
            type="url"
            inputMode="url"
            placeholder="https://images.example.com/preview.png"
            value={values.imageUrl}
            invalid={Boolean(errors.imageUrl)}
            onChange={(event) => set('imageUrl', event.target.value)}
          />
        )}
      </Field>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          loading={submitting}
          loadingText="Saving…"
          leadingIcon={<Save className="size-4" aria-hidden />}
        >
          {project ? 'Save changes' : 'Create project'}
        </Button>
      </div>
    </form>
  );
}
