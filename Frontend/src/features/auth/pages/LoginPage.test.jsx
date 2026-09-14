import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './LoginPage.jsx';

const handleLogin = vi.fn();

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ handleLogin })
}));

describe('Login flow', () => {
  beforeEach(() => {
    handleLogin.mockClear();
  });

  it('submits credentials and opens the app on success', async () => {
    const onLoginSuccess = vi.fn();
    handleLogin.mockResolvedValueOnce({ success: true });

    render(<Login onBack={vi.fn()} onOpenRegister={vi.fn()} onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('you@innerly.com'), {
      target: { value: 'ada@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalled());
    expect(handleLogin).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'password123'
    });
  });

  it('shows backend errors', async () => {
    handleLogin.mockResolvedValueOnce({ success: false, message: 'Invalid login' });

    render(<Login onBack={vi.fn()} onOpenRegister={vi.fn()} onLoginSuccess={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('you@innerly.com'), {
      target: { value: 'ada@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'wrong-password' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid login')).toBeInTheDocument();
  });

  it('warns and does not submit invalid email format', async () => {
    render(<Login onBack={vi.fn()} onOpenRegister={vi.fn()} onLoginSuccess={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('you@innerly.com'), {
      target: { value: 'bad-email' }
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(handleLogin).not.toHaveBeenCalled();
  });
});
