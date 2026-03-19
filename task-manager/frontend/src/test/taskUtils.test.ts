import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sortTasks,
  isDueSoon,
  isOverdue,
  formatDate,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../utils/taskUtils';
import type { Task } from '../types/task';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Test Task',
  status: 'TODO',
  ...overrides,
});

describe('taskUtils', () => {
  describe('STATUS_LABELS', () => {
    it('has correct label for TODO', () => {
      expect(STATUS_LABELS['TODO']).toBe('To Do');
    });
    it('has correct label for IN_PROGRESS', () => {
      expect(STATUS_LABELS['IN_PROGRESS']).toBe('In Progress');
    });
    it('has correct label for DONE', () => {
      expect(STATUS_LABELS['DONE']).toBe('Done');
    });
  });

  describe('STATUS_COLORS', () => {
    it('has color classes for all statuses', () => {
      expect(STATUS_COLORS['TODO']).toContain('gray');
      expect(STATUS_COLORS['IN_PROGRESS']).toContain('blue');
      expect(STATUS_COLORS['DONE']).toContain('green');
    });
  });

  describe('sortTasks', () => {
    const tasks: Task[] = [
      makeTask({ id: 1, title: 'Banana', status: 'DONE', dueDate: '2026-04-10' }),
      makeTask({ id: 2, title: 'Apple', status: 'TODO', dueDate: '2026-03-20' }),
      makeTask({ id: 3, title: 'Cherry', status: 'IN_PROGRESS', dueDate: '2026-05-01' }),
    ];

    it('sorts by title ascending', () => {
      const sorted = sortTasks(tasks, 'title', 'asc');
      expect(sorted.map(t => t.title)).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    it('sorts by title descending', () => {
      const sorted = sortTasks(tasks, 'title', 'desc');
      expect(sorted.map(t => t.title)).toEqual(['Cherry', 'Banana', 'Apple']);
    });

    it('sorts by dueDate ascending', () => {
      const sorted = sortTasks(tasks, 'dueDate', 'asc');
      expect(sorted[0].title).toBe('Apple');
      expect(sorted[2].title).toBe('Cherry');
    });

    it('sorts by dueDate descending', () => {
      const sorted = sortTasks(tasks, 'dueDate', 'desc');
      expect(sorted[0].title).toBe('Cherry');
    });

    it('sorts by status ascending (TODO → IN_PROGRESS → DONE)', () => {
      const sorted = sortTasks(tasks, 'status', 'asc');
      expect(sorted.map(t => t.status)).toEqual(['TODO', 'IN_PROGRESS', 'DONE']);
    });

    it('sorts by status descending', () => {
      const sorted = sortTasks(tasks, 'status', 'desc');
      expect(sorted.map(t => t.status)).toEqual(['DONE', 'IN_PROGRESS', 'TODO']);
    });

    it('places tasks without dueDate at the end when sorting by dueDate asc', () => {
      const withNull = [
        makeTask({ id: 1, title: 'A', dueDate: undefined }),
        makeTask({ id: 2, title: 'B', dueDate: '2026-03-20' }),
      ];
      const sorted = sortTasks(withNull, 'dueDate', 'asc');
      expect(sorted[0].title).toBe('B');
    });

    it('does not mutate original array', () => {
      const original = [...tasks];
      sortTasks(tasks, 'title', 'asc');
      expect(tasks).toEqual(original);
    });
  });

  describe('isDueSoon', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-19'));
    });
    afterEach(() => vi.useRealTimers());

    it('returns true when due date is today', () => {
      expect(isDueSoon('2026-03-19')).toBe(true);
    });

    it('returns true when due date is within 3 days', () => {
      expect(isDueSoon('2026-03-21')).toBe(true);
    });

    it('returns false when due date is more than 3 days away', () => {
      expect(isDueSoon('2026-03-25')).toBe(false);
    });

    it('returns false when due date is in the past', () => {
      expect(isDueSoon('2026-03-15')).toBe(false);
    });

    it('returns false when dueDate is undefined', () => {
      expect(isDueSoon(undefined)).toBe(false);
    });
  });

  describe('isOverdue', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-19'));
    });
    afterEach(() => vi.useRealTimers());

    it('returns true when past due and not DONE', () => {
      expect(isOverdue('2026-03-10', 'TODO')).toBe(true);
    });

    it('returns false when task is DONE even if past due', () => {
      expect(isOverdue('2026-03-10', 'DONE')).toBe(false);
    });

    it('returns false when due date is in the future', () => {
      expect(isOverdue('2026-04-01', 'TODO')).toBe(false);
    });

    it('returns false when dueDate is undefined', () => {
      expect(isOverdue(undefined, 'TODO')).toBe(false);
    });

    it('returns false when status is undefined', () => {
      expect(isOverdue('2026-03-10', undefined)).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('returns em dash for undefined input', () => {
      expect(formatDate(undefined)).toBe('—');
    });

    it('formats a date string to German locale', () => {
      const result = formatDate('2026-04-15');
      expect(result).toMatch(/15\.04\.2026/);
    });
  });
});
