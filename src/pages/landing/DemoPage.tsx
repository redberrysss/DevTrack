import { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  GitFork,
  Info,
  Languages,
  ListChecks,
  Sparkles,
  Star,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useGithubUser } from '@/hooks/useGithubUser';
import { siteConfig } from '@/config/site';
import { demoEducation, demoExperience, demoProjects, demoTasks } from '@/lib/demoData';
import { computeProjectStats, computeTaskStats, summariseGithub } from '@/lib/stats';
import { extractLanguages } from '@/lib/githubFilters';
import { formatCompactNumber, formatDateShort } from '@/utils/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/LinkButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TagList } from '@/components/ui/TagInput';
import { InlineNotice } from '@/components/ui/States';
import { Github } from '@/components/ui/BrandIcons';
import { ProjectsByStatusChart } from '@/components/charts/ProjectsByStatusChart';
import { TaskCompletionChart } from '@/components/charts/TaskCompletionChart';
import { StatCard } from '@/components/dashboard/StatCard';

const SampleBanner = () => (
  <InlineNotice tone="info">
    <span className="inline-flex items-start gap-2">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Sample data.</strong> Everything on this page is a fixed, illustrative
        dataset shipped with the app so you can evaluate the interface. It is never written to a database, and your
        own account starts completely empty.
      </span>
    </span>
  </InlineNotice>
);

export default function DemoPage() {
  usePageMeta({
    title: 'Live demo — DevTrack',
    description: 'Explore a sample DevTrack workspace with clearly labelled illustrative data.',
  });

  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';
  const liveUsername = isAuthenticated ? null : siteConfig.defaultGithubUsername;
  const github = useGithubUser(liveUsername);

  const [selectedId, setSelectedId] = useState(demoProjects[0]?.id ?? '');
  const selected = demoProjects.find((entry) => entry.id === selectedId) ?? demoProjects[0];
  const selectedTasks = selected ? demoTasks.filter((task) => task.projectId === selected.id) : [];

  const projectStats = computeProjectStats(demoProjects);
  const taskStats = computeTaskStats(demoTasks);
  const githubSummary = summariseGithub(github.data?.repos ?? []);
  const languages = extractLanguages(github.data?.repos ?? []);

  return (
    <div>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3 py-1 text-xs font-medium text-ink-muted">
            <Sparkles className="size-3.5 text-brand" aria-hidden />
            Interactive sample workspace
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            See what a finished DevTrack workspace looks like
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Below is a complete sample: projects across every status, their tasks, the charts they produce and a
            filled-in profile. The project selector is fully interactive so you can explore the sample data, then
            create an account to build the real thing.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {isAuthenticated ? (
              <LinkButton to="/dashboard" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                Open your real dashboard
              </LinkButton>
            ) : (
              <LinkButton to="/register" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                Create your free account
              </LinkButton>
            )}
            <LinkButton to="/login" variant="secondary" size="lg">
              I already have an account
            </LinkButton>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <SampleBanner />

        <section aria-labelledby="demo-stats">
          <h2 id="demo-stats" className="text-xl font-semibold tracking-tight text-ink">
            What the dashboard computes
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            The same functions your dashboard runs, applied to the sample projects and tasks.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total projects"
              value={projectStats.total}
              icon={FolderKanban}
              hint={`${projectStats.planning} in planning`}
            />
            <StatCard
              label="In progress"
              value={projectStats.inProgress}
              icon={CircleDashed}
              hint={`${projectStats.archived} archived`}
            />
            <StatCard
              label="Completed projects"
              value={projectStats.completed}
              icon={CheckCircle2}
              hint={`${projectStats.averageProgress}% average progress`}
            />
            <StatCard
              label="Tasks completed"
              value={`${taskStats.completed}/${taskStats.total}`}
              icon={ListChecks}
              hint={`${taskStats.remaining} still open`}
              footer={
                <ProgressBar
                  value={taskStats.percentComplete}
                  srDescription={`${taskStats.completed} of ${taskStats.total} tasks completed`}
                  className="h-1.5"
                />
              }
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <ProjectsByStatusChart projects={demoProjects} />
          <TaskCompletionChart tasks={demoTasks} />
        </div>

        <section aria-labelledby="demo-projects">
          <Card>
            <CardHeader
              title={
                <span id="demo-projects">Sample projects</span>
              }
              description="Pick a project to see its task list and progress. Selections do not change any data."
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {demoProjects.map((entry) => {
                const isActive = entry.id === selected?.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelectedId(entry.id)}
                    className={
                      isActive
                        ? 'rounded-[var(--radius-control)] border border-brand bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand'
                        : 'rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-hover'
                    }
                  >
                    {entry.name}
                  </button>
                );
              })}
            </div>

            {selected ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-ink break-anywhere">{selected.name}</h3>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="mt-2 text-sm text-ink-muted break-anywhere">{selected.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
                    <span className="rounded bg-surface-muted px-1.5 py-0.5 font-medium text-ink-muted ring-1 ring-line-strong ring-inset">
                      {selected.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {formatDateShort(selected.startDate)}
                    </span>
                  </div>

                  <div className="mt-5">
                    <ProgressBar
                      value={selected.progress}
                      label="Progress"
                      showValue
                      srDescription={`${selected.progress}% complete`}
                    />
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-medium text-ink-muted">Technology</p>
                    <TagList items={selected.technologies} max={8} emptyLabel="No technologies listed" className="mt-2" />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-ink">Tasks in this project</h4>
                  <ul className="mt-3 space-y-2">
                    {selectedTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-start gap-2.5 rounded-[var(--radius-control)] border border-line bg-surface-muted/50 px-3 py-2 text-sm"
                      >
                        <span
                          aria-hidden
                          className={
                            task.completed
                              ? 'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand text-brand-contrast'
                              : 'mt-0.5 size-4 shrink-0 rounded-full border-2 border-line-strong'
                          }
                        >
                          {task.completed ? <CheckCircle2 className="size-3" /> : null}
                        </span>
                        <span className={task.completed ? 'text-ink-subtle line-through' : 'text-ink'}>
                          {task.title}
                        </span>
                        <span className="sr-only">{task.completed ? '(completed)' : '(open)'}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-ink-subtle">
                    {selectedTasks.filter((task) => task.completed).length} of {selectedTasks.length} complete.
                  </p>
                </div>
              </div>
            ) : null}
          </Card>
        </section>

        <section aria-labelledby="demo-profile">
          <Card>
            <CardHeader
              title={<span id="demo-profile">Sample profile</span>}
              description="The profile page renders exactly these fields from your own Firestore document."
            />
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-ink">Sam Rivera</p>
                <p className="mt-0.5 text-sm text-ink-muted break-anywhere">
                  Frontend engineer building data-heavy interfaces, with a soft spot for developer tooling.
                </p>
                <p className="mt-2 text-xs text-ink-subtle">Amsterdam, Netherlands</p>
                <div className="mt-4">
                  <p className="text-xs font-medium text-ink-muted">Skills</p>
                  <TagList
                    items={['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Firebase', 'Accessibility']}
                    max={12}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-ink-muted">Experience</p>
                  {demoExperience.map((entry) => (
                    <div key={entry.id} className="mt-2">
                      <p className="text-sm font-medium text-ink break-anywhere">{entry.role}</p>
                      <p className="text-sm text-ink-muted break-anywhere">{entry.company}</p>
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {entry.current ? 'Present' : entry.endDate} · {entry.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-muted">Education</p>
                  {demoEducation.map((entry) => (
                    <div key={entry.id} className="mt-2">
                      <p className="text-sm font-medium text-ink break-anywhere">{entry.degree}</p>
                      <p className="text-sm text-ink-muted break-anywhere">{entry.institution}</p>
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {entry.startYear} — {entry.endYear}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section aria-labelledby="demo-github">
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2" id="demo-github">
                  <Github className="size-4" aria-hidden />
                  GitHub integration
                </span>
              }
              description="GitHub panels always read the real public API. This section shows your configured account, or explains how to enable it."
            />

            {!siteConfig.defaultGithubUsername ? (
              <p className="mt-5 text-sm text-ink-muted">
                No public username is configured for this deployment. Set{' '}
                <code className="text-xs">VITE_GITHUB_USERNAME</code> in <code className="text-xs">.env.local</code>{' '}
                and this panel will load real data for that account. Inside the app, every user can connect their own
                username from the GitHub page and their settings.
              </p>
            ) : github.loading ? (
              <p className="mt-5 text-sm text-ink-muted">Loading live public data for @{siteConfig.defaultGithubUsername}…</p>
            ) : github.error ? (
              <p className="mt-5 text-sm text-ink-muted">{github.error}</p>
            ) : (
              <>
                <div className="mt-5 flex items-center gap-4">
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-ink-subtle ring-1 ring-line-strong"
                  >
                    <Github className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-ink-muted">Live public data for @{siteConfig.defaultGithubUsername}</p>
                    <p className="truncate text-lg font-semibold tracking-tight text-ink">
                      {github.data?.user.name || github.data?.user.login}
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Repositories', value: githubSummary.totalRepos, icon: FolderKanban },
                    { label: 'Stars', value: githubSummary.totalStars, icon: Star },
                    { label: 'Forks', value: githubSummary.totalForks, icon: GitFork },
                    { label: 'Languages', value: githubSummary.languages, icon: Languages },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[var(--radius-control)] border border-line bg-surface p-3">
                      <dt className="text-xs text-ink-muted">{item.label}</dt>
                      <dd className="mt-0.5 text-lg font-semibold text-ink">{formatCompactNumber(item.value)}</dd>
                    </div>
                  ))}
                </dl>

                {languages.length > 0 ? (
                  <p className="mt-4 text-sm text-ink-muted break-anywhere">
                    Languages across public repositories: {languages.join(', ')}
                  </p>
                ) : null}
              </>
            )}
          </Card>
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-10 text-center shadow-[var(--shadow-card)] sm:px-10">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Ready to build your own?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            The sample above is a fixed illustration. Your account starts empty and every project, task and profile
            field is yours to fill in.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <LinkButton to="/projects" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                Create a project
              </LinkButton>
            ) : (
              <LinkButton to="/register" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                Create your free account
              </LinkButton>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
