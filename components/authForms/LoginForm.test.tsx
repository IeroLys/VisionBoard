import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

const mockReplace = vi.hoisted(() => vi.fn());
const mockRefresh = vi.hoisted(() => vi.fn());
const mockSignInEmail = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: mockSignInEmail,
    },
  },
}));

describe('Компонент LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('корректно рендерит форму', () => {
    render(<LoginForm />);
    expect(screen.getByText('Введите email:')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('показывает ошибки валидации при пустой отправке', async () => {
    render(<LoginForm />);
    const form = document.querySelector('form')!;
    
    fireEvent.submit(form);

    expect(await screen.findAllByText('Поле обязательно для заполнения')).toHaveLength(2);
    expect(mockSignInEmail).not.toHaveBeenCalled();
  });

  it('показывает ошибку при неверном формате email', async () => {
    render(<LoginForm />);
    const form = document.querySelector('form')!;
    
    const emailInput = screen.getByLabelText('Введите email:') as HTMLInputElement;
    emailInput.value = 'bad-email';
    fireEvent.input(emailInput);

    fireEvent.submit(form);

    expect(await screen.findByText('Неверный формат email')).toBeInTheDocument();
    expect(mockSignInEmail).not.toHaveBeenCalled();
  });

  it('успешно вызывает authClient и роутер при валидных данных', async () => {
    mockSignInEmail.mockResolvedValue({ error: undefined });

    render(<LoginForm />);
    const form = document.querySelector('form')!;
    
    const emailInput = screen.getByLabelText('Введите email:') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Введите пароль:') as HTMLInputElement;

    emailInput.value = 'test@example.com';
    fireEvent.input(emailInput);

    passwordInput.value = 'ValidPass123';
    fireEvent.input(passwordInput);

    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPass123',
      });
      expect(mockReplace).toHaveBeenCalledWith('/');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('показывает общую ошибку при неудачной авторизации', async () => {
    mockSignInEmail.mockResolvedValue({ 
      error: { code: 'INVALID_EMAIL_OR_PASSWORD' } 
    });

    render(<LoginForm />);
    const form = document.querySelector('form')!;
    
    const emailInput = screen.getByLabelText('Введите email:') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Введите пароль:') as HTMLInputElement;

    emailInput.value = 'test@example.com';
    fireEvent.input(emailInput);
    passwordInput.value = 'WrongPass';
    fireEvent.input(passwordInput);
    
    fireEvent.submit(form);

    expect(await screen.findByText('Неверный email или пароль.')).toBeInTheDocument();
  });

  it('показывает ошибку сети при исключении', async () => {
    mockSignInEmail.mockRejectedValue(new Error('Network fail'));

    render(<LoginForm />);
    const form = document.querySelector('form')!;
    
    const emailInput = screen.getByLabelText('Введите email:') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Введите пароль:') as HTMLInputElement;

    emailInput.value = 'test@example.com';
    fireEvent.input(emailInput);
    passwordInput.value = 'ValidPass123';
    fireEvent.input(passwordInput);
    
    fireEvent.submit(form);

    expect(await screen.findByText('Ошибка сети. Проверьте подключение к интернету.')).toBeInTheDocument();
  });
});