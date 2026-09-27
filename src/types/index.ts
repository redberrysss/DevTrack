import type { Timestamp } from 'firebase/firestore';

/** Lifecycle of a project. Display labels live in `utils/constants.ts`. */
export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'archived';

/** How the `progress` value of a project is calculated. */
export type ProgressMode = 'manual' | 'tasks';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  progress: number;
  progressMode: ProgressMode;
  /** ISO date string (yyyy-mm-dd) or empty string when not set. */
  startDate: string;
  /** ISO date string (yyyy-mm-dd) or empty string when not set. */
  endDate: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface Task {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  githubUsername: string;
  linkedinUrl: string;
  portfolioUrl: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  emailVerified: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/** Shape written to Firestore (never contains the id inside the document). */
export type UserProfileData = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

/* -------------------------------------------------------------------------- */
/*                                   GitHub                                    */
/* -------------------------------------------------------------------------- */

export interface GithubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  profileUrl: string;
  htmlUrl: string;
  createdAt: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  isFork: boolean;
  isArchived: boolean;
  topics: string[];
  license: string | null;
  url: string;
  homepage: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface GithubSnapshot {
  user: GithubUser;
  repos: GithubRepo[];
  fetchedAt: number;
  /** Only present when the API told us we are close to the rate limit. */
  rateLimit?: GithubRateLimit;
}

export interface GithubRateLimit {
  limit: number;
  remaining: number;
  /** Epoch milliseconds when the quota resets. */
  resetAt: number;
}

/* -------------------------------------------------------------------------- */
/*                                 UI helpers                                  */
/* -------------------------------------------------------------------------- */

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

export interface AsyncState {
  loading: boolean;
  error: string | null;
}
