import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddTaskModal from './AddTaskModal'; // Укажите правильный путь к вашему компоненту

describe('Компонент AddTaskModal', () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // По умолчанию onAdd успешно завершается без ошибок (возвращает void)
    mockOnAdd.mockResolvedValue(undefined);
  });

  it('корректно рендерит модальное окно', () => {
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    expect(screen.getByText('Новая задача')).toBeInTheDocument();
    expect(screen.getByLabelText('Введите задачу:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument();
  });

  it('вызывает onClose при клике на кнопку закрытия (крестик)', () => {
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );

    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ТРЕБОВАНИЕ 2: При нажатии кнопки "добавить" без введения текста должно выводиться сообщение, туду не появится, модалка висит
  it('показывает ошибку и не вызывает onAdd/onClose при попытке добавить задачу с пустым именем', async () => {
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText('Пожалуйста, введите название задачи')).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled(); // Модальное окно остается открытым
  });

  // ТРЕБОВАНИЕ 1: При нажатии кнопки "добавить" модальное окно закрывается, туду добавилось
  it('успешно вызывает onAdd с обрезанным (trimmed) именем и закрывает модалку', async () => {
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const input = screen.getByLabelText('Введите задачу:');
    fireEvent.change(input, { target: { value: '  Новая важная задача  ' } });
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(mockOnAdd).toHaveBeenCalledWith('Новая важная задача');
    
    // Ожидаем, что onClose будет вызван после успешного завершения onAdd
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('показывает ошибку сервера, если onAdd возвращает строку ошибки', async () => {
    mockOnAdd.mockResolvedValue('Задача с таким названием уже существует в этом холсте');
    
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const input = screen.getByLabelText('Введите задачу:');
    fireEvent.change(input, { target: { value: 'Дубликат' } });
    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText('Задача с таким названием уже существует в этом холсте')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled(); // Модалка не должна закрыться при ошибке
  });

  it('показывает общую ошибку при исключении (throw) во время сохранения', async () => {
    mockOnAdd.mockRejectedValue(new Error('Network error'));
    
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const input = screen.getByLabelText('Введите задачу:');
    fireEvent.change(input, { target: { value: 'Сбой' } });
    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText('Не удалось сохранить. Попробуйте ещё раз')).toBeInTheDocument();
  });

  it('блокирует кнопку и меняет текст на "Добавление..." во время ожидания (pending)', async () => {
    let resolvePromise: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnAdd.mockReturnValue(pendingPromise);

    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const input = screen.getByLabelText('Введите задачу:');
    fireEvent.change(input, { target: { value: 'Долгая задача' } });
    fireEvent.submit(document.querySelector('form')!);

    const button = screen.getByRole('button', { name: /добавление/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Добавление...');

    // Разрешаем промис, чтобы завершить тест
    resolvePromise!();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /добавить/i })).not.toBeDisabled();
    });
  });

  it('закрывает модальное окно при нажатии клавиши Escape', () => {
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('закрывает модальное окно при клике на фон (overlay)', () => {
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    // Находим внешний div, который является фоном (role="dialog" - это он же или его родитель)
    const overlay = screen.getByRole('dialog');
    
    // Симулируем клик именно по фону (target === currentTarget)
    fireEvent.mouseDown(overlay, { target: overlay });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('очищает ошибку при вводе текста в поле после неудачной попытки', async () => {
    render(
      <AddTaskModal onClose={mockOnClose} onAdd={mockOnAdd} />
    );
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    
    expect(await screen.findByText('Пожалуйста, введите название задачи')).toBeInTheDocument();
    
    const input = screen.getByLabelText('Введите задачу:');
    fireEvent.change(input, { target: { value: 'Теперь текст есть' } });
    
    expect(screen.queryByText('Пожалуйста, введите название задачи')).not.toBeInTheDocument();
  });
});