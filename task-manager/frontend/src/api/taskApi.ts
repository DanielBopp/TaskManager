import axios from 'axios';
import type { Task, TaskRequest, TaskFilters } from '../types/task';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const taskApi = {
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.category) params.category = filters.category;
    const { data } = await api.get<Task[]>('/tasks', { params });
    return data;
  },

  getById: async (id: number): Promise<Task> => {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (task: TaskRequest): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', task);
    return data;
  },

  update: async (id: number, task: TaskRequest): Promise<Task> => {
    const { data } = await api.put<Task>(`/tasks/${id}`, task);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/tasks/categories');
    return data;
  },
};
