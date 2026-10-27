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

  it('должен показывать ошибки валидации', async () => {
    const user = userEvent.setup();
    // Используем findAllByText вместо findByText
    const { getByRole, findAllByText } = render(<LoginForm />);

    await user.click(getByRole('button', { name: /войти/i }));

    // Ищем ВСЕ элементы с текстом ошибки
    const errorMessages = await findAllByText('Поле обязательно для заполнения');
    
    // Проверяем, что нашлось ровно 2 ошибки (для email и пароля)
    expect(errorMessages).toHaveLength(2);
  });
});