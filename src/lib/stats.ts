import type { GithubRepo, Project, ProjectStatus, Task } from '@/types';
import { PROJECT_STATUSES } from '@/utils/constants';

export interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  planning: number;
  archived: number;
  averageProgress: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  remaining: number;
  percentComplete: number;
}

export function computeProjectStats(projects: Project[]): ProjectStats {
  const counts: Record<ProjectStatus, number> = {
    planning: 0,
    'in-progress': 0,
    completed: 0,
    archived: 0,
  };

  let progressTotal = 0;
  for (const project of projects) {
    counts[project.status] += 1;
    progressTotal += project.progress;
  }

  return {
    total: projects.length,
    completed: counts.completed,
    inProgress: counts['in-progress'],
    planning: counts.planning,
    archived: counts.archived,
    averageProgress: projects.length === 0 ? 0 : Math.round(progressTotal / projects.length),
  };
}

export function computeTaskStats(tasks: Task[]): TaskStats {
  const completed = tasks.reduce((total, task) => total + (task.completed ? 1 : 0), 0);
  const total = tasks.length;
  return {
    total,
    completed,
    remaining: total - completed,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export interface CountEntry<T extends string> {
  key: T;
  label: string;
  value: number;
  color: string;
}

const STATUS_CHART_COLORS: Record<ProjectStatus, string> = {
  planning: '#94a3b8',
  'in-progress': '#3b82f6',
  completed: '#10b981',
  archived: '#a1a1aa',
};

/** Maps the hyphenated status used in forms onto the camelCase stats field. */
const STATUS_STAT_KEY: Record<ProjectStatus, keyof ProjectStats> = {
  planning: 'planning',
  'in-progress': 'inProgress',
  completed: 'completed',
  archived: 'archived',
};

export function countProjectsByStatus(projects: Project[]): CountEntry<ProjectStatus>[] {
  const stats = computeProjectStats(projects);
  return PROJECT_STATUSES.map((status) => ({
    key: status.value,
    label: status.label,
    value: stats[STATUS_STAT_KEY[status.value]],
    color: STATUS_CHART_COLORS[status.value],
  }));
}

export interface GithubSummary {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  languages: number;
  topLanguage: string | null;
}

export function summariseGithub(repos: GithubRepo[]): GithubSummary {
  let totalStars = 0;
  let totalForks = 0;
  const languageCounts = new Map<string, number>();

  for (const repo of repos) {
    totalStars += repo.stars;
    totalForks += repo.forks;
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
    }
  }

  let topLanguage: string | null = null;
  let topCount = 0;
  languageCounts.forEach((count, language) => {
    if (count > topCount) {
      topCount = count;
      topLanguage = language;
    }
  });

  return {
    totalRepos: repos.length,
    totalStars,
    totalForks,
    languages: languageCounts.size,
    topLanguage,
  };
}

export const CHART_COLORS = {
  axis: '#94a3b8',
  grid: 'rgba(148, 163, 184, 0.22)',
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#f59e0b',
  quaternary: '#8b5cf6',
  muted: '#64748b',
} as const;

export const LANGUAGE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6366f1',
  '#14b8a6',
] as const;

export function languageColor(language: string, index: number): string {
  if (language === 'TypeScript') return LANGUAGE_COLORS[0];
  if (language === 'JavaScript') return LANGUAGE_COLORS[4];
  if (language === 'Python') return LANGUAGE_COLORS[1];
  if (language === 'HTML') return LANGUAGE_COLORS[2];
  if (language === 'CSS') return LANGUAGE_COLORS[8];
  if (language === 'Java') return LANGUAGE_COLORS[3];
  if (language === 'Go') return LANGUAGE_COLORS[5];
  if (language === 'Rust') return LANGUAGE_COLORS[7];
  if (language === 'Shell') return LANGUAGE_COLORS[9];
  return LANGUAGE_COLORS[index % LANGUAGE_COLORS.length];
}

export interface LanguageDatum {
  language: string;
  count: number;
}

export function countReposByLanguage(repos: GithubRepo[], limit = 6): LanguageDatum[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language))
    .slice(0, limit);
}
