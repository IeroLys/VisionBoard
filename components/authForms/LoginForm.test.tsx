import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Компонент LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('должен отображать форму входа', () => {
    const { getByRole, getByLabelText } = render(<LoginForm />);
    
    expect(getByRole('heading', { name: /вход/i })).toBeInTheDocument();
    expect(getByLabelText(/введите email/i)).toBeInTheDocument();
    expect(getByLabelText(/введите пароль/i)).toBeInTheDocument();
  });

  it('должен показывать 2 ошибки при отправке пустой формы', async () => {
    const user = userEvent.setup();
    const { getByRole, findAllByText, container } = render(<LoginForm />);
    
    // Отключаем нативную валидацию, чтобы сработала наша кастомная проверка на пустоту
    container.querySelector('form')!.noValidate = true;

    await user.click(getByRole('button', { name: /войти/i }));

    const errorMessages = await findAllByText('Поле обязательно для заполнения');
    expect(errorMessages).toHaveLength(2);
  });

  // ✅ ИСПРАВЛЕНО: Отключаем нативную валидацию, чтобы форма отправилась с неверным email
  it('должен показывать ошибку при неверном формате email', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole, findByText, container } = render(<LoginForm />);
    
    container.querySelector('form')!.noValidate = true;

    await user.type(getByLabelText(/введите email/i), 'not-an-email');
    await user.type(getByLabelText(/введите пароль/i), 'ValidPass123');
    await user.click(getByRole('button', { name: /войти/i }));

    expect(await findByText('Неверный формат email')).toBeInTheDocument();
  });

  it('должен показывать ошибку, если пароль короче 8 символов', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole, findByText, container } = render(<LoginForm />);
    
    container.querySelector('form')!.noValidate = true;

    await user.type(getByLabelText(/введите email/i), 'test@example.com');
    await user.type(getByLabelText(/введите пароль/i), '123');
    await user.click(getByRole('button', { name: /войти/i }));

    expect(await findByText('Пароль должен содержать от 8 до 30 символов')).toBeInTheDocument();
  });

  it('должен показать общую ошибку при неверном пароле (ответ сервера)', async () => {
    const user = userEvent.setup();
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid password' }),
    } as unknown as Response);

    const { getByLabelText, getByRole, findByText, container } = render(<LoginForm />);
    container.querySelector('form')!.noValidate = true;

    await user.type(getByLabelText(/введите email/i), 'test@example.com');
    await user.type(getByLabelText(/введите пароль/i), 'WrongPass123');
    await user.click(getByRole('button', { name: /войти/i }));

    expect(await findByText('Неверный email или пароль')).toBeInTheDocument();
  });

  it('должен показать ошибку сети при сбое fetch', async () => {
    const user = userEvent.setup();
    
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const { getByLabelText, getByRole, findByText, container } = render(<LoginForm />);
    container.querySelector('form')!.noValidate = true;

    await user.type(getByLabelText(/введите email/i), 'test@example.com');
    await user.type(getByLabelText(/введите пароль/i), 'ValidPass123');
    await user.click(getByRole('button', { name: /войти/i }));

    expect(await findByText('Ошибка сети. Проверьте подключение к интернету.')).toBeInTheDocument();
  });

    it('должен показать дефолтную ошибку при неизвестном сообщении от сервера', async () => {
    const user = userEvent.setup();
    
    // Мокаем ошибку, которая НЕ попадает ни под один if в getRussianAuthError
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Unknown database error' }),
    } as unknown as Response);

    const { getByLabelText, getByRole, findByText, container } = render(<LoginForm />);
    container.querySelector('form')!.noValidate = true;

    await user.type(getByLabelText(/введите email/i), 'test@example.com');
    await user.type(getByLabelText(/введите пароль/i), 'ValidPass123');
    await user.click(getByRole('button', { name: /войти/i }));

    // Проверяем, что сработал именно дефолтный return
    expect(await findByText('Неверный email или пароль.')).toBeInTheDocument();
  });
});