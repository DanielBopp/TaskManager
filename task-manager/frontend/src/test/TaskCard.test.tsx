import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '../types/task';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Buy groceries',
  description: 'Milk and eggs',
  status: 'TODO',
  dueDate: '2026-04-01',
  category: 'Personal',
  ...overrides,
});

describe('TaskCard', () => {
  const defaultProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onStatusChange: vi.fn(),
  };

  it('renders task title', () => {
    render(<TaskCard task={makeTask()} {...defaultProps} />);
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={makeTask()} {...defaultProps} />);
    expect(screen.getByText('Milk and eggs')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<TaskCard task={makeTask()} {...defaultProps} />);
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders status select with current value', () => {
    render(<TaskCard task={makeTask({ status: 'IN_PROGRESS' })} {...defaultProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('IN_PROGRESS');
  });

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn();
    const task = makeTask();
    render(<TaskCard task={task} {...defaultProps} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText(/edit task/i));
    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it('calls onDelete with task id when delete button clicked', async () => {
    const onDelete = vi.fn();
    render(<TaskCard task={makeTask()} {...defaultProps} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText(/delete task/i));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onStatusChange when status dropdown changes', async () => {
    const onStatusChange = vi.fn();
    render(<TaskCard task={makeTask()} {...defaultProps} onStatusChange={onStatusChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'DONE');
    expect(onStatusChange).toHaveBeenCalledWith(1, 'DONE');
  });

  it('applies line-through style when task is DONE', () => {
    render(<TaskCard task={makeTask({ status: 'DONE' })} {...defaultProps} />);
    const title = screen.getByText('Buy groceries');
    expect(title.className).toContain('line-through');
  });

  it('does not render description when absent', () => {
    render(<TaskCard task={makeTask({ description: undefined })} {...defaultProps} />);
    expect(screen.queryByText('Milk and eggs')).not.toBeInTheDocument();
  });

  it('does not render category badge when absent', () => {
    render(<TaskCard task={makeTask({ category: undefined })} {...defaultProps} />);
    expect(screen.queryByText('Personal')).not.toBeInTheDocument();
  });

  it('renders article element with data-testid', () => {
    render(<TaskCard task={makeTask()} {...defaultProps} />);
    expect(screen.getByTestId('task-card')).toBeInTheDocument();
  });

  it('shows overdue indicator for past due non-DONE tasks', () => {
    render(<TaskCard task={makeTask({ dueDate: '2020-01-01', status: 'TODO' })} {...defaultProps} />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('does not show overdue for DONE tasks', () => {
    render(<TaskCard task={makeTask({ dueDate: '2020-01-01', status: 'DONE' })} {...defaultProps} />);
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });
});
