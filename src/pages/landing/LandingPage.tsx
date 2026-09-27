import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { LANDING_DESCRIPTION, LANDING_TITLE } from '@/utils/constants';
import { siteConfig } from '@/config/site';
import { useGithubUser } from '@/hooks/useGithubUser';
import { summariseGithub } from '@/lib/stats';
import { extractLanguages } from '@/lib/githubFilters';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/LinkButton';
import { Github } from '@/components/ui/BrandIcons';
import { formatCompactNumber } from '@/utils/format';

interface Feature {
  icon: typeof FolderKanban;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: FolderKanban,
    title: 'Projects with real context',
    description:
      'Every project keeps its description, category, technology stack, live URL, repository link and due date in one place, so nothing gets lost in a notes file.',
  },
  {
    icon: ListChecks,
    title: 'Tasks that move the needle',
    description:
      'Break a project into tasks, tick them off, and let the progress bar update itself. DevTrack can also keep a project’s progress in sync with its task completion automatically.',
  },
  {
    icon: TrendingUp,
    title: 'A dashboard that reflects reality',
    description:
      'Planning, in-progress, completed and archived counts, task completion and average progress — all computed from the data you entered, never from placeholder numbers.',
  },
  {
    icon: Search,
    title: 'Find anything fast',
    description:
      'Search by name, description or technology, then filter by status and category, sort by date or progress, and scan the result set in a single list.',
  },
  {
    icon: Star,
    title: 'Your GitHub, in context',
    description:
      'Connect a username to pull public profile data, repositories, stars and language breakdown into the same workspace as your projects.',
  },
  {
    icon: User,
    title: 'A profile worth sharing',
    description:
      'Bio, location, skills, education, work history and social links. Everything you entered is available in one shareable place.',
  },
  {
    icon: Moon,
    title: 'Light and dark, by choice',
    description:
      'Follow your system theme or pin DevTrack to light or dark. The preference is remembered on your device and applied before the app renders.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data stays yours',
    description:
      'Firebase security rules mean only you can read or write your own projects, tasks and profile — nobody else, not even by guessing an ID.',
  },
];

const workflowSteps = [
  {
    icon: LayoutDashboard,
    title: 'Sign in and see your workspace',
    description: 'Create an account with an email and password. Your dashboard opens on real, empty data — not a fake demo.',
  },
  {
    icon: FolderKanban,
    title: 'Add the projects you are building',
    description: 'Name it, describe it, pick a status, add the stack and link the live URL and repository.',
  },
  {
    icon: ClipboardList,
    title: 'Track tasks as you work',
    description: 'Create tasks, complete them, and watch project progress and dashboard charts update immediately.',
  },
  {
    icon: Sparkles,
    title: 'Showcase the result',
    description: 'Complete your profile, connect GitHub, and walk into your next interview with a live trail of what you shipped.',
  },
];

export default function LandingPage() {
  usePageMeta({ title: LANDING_TITLE, description: LANDING_DESCRIPTION });

  const { status } = useAuth();
  const demoUsername = siteConfig.defaultGithubUsername;
  const github = useGithubUser(demoUsername);
  const githubSummary = summariseGithub(github.data?.repos ?? []);
  const languages = extractLanguages(github.data?.repos ?? []).slice(0, 4);

  const showSignedIn = status === 'authenticated';

  return (
    <div className="bg-canvas">
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-brand-soft),transparent)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
              <Sparkles className="size-3.5 text-brand" aria-hidden />
              Projects, tasks and GitHub in one workspace
            </span>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Build. Track. <span className="text-brand">Showcase.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-ink-muted sm:text-lg">
              DevTrack keeps your developer projects, their tasks and your public GitHub activity in one honest,
              data-backed place — so the progress you make is the progress you can prove.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {showSignedIn ? (
                <LinkButton to="/dashboard" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                  Open your dashboard
                </LinkButton>
              ) : (
                <LinkButton to="/register" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                  Create your free account
                </LinkButton>
              )}
              <LinkButton to="/demo" variant="secondary" size="lg">
                Explore the live demo
              </LinkButton>
            </div>

            <p className="mt-4 text-xs text-ink-subtle">
              No credit card, no seed data. Everything you see comes from your own account.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-5xl">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
              <div className="flex items-center gap-2 border-b border-line pb-4">
                <span className="size-2.5 rounded-full bg-red-400" aria-hidden />
                <span className="size-2.5 rounded-full bg-amber-400" aria-hidden />
                <span className="size-2.5 rounded-full bg-emerald-400" aria-hidden />
                <p className="ml-2 truncate text-xs text-ink-subtle">devtrack.app/dashboard</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total projects', value: '8', accent: true },
                  { label: 'In progress', value: '3' },
                  { label: 'Tasks completed', value: '41/57' },
                  { label: 'Average progress', value: '62%' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[var(--radius-control)] border border-line bg-surface-muted/60 p-4">
                    <p className="text-xs font-medium text-ink-muted">{item.label}</p>
                    <p
                      className={
                        item.accent ? 'mt-1.5 text-2xl font-semibold tracking-tight text-brand' : 'mt-1.5 text-2xl font-semibold tracking-tight text-ink'
                      }
                    >
                      {item.value}
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className={item.accent ? 'h-full w-[62%] rounded-full bg-brand' : 'h-full w-[40%] rounded-full bg-line-strong'}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-subtle">
                Layout preview. The numbers above are illustrative only — your dashboard is filled from your own
                projects and tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Everything the dashboard promises, working
            </h2>
            <p className="mt-3 text-ink-muted">
              DevTrack is a complete product, not a prototype. Each capability below is implemented end to end and
              verified by the automated test suite.
            </p>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card as="li" key={feature.title} className="h-full">
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-brand-soft text-brand"
                >
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{feature.description}</p>
              </Card>
            ))}
          </ul>
        </div>
      </section>

      <section id="projects" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Projects that remember the whole story
              </h2>
              <p className="mt-3 text-ink-muted">
                A project in DevTrack is more than a title. It carries the description, the category, the technology
                stack you used, the live URL, the repository, the deadline and the progress — plus the full task list
                and the timeline of everything that happened to it.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Filter by status and category, sort by date, progress or name',
                  'Search names, descriptions and technologies at once',
                  'Automatic or manual progress — you decide how a project is measured',
                  'Deleting a project removes its tasks in a single batched write',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {showSignedIn ? (
                  <LinkButton to="/projects" variant="secondary">
                    Open your projects
                  </LinkButton>
                ) : (
                  <LinkButton to="/register" variant="secondary">
                    Start tracking a project
                  </LinkButton>
                )}
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">devtrack-web</h3>
                  <p className="mt-0.5 text-sm text-ink-muted">Web App · In Progress</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 ring-inset dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/25">
                  In Progress
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>Progress</span>
                  <span>68%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full w-[68%] rounded-full bg-blue-500" />
                </div>
              </div>

              <ul className="mt-5 space-y-2.5">
                {[
                  { title: 'Offline task queue', done: true },
                  { title: 'Conflict-free syncing', done: true },
                  { title: 'Timeline view', done: true },
                  { title: 'Export project summary', done: false },
                ].map((task) => (
                  <li key={task.title} className="flex items-center gap-2.5 text-sm">
                    <span
                      aria-hidden
                      className={
                        task.done
                          ? 'flex size-4 items-center justify-center rounded-full bg-brand text-brand-contrast'
                          : 'size-4 rounded-full border-2 border-line-strong'
                      }
                    >
                      {task.done ? <CheckCircle2 className="size-3" /> : null}
                    </span>
                    <span className={task.done ? 'text-ink-subtle line-through' : 'text-ink'}>{task.title}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs text-ink-subtle">
                Sample project card for illustration. Create your own projects to see live data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="github" className="scroll-mt-20 border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-[var(--radius-card)] border border-line bg-canvas p-5 shadow-[var(--shadow-card)] sm:p-6">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-ink-subtle ring-1 ring-line-strong"
                  >
                    <Github className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-ink-muted">
                      {demoUsername ? (
                        <>
                          Live public data for{' '}
                          <span className="font-medium text-ink">@{demoUsername}</span>
                        </>
                      ) : (
                        'Set VITE_GITHUB_USERNAME to show live GitHub data here'
                      )}
                    </p>
                    {github.data?.user ? (
                      <p className="truncate text-lg font-semibold tracking-tight text-ink">
                        {github.data.user.name || github.data.user.login}
                      </p>
                    ) : null}
                  </div>
                </div>

                {demoUsername ? (
                  github.loading ? (
                    <p className="mt-5 text-sm text-ink-muted">Loading public GitHub data…</p>
                  ) : github.error ? (
                    <p className="mt-5 text-sm text-ink-muted">{github.error}</p>
                  ) : (
                    <>
                      <dl className="mt-5 grid grid-cols-3 gap-3">
                        {[
                          { label: 'Repositories', value: githubSummary.totalRepos },
                          { label: 'Stars', value: githubSummary.totalStars },
                          { label: 'Forks', value: githubSummary.totalForks },
                        ].map((item) => (
                          <div key={item.label} className="rounded-[var(--radius-control)] border border-line bg-surface p-3">
                            <dt className="text-xs text-ink-muted">{item.label}</dt>
                            <dd className="mt-0.5 text-lg font-semibold text-ink">
                              {formatCompactNumber(item.value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {languages.length > 0 ? (
                        <p className="mt-4 text-sm text-ink-muted break-anywhere">
                          Languages used: {languages.join(', ')}
                        </p>
                      ) : null}
                    </>
                  )
                ) : (
                  <p className="mt-5 text-sm text-ink-muted">
                    Add a public username in <code className="text-xs">.env.local</code> as{' '}
                    <code className="text-xs">VITE_GITHUB_USERNAME</code> to load real data on this page.
                  </p>
                )}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                GitHub data that belongs to your workspace
              </h2>
              <p className="mt-3 text-ink-muted">
                DevTrack reads the public GitHub REST API — no token is ever shipped to the browser, and nothing is
                written back to GitHub. Responses are cached for five minutes so switching pages does not burn through
                the anonymous rate limit.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Look up any public account, then save it to your profile for the dashboard',
                  'Filter repositories by language and search by name, description or topic',
                  'Sort by last update, stars, name or creation date',
                  'Repository cards show stars, forks, issues, license and the primary language',
                  'Rate-limit and network problems surface as a clear message with a retry action',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {showSignedIn ? (
                  <LinkButton to="/github" variant="secondary">
                    Open the GitHub page
                  </LinkButton>
                ) : (
                  <LinkButton to="/register" variant="secondary">
                    Connect your GitHub
                  </LinkButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">How it works</h2>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Four steps, and everything you enter is persisted to your own Firebase account.
          </p>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="relative rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-contrast"
                  >
                    {index + 1}
                  </span>
                  <step.icon className="size-4 text-ink-subtle" aria-hidden />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="rounded-[var(--radius-card)] border border-line bg-canvas px-6 py-12 text-center shadow-[var(--shadow-card)] sm:px-10">
            <GitBranch className="mx-auto size-6 text-brand" aria-hidden />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Start tracking what you build today
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-muted">
              Your projects, your tasks, your progress. Create an account and the dashboard is yours in under a
              minute.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {showSignedIn ? (
                <LinkButton to="/dashboard" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                  Go to your dashboard
                </LinkButton>
              ) : (
                <LinkButton to="/register" size="lg" trailingIcon={<ArrowRight className="size-4" aria-hidden />}>
                  Create your free account
                </LinkButton>
              )}
              <LinkButton to="/demo" variant="secondary" size="lg">
                See the demo first
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
