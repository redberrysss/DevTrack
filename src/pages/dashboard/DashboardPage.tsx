import { useMemo } from 'react';
import { CheckCircle2, CircleDashed, FolderKanban, ListChecks, Star } from 'lucide-react';
import { Github } from '@/components/ui/BrandIcons';

import { useAuth } from '@/hooks/useAuth';
import { useAllTasks, useProjects } from '@/hooks/useFirestoreData';
import { useGithubUser } from '@/hooks/useGithubUser';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/hooks/useToast';
import { computeProjectStats, computeTaskStats } from '@/lib/stats';
import { normaliseUsername } from '@/services/github/githubService';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/LinkButton';
import { ErrorState, EmptyState } from '@/components/ui/States';
import { SkeletonChart } from '@/components/ui/Loading';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { TaskProgressCard } from '@/components/dashboard/TaskProgressCard';
import { GithubSummaryCard } from '@/components/dashboard/GithubSummaryCard';
import { ProjectsByStatusChart } from '@/components/charts/ProjectsByStatusChart';
import { TaskCompletionChart } from '@/components/charts/TaskCompletionChart';
import { GithubLanguagesChart } from '@/components/charts/GithubLanguagesChart';
import { getFriendlyError } from '@/utils/errors';
import { formatCompactNumber } from '@/utils/format';

function greetingFor(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  usePageMeta({ title: 'Dashboard — DevTrack', description: 'Your projects, tasks and GitHub activity at a glance.' });

  const { profile, user } = useAuth();
  const toast = useToast();
  const userId = user?.uid ?? null;

  const { items: projects, loading: projectsLoading, error: projectsError, refresh } = useProjects(userId);
  const { items: tasks, loading: tasksLoading, error: tasksError, refresh: refreshTasks } = useAllTasks(userId);

  const connectedUsername = profile?.githubUsername ? normaliseUsername(profile.githubUsername) : null;
  const github = useGithubUser(connectedUsername);

  const projectStats = useMemo(() => computeProjectStats(projects), [projects]);
  const taskStats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const githubRepos = useMemo(() => github.data?.repos ?? [], [github.data]);
  const totalStars = useMemo(() => githubRepos.reduce((total, repo) => total + repo.stars, 0), [githubRepos]);
  const displayName = profile?.name?.trim() || user?.displayName || 'Developer';

  const handleGithubRefresh = () => {
    try {
      github.refresh();
      toast.info('Refreshing GitHub data', 'Fetching the latest profile and repositories.');
    } catch (error) {
      toast.error('Could not refresh', getFriendlyError(error, 'Please try again.'));
    }
  };

  const hasNoData = !projectsLoading && projects.length === 0 && tasks.length === 0;

  return (
    <div>
      <PageHeader
        title={`${greetingFor()}, ${displayName.split(' ')[0] ?? displayName}`}
        description="Here is what you are working on right now."
        actions={
          <>
            <LinkButton to="/github" variant="secondary" leadingIcon={<Github className="size-4" aria-hidden />}>
              GitHub
            </LinkButton>
            <LinkButton to="/projects" leadingIcon={<FolderKanban className="size-4" aria-hidden />}>
              Projects
            </LinkButton>
          </>
        }
      />

      {projectsError ? (
        <ErrorState
          message={projectsError}
          onRetry={refresh}
          className="mb-6"
          title="We could not load your projects"
        />
      ) : null}

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total projects"
          value={projectStats.total}
          icon={FolderKanban}
          loading={projectsLoading}
          hint={`${projectStats.planning} in planning`}
          to="/projects"
        />
        <StatCard
          label="In progress"
          value={projectStats.inProgress}
          icon={CircleDashed}
          loading={projectsLoading}
          hint={`${projectStats.archived} archived`}
          to="/projects"
        />
        <StatCard
          label="Completed"
          value={projectStats.completed}
          icon={CheckCircle2}
          loading={projectsLoading}
          hint={`${projectStats.averageProgress}% average progress`}
          to="/projects"
        />
        <StatCard
          label="Tasks completed"
          value={`${taskStats.completed}/${taskStats.total}`}
          icon={ListChecks}
          loading={tasksLoading}
          hint={tasksError ? 'Could not load tasks' : `${taskStats.remaining} still open`}
        />
        <StatCard
          label="GitHub repositories"
          value={connectedUsername ? (github.loading ? '—' : githubRepos.length) : '—'}
          icon={Github}
          loading={github.loading}
          hint={connectedUsername ? `@${connectedUsername}` : 'Not connected yet'}
          to="/github"
        />
        <StatCard
          label="GitHub stars"
          value={connectedUsername ? (github.loading ? '—' : formatCompactNumber(totalStars)) : '—'}
          icon={Star}
          loading={github.loading}
          hint={connectedUsername ? 'Across public repositories' : 'Not connected yet'}
          to="/github"
        />
      </section>

      {hasNoData ? (
        <EmptyState
          className="mt-6"
          icon={<FolderKanban className="size-5" />}
          title="Your dashboard is ready"
          description="Nothing has been tracked yet. Create your first project, add a few tasks, then connect GitHub to see your activity here."
          action={
            <LinkButton to="/projects" size="sm">
              Create your first project
            </LinkButton>
          }
        />
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent projects"
            description="The five most recently updated projects."
            actions={
              <LinkButton to="/projects" variant="ghost" size="sm">
                View all
              </LinkButton>
            }
          />
          <div className="mt-5">
            <RecentProjects projects={projects.slice(0, 5)} loading={projectsLoading} />
          </div>
        </Card>

        <div className="space-y-6">
          <TaskProgressCard tasks={tasks} loading={tasksLoading} />
          {tasksError ? (
            <ErrorState message={tasksError} onRetry={refreshTasks} compact title="Task data unavailable" />
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {projectsLoading ? <SkeletonChart /> : <ProjectsByStatusChart projects={projects} />}
        {tasksLoading ? <SkeletonChart /> : <TaskCompletionChart tasks={tasks} />}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GithubSummaryCard
          username={connectedUsername}
          user={github.data?.user ?? null}
          repos={githubRepos}
          loading={github.loading}
          error={github.error}
          onRetry={handleGithubRefresh}
        />
        {github.loading && connectedUsername ? <SkeletonChart height={200} /> : <GithubLanguagesChart repos={githubRepos} />}
      </div>
    </div>
  );
}
