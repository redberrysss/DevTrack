import type { GithubRepo } from '@/types';
import type { RepoSortOption } from '@/utils/constants';

export interface RepoFilterState {
  search: string;
  language: string;
  sort: RepoSortOption;
  hideForks: boolean;
}

function timeValue(iso: string): number {
  if (!iso) return 0;
  const parsed = new Date(iso).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function extractLanguages(repos: GithubRepo[]): string[] {
  const languages = new Set<string>();
  for (const repo of repos) {
    if (repo.language) languages.add(repo.language);
  }
  return Array.from(languages).sort((a, b) => a.localeCompare(b));
}

export function sortRepos(repos: GithubRepo[], sort: RepoSortOption): GithubRepo[] {
  const sorted = [...repos];
  switch (sort) {
    case 'stars':
      return sorted.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'created':
      return sorted.sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt));
    case 'updated':
    default:
      return sorted.sort((a, b) => timeValue(b.updatedAt) - timeValue(a.updatedAt));
  }
}

export function filterAndSortRepos(repos: GithubRepo[], filters: RepoFilterState): GithubRepo[] {
  const needle = filters.search.trim().toLowerCase();
  const filtered = repos.filter((repo) => {
    if (filters.hideForks && repo.isFork) return false;
    if (filters.language !== 'all' && repo.language !== filters.language) return false;
    if (!needle) return true;
    return (
      repo.name.toLowerCase().includes(needle) ||
      (repo.description ?? '').toLowerCase().includes(needle) ||
      repo.topics.some((topic) => topic.toLowerCase().includes(needle)) ||
      (repo.language ?? '').toLowerCase().includes(needle)
    );
  });
  return sortRepos(filtered, filters.sort);
}
