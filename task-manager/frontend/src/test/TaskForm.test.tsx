import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../components/TaskForm';
import type { Task } from '../types/task';

const defaultProps = {
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
  categories: ['Work', 'Personal'],
};

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Existing Task',
  description: 'Existing description',
  status: 'IN_PROGRESS',
  dueDate: '2026-04-15',
  category: 'Work',
  ...overrides,
});

describe('TaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all form fields', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    it('shows "Create Task" button when no initialData', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });

    it('shows "Update Task" button when initialData provided', () => {
      render(<TaskForm {...defaultProps} initialData={makeTask()} />);
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    });

    it('pre-fills form with initialData', () => {
      render(<TaskForm {...defaultProps} initialData={makeTask()} />);
      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Task');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description');
      expect(screen.getByLabelText(/status/i)).toHaveValue('IN_PROGRESS');
    });

    it('shows character counter for title', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows error when title is empty on submit', async () => {
      render(<TaskForm {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));
      expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when title exceeds 100 characters', async () => {
      render(<TaskForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'A'.repeat(101) } });
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));
      expect(await screen.findByText(/100 characters/i)).toBeInTheDocument();
    });

    it('shows error when description exceeds 500 characters', async () => {
      render(<TaskForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Valid Title' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'D'.repeat(501) } });
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));
      expect(await screen.findByText(/500 characters/i)).toBeInTheDocument();
    });

    it('clears title error when user starts typing', async () => {
      render(<TaskForm {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));
      await screen.findByText(/title is required/i);
      await userEvent.type(screen.getByLabelText(/title/i), 'A');
      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
    });
  });

  describe('submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
      await userEvent.selectOptions(screen.getByLabelText(/status/i), 'DONE');
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'New Task', status: 'DONE' })
        );
      });
    });

    it('trims title on submit', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: '  Trimmed Title  ' } });
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Trimmed Title' })
        );
      });
    });

    it('sends undefined for empty optional fields', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Only Title' } });
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            description: undefined,
            dueDate: undefined,
            category: undefined,
          })
        );
      });
    });

    it('shows API error message when submission fails', async () => {
      const onSubmit = vi.fn().mockRejectedValue({
        response: { data: { message: 'Server error' } },
      });
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Server error');
    });

    it('shows network error message when no response', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Network Error'));
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
      await userEvent.click(screen.getByRole('button', { name: /create task/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i);
    });
  });

  describe('cancel', () => {
    it('calls onCancel when Cancel button clicked', async () => {
      render(<TaskForm {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('character counters', () => {
    it('updates title character counter as user types', async () => {
      render(<TaskForm {...defaultProps} />);
      await userEvent.type(screen.getByLabelText(/title/i), 'Hello');
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('updates description character counter as user types', async () => {
      render(<TaskForm {...defaultProps} />);
      await userEvent.type(screen.getByLabelText(/description/i), 'Test');
      expect(screen.getByText('4/500')).toBeInTheDocument();
    });
  });
});
