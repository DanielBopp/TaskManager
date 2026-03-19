import type { TaskFilters, SortField, SortOrder } from '../types/task';
import { STATUS_OPTIONS } from '../utils/taskUtils';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  sortField: SortField;
  sortOrder: SortOrder;
  categories: string[];
  onFiltersChange: (filters: TaskFilters) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onReset: () => void;
}

export function TaskFiltersBar({
  filters,
  sortField,
  sortOrder,
  categories,
  onFiltersChange,
  onSortChange,
  onReset,
}: TaskFiltersBarProps) {
  const hasActiveFilters = !!(filters.search || filters.status || filters.category);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={filters.search ?? ''}
            onChange={e => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={filters.status ?? ''}
          onChange={e => onFiltersChange({ ...filters, status: (e.target.value as TaskFilters['status']) || undefined })}
          aria-label="Filter by status"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={filters.category ?? ''}
            onChange={e => onFiltersChange({ ...filters, category: e.target.value || undefined })}
            aria-label="Filter by category"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={`${sortField}:${sortOrder}`}
          onChange={e => {
            const [field, order] = e.target.value.split(':') as [SortField, SortOrder];
            onSortChange(field, order);
          }}
          aria-label="Sort tasks"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="title:asc">Title A→Z</option>
          <option value="title:desc">Title Z→A</option>
          <option value="dueDate:asc">Due Date ↑</option>
          <option value="dueDate:desc">Due Date ↓</option>
          <option value="status:asc">Status ↑</option>
          <option value="status:desc">Status ↓</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-red-600 hover:text-red-800 px-2 py-2 underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
