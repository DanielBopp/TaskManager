import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFiltersBar } from '../components/TaskFiltersBar';
import type { TaskFilters, SortField, SortOrder } from '../types/task';

const defaultProps = {
  filters: {} as TaskFilters,
  sortField: 'title' as SortField,
  sortOrder: 'asc' as SortOrder,
  categories: ['Work', 'Personal'],
  onFiltersChange: vi.fn(),
  onSortChange: vi.fn(),
  onReset: vi.fn(),
};

describe('TaskFiltersBar', () => {
  it('renders search input', () => {
    render(<TaskFiltersBar {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();
  });

  it('renders status filter select', () => {
    render(<TaskFiltersBar {...defaultProps} />);
    expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument();
  });

  it('renders category filter when categories exist', () => {
    render(<TaskFiltersBar {...defaultProps} />);
    expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
  });

  it('does not render category filter when no categories', () => {
    render(<TaskFiltersBar {...defaultProps} categories={[]} />);
    expect(screen.queryByLabelText(/filter by category/i)).not.toBeInTheDocument();
  });

  it('renders sort select', () => {
    render(<TaskFiltersBar {...defaultProps} />);
    expect(screen.getByLabelText(/sort tasks/i)).toBeInTheDocument();
  });

  it('calls onFiltersChange when search input changes', async () => {
    const onFiltersChange = vi.fn();
    render(<TaskFiltersBar {...defaultProps} onFiltersChange={onFiltersChange} />);
    await userEvent.type(screen.getByPlaceholderText(/search tasks/i), 'a');
    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('calls onFiltersChange when status changes', async () => {
    const onFiltersChange = vi.fn();
    render(<TaskFiltersBar {...defaultProps} onFiltersChange={onFiltersChange} />);
    await userEvent.selectOptions(screen.getByLabelText(/filter by status/i), 'TODO');
    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('shows clear filters button when filters are active', () => {
    render(
      <TaskFiltersBar
        {...defaultProps}
        filters={{ search: 'test' }}
      />
    );
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('hides clear filters button when no active filters', () => {
    render(<TaskFiltersBar {...defaultProps} filters={{}} />);
    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument();
  });

  it('calls onReset when clear filters clicked', async () => {
    const onReset = vi.fn();
    render(
      <TaskFiltersBar
        {...defaultProps}
        filters={{ status: 'TODO' }}
        onReset={onReset}
      />
    );
    await userEvent.click(screen.getByText(/clear filters/i));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('calls onSortChange when sort changes', async () => {
    const onSortChange = vi.fn();
    render(<TaskFiltersBar {...defaultProps} onSortChange={onSortChange} />);
    await userEvent.selectOptions(screen.getByLabelText(/sort tasks/i), 'dueDate:asc');
    expect(onSortChange).toHaveBeenCalledWith('dueDate', 'asc');
  });

  it('shows search value from filters', () => {
    render(<TaskFiltersBar {...defaultProps} filters={{ search: 'hello' }} />);
    expect(screen.getByPlaceholderText(/search tasks/i)).toHaveValue('hello');
  });
});
