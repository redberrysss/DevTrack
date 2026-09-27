import { Link } from 'react-router-dom';
import { ArrowRight, FolderKanban } from 'lucide-react';

import type { Project } from '@/types';
import { EmptyState } from '@/components/ui/States';
import { LinkButton } from '@/components/ui/LinkButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Loading';
import { formatRelativeTime } from '@/utils/format';
import { TagList } from '@/components/ui/TagInput';

export function RecentProjects({ projects, loading }: { projects: Project[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="rounded-[var(--radius-control)] border border-line p-4">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="mt-3 h-2 w-full" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban className="size-5" />}
        title="You haven't created any projects yet"
        description="Create your first project to start tracking progress, tasks and links in one place."
        action={
          <LinkButton to="/projects" size="sm" trailingIcon={<ArrowRight className="size-3.5" aria-hidden />}>
            Go to projects
          </LinkButton>
        }
        className="border-none bg-surface-muted/40 py-10"
      />
    );
  }

  return (
    <ul className="divide-y divide-[var(--line)]">
      {projects.map((project) => (
        <li key={project.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={`/projects/${project.id}`}
                className="text-sm font-medium text-ink hover:underline break-anywhere"
              >
                {project.name}
              </Link>
              <p className="mt-0.5 text-xs text-ink-subtle">Updated {formatRelativeTime(project.updatedAt ?? project.createdAt)}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <div className="mt-3">
            <ProgressBar
              value={project.progress}
              size="sm"
              showValue
              srDescription={`${project.name} is ${project.progress}% complete`}
            />
          </div>

          <div className="mt-3">
            <TagList items={project.technologies} max={4} emptyLabel="No technologies listed" />
          </div>
        </li>
      ))}
    </ul>
  );
}
