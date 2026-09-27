import type { GithubRateLimit, GithubRepo, GithubSnapshot, GithubUser } from '@/types';
import { siteConfig } from '@/config/site';
import { AppError } from '@/utils/errors';
import { GITHUB_API_BASE, GITHUB_CACHE_TTL_MS } from '@/utils/constants';

const USER_CACHE_PREFIX = 'devtrack.gh.user.';
const REPO_CACHE_PREFIX = 'devtrack.gh.repos.';

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

function readCache<T>(key: string): T | null {
  const now = Date.now();
  const memory = memoryCache.get(key);
  if (memory && memory.expiresAt > now) return memory.value as T;
  if (memory) memoryCache.delete(key);

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= now) {
      sessionStorage.removeItem(key);
      return null;
    }
    memoryCache.set(key, parsed as CacheEntry<unknown>);
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown, ttl: number): void {
  const entry = { value, expiresAt: Date.now() + ttl };
  memoryCache.set(key, entry);
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage can be unavailable (private mode); the memory cache still works.
  }
}

export function clearGithubCache(username?: string): void {
  if (username) {
    memoryCache.delete(USER_CACHE_PREFIX + username.toLowerCase());
    memoryCache.delete(REPO_CACHE_PREFIX + username.toLowerCase());
    return;
  }
  memoryCache.clear();
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('devtrack.gh.'))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
}

export function normaliseUsername(username: string): string {
  return username.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/^@/, '').replace(/\/+$/, '');
}

/**
 * Requests go to `api.github.com` by default (public data, no token, 60
 * requests/hour per IP). Point `VITE_GITHUB_PROXY_URL` at a server-side proxy
 * to use a private token without ever shipping it to the browser.
 */
function buildUrl(path: string): string {
  const proxy = siteConfig.githubProxyUrl.replace(/\/+$/, '');
  if (proxy) return `${proxy}${path}`;
  return `${GITHUB_API_BASE}${path}`;
}

function readRateLimit(response: Response): GithubRateLimit | undefined {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const limit = response.headers.get('x-ratelimit-limit');
  const reset = response.headers.get('x-ratelimit-reset');
  if (remaining === null || limit === null) return undefined;
  return {
    remaining: Number(remaining),
    limit: Number(limit),
    resetAt: reset ? Number(reset) * 1000 : Date.now(),
  };
}

function rateLimitMessage(rateLimit: GithubRateLimit | undefined): string {
  if (!rateLimit) return 'GitHub has temporarily limited how many requests this device can make.';
  const minutes = Math.max(1, Math.round((rateLimit.resetAt - Date.now()) / 60000));
  return `You have reached GitHub's public API limit of ${rateLimit.limit} requests per hour. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

async function request<T>(path: string, signal?: AbortSignal): Promise<{ data: T; rateLimit?: GithubRateLimit }> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      signal,
      headers: { Accept: 'application/vnd.github+json' },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new AppError(
      'Could not reach GitHub. Check your internet connection and try again.',
      'github/network',
    );
  }

  const rateLimit = readRateLimit(response);

  if (response.ok) {
    try {
      return { data: (await response.json()) as T, rateLimit };
    } catch {
      throw new AppError('GitHub returned an unexpected response. Try again shortly.', 'github/bad-response');
    }
  }

  if (response.status === 404) {
    throw new AppError('We could not find that GitHub account. Check the username and try again.', 'github/not-found');
  }

  if (response.status === 401) {
    throw new AppError('GitHub rejected this request. Please try again later.', 'github/unauthorized');
  }

  if ((response.status === 403 || response.status === 429) && (rateLimit?.remaining === 0 || response.status === 429)) {
    throw new AppError(rateLimitMessage(rateLimit), 'github/rate-limit');
  }

  if (response.status === 422) {
    throw new AppError('That does not look like a valid GitHub username.', 'github/invalid-username');
  }

  if (response.status >= 500) {
    throw new AppError('GitHub is having trouble right now. Please try again in a moment.', 'github/unavailable');
  }

  throw new AppError('Something went wrong while contacting GitHub. Please try again.', 'github/unknown');
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function mapGithubUser(raw: Record<string, unknown>, username: string): GithubUser {
  const login = toNullableString(raw.login) ?? username;
  return {
    login,
    name: toNullableString(raw.name),
    avatarUrl: toNullableString(raw.avatar_url) ?? `https://github.com/${login}.png`,
    bio: toNullableString(raw.bio),
    company: toNullableString(raw.company),
    location: toNullableString(raw.location),
    blog: toNullableString(raw.blog),
    followers: toNumber(raw.followers),
    following: toNumber(raw.following),
    publicRepos: toNumber(raw.public_repos),
    publicGists: toNumber(raw.gists),
    profileUrl: toNullableString(raw.html_url) ?? `https://github.com/${login}`,
    htmlUrl: toNullableString(raw.html_url) ?? `https://github.com/${login}`,
    createdAt: toNullableString(raw.created_at) ?? new Date().toISOString(),
  };
}

function mapGithubRepo(raw: Record<string, unknown>): GithubRepo {
  const name = toNullableString(raw.name) ?? 'repository';
  const fullName = toNullableString(raw.full_name) ?? name;
  return {
    id: toNumber(raw.id),
    name,
    fullName,
    description: toNullableString(raw.description),
    language: toNullableString(raw.language),
    stars: toNumber(raw.stargazers_count),
    forks: toNumber(raw.forks_count),
    watchers: toNumber(raw.watchers_count),
    openIssues: toNumber(raw.open_issues_count),
    isFork: raw.fork === true,
    isArchived: raw.archived === true,
    topics: Array.isArray(raw.topics) ? raw.topics.filter((item: unknown): item is string => typeof item === 'string') : [],
    license: toNullableString((raw.license as Record<string, unknown> | null)?.spdx_id),
    url: toNullableString(raw.html_url) ?? `https://github.com/${fullName}`,
    homepage: toNullableString(raw.homepage),
    createdAt: toNullableString(raw.created_at) ?? '',
    updatedAt: toNullableString(raw.updated_at) ?? '',
    pushedAt: toNullableString(raw.pushed_at) ?? '',
  };
}

export interface GithubResult {
  data: GithubSnapshot;
  fromCache: boolean;
}

let lastKnownRateLimit: GithubRateLimit | undefined;

export async function fetchGithubUser(username: string, signal?: AbortSignal): Promise<GithubUser> {
  const handle = normaliseUsername(username);
  const cacheKey = USER_CACHE_PREFIX + handle.toLowerCase();
  const cached = readCache<GithubUser>(cacheKey);
  if (cached) return cached;

  const { data, rateLimit } = await request<Record<string, unknown>>(
    `/users/${encodeURIComponent(handle)}`,
    signal,
  );
  if (rateLimit) lastKnownRateLimit = rateLimit;
  const user = mapGithubUser(data, handle);
  writeCache(cacheKey, user, GITHUB_CACHE_TTL_MS);
  return user;
}

export async function fetchGithubRepos(username: string, signal?: AbortSignal): Promise<GithubRepo[]> {
  const handle = normaliseUsername(username);
  const cacheKey = REPO_CACHE_PREFIX + handle.toLowerCase();
  const cached = readCache<GithubRepo[]>(cacheKey);
  if (cached) return cached;

  const { data, rateLimit } = await request<Array<Record<string, unknown>>>(
    `/users/${encodeURIComponent(handle)}/repos?per_page=100&sort=updated&type=owner`,
    signal,
  );
  if (rateLimit) lastKnownRateLimit = rateLimit;
  const repos = Array.isArray(data) ? data.map(mapGithubRepo) : [];
  writeCache(cacheKey, repos, GITHUB_CACHE_TTL_MS);
  return repos;
}

/** Resolves the profile and repositories with a single UI update. */
export async function fetchGithubSnapshot(username: string, signal?: AbortSignal): Promise<GithubResult> {
  const handle = normaliseUsername(username);
  const cachedUser = readCache<GithubUser>(USER_CACHE_PREFIX + handle.toLowerCase());
  const cachedRepos = readCache<GithubRepo[]>(REPO_CACHE_PREFIX + handle.toLowerCase());

  if (cachedUser && cachedRepos) {
    return {
      data: { user: cachedUser, repos: cachedRepos, fetchedAt: Date.now(), rateLimit: lastKnownRateLimit },
      fromCache: true,
    };
  }

  const [user, repos] = await Promise.all([fetchGithubUser(handle, signal), fetchGithubRepos(handle, signal)]);

  return {
    data: { user, repos, fetchedAt: Date.now(), rateLimit: lastKnownRateLimit },
    fromCache: false,
  };
}
