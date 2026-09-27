import type { EducationEntry, ExperienceEntry, Project, Task } from '@/types';

/**
 * Illustrative dataset used **only** by the public `/demo` page.
 *
 * It is deliberately kept out of the application itself: nothing in the auth
 * guard, dashboard or Firestore layer imports this file, so a real account can
 * never contain this data. The demo page labels it as a sample everywhere it is
 * rendered.
 */

const project = (
  input: Omit<Project, 'userId' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'progressMode'> &
    Partial<Pick<Project, 'imageUrl' | 'progressMode'>>,
): Project => ({
  userId: 'demo-user',
  imageUrl: '',
  progressMode: 'tasks',
  createdAt: null,
  updatedAt: null,
  ...input,
});

const task = (
  projectId: string,
  id: string,
  title: string,
  completed: boolean,
  description = '',
): Task => ({
  id,
  projectId,
  userId: 'demo-user',
  title,
  description,
  completed,
  completedAt: completed ? null : null,
  createdAt: null,
  updatedAt: null,
});

export const demoProjects: Project[] = [
  project({
    id: 'demo-1',
    name: 'Habitloop',
    description:
      'A habit tracker that turns streaks into a visual timeline. Built with React, TypeScript and Cloud Firestore, with offline write support and conflict-free merging.',
    category: 'Web App',
    status: 'in-progress',
    technologies: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Vite'],
    githubUrl: 'https://github.com/octocat/hello-world',
    liveUrl: 'https://example.com/habitloop',
    progress: 72,
    startDate: '2025-04-14',
    endDate: '2025-09-30',
  }),
  project({
    id: 'demo-2',
    name: 'Promptlint',
    description:
      'A CLI that lints prompt files for placeholders, token budgets and duplicated context blocks. Ships as a single binary with zero runtime dependencies.',
    category: 'CLI Tool',
    status: 'completed',
    technologies: ['Node.js', 'TypeScript', 'Vitest'],
    githubUrl: 'https://github.com/octocat/Spoon-Knife',
    liveUrl: '',
    progress: 100,
    startDate: '2025-01-08',
    endDate: '2025-05-21',
  }),
  project({
    id: 'demo-3',
    name: 'Atlas API',
    description:
      'A public REST API for geographic datasets, with key rotation, per-plan rate limits and OpenAPI documentation generated from the source.',
    category: 'API / Backend',
    status: 'in-progress',
    technologies: ['Firebase Functions', 'Node.js', 'OpenAPI'],
    githubUrl: 'https://github.com/octocat/git-consortium',
    liveUrl: 'https://example.com/atlas-api',
    progress: 45,
    startDate: '2025-06-02',
    endDate: '',
  }),
  project({
    id: 'demo-4',
    name: 'Colourkit',
    description:
      'A design-token library that converts a palette into Tailwind themes, Figma variables and accessible contrast pairs in one command.',
    category: 'Design',
    status: 'planning',
    technologies: ['Tailwind CSS', 'TypeScript'],
    githubUrl: '',
    liveUrl: '',
    progress: 10,
    startDate: '2025-09-01',
    endDate: '',
  }),
  project({
    id: 'demo-5',
    name: 'Tidy Transcripts',
    description:
      'An offline-first app that transcribes recorded lectures, highlights action items and exports a clean summary to Markdown.',
    category: 'Web App',
    status: 'archived',
    technologies: ['React', 'IndexedDB', 'Web Speech API'],
    githubUrl: 'https://github.com/octocat/linguist',
    liveUrl: '',
    progress: 100,
    startDate: '2023-09-04',
    endDate: '2024-02-16',
  }),
  project({
    id: 'demo-6',
    name: 'Repo Radar',
    description:
      'A service that tracks dependency releases and opens a pull request when a pinned version is outdated, with changelog summaries included.',
    category: 'Open Source',
    status: 'completed',
    technologies: ['Python', 'GitHub API', 'Docker'],
    githubUrl: 'https://github.com/octocat/hub',
    liveUrl: '',
    progress: 100,
    startDate: '2024-11-11',
    endDate: '2025-03-29',
  }),
];

export const demoTasks: Task[] = [
  task('demo-1', 'demo-t1', 'Set up the offline write queue', true),
  task('demo-1', 'demo-t2', 'Add streak calculations to the store', true),
  task('demo-1', 'demo-t3', 'Build the timeline visualisation', true),
  task('demo-1', 'demo-t4', 'Add keyboard navigation to the heatmap', false),
  task('demo-1', 'demo-t5', 'Write the onboarding tour', false),
  task('demo-2', 'demo-t6', 'Implement the placeholder rule', true),
  task('demo-2', 'demo-t7', 'Add the token budget checker', true),
  task('demo-2', 'demo-t8', 'Publish the npm package', true),
  task('demo-3', 'demo-t9', 'Design the dataset schema', true),
  task('demo-3', 'demo-t10', 'Add API key rotation', false),
  task('demo-3', 'demo-t11', 'Generate the OpenAPI document', false),
  task('demo-4', 'demo-t12', 'Collect references for the token format', false),
  task('demo-5', 'demo-t13', 'Prototype the recorder', true),
  task('demo-5', 'demo-t14', 'Export to Markdown', true),
  task('demo-6', 'demo-t15', 'Add release polling', true),
  task('demo-6', 'demo-t16', 'Open release pull requests', true),
];

export const demoEducation: EducationEntry[] = [
  {
    id: 'demo-e1',
    institution: 'University of Amsterdam',
    degree: 'BSc Computer Science',
    field: 'Software Engineering',
    startYear: '2020',
    endYear: '2023',
    description: '',
  },
];

export const demoExperience: ExperienceEntry[] = [
  {
    id: 'demo-x1',
    company: 'Studio Kolthoff',
    role: 'Frontend Engineer',
    startDate: '2023-07-01',
    endDate: '',
    current: true,
    description: 'Building data-heavy interfaces and the design system behind them.',
  },
];
