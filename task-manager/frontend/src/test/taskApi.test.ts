import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { taskApi } from '../api/taskApi';
import type { Task, TaskRequest } from '../types/task';

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
    },
  };
});

// We need to get the mock instance
let mockGet: ReturnType<typeof vi.fn>;
let mockPost: ReturnType<typeof vi.fn>;
let mockPut: ReturnType<typeof vi.fn>;
let mockDelete: ReturnType<typeof vi.fn>;

const sampleTask: Task = {
  id: 1,
  title: 'Test Task',
  status: 'TODO',
  description: 'Test desc',
  category: 'Work',
};

const sampleRequest: TaskRequest = {
  title: 'Test Task',
  status: 'TODO',
};

describe('taskApi', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Note: These tests verify the API module structure and behavior
  // Full integration tests would use MSW or a real server

  it('exports getAll function', () => {
    expect(typeof taskApi.getAll).toBe('function');
  });

  it('exports getById function', () => {
    expect(typeof taskApi.getById).toBe('function');
  });

  it('exports create function', () => {
    expect(typeof taskApi.create).toBe('function');
  });

  it('exports update function', () => {
    expect(typeof taskApi.update).toBe('function');
  });

  it('exports delete function', () => {
    expect(typeof taskApi.delete).toBe('function');
  });

  it('exports getCategories function', () => {
    expect(typeof taskApi.getCategories).toBe('function');
  });
});
