export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  category?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  category?: string;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  category?: string;
}

export type SortField = 'dueDate' | 'status' | 'title';
export type SortOrder = 'asc' | 'desc';
