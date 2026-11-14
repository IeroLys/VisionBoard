import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateCanvasModal from './create-canvas';

describe('Компонент CreateCanvasModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnCreate.mockResolvedValue(undefined);
  });

  it('корректно рендерит модальное окно', () => {
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    expect(screen.getByText('Создание холста')).toBeInTheDocument();
    expect(screen.getByLabelText('Введите название холста:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /создать/i })).toBeInTheDocument();
  });

  it('вызывает onClose при клике на кнопку закрытия (крестик)', () => {
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );

    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('показывает ошибку и не вызывает onCreate при попытке создать холст с пустым именем', async () => {
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText('Пожалуйста, введите название холста')).toBeInTheDocument();
    expect(mockOnCreate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled(); // Модалка остается открытой
  });

  it('показывает ошибку при попытке создать холст с существующим именем (регистронезависимо)', async () => {
    render(
      <CreateCanvasModal 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
        existingCanvs={['Мой Холст']} 
      />
    );
    
    const input = screen.getByLabelText('Введите название холста:');
    fireEvent.change(input, { target: { value: 'мой холст' } });
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText('Холст с таким названием уже существует')).toBeInTheDocument();
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('успешно вызывает onCreate с обрезанным (trimmed) именем', async () => {
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const input = screen.getByLabelText('Введите название холста:');
    fireEvent.change(input, { target: { value: '  Новый Холст  ' } });
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(mockOnCreate).toHaveBeenCalledWith('Новый Холст');
  });

  it('показывает ошибку сервера, если onCreate возвращает строку ошибки', async () => {
    mockOnCreate.mockResolvedValue('Превышен лимст количества холстов');
    
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const input = screen.getByLabelText('Введите название холста:');
    fireEvent.change(input, { target: { value: 'Тестовый холст' } });
    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText('Превышен лимст количества холстов')).toBeInTheDocument();
  });

  it('показывает общую ошибку при исключении (throw) во время сохранения', async () => {
    mockOnCreate.mockRejectedValue(new Error('Network error'));
    
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const input = screen.getByLabelText('Введите название холста:');
    fireEvent.change(input, { target: { value: 'Сбой' } });
    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText('Не удалось сохранить. Попробуйте ещё раз')).toBeInTheDocument();
  });

  it('блокирует кнопку и меняет текст на "Создание..." во время ожидания (pending)', async () => {
    let resolvePromise: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnCreate.mockReturnValue(pendingPromise);

    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const input = screen.getByLabelText('Введите название холста:');
    fireEvent.change(input, { target: { value: 'Долгий холст' } });
    fireEvent.submit(document.querySelector('form')!);

    const button = screen.getByRole('button', { name: /создание/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Создание...');

    // Разрешаем промис, чтобы завершить тест и снять блокировку
    resolvePromise!();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /создать/i })).not.toBeDisabled();
    });
  });

  it('закрывает модальное окно при нажатии клавиши Escape', () => {
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('закрывает модальное окно при клике на фон (overlay)', () => {
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const overlay = screen.getByRole('dialog');
    
    // Симулируем клик именно по фону (target === currentTarget)
    fireEvent.mouseDown(overlay, { target: overlay });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('очищает ошибку при вводе текста в поле после неудачной попытки', async () => {
    render(
      <CreateCanvasModal onClose={mockOnClose} onCreate={mockOnCreate} />
    );
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    
    expect(await screen.findByText('Пожалуйста, введите название холста')).toBeInTheDocument();
    
    const input = screen.getByLabelText('Введите название холста:');
    fireEvent.change(input, { target: { value: 'Теперь текст есть' } });
    
    expect(screen.queryByText('Пожалуйста, введите название холста')).not.toBeInTheDocument();
  });
});