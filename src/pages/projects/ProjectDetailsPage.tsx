import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Github } from '@/components/ui/BrandIcons';

import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProjects, useTasks } from '@/hooks/useFirestoreData';
import { useToast } from '@/hooks/useToast';
import { deleteProject } from '@/services/projects/projectsService';
import { createTask, deleteTask, setTaskCompleted, updateTaskDetails } from '@/services/projects/tasksService';
import { computeTaskStats } from '@/lib/stats';
import { getFriendlyError } from '@/utils/errors';
import { formatIsoDate } from '@/utils/format';
import type { Task } from '@/types';
import type { TaskFormValues } from '@/utils/validation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ExternalLinkButton, LinkButton } from '@/components/ui/LinkButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TagList } from '@/components/ui/TagInput';
import { ErrorState } from '@/components/ui/States';
import { PageLoader } from '@/components/ui/Loading';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';
import { TaskList } from '@/components/projects/TaskList';

export default function ProjectDetailsPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const { user, isProfileReady } = useAuth();
  const toast = useToast();

  const { items: projects, loading, error, refresh } = useProjects(user?.uid ?? null);
  const tasksState = useTasks(user?.uid ?? null, projectId || null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  const project = useMemo(
    () => projects.find((entry) => entry.id === projectId) ?? null,
    [projects, projectId],
  );

  const taskStats = useMemo(() => computeTaskStats(tasksState.items), [tasksState.items]);

  usePageMeta({
    title: project ? `${project.name} — DevTrack` : 'Project — DevTrack',
    description: project?.description?.slice(0, 155),
  });

  const handleDelete = useCallback(async () => {
    if (!project || !user) return;
    setDeleteBusy(true);
    try {
      await deleteProject(user.uid, project.id);
      toast.success('Project deleted', `“${project.name}” and its tasks were removed.`);
      navigate('/projects', { replace: true });
    } catch (deleteError) {
      const message = getFriendlyError(deleteError, 'We could not delete that project. Please try again.');
      toast.error('Delete failed', message);
      setDeleteOpen(false);
    } finally {
      setDeleteBusy(false);
    }
  }, [navigate, project, toast, user]);

  const handleCreateTask = useCallback(
    async (values: TaskFormValues) => {
      if (!user || !project) return;
      setTaskError(null);
      await createTask(user.uid, project.id, values);
      toast.success('Task added', `“${values.title.trim()}” is on the list.`);
    },
    [project, toast, user],
  );

  const handleUpdateTask = useCallback(
    async (taskId: string, values: TaskFormValues) => {
      if (!user || !project) return;
      setTaskError(null);
      try {
        await updateTaskDetails(user.uid, project.id, taskId, values);
        toast.success('Task updated', 'Your changes have been saved.');
      } catch (updateError) {
        const message = getFriendlyError(updateError, 'We could not update that task.');
        setTaskError(message);
        toast.error('Update failed', message);
        throw updateError;
      }
    },
    [project, toast, user],
  );

  const handleToggleTask = useCallback(
    async (task: Task) => {
      if (!user || !project) return;
      setTaskError(null);
      const nextCompleted = !task.completed;
      const completedCount = taskStats.completed + (nextCompleted ? 1 : -1);
      try {
        await setTaskCompleted({
          userId: user.uid,
          projectId: project.id,
          taskId: task.id,
          completed: nextCompleted,
          completedCount,
          totalCount: taskStats.total,
          deriveProgress: project.progressMode === 'tasks',
        });
      } catch (toggleError) {
        const message = getFriendlyError(toggleError, 'We could not update that task.');
        setTaskError(message);
        toast.error('Update failed', message);
      }
    },
    [project, taskStats, toast, user],
  );

  const handleDeleteTask = useCallback(
    async (task: Task) => {
      if (!user || !project) return;
      setTaskError(null);
      try {
        await deleteTask(user.uid, project.id, task.id);
        toast.success('Task deleted', `“${task.title}” was removed.`);
      } catch (deleteTaskError) {
        const message = getFriendlyError(deleteTaskError, 'We could not delete that task.');
        setTaskError(message);
        toast.error('Delete failed', message);
      }
    },
    [project, toast, user],
  );

  if (loading || isProfileReady === false) return <PageLoader label="Loading project…" />;

  if (error) {
    return (
      <div>
        <PageHeader title="Project" backTo="/projects" backLabel="All projects" />
        <ErrorState
          message={error}
          onRetry={refresh}
          title="We could not load this project"
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <PageHeader title="Project not found" backTo="/projects" backLabel="All projects" />
        <ErrorState
          title="This project no longer exists"
          message="It may have been deleted, or the link is incorrect. Your other projects are still available."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton to="/projects">Back to projects</LinkButton>
          <LinkButton to="/dashboard" variant="secondary">
            Go to dashboard
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        backTo="/projects"
        backLabel="All projects"
        description={`${project.category} · started ${formatIsoDate(project.startDate)}`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditOpen(true)}
              leadingIcon={<Pencil className="size-4" aria-hidden />}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(true)}
              className="text-ink-muted hover:text-critical"
              leadingIcon={<Trash2 className="size-4" aria-hidden />}
            >
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Project overview"
              actions={<StatusBadge status={project.status} />}
            />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted break-anywhere">{project.description}</p>

            <div className="mt-6">
              <ProgressBar
                value={project.progress}
                label={project.progressMode === 'tasks' ? 'Progress (from tasks)' : 'Progress'}
                showValue
                srDescription={`${project.name} is ${project.progress}% complete`}
              />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink">Technologies</h3>
              <div className="mt-2">
                <TagList items={project.technologies} max={20} emptyLabel="No technologies listed yet" />
              </div>
            </div>
          </Card>

          <TaskList
            tasks={tasksState.items}
            loading={tasksState.loading}
            error={tasksState.error ?? taskError}
            onCreate={handleCreateTask}
            onUpdate={handleUpdateTask}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onRetry={tasksState.refresh}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Links" description="Where people can find this project." />
            <div className="mt-4 space-y-2">
              {project.githubUrl ? (
                <ExternalLinkButton
                  href={project.githubUrl}
                  fullWidth
                  variant="secondary"
                  leadingIcon={<Github className="size-4" aria-hidden />}
                >
                  View on GitHub
                </ExternalLinkButton>
              ) : null}
              {project.liveUrl ? (
                <ExternalLinkButton
                  href={project.liveUrl}
                  fullWidth
                  variant="secondary"
                  leadingIcon={<ExternalLink className="size-4" aria-hidden />}
                >
                  Open live demo
                </ExternalLinkButton>
              ) : null}
              {project.imageUrl ? (
                <ExternalLinkButton
                  href={project.imageUrl}
                  fullWidth
                  variant="secondary"
                  leadingIcon={<ExternalLink className="size-4" aria-hidden />}
                >
                  View preview image
                </ExternalLinkButton>
              ) : null}
              {!project.githubUrl && !project.liveUrl && !project.imageUrl ? (
                <p className="text-sm text-ink-subtle">
                  No links yet. Add a GitHub or live demo URL by editing this project.
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Project timeline" description="Key dates for this project." />
            <div className="mt-5">
              <ProjectTimeline project={project} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Tasks at a glance" />
            <dl className="mt-4 space-y-2 text-sm">
              {[
                { label: 'Total tasks', value: taskStats.total },
                { label: 'Completed', value: taskStats.completed },
                { label: 'Remaining', value: taskStats.remaining },
                { label: 'Completion', value: `${taskStats.percentComplete}%` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="font-medium text-ink tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
            {project.progressMode === 'tasks' ? (
              <p className="mt-4 text-xs text-ink-subtle">
                This project calculates progress from its tasks, so completing a task updates the bar above
                automatically.
              </p>
            ) : (
              <p className="mt-4 text-xs text-ink-subtle">
                Progress is set manually. Switch on “Calculate progress from tasks” when editing to keep it
                automatic.
              </p>
            )}
            <Link
              to="/projects"
              className="mt-4 inline-flex text-sm font-medium text-brand hover:underline"
            >
              Back to all projects
            </Link>
          </Card>
        </div>
      </div>

      <ProjectFormModal open={editOpen} project={project} onClose={() => setEditOpen(false)} />

      <ConfirmDialog
        open={deleteOpen}
        destructive
        title="Delete this project?"
        description={`“${project.name}” and all of its tasks will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete project"
        cancelLabel="Keep project"
        loading={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
