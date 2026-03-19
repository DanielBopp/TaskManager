import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        message="Delete it?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen
        message="Delete it?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('displays the message', () => {
    render(
      <ConfirmDialog
        isOpen
        message="Are you sure you want to delete this task?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Are you sure you want to delete this task?')).toBeInTheDocument();
  });

  it('calls onConfirm when Delete button clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog isOpen message="Delete?" onConfirm={onConfirm} onCancel={vi.fn()} />
    );
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog isOpen message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows Confirm Delete heading', () => {
    render(
      <ConfirmDialog isOpen message="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
  });
});
