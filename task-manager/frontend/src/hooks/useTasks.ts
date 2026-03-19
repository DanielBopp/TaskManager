import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../api/taskApi';
import type { Task, TaskRequest, TaskFilters } from '../types/task';

interface UseTasksReturn {
  tasks: Task[];
  categories: string[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (task: TaskRequest) => Promise<Task>;
  updateTask: (id: number, task: TaskRequest) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message ?? 'An unexpected error occurred';
    }
    return 'Network error. Please check your connection.';
  };

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await taskApi.getCategories();
      setCategories(cats);
    } catch {
      // non-critical, ignore
    }
  }, []);

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll(filters);
      setTasks(data);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: TaskRequest): Promise<Task> => {
    const created = await taskApi.create(task);
    await fetchTasks();
    await fetchCategories();
    return created;
  }, [fetchTasks, fetchCategories]);

  const updateTask = useCallback(async (id: number, task: TaskRequest): Promise<Task> => {
    const updated = await taskApi.update(id, task);
    await fetchTasks();
    await fetchCategories();
    return updated;
  }, [fetchTasks, fetchCategories]);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    await taskApi.delete(id);
    await fetchTasks();
    await fetchCategories();
  }, [fetchTasks, fetchCategories]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [fetchTasks, fetchCategories]);

  return { tasks, categories, loading, error, fetchTasks, createTask, updateTask, deleteTask, clearError };
}
