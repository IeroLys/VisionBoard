import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DialogShell, ConfirmDialog, RenameDialog } from './dialog';

describe('Компоненты диалоговых окон (dialog.tsx)', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('DialogShell', () => {
    it('корректно рендерит заголовок и дочерние элементы', () => {
      render(
        <DialogShell title="Тестовый заголовок" onClose={mockOnClose}>
          <p>Тестовый контент</p>
        </DialogShell>
      );
      expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument();
      expect(screen.getByText('Тестовый контент')).toBeInTheDocument();
    });

    it('блокирует скролл body при монтировании и восстанавливает при размонтировании', () => {
      const { unmount } = render(
        <DialogShell title="Test" onClose={mockOnClose}>
          Content
        </DialogShell>
      );
      expect(document.body.style.overflow).toBe('hidden');
      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('закрывает диалог при нажатии Escape', () => {
      render(<DialogShell title="Test" onClose={mockOnClose}>Content</DialogShell>);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('закрывает диалог при клике на крестик', () => {
      render(<DialogShell title="Test" onClose={mockOnClose}>Content</DialogShell>);
      fireEvent.click(screen.getByLabelText('Закрыть'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('закрывает диалог при клике на затемненный фон (overlay)', () => {
      render(<DialogShell title="Test" onClose={mockOnClose}>Content</DialogShell>);
      const overlay = screen.getByRole('dialog');
      fireEvent.mouseDown(overlay, { target: overlay, currentTarget: overlay });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConfirmDialog', () => {
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
      mockOnConfirm.mockResolvedValue(undefined);
    });

    it('корректно рендерит сообщение и кнопки с кастомным лейблом', () => {
      render(
        <ConfirmDialog
          title="Подтверждение"
          message="Вы уверены?"
          confirmLabel="Да, удалить"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Вы уверены?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Да, удалить' })).toBeInTheDocument();
    });

    it('вызывает onClose при нажатии "Отмена"', () => {
      render(
        <ConfirmDialog title="Test" message="Msg" onConfirm={mockOnConfirm} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('успешно вызывает onConfirm и закрывает диалог при разрешении промиса', async () => {
      render(
        <ConfirmDialog title="Test" message="Msg" onConfirm={mockOnConfirm} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('показывает ошибку, если onConfirm возвращает строку, и не закрывает диалог', async () => {
      mockOnConfirm.mockResolvedValue('Ошибка: нет прав доступа');
      render(
        <ConfirmDialog title="Test" message="Msg" onConfirm={mockOnConfirm} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      
      expect(await screen.findByText('Ошибка: нет прав доступа')).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('показывает общую ошибку при выбросе исключения (catch)', async () => {
      mockOnConfirm.mockRejectedValue(new Error('Network fail'));
      render(
        <ConfirmDialog title="Test" message="Msg" onConfirm={mockOnConfirm} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      
      expect(await screen.findByText('Что-то пошло не так. Попробуйте ещё раз')).toBeInTheDocument();
    });

    it('блокирует кнопку и меняет текст во время pending', async () => {
      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnConfirm.mockReturnValue(pendingPromise);

      render(
        <ConfirmDialog title="Test" message="Msg" onConfirm={mockOnConfirm} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      
      const button = screen.getByRole('button', { name: 'Удаление...' });
      expect(button).toBeDisabled();

      act(() => {
        resolvePromise!();
      });
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Удаление...' })).not.toBeInTheDocument();
      });
    });
  });

  describe('RenameDialog', () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
      mockOnSubmit.mockResolvedValue(undefined);
    });

    it('корректно рендерит форму с начальным значением', () => {
      render(
        <RenameDialog
          title="Переименование"
          label="Новое имя:"
          initialValue="Старое имя"
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Переименование')).toBeInTheDocument();
      expect(screen.getByLabelText('Новое имя:')).toBeInTheDocument();
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Старое имя');
    });

    it('мгновенно закрывает диалог, если значение не изменилось (после trim)', () => {
      render(
        <RenameDialog
          title="Test"
          label="Label"
          initialValue="Имя"
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '  Имя  ' } });
      fireEvent.submit(input.closest('form')!);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('показывает ошибку, если поле очищено', async () => {
      render(
        <RenameDialog title="Test" label="Label" initialValue="Old" onSubmit={mockOnSubmit} onClose={mockOnClose} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.submit(input.closest('form')!);
      
      expect(await screen.findByText('Название не может быть пустым')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('успешно вызывает onSubmit с обрезанным значением и закрывает диалог', async () => {
      render(
        <RenameDialog title="Test" label="Label" initialValue="Old" onSubmit={mockOnSubmit} onClose={mockOnClose} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '  New Name  ' } });
      fireEvent.submit(input.closest('form')!);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('New Name');
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('показывает ошибку от сервера и не закрывает диалог', async () => {
      mockOnSubmit.mockResolvedValue('Такое имя уже занято');
      render(
        <RenameDialog title="Test" label="Label" initialValue="Old" onSubmit={mockOnSubmit} onClose={mockOnClose} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New' } });
      fireEvent.submit(input.closest('form')!);
      
      expect(await screen.findByText('Такое имя уже занято')).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('очищает ошибку при изменении поля ввода', async () => {
      render(
        <RenameDialog title="Test" label="Label" initialValue="Old" onSubmit={mockOnSubmit} onClose={mockOnClose} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.submit(input.closest('form')!);
      
      expect(await screen.findByText('Название не может быть пустым')).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: 'Теперь ок' } });
      expect(screen.queryByText('Название не может быть пустым')).not.toBeInTheDocument();
    });

    it('блокирует кнопку и меняет текст во время pending', async () => {
      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnSubmit.mockReturnValue(pendingPromise);

      render(
        <RenameDialog title="Test" label="Label" initialValue="Old" onSubmit={mockOnSubmit} onClose={mockOnClose} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New' } });
      fireEvent.submit(input.closest('form')!);
      
      const button = screen.getByRole('button', { name: 'Сохранение...' });
      expect(button).toBeDisabled();

      act(() => {
        resolvePromise!();
      });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Сохранить' })).not.toBeDisabled();
      });
    });
  });
});