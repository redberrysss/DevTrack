import { useMemo, useState, type FormEvent } from 'react';
import { Link2Off, RefreshCw, Search, SearchX, Unplug } from 'lucide-react';
import { Github } from '@/components/ui/BrandIcons';

import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/hooks/useToast';
import { useGithubUser } from '@/hooks/useGithubUser';
import { extractLanguages, filterAndSortRepos, type RepoFilterState } from '@/lib/githubFilters';
import { siteConfig } from '@/config/site';
import { normaliseUsername } from '@/services/github/githubService';
import { getFriendlyError } from '@/utils/errors';
import { REPO_SORT_OPTIONS, type RepoSortOption } from '@/utils/constants';
import { formatNumber } from '@/utils/format';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { EmptyState, ErrorState, InlineNotice } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Loading';
import { GithubProfileCard } from '@/components/github/GithubProfileCard';
import { RepoList } from '@/components/github/RepoList';

const defaultRepoFilters: RepoFilterState = {
  search: '',
  language: 'all',
  sort: 'updated',
  hideForks: false,
};

export default function GithubPage() {
  usePageMeta({
    title: 'GitHub — DevTrack',
    description: 'Connect a GitHub account to view public repositories, stars and languages.',
  });

  const { profile, saveProfile } = useAuth();
  const toast = useToast();

  const connected = profile?.githubUsername ? normaliseUsername(profile.githubUsername) : null;
  const [draftUsername, setDraftUsername] = useState(connected ?? siteConfig.defaultGithubUsername);
  const [activeUsername, setActiveUsername] = useState<string | null>(connected);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingConnection, setSavingConnection] = useState(false);
  const [filters, setFilters] = useState<RepoFilterState>(defaultRepoFilters);

  // A freshly connected account starts showing immediately, without an effect.
  if (connected && !activeUsername) setActiveUsername(connected);

  const { data, loading, error, refresh } = useGithubUser(activeUsername);

  const repos = useMemo(() => data?.repos ?? [], [data]);
  const languages = useMemo(() => extractLanguages(repos), [repos]);
  const visibleRepos = useMemo(() => filterAndSortRepos(repos, filters), [repos, filters]);

  const stars = useMemo(() => repos.reduce((total, repo) => total + repo.stars, 0), [repos]);
  const forks = useMemo(() => repos.reduce((total, repo) => total + repo.forks, 0), [repos]);

  const handleLookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const handle = normaliseUsername(draftUsername);
    if (!handle) {
      setUsernameError('Enter a GitHub username to continue.');
      return;
    }
    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(handle)) {
      setUsernameError('That does not look like a valid GitHub username.');
      return;
    }
    setUsernameError(null);
    setActiveUsername(handle);
    setFilters(defaultRepoFilters);
  };

  const handleConnect = async () => {
    if (!activeUsername) return;
    setSavingConnection(true);
    try {
      await saveProfile({ githubUsername: activeUsername });
      toast.success('GitHub connected', `DevTrack will keep @${activeUsername} in sync.`);
    } catch (connectError) {
      const message = getFriendlyError(connectError, 'We could not save your GitHub username.');
      toast.error('Could not connect', message);
    } finally {
      setSavingConnection(false);
    }
  };

  const handleDisconnect = async () => {
    setSavingConnection(true);
    try {
      await saveProfile({ githubUsername: '' });
      toast.success('GitHub disconnected', 'Your dashboard no longer tracks GitHub data.');
    } catch (disconnectError) {
      const message = getFriendlyError(disconnectError, 'We could not update your profile.');
      toast.error('Could not disconnect', message);
    } finally {
      setSavingConnection(false);
    }
  };

  const rateLimitLow = data?.rateLimit ? data.rateLimit.remaining <= 5 : false;
  const isConnected = Boolean(connected) && connected === activeUsername;

  return (
    <div>
      <PageHeader
        title="GitHub"
        description="Look up any public account to review repositories, stars and languages."
      />

      <Card>
        <form onSubmit={handleLookup} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <label htmlFor="github-username" className="mb-1.5 block text-sm font-medium text-ink">
              GitHub username
            </label>
            <Input
              id="github-username"
              value={draftUsername}
              onChange={(event) => {
                setDraftUsername(event.target.value);
                setUsernameError(null);
              }}
              placeholder="e.g. octocat"
              autoComplete="off"
              spellCheck={false}
              invalid={Boolean(usernameError)}
              aria-describedby={usernameError ? 'github-username-error' : 'github-username-hint'}
              leadingSlot={<Search className="size-4" />}
            />
            {usernameError ? (
              <p id="github-username-error" role="alert" className="mt-1.5 text-xs font-medium text-critical">
                {usernameError}
              </p>
            ) : (
              <p id="github-username-hint" className="mt-1.5 text-xs text-ink-subtle">
                Public data only — no GitHub sign-in or token is required.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 sm:pt-7">
            <Button type="submit" loading={loading} loadingText="Loading…" leadingIcon={<Github className="size-4" aria-hidden />}>
              View profile
            </Button>
            {activeUsername ? (
              <Button
                type="button"
                variant="secondary"
                onClick={refresh}
                aria-label="Refresh GitHub data"
                className="px-2.5"
              >
                <RefreshCw className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </form>

        {activeUsername ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-sm text-ink-muted">
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5">
                  <Github className="size-4" aria-hidden />
                  Tracking <span className="font-medium text-ink">@{activeUsername}</span> on your dashboard.
                </span>
              ) : (
                <span>
                  You are looking at <span className="font-medium text-ink">@{activeUsername}</span>.
                </span>
              )}
            </p>
            {isConnected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                loading={savingConnection}
                leadingIcon={<Unplug className="size-3.5" aria-hidden />}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleConnect}
                loading={savingConnection}
                loadingText="Connecting…"
                leadingIcon={<Link2Off className="size-3.5" aria-hidden />}
              >
                Connect this account
              </Button>
            )}
          </div>
        ) : null}
      </Card>

      {error ? (
        <ErrorState
          className="mt-6"
          title="We could not load that GitHub account"
          message={error}
          onRetry={refresh}
          retryLabel="Try again"
        />
      ) : null}

      {rateLimitLow ? (
        <InlineNotice tone="caution" className="mt-6">
          You are close to GitHub&apos;s public API limit of {data?.rateLimit?.limit ?? 60} requests per hour.
          {data?.rateLimit?.resetAt
            ? ` It resets at ${new Date(data.rateLimit.resetAt).toLocaleTimeString()}.`
            : ''}
        </InlineNotice>
      ) : null}

      {loading && !data ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
            <div className="flex gap-4">
              <Skeleton className="size-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
            <Skeleton className="h-4 w-40" />
            <div className="mt-4 space-y-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="mt-6">
            <GithubProfileCard user={data.user} />
          </div>

          <Card className="mt-6">
            <CardHeader
              title="Repositories"
              description={`${formatNumber(repos.length)} public repositories · ${formatNumber(stars)} stars · ${formatNumber(forks)} forks`}
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="relative">
                <label htmlFor="repo-search" className="sr-only">
                  Search repositories
                </label>
                <Input
                  id="repo-search"
                  type="search"
                  value={filters.search}
                  placeholder="Search repositories and topics"
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  leadingSlot={<Search className="size-4" />}
                />
              </div>

              <div>
                <label htmlFor="repo-language" className="sr-only">
                  Filter by language
                </label>
                <Select
                  id="repo-language"
                  value={filters.language}
                  onChange={(event) => setFilters((current) => ({ ...current, language: event.target.value }))}
                >
                  <option value="all">All languages</option>
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="repo-sort" className="sr-only">
                  Sort repositories
                </label>
                <Select
                  id="repo-sort"
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, sort: event.target.value as RepoSortOption }))
                  }
                >
                  {REPO_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-5">
              {repos.length === 0 ? (
                <EmptyState
                  icon={<Github className="size-5" />}
                  title="No public repositories"
                  description={`@${data.user.login} has not published any public repositories yet.`}
                  className="border-none bg-surface-muted/40 py-10"
                />
              ) : visibleRepos.length === 0 ? (
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No repositories match your filters"
                  description="Try a different search term or language."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setFilters(defaultRepoFilters)}>
                      Clear filters
                    </Button>
                  }
                  className="border-none bg-surface-muted/40 py-10"
                />
              ) : (
                <RepoList repos={visibleRepos} />
              )}
            </div>
          </Card>
        </>
      ) : null}

      {!activeUsername && !loading ? (
        <EmptyState
          className="mt-6"
          icon={<Github className="size-5" />}
          title="Look up a GitHub profile"
          description="Enter any public username above to see their profile, repositories, stars and languages."
        />
      ) : null}
    </div>
  );
}
