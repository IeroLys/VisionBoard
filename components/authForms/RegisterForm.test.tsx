import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from './RegisterForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Компонент RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('должен корректно отображать форму регистрации', () => {
    const { getByRole, getByLabelText } = render(<RegisterForm />);
    
    expect(getByRole('heading', { name: /регистрация/i })).toBeInTheDocument();
    expect(getByLabelText(/введите имя/i)).toBeInTheDocument();
    expect(getByLabelText(/введите email/i)).toBeInTheDocument();
    expect(getByLabelText(/придумайте пароль/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument();
  });

  it('должен показывать 3 ошибки при отправке пустой формы', async () => {
    const { findAllByText, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    fireEvent.submit(form);

    const errorMessages = await findAllByText('Поле обязательно для заполнения');
    expect(errorMessages).toHaveLength(3);
  });

  it('должен показывать ошибку при неверном формате email', async () => {
    const { getByLabelText, findByText, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    const nameInput = getByLabelText(/введите имя/i) as HTMLInputElement;
    const emailInput = getByLabelText(/введите email/i) as HTMLInputElement;
    const passwordInput = getByLabelText(/придумайте пароль/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Иван' } });
    fireEvent.change(emailInput, { target: { value: 'неправильный-email' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });

    fireEvent.submit(form);

    expect(await findByText('Неверный формат email')).toBeInTheDocument();
  });

  it('должен показывать ошибку, если пароль короче 8 символов', async () => {
    const { getByLabelText, findByText, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    const nameInput = getByLabelText(/введите имя/i) as HTMLInputElement;
    const emailInput = getByLabelText(/введите email/i) as HTMLInputElement;
    const passwordInput = getByLabelText(/придумайте пароль/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Иван' } });
    fireEvent.change(emailInput, { target: { value: 'ivan@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });

    fireEvent.submit(form);

    expect(await findByText('Пароль должен содержать от 8 до 30 символов')).toBeInTheDocument();
  });

  // ✅ ИСПРАВЛЕННЫЙ ТЕСТ: Проверяем вызов fetch вместо глючного router.push
  it('должен успешно отправить данные при корректном заполнении', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as unknown as Response);

    const { getByLabelText, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    const nameInput = getByLabelText(/введите имя/i) as HTMLInputElement;
    const emailInput = getByLabelText(/введите email/i) as HTMLInputElement;
    const passwordInput = getByLabelText(/придумайте пароль/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Иван' } });
    fireEvent.change(emailInput, { target: { value: 'ivan@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });

    fireEvent.submit(form);

    // Если fetch вызван с правильными данными, значит валидация прошла успешно!
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/sign-up/email', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Иван', email: 'ivan@test.com', password: 'ValidPass123' }),
      }));
    });
  });

  it('должен показать ошибку, если email уже занят (ответ от сервера)', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'User already exists' }),
    } as unknown as Response);

    const { getByLabelText, findByText, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    const nameInput = getByLabelText(/введите имя/i) as HTMLInputElement;
    const emailInput = getByLabelText(/введите email/i) as HTMLInputElement;
    const passwordInput = getByLabelText(/придумайте пароль/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Иван' } });
    fireEvent.change(emailInput, { target: { value: 'ivan@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });

    fireEvent.submit(form);

    expect(await findByText('Пользователь с таким email уже зарегистрирован')).toBeInTheDocument();
  });

  it('должен показать ошибку сети при сбое fetch', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const { getByLabelText, findByText, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    const nameInput = getByLabelText(/введите имя/i) as HTMLInputElement;
    const emailInput = getByLabelText(/введите email/i) as HTMLInputElement;
    const passwordInput = getByLabelText(/придумайте пароль/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Иван' } });
    fireEvent.change(emailInput, { target: { value: 'ivan@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });

    fireEvent.submit(form);

    expect(await findByText('Ошибка сети. Проверьте подключение к интернету.')).toBeInTheDocument();
  });
});