import type { ProjectStatus } from '@/types';

export const APP_NAME = 'DevTrack';

export const LANDING_TITLE = 'DevTrack — Build. Track. Showcase.';

export const LANDING_DESCRIPTION =
  'Manage your developer projects, track your progress, and showcase your GitHub development journey with DevTrack.';

export interface StatusMeta {
  value: ProjectStatus;
  label: string;
  /** Text + dot colour. Never colour alone: the label is always rendered too. */
  badgeClass: string;
  barClass: string;
}

export const PROJECT_STATUSES: StatusMeta[] = [
  {
    value: 'planning',
    label: 'Planning',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-400/25',
    barClass: 'bg-slate-400',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
    badgeClass:
      'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/25',
    barClass: 'bg-blue-500',
  },
  {
    value: 'completed',
    label: 'Completed',
    badgeClass:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25',
    barClass: 'bg-emerald-500',
  },
  {
    value: 'archived',
    label: 'Archived',
    badgeClass:
      'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-400/25',
    barClass: 'bg-zinc-400 dark:bg-zinc-500',
  },
];

export const STATUS_VALUES: ProjectStatus[] = PROJECT_STATUSES.map((status) => status.value);

export function getStatusMeta(status: string): StatusMeta {
  return (
    PROJECT_STATUSES.find((entry) => entry.value === status) ??
    PROJECT_STATUSES[PROJECT_STATUSES.length - 1]!
  );
}

export const PROJECT_CATEGORIES = [
  'Web App',
  'Mobile App',
  'API / Backend',
  'Library',
  'CLI Tool',
  'Machine Learning',
  'Open Source',
  'Design',
  'Data',
  'Other',
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'progress', label: 'Highest progress' },
  { value: 'name', label: 'Name (A–Z)' },
] as const;

export type ProjectSortOption = (typeof SORT_OPTIONS)[number]['value'];

export const REPO_SORT_OPTIONS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'stars', label: 'Most stars' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'created', label: 'Newest' },
] as const;

export type RepoSortOption = (typeof REPO_SORT_OPTIONS)[number]['value'];

/** Validation limits shared by the forms and the validators. */
export const LIMITS = {
  projectName: 80,
  projectDescription: 600,
  projectUrl: 300,
  technologies: 15,
  technologyLength: 30,
  taskTitle: 120,
  taskDescription: 400,
  name: 60,
  bio: 400,
  skills: 30,
  skillLength: 30,
  profileUrl: 300,
  avatarUrl: 1000,
  location: 80,
  role: 80,
  company: 80,
  institution: 120,
  githubUsername: 39,
  passwordMin: 8,
} as const;

export const GITHUB_API_BASE = 'https://api.github.com';

export const GITHUB_CACHE_TTL_MS = 5 * 60 * 1000;

export const THEME_STORAGE_KEY = 'devtrack.theme';
