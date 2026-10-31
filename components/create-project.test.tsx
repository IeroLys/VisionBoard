import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateBoardModal from './create-project';

describe('Компонент CreateBoardModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('корректно рендерит модальное окно', () => {
    render(
      <CreateBoardModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    expect(screen.getByText('Создание проекта')).toBeInTheDocument();
    expect(screen.getByLabelText('Введите название проекта:')).toBeInTheDocument();
  });

  it('вызывает onClose при клике на кнопку закрытия', () => {
    render(
      <CreateBoardModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );

    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('показывает ошибку при попытке создать проект с пустым именем', async () => {
    render(
      <CreateBoardModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText('Пожалуйста, введите название проекта')).toBeInTheDocument();
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('показывает ошибку при попытке создать проект с существующим именем (регистронезависимо)', async () => {
    render(
      <CreateBoardModal 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
        existingProjects={['Мой Проект']} 
      />
    );
    
    const input = screen.getByLabelText('Введите название проекта:');
    fireEvent.change(input, { target: { value: 'мой проект' } });
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText('Проект с таким названием уже существует')).toBeInTheDocument();
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('успешно вызывает onCreate с_trimmed_ именем и очищает ошибку', async () => {
    render(
      <CreateBoardModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const input = screen.getByLabelText('Введите название проекта:');
    
    fireEvent.change(input, { target: { value: '   ' } });
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    
    expect(await screen.findByText('Пожалуйста, введите название проекта')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '  Новый Проект  ' } });
    fireEvent.submit(form);

    expect(mockOnCreate).toHaveBeenCalledWith('Новый Проект');
  });
});