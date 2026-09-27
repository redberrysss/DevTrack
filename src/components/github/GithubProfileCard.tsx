import { Building2, Link2, MapPin, UserPlus, Users } from 'lucide-react';

import type { GithubUser } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ExternalLinkButton } from '@/components/ui/LinkButton';
import { formatDate, formatNumber } from '@/utils/format';

export function GithubProfileCard({ user }: { user: GithubUser }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={user.name ?? user.login} src={user.avatarUrl} size="xl" className="sm:size-20" />

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink break-anywhere">{user.name ?? user.login}</h2>
          <p className="text-sm text-ink-muted">@{user.login}</p>
          {user.bio ? <p className="mt-2 text-sm text-ink-muted break-anywhere">{user.bio}</p> : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-subtle">
            {user.company ? (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5" aria-hidden />
                {user.company}
              </span>
            ) : null}
            {user.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {user.location}
              </span>
            ) : null}
            {user.blog ? (
              <a
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 break-anywhere hover:text-ink hover:underline"
              >
                <Link2 className="size-3.5" aria-hidden />
                {user.blog}
              </a>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              Joined {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Public repos', value: user.publicRepos },
          { label: 'Followers', value: user.followers },
          { label: 'Following', value: user.following },
          { label: 'Public gists', value: user.publicGists },
        ].map((item) => (
          <div key={item.label} className="rounded-[var(--radius-control)] border border-line bg-surface-muted/50 p-3">
            <dt className="text-xs font-medium text-ink-muted">{item.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-ink tabular-nums">{formatNumber(item.value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <ExternalLinkButton
          href={user.profileUrl}
          variant="secondary"
          size="sm"
          leadingIcon={<UserPlus className="size-3.5" aria-hidden />}
        >
          View profile on GitHub
        </ExternalLinkButton>
      </div>
    </div>
  );
}
