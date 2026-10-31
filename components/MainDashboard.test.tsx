import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import MainDashboard from './MainDashboard'; 

vi.mock('@/components/LogoutButton', () => ({
  default: () => <button aria-label="Выйти">Mocked Logout</button>
}));

describe('Компонент MainDashboard', () => {
  const getCreateButton = () => {
    const textButton = screen.queryByRole('button', { name: /Создать проект/i });
    if (textButton) return textButton;

    const buttons = screen.getAllByRole('button');
    const plusButton = buttons.find(btn => btn.querySelector('.lucide-plus'));
    
    if (plusButton) return plusButton;

    throw new Error('Не удалось найти кнопку создания проекта');
  };

  it('корректно рендерит пустое состояние', () => {
    render(<MainDashboard />);
    expect(screen.getByText(/У вас пока нет проектов/i)).toBeInTheDocument();
  });

  it('открывает модальное окно при клике на кнопку создания', () => {
    render(<MainDashboard />);
    fireEvent.click(getCreateButton());
    expect(screen.getByText('Создание проекта')).toBeInTheDocument();
  });

  it('создает новый проект через модальное окно и отображает его', async () => {
    render(<MainDashboard />);
    
    fireEvent.click(getCreateButton());
    
    const input = screen.getByLabelText('Введите название проекта:');
    fireEvent.change(input, { target: { value: 'Мой первый проект' } });
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByText('Создание проекта')).not.toBeInTheDocument();
      expect(screen.getByText('Мой первый проект')).toBeInTheDocument();
    });
  });

  it('корректно работает переключатель "Посмотреть все проекты"', async () => {
    render(<MainDashboard />);
    
    const addProject = (name: string) => {
      fireEvent.click(getCreateButton());
      const input = screen.getByLabelText('Введите название проекта:');
      fireEvent.change(input, { target: { value: name } });
      fireEvent.submit(document.querySelector('form')!);
    };

    addProject('Проект 1');
    addProject('Проект 2');
    addProject('Проект 3');

    await waitFor(() => {
      expect(screen.getByText('Проект 3')).toBeInTheDocument();
    });


    addProject('Проект 4');

    const showAllBtn = await screen.findByRole('button', { name: /Посмотреть все проекты \(4\)/i });
    fireEvent.click(showAllBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Проект 4')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Скрыть/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Скрыть/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Скрыть/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Проект 4')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Посмотреть все проекты \(4\)/i })).toBeInTheDocument();
    });
  });
});