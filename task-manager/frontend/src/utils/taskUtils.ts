import type { Task, SortField, SortOrder } from '../types/task';

export const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

export const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
] as const;

export function sortTasks(tasks: Task[], field: SortField, order: SortOrder): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0;

    if (field === 'dueDate') {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      comparison = aDate - bDate;
    } else if (field === 'status') {
      const statusOrder = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    } else if (field === 'title') {
      comparison = a.title.localeCompare(b.title);
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

export function isDueSoon(dueDate?: string): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
}

export function isOverdue(dueDate?: string, status?: string): boolean {
  if (!dueDate || status === 'DONE') return false;
  return new Date(dueDate) < new Date();
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
