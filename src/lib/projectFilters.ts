import type { Project } from '@/types';
import type { ProjectSortOption } from '@/utils/constants';

export interface ProjectFilterState {
  search: string;
  status: string;
  category: string;
  sort: ProjectSortOption;
}

function timestampValue(project: Project, key: 'createdAt' | 'updatedAt'): number {
  const value = project[key];
  if (!value) return 0;
  return typeof value.toMillis === 'function' ? value.toMillis() : 0;
}

export function matchesProjectSearch(project: Project, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    project.name.toLowerCase().includes(needle) ||
    project.description.toLowerCase().includes(needle) ||
    project.category.toLowerCase().includes(needle) ||
    project.technologies.some((technology) => technology.toLowerCase().includes(needle))
  );
}

export function sortProjects(projects: Project[], sort: ProjectSortOption): Project[] {
  const sorted = [...projects];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => timestampValue(a, 'createdAt') - timestampValue(b, 'createdAt'));
    case 'updated':
      return sorted.sort((a, b) => timestampValue(b, 'updatedAt') - timestampValue(a, 'updatedAt'));
    case 'progress':
      return sorted.sort((a, b) => b.progress - a.progress || a.name.localeCompare(b.name));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
    default:
      return sorted.sort((a, b) => timestampValue(b, 'createdAt') - timestampValue(a, 'createdAt'));
  }
}

export function filterAndSortProjects(projects: Project[], filters: ProjectFilterState): Project[] {
  const filtered = projects.filter((project) => {
    if (filters.status !== 'all' && project.status !== filters.status) return false;
    if (filters.category !== 'all' && project.category !== filters.category) return false;
    return matchesProjectSearch(project, filters.search);
  });
  return sortProjects(filtered, filters.sort);
}
