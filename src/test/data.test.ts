import { describe, expect, it } from 'vitest';

import type { GithubRepo, Project, Task } from '@/types';
import {
  computeProjectStats,
  computeTaskStats,
  countProjectsByStatus,
  countReposByLanguage,
  summariseGithub,
} from '@/lib/stats';
import { filterAndSortProjects, matchesProjectSearch } from '@/lib/projectFilters';
import { filterAndSortRepos, sortRepos } from '@/lib/githubFilters';
import { demoProjects, demoTasks } from '@/lib/demoData';

const timestamp = (millis: number) =>
  ({ toMillis: () => millis, seconds: Math.floor(millis / 1000), nanoseconds: 0 }) as unknown as Project['createdAt'];

const project = (overrides: Partial<Project> = {}): Project => ({
  id: 'p1',
  userId: 'u1',
  name: 'Project',
  description: 'A project description',
  category: 'Web App',
  status: 'planning',
  technologies: ['React'],
  githubUrl: '',
  liveUrl: '',
  imageUrl: '',
  progress: 0,
  progressMode: 'manual',
  startDate: '2025-01-01',
  endDate: '',
  createdAt: timestamp(1_700_000_000_000),
  updatedAt: timestamp(1_700_000_000_000),
  ...overrides,
});

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  projectId: 'p1',
  userId: 'u1',
  title: 'Task',
  description: '',
  completed: false,
  completedAt: null,
  createdAt: null,
  updatedAt: null,
  ...overrides,
});

const repo = (overrides: Partial<GithubRepo> = {}): GithubRepo => ({
  id: 1,
  name: 'repo',
  fullName: 'octocat/repo',
  description: 'A repository',
  language: 'TypeScript',
  stars: 0,
  forks: 0,
  watchers: 0,
  openIssues: 0,
  isFork: false,
  isArchived: false,
  topics: [],
  license: null,
  url: 'https://api.github.com/repos/octocat/repo',
  homepage: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  pushedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('project statistics', () => {
  it('counts every status and averages progress', () => {
    const stats = computeProjectStats([
      project({ status: 'planning', progress: 0 }),
      project({ status: 'in-progress', progress: 50 }),
      project({ status: 'completed', progress: 100 }),
      project({ status: 'archived', progress: 100 }),
    ]);

    expect(stats).toEqual({
      total: 4,
      planning: 1,
      inProgress: 1,
      completed: 1,
      archived: 1,
      averageProgress: 63,
    });
  });

  it('returns zeros for an empty workspace', () => {
    expect(computeProjectStats([])).toEqual({
      total: 0,
      planning: 0,
      inProgress: 0,
      completed: 0,
      archived: 0,
      averageProgress: 0,
    });
  });

  it('produces one chart entry per status, including empty ones', () => {
    const entries = countProjectsByStatus([project({ status: 'in-progress' })]);
    expect(entries).toHaveLength(4);
    expect(entries.find((entry) => entry.key === 'in-progress')?.value).toBe(1);
    expect(entries.find((entry) => entry.key === 'completed')?.value).toBe(0);
  });
});

describe('task statistics', () => {
  it('computes completion and the remaining count', () => {
    const stats = computeTaskStats([
      task({ completed: true }),
      task({ completed: true }),
      task({ completed: true }),
      task({ completed: false }),
    ]);
    expect(stats).toEqual({ total: 4, completed: 3, remaining: 1, percentComplete: 75 });
  });

  it('does not divide by zero', () => {
    expect(computeTaskStats([])).toEqual({ total: 0, completed: 0, remaining: 0, percentComplete: 0 });
  });
});

describe('project filtering and sorting', () => {
  const projects = [
    project({ id: 'a', name: 'Alpha', technologies: ['Vue'], status: 'planning', progress: 10 }),
    project({ id: 'b', name: 'Beta', description: 'Fast search tool', status: 'completed', progress: 100 }),
    project({ id: 'c', name: 'Gamma', category: 'CLI Tool', status: 'in-progress', progress: 50 }),
  ];

  it('searches name, description, category and technologies', () => {
    expect(matchesProjectSearch(projects[0]!, 'alp')).toBe(true);
    expect(matchesProjectSearch(projects[1]!, 'search')).toBe(true);
    expect(matchesProjectSearch(projects[2]!, 'cli tool')).toBe(true);
    expect(matchesProjectSearch(projects[0]!, 'vue')).toBe(true);
    expect(matchesProjectSearch(projects[0]!, 'nothing-here')).toBe(false);
    expect(matchesProjectSearch(projects[0]!, '   ')).toBe(true);
  });

  it('combines filters', () => {
    const result = filterAndSortProjects(projects, {
      search: '',
      status: 'in-progress',
      category: 'all',
      sort: 'name',
    });
    expect(result.map((entry) => entry.name)).toEqual(['Gamma']);
  });

  it('sorts by name, progress and creation date', () => {
    const byName = filterAndSortProjects(projects, { search: '', status: 'all', category: 'all', sort: 'name' });
    expect(byName.map((entry) => entry.name)).toEqual(['Alpha', 'Beta', 'Gamma']);

    const byProgress = filterAndSortProjects(projects, {
      search: '',
      status: 'all',
      category: 'all',
      sort: 'progress',
    });
    expect(byProgress[0]?.name).toBe('Beta');

    const byOldest = filterAndSortProjects(projects, { search: '', status: 'all', category: 'all', sort: 'oldest' });
    expect(byOldest).toHaveLength(3);
  });
});

describe('github helpers', () => {
  it('summarises stars, forks and languages', () => {
    const summary = summariseGithub([
      repo({ language: 'TypeScript', stars: 10, forks: 2 }),
      repo({ language: 'TypeScript', stars: 5, forks: 1 }),
      repo({ language: null, stars: 1, forks: 0 }),
    ]);
    expect(summary).toEqual({
      totalRepos: 3,
      totalStars: 16,
      totalForks: 3,
      languages: 1,
      topLanguage: 'TypeScript',
    });
  });

  it('counts repositories per language, most used first', () => {
    const counts = countReposByLanguage([
      repo({ language: 'Go' }),
      repo({ language: 'TypeScript' }),
      repo({ language: 'TypeScript' }),
      repo({ language: null }),
    ]);
    expect(counts[0]).toEqual({ language: 'TypeScript', count: 2 });
    expect(counts).toHaveLength(2);
  });

  it('sorts and filters repositories', () => {
    const repos = [
      repo({ id: 1, name: 'b-repo', stars: 1, isFork: true, language: 'Go' }),
      repo({ id: 2, name: 'a-repo', stars: 50, language: 'TypeScript' }),
    ];

    expect(sortRepos(repos, 'stars')[0]?.name).toBe('a-repo');
    expect(sortRepos(repos, 'name')[0]?.name).toBe('a-repo');

    const visible = filterAndSortRepos(repos, {
      search: '',
      language: 'all',
      sort: 'stars',
      hideForks: true,
    });
    expect(visible.map((entry) => entry.name)).toEqual(['a-repo']);

    const searched = filterAndSortRepos(repos, {
      search: 'b-re',
      language: 'all',
      sort: 'name',
      hideForks: false,
    });
    expect(searched).toHaveLength(1);
  });
});

describe('the sample dataset used by /demo', () => {
  it('is self-consistent', () => {
    expect(demoProjects.length).toBeGreaterThan(0);
    const projectIds = new Set(demoProjects.map((entry) => entry.id));
    for (const entry of demoTasks) {
      expect(projectIds.has(entry.projectId)).toBe(true);
    }
    const stats = computeProjectStats(demoProjects);
    expect(stats.total).toBe(demoProjects.length);
    expect(stats.averageProgress).toBeGreaterThan(0);
    expect(computeTaskStats(demoTasks).total).toBe(demoTasks.length);
  });
});
