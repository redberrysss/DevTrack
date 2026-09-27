import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';

import { ThemeProvider } from '@/contexts/ThemeProvider';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState, ErrorState, InlineNotice } from '@/components/ui/States';
import { TagInput, TagList } from '@/components/ui/TagInput';
import { GithubLanguagesChart } from '@/components/charts/GithubLanguagesChart';
import { ProjectsByStatusChart } from '@/components/charts/ProjectsByStatusChart';
import { StatCard } from '@/components/dashboard/StatCard';
import type { GithubRepo, Project } from '@/types';

const timestamp = (millis: number) =>
  ({ toMillis: () => millis, seconds: Math.floor(millis / 1000), nanoseconds: 0 }) as unknown as Project['createdAt'];

const project = (overrides: Partial<Project> = {}): Project => ({
  id: 'p1',
  userId: 'u1',
  name: 'Project',
  description: 'Description',
  category: 'Web App',
  status: 'in-progress',
  technologies: ['React'],
  githubUrl: '',
  liveUrl: '',
  imageUrl: '',
  progress: 40,
  progressMode: 'manual',
  startDate: '2025-01-01',
  endDate: '',
  createdAt: timestamp(1_700_000_000_000),
  updatedAt: timestamp(1_700_000_000_000),
  ...overrides,
});

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const repo = (name: string, language: string | null, stars: number): GithubRepo => ({
  id: name.length,
  name,
  fullName: `octocat/${name}`,
  description: null,
  language,
  stars,
  forks: 0,
  watchers: stars,
  openIssues: 0,
  isFork: false,
  isArchived: false,
  topics: [],
  license: null,
  url: `https://api.github.com/repos/octocat/${name}`,
  homepage: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  pushedAt: '2025-01-01T00:00:00Z',
});

describe('StatusBadge', () => {
  it('always pairs colour with a text label', () => {
    render(<StatusBadge status="in-progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('falls back to a known label for unknown statuses', () => {
    render(<StatusBadge status="not-a-status" />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('exposes the value to assistive technology', () => {
    const { container } = render(<ProgressBar value={42} label="Progress" showValue srDescription="42% complete" />);
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '42');
  });
});

describe('states', () => {
  it('announces errors assertively', () => {
    render(<ErrorState message="Firestore is unavailable." title="Could not load" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Firestore is unavailable.');
  });

  it('calls onRetry when the retry button is pressed', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Boom" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders an empty state without actions', () => {
    render(<EmptyState title="Nothing here" description="Create your first project." />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders an inline notice', () => {
    render(<InlineNotice tone="caution">Verify your email</InlineNotice>);
    expect(screen.getByText('Verify your email')).toBeInTheDocument();
  });
});

describe('TagInput', () => {
  it('adds tags on Enter and removes them with the chip button', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<string[]>([]);
      return <TagInput label="Technologies" value={value} onChange={setValue} />;
    }

    render(<Harness />);
    const input = screen.getByLabelText('Technologies');
    await user.type(input, 'React{Enter}');
    await user.type(input, 'TypeScript{Enter}');
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('lists tags and shows the overflow count', () => {
    render(<TagList items={['a', 'b', 'c', 'd', 'e']} max={2} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('+3 more')).toBeInTheDocument();
  });

  it('shows the empty label when there are no tags', () => {
    render(<TagList items={[]} emptyLabel="No skills yet" />);
    expect(screen.getByText('No skills yet')).toBeInTheDocument();
  });
});

describe('StatCard', () => {
  it('renders a label, a value and a hint', () => {
    render(
      <MemoryRouter>
        <StatCard label="Total projects" value={8} icon={FolderKanban} hint="3 in planning" />
      </MemoryRouter>,
    );
    expect(screen.getByText('Total projects')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3 in planning')).toBeInTheDocument();
  });
});

describe('charts', () => {
  it('shows an empty message instead of an empty chart', () => {
    renderWithTheme(<ProjectsByStatusChart projects={[]} />);
    expect(screen.getByText('No projects to chart yet')).toBeInTheDocument();
  });

  it('renders the projects-by-status chart when there is data', () => {
    const { container } = renderWithTheme(
      <ProjectsByStatusChart projects={[project({ status: 'completed', progress: 100 })]} />,
    );
    expect(container.querySelector('.recharts-responsive-container')).toBeTruthy();
    expect(screen.queryByText('No projects to chart yet')).not.toBeInTheDocument();
  });

  it('renders the language chart with a repository', () => {
    const { container } = renderWithTheme(
      <GithubLanguagesChart repos={[repo('alpha', 'TypeScript', 3), repo('beta', 'Go', 1)]} />,
    );
    expect(container.querySelector('.recharts-responsive-container')).toBeTruthy();
  });

  it('explains when there is nothing to plot', () => {
    renderWithTheme(<GithubLanguagesChart repos={[]} />);
    expect(screen.getByText('No repositories to chart')).toBeInTheDocument();
  });
});
