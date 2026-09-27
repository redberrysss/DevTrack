import { ExternalLink, GitFork, Star } from 'lucide-react';

import type { GithubRepo } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDateShort, formatNumber, formatRelativeTime } from '@/utils/format';

export interface RepoListProps {
  repos: GithubRepo[];
}

export function RepoList({ repos }: RepoListProps) {
  return (
    <ul className="divide-y divide-[var(--line)]">
      {repos.map((repo) => (
        <li key={repo.id} className="py-5 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="break-anywhere text-sm font-semibold text-ink hover:underline"
                >
                  {repo.fullName}
                </a>
                {repo.language ? (
                  <Badge tone="brand" dot>
                    {repo.language}
                  </Badge>
                ) : null}
                {repo.isFork ? <Badge tone="muted">Fork</Badge> : null}
                {repo.isArchived ? <Badge tone="caution">Archived</Badge> : null}
              </div>

              <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted break-anywhere">
                {repo.description ?? 'No description provided for this repository.'}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-subtle">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5" aria-hidden />
                  {formatNumber(repo.stars)} stars
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitFork className="size-3.5" aria-hidden />
                  {formatNumber(repo.forks)} forks
                </span>
                <span>Updated {formatRelativeTime(repo.updatedAt)}</span>
                <span className="hidden sm:inline">Created {formatDateShort(repo.createdAt)}</span>
              </div>

              {repo.topics.length > 0 ? (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {repo.topics.slice(0, 5).map((topic) => (
                    <li
                      key={topic}
                      className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-subtle"
                    >
                      #{topic}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {repo.homepage ? (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-surface-hover"
                >
                  Live site
                </a>
              ) : null}
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-surface-hover"
              >
                View repository
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
