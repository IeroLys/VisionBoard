import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogoutButton from './LogoutButton';

const mockReplace = vi.hoisted(() => vi.fn());
const mockRefresh = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: mockSignOut,
  },
}));

describe('Компонент LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('корректно рендерит кнопку выхода', () => {
    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: 'Выйти' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('успешно выходит из системы и перенаправляет пользователя', async () => {
    mockSignOut.mockResolvedValue(undefined);
    render(<LogoutButton />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Выйти' }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/login');
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('обрабатывает ошибку при выходе и разблокирует кнопку', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'));
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: 'Выйти' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).not.toHaveBeenCalled();
      expect(button).not.toBeDisabled();
    });
  });

  it('блокирует кнопку во время загрузки', async () => {
    mockSignOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: 'Выйти' });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-60');
  });
});