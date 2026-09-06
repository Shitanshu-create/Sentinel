import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from './RegisterPage.jsx';

const handleRegister = vi.fn();

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ handleRegister })
}));

describe('Register flow', () => {
  beforeEach(() => {
    handleRegister.mockClear();
  });

  it('submits registration and opens the app on success', async () => {
    const onRegisterSuccess = vi.fn();
    handleRegister.mockResolvedValueOnce({ success: true });

    render(<Register onBack={vi.fn()} onOpenLogin={vi.fn()} onRegisterSuccess={onRegisterSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Ada' }
    });
    fireEvent.change(screen.getByPlaceholderText('you@innerly.com'), {
      target: { value: 'ada@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(onRegisterSuccess).toHaveBeenCalled());
    expect(handleRegister).toHaveBeenCalledWith({
      username: 'Ada',
      email: 'ada@example.com',
      password: 'password123'
    });
  });

  it('shows registration format instructions', () => {
    render(<Register onBack={vi.fn()} onOpenLogin={vi.fn()} onRegisterSuccess={vi.fn()} />);

    expect(screen.getByText('Username must be 2-60 characters.')).toBeInTheDocument();
    expect(screen.getByText('Email must be valid and 254 characters or less.')).toBeInTheDocument();
    expect(screen.getByText('Password must be 8-128 characters.')).toBeInTheDocument();
  });

  it('warns and does not submit when password is too short', async () => {
    render(<Register onBack={vi.fn()} onOpenLogin={vi.fn()} onRegisterSuccess={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Ada' }
    });
    fireEvent.change(screen.getByPlaceholderText('you@innerly.com'), {
      target: { value: 'ada@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'short' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(handleRegister).not.toHaveBeenCalled();
  });
});
