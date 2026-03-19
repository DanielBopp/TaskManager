import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../components/Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} title="Test" onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(
      <Modal isOpen title="Test Modal" onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(
      <Modal isOpen title="My Modal Title" onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText('My Modal Title')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Modal isOpen title="Test" onClose={vi.fn()}>
        <p>Modal content here</p>
      </Modal>
    );
    expect(screen.getByText('Modal content here')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    await userEvent.click(screen.getByLabelText(/close modal/i));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has aria-modal attribute', () => {
    render(
      <Modal isOpen title="Test" onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to title', () => {
    render(
      <Modal isOpen title="Test" onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
