import { Search, SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import type { ProjectFilterState } from '@/lib/projectFilters';
import { PROJECT_STATUSES, SORT_OPTIONS, type ProjectSortOption } from '@/utils/constants';

export interface ProjectFiltersBarProps {
  value: ProjectFilterState;
  onChange: (next: ProjectFilterState) => void;
  resultCount: number;
  totalCount: number;
  categories: string[];
}

export function ProjectFiltersBar({
  value,
  onChange,
  resultCount,
  totalCount,
  categories,
}: ProjectFiltersBarProps) {
  const isFiltered =
    value.search.trim() !== '' || value.status !== 'all' || value.category !== 'all' || value.sort !== 'newest';

  const clear = () => onChange({ search: '', status: 'all', category: 'all', sort: 'newest' });

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <Input
            id="project-search"
            type="search"
            value={value.search}
            placeholder="Search name, description or technology"
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            leadingSlot={<Search className="size-4" />}
            className="pr-9"
          />
          {value.search ? (
            <button
              type="button"
              onClick={() => onChange({ ...value, search: '' })}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-subtle transition-colors hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <div>
          <label htmlFor="project-status" className="sr-only">
            Filter by status
          </label>
          <Select
            id="project-status"
            value={value.status}
            onChange={(event) => onChange({ ...value, status: event.target.value })}
          >
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="project-category" className="sr-only">
            Filter by category
          </label>
          <Select
            id="project-category"
            value={value.category}
            onChange={(event) => onChange({ ...value, category: event.target.value })}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="project-sort" className="sr-only">
            Sort projects
          </label>
          <Select
            id="project-sort"
            value={value.sort}
            onChange={(event) => onChange({ ...value, sort: event.target.value as ProjectSortOption })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-subtle">
        <span className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="size-3.5" aria-hidden />
          Showing {resultCount} of {totalCount} project{totalCount === 1 ? '' : 's'}
        </span>
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={clear} leadingIcon={<X className="size-3.5" aria-hidden />}>
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
