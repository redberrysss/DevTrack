import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Github } from '@/components/ui/BrandIcons';

import type { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TagList } from '@/components/ui/TagInput';
import { formatDateShort, formatRelativeTime } from '@/utils/format';

export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(project.imageUrl) && !imageFailed;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-raised)]">
      {showImage ? (
        <div className="aspect-[16/9] w-full overflow-hidden border-b border-line bg-surface-muted">
          <img
            src={project.imageUrl}
            alt={`${project.name} preview`}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[15px] font-semibold text-ink break-anywhere">
            <Link to={`/projects/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </h3>
          <StatusBadge status={project.status} className="shrink-0" />
        </div>

        <p className="mt-2 line-clamp-3 text-sm text-ink-muted break-anywhere">{project.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
          <span className="rounded bg-surface-muted px-1.5 py-0.5 font-medium text-ink-muted ring-1 ring-line-strong ring-inset">
            {project.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatDateShort(project.startDate)}
          </span>
          <span>Updated {formatRelativeTime(project.updatedAt ?? project.createdAt)}</span>
        </div>

        <div className="mt-4">
          <ProgressBar
            value={project.progress}
            label={project.progressMode === 'tasks' ? 'Task completion' : 'Progress'}
            showValue
            srDescription={`${project.progress}% complete`}
          />
        </div>

        <div className="mt-4">
          <TagList items={project.technologies} max={4} emptyLabel="No technologies listed" />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <LinkButton to={`/projects/${project.id}`} variant="secondary" size="sm">
            View
          </LinkButton>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.name}`}
            leadingIcon={<Pencil className="size-3.5" aria-hidden />}
            className="px-2"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
            className="px-2 text-ink-muted hover:text-critical"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>

          <div className="ml-auto flex items-center gap-1">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${project.name} on GitHub`}
                title="Open repository on GitHub"
                className="flex size-8 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
              >
                <Github className="size-4" aria-hidden />
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${project.name} live demo`}
                title="Open live demo"
                className="flex size-8 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
              >
                <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
