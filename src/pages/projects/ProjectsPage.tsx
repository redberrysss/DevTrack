import { useMemo, useState } from 'react';
import { FolderKanban, Plus, SearchX } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useProjects } from '@/hooks/useFirestoreData';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useToast } from '@/hooks/useToast';
import { deleteProject } from '@/services/projects/projectsService';
import { filterAndSortProjects, type ProjectFilterState } from '@/lib/projectFilters';
import type { Project } from '@/types';
import { getFriendlyError } from '@/utils/errors';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { SkeletonProjectCard } from '@/components/ui/Loading';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFiltersBar } from '@/components/projects/ProjectFiltersBar';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';

const defaultFilters: ProjectFilterState = { search: '', status: 'all', category: 'all', sort: 'newest' };

export default function ProjectsPage() {
  usePageMeta({
    title: 'Projects — DevTrack',
    description: 'Create, update and track every software project you are working on.',
  });

  const { user } = useAuth();
  const toast = useToast();
  const { items: projects, loading, error, refresh } = useProjects(user?.uid ?? null);

  const [filters, setFilters] = useState<ProjectFilterState>(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const debouncedSearch = useDebouncedValue(filters.search, 200);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((project) => project.category))).sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const visibleProjects = useMemo(
    () => filterAndSortProjects(projects, { ...filters, search: debouncedSearch }),
    [projects, filters, debouncedSearch],
  );

  const openCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProject || !user) return;
    setDeleteBusy(true);
    try {
      await deleteProject(user.uid, deletingProject.id);
      toast.success('Project deleted', `“${deletingProject.name}” and its tasks were removed.`);
      setDeletingProject(null);
    } catch (deleteError) {
      const message = getFriendlyError(deleteError, 'We could not delete that project. Please try again.');
      toast.error('Delete failed', message);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Everything you are building, with progress, tasks and links in one place."
        actions={
          <Button onClick={openCreate} leadingIcon={<Plus className="size-4" aria-hidden />}>
            New project
          </Button>
        }
      />

      {error ? (
        <ErrorState
          message={error}
          onRetry={refresh}
          title="We could not load your projects"
          className="mb-6"
        />
      ) : null}

      <ProjectFiltersBar
        value={filters}
        onChange={setFilters}
        resultCount={visibleProjects.length}
        totalCount={projects.length}
        categories={categories}
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <SkeletonProjectCard key={index} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-5" />}
            title="You haven't created any projects yet"
            description="Add your first project to track its progress, break it into tasks and link it to GitHub."
            action={
              <Button onClick={openCreate} leadingIcon={<Plus className="size-4" aria-hidden />}>
                Create your first project
              </Button>
            }
          />
        ) : visibleProjects.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No projects match your filters"
            description="Try a different search term, status or category."
            action={
              <Button variant="secondary" onClick={() => setFilters(defaultFilters)}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEdit}
                onDelete={setDeletingProject}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectFormModal
        open={modalOpen}
        project={editingProject}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
      />

      <ConfirmDialog
        open={deletingProject !== null}
        destructive
        title="Delete this project?"
        description={
          deletingProject
            ? `“${deletingProject.name}” and all of its tasks will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete project"
        cancelLabel="Keep project"
        loading={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProject(null)}
      />
    </div>
  );
}
