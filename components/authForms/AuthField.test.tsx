import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuthField from './AuthField';

describe('Компонент AuthField', () => {
  it('корректно рендерит label и input', () => {
    render(<AuthField name="email" label="Введите email:" type="email" />);
    expect(screen.getByLabelText('Введите email:')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('показывает сообщение об ошибке, если оно передано', () => {
    render(<AuthField name="email" label="Email" error="Неверный формат" />);
    expect(screen.getByText('Неверный формат')).toBeInTheDocument();
  });

  it('переключает видимость пароля при клике на кнопку', () => {
    render(<AuthField name="password" label="Пароль" type="password" />);
    
    const input = screen.getByLabelText('Пароль');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: 'Показать пароль' });
    fireEvent.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Скрыть пароль');
  });
});