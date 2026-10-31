import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from './RegisterForm';

const mockReplace = vi.hoisted(() => vi.fn());
const mockRefresh = vi.hoisted(() => vi.fn());
const mockSignUpEmail = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signUp: {
      email: mockSignUpEmail,
    },
  },
}));

describe('Компонент RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('корректно рендерит форму', () => {
    render(<RegisterForm />);
    expect(screen.getByText('Введите имя:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
  });

  it('показывает 3 ошибки валидации при пустой отправке', async () => {
    render(<RegisterForm />);
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(await screen.findAllByText('Поле обязательно для заполнения')).toHaveLength(3);
    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });

  it('успешно вызывает authClient.signUp и роутер при валидных данных', async () => {
    mockSignUpEmail.mockResolvedValue({ error: undefined });

    render(<RegisterForm />);
    const form = document.querySelector('form')!;
    
    const nameInput = screen.getByLabelText('Введите имя:') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Введите email:') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Придумайте пароль:') as HTMLInputElement;

    nameInput.value = 'Иван';
    fireEvent.input(nameInput);

    emailInput.value = 'ivan@test.com';
    fireEvent.input(emailInput);

    passwordInput.value = 'ValidPass123';
    fireEvent.input(passwordInput);

    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: 'Иван',
        email: 'ivan@test.com',
        password: 'ValidPass123',
      });
      expect(mockReplace).toHaveBeenCalledWith('/');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('показывает ошибку, если email уже используется', async () => {
    mockSignUpEmail.mockResolvedValue({ 
      error: { code: 'USER_ALREADY_EXISTS' } 
    });

    render(<RegisterForm />);
    const form = document.querySelector('form')!;
    
    const nameInput = screen.getByLabelText('Введите имя:') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Введите email:') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Придумайте пароль:') as HTMLInputElement;

    nameInput.value = 'Иван';
    fireEvent.input(nameInput);
    emailInput.value = 'ivan@test.com';
    fireEvent.input(emailInput);
    passwordInput.value = 'ValidPass123';
    fireEvent.input(passwordInput);
    
    fireEvent.submit(form);

    expect(await screen.findByText('Этот email уже используется.')).toBeInTheDocument();
  });
});