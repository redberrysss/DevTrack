import { useState, type FormEvent } from 'react';
import { Check, ListTodo, Pencil, Plus, Save, Trash2 } from 'lucide-react';

import type { Task } from '@/types';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Form';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Spinner } from '@/components/ui/Loading';
import { LIMITS } from '@/utils/constants';
import { formatRelativeTime } from '@/utils/format';
import { hasErrors, validateTaskForm, type FieldErrors, type TaskFormValues } from '@/utils/validation';

export interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onCreate: (values: TaskFormValues) => Promise<void>;
  onUpdate: (taskId: string, values: TaskFormValues) => Promise<void>;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onRetry: () => void;
  canDelete?: boolean;
}

export function TaskList({
  tasks,
  loading,
  error,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
  onRetry,
  canDelete = false,
}: TaskListProps) {
  const [adding, setAdding] = useState(false);
  const [values, setValues] = useState<TaskFormValues>({ title: '', description: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const completedCount = tasks.filter((task) => task.completed).length;
  const percent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const resetComposer = () => {
    setValues({ title: '', description: '' });
    setErrors({});
    setSubmitError(null);
    setAdding(false);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors = validateTaskForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      await onCreate(values);
      setValues({ title: '', description: '' });
      setErrors({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not add the task.');
    } finally {
      setSaving(false);
    }
  };

  const runToggle = async (task: Task) => {
    setPendingTaskId(task.id);
    try {
      await onToggle(task);
    } finally {
      setPendingTaskId(null);
    }
  };

  const runDelete = async (task: Task) => {
    setPendingDeleteId(task.id);
    try {
      await onDelete(task);
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <section aria-labelledby="tasks-heading" className="rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div className="min-w-0">
          <h2 id="tasks-heading" className="text-[15px] font-semibold text-ink">
            Tasks
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {loading ? 'Loading tasks…' : `${completedCount} of ${tasks.length} complete`}
          </p>
        </div>
        {!adding ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAdding(true)}
            leadingIcon={<Plus className="size-3.5" aria-hidden />}
          >
            Add task
          </Button>
        ) : null}
      </div>

      <div className="p-5">
        <ProgressBar
          value={percent}
          label="Task completion"
          showValue
          srDescription={`${completedCount} of ${tasks.length} tasks completed`}
          className="mb-5"
        />

        {error ? <ErrorState message={error} onRetry={onRetry} compact title="Could not load tasks" /> : null}

        {adding ? (
          <form onSubmit={handleCreate} noValidate className="mb-5 rounded-[var(--radius-control)] border border-line bg-surface-muted/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">New task</h3>
            <div className="space-y-3">
              <Field label="Title" required error={errors.title}>
                {(props) => (
                  <Input
                    {...props}
                    value={values.title}
                    maxLength={LIMITS.taskTitle}
                    placeholder="Wire up the authentication flow"
                    invalid={Boolean(errors.title)}
                    onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                  />
                )}
              </Field>
              <Field label="Notes" error={errors.description} hint="Optional context for future you.">
                {(props) => (
                  <Textarea
                    {...props}
                    rows={2}
                    value={values.description}
                    maxLength={LIMITS.taskDescription}
                    invalid={Boolean(errors.description)}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                )}
              </Field>
            </div>
            {submitError ? (
              <p role="alert" className="mt-3 text-sm font-medium text-critical break-anywhere">
                {submitError}
              </p>
            ) : null}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" size="sm" onClick={resetComposer} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={saving} loadingText="Adding…" leadingIcon={<Plus className="size-3.5" aria-hidden />}>
                Add task
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner label="Loading tasks…" />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="size-5" />}
            title="No tasks added yet"
            description="Break the project down into tasks so progress is easy to follow."
            action={
              adding ? undefined : (
                <Button variant="secondary" size="sm" onClick={() => setAdding(true)} leadingIcon={<Plus className="size-3.5" aria-hidden />}>
                  Add the first task
                </Button>
              )
            }
            className="border-none bg-surface-muted/40 py-8"
          />
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                editing={editingId === task.id}
                busy={pendingTaskId === task.id || pendingDeleteId === task.id}
                canDelete={canDelete}
                onToggle={() => runToggle(task)}
                onDelete={() => runDelete(task)}
                onEdit={() => setEditingId(task.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={async (next) => {
                  await onUpdate(task.id, next);
                  setEditingId(null);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

interface TaskRowProps {
  task: Task;
  editing: boolean;
  busy: boolean;
  canDelete: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (values: TaskFormValues) => Promise<void>;
}

function TaskRow({ task, editing, busy, canDelete, onToggle, onDelete, onEdit, onCancelEdit, onSave }: TaskRowProps) {
  const [values, setValues] = useState<TaskFormValues>({ title: task.title, description: task.description });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateTaskForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSaving(true);
    try {
      await onSave(values);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <li className="py-4">
        <form onSubmit={handleSave} noValidate className="space-y-3">
          <Field label="Title" required error={errors.title}>
            {(props) => (
              <Input
                {...props}
                value={values.title}
                maxLength={LIMITS.taskTitle}
                invalid={Boolean(errors.title)}
                onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              />
            )}
          </Field>
          <Field label="Notes" error={errors.description}>
            {(props) => (
              <Textarea
                {...props}
                rows={2}
                value={values.description}
                maxLength={LIMITS.taskDescription}
                invalid={Boolean(errors.description)}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              />
            )}
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="sm" onClick={onCancelEdit} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving} leadingIcon={<Save className="size-3.5" aria-hidden />}>
              Save task
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 py-3">
      <span className="flex h-6 items-center">
        {busy ? (
          <Spinner />
        ) : (
          <Checkbox
            checked={task.completed}
            onChange={onToggle}
            label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            className="[&>span:last-child]:sr-only"
          />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium break-anywhere ${
            task.completed ? 'text-ink-subtle line-through' : 'text-ink'
          }`}
        >
          {task.completed ? (
            <Check className="mr-1.5 inline size-3.5 text-positive align-[-1px]" aria-hidden />
          ) : null}
          {task.title}
        </p>
        {task.description ? (
          <p className="mt-0.5 text-sm text-ink-muted break-anywhere">{task.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-ink-subtle">
          {task.completed && task.completedAt
            ? `Completed ${formatRelativeTime(task.completedAt)}`
            : `Added ${formatRelativeTime(task.createdAt)}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label={`Edit ${task.title}`}
          className="px-2"
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        {canDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label={`Delete ${task.title}`}
            className="px-2 text-ink-muted hover:text-critical"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </li>
  );
}
