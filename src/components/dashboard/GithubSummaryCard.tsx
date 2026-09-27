
import { Github } from '@/components/ui/BrandIcons';

import type { GithubRepo, GithubUser } from '@/types';
import { summariseGithub } from '@/lib/stats';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Loading';
import { LinkButton } from '@/components/ui/LinkButton';
import { formatNumber } from '@/utils/format';

export interface GithubSummaryCardProps {
  username: string | null;
  user: GithubUser | null;
  repos: GithubRepo[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function GithubSummaryCard({ username, user, repos, loading, error, onRetry }: GithubSummaryCardProps) {
  if (!username) {
    return (
      <Card>
        <CardHeader
          title="GitHub activity"
          description="Connect your account to see repositories, stars and languages."
        />
        <div className="mt-5 flex flex-col items-start gap-3 rounded-[var(--radius-control)] border border-dashed border-line-strong bg-surface-muted/40 p-5">
          <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-surface text-ink-subtle">
            <Github className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">No GitHub account connected</p>
            <p className="mt-1 text-sm text-ink-muted">
              Add your username to see public repositories, stars and your most used languages.
            </p>
          </div>
          <LinkButton to="/github" size="sm">
            Connect GitHub
          </LinkButton>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="GitHub activity" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </Card>
    );
  }

  if (error || !user) {
    return (
      <Card>
        <CardHeader title="GitHub activity" />
        <div className="mt-5 rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm font-medium text-ink break-anywhere">{error ?? 'We could not load your GitHub data.'}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </Card>
    );
  }

  const summary = summariseGithub(repos);

  return (
    <Card>
      <CardHeader
        title="GitHub activity"
        description={`Connected as @${user.login}`}
        actions={
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Refresh
          </Button>
        }
      />

      <div className="mt-5 flex items-center gap-3">
        <Avatar name={user.name ?? user.login} src={user.avatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{user.name ?? user.login}</p>
          <p className="truncate text-xs text-ink-subtle">@{user.login}</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Repositories', value: formatNumber(summary.totalRepos) },
          { label: 'Stars', value: formatNumber(summary.totalStars) },
          { label: 'Forks', value: formatNumber(summary.totalForks) },
          { label: 'Languages', value: formatNumber(summary.languages) },
        ].map((item) => (
          <div key={item.label} className="rounded-[var(--radius-control)] border border-line bg-surface-muted/50 p-3">
            <dt className="text-xs font-medium text-ink-muted">{item.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-ink tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-ink-subtle break-anywhere">
        {formatNumber(user.publicRepos)} public repositories · {formatNumber(user.followers)} followers ·{' '}
        {summary.topLanguage ? `mostly ${summary.topLanguage}` : 'no primary language detected'}
      </p>
    </Card>
  );
}
