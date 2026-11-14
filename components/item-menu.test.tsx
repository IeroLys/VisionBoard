import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItemMenu from './item-menu';

describe('Компонент ItemMenu', () => {
  const mockOnRename = vi.fn();
  const mockOnDelete = vi.fn();
  
  const defaultProps = {
    itemTitle: 'Тестовый проект',
    kind: {
      label: 'проекта',
      renameTitle: 'Переименование проекта',
      deleteTitle: 'Удалить проект?',
      deleteWarning: 'Все данные будут потеряны',
    },
    onRename: mockOnRename,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRename.mockResolvedValue(undefined);
    mockOnDelete.mockResolvedValue(undefined);
  });

  it('корректно рендерит кнопку меню с правильным aria-label', () => {
    render(<ItemMenu {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'Действия: Тестовый проект' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('открывает и закрывает меню при клике на кнопку', () => {
    render(<ItemMenu {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'Действия: Тестовый проект' });
    
    // Открываем
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Переименовать')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
    
    // Закрываем
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('закрывает меню при клике вне его области', () => {
    render(<ItemMenu {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'Действия: Тестовый проект' });
    fireEvent.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    // Клик по body (имитация клика вне компонента)
    fireEvent.mouseDown(document.body);
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('закрывает меню при нажатии клавиши Escape', () => {
    render(<ItemMenu {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'Действия: Тестовый проект' });
    fireEvent.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('предотвращает всплытие клика (stopPropagation), чтобы не срабатывали родительские обработчики', () => {
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <ItemMenu {...defaultProps} />
      </div>
    );
    
    const button = screen.getByRole('button', { name: 'Действия: Тестовый проект' });
    
    // Клик по кнопке должен быть остановлен внутри ItemMenu и не дойти до родителя
    fireEvent.click(button);
    
    expect(onParentClick).not.toHaveBeenCalled();
  });

    it('не рендерит кнопку "Переименовать", если onRename не передан', () => {
    // Создаем новый объект пропсов, явно исключая onRename, без создания лишних переменных
    const propsWithoutRename = Object.fromEntries(
      Object.entries(defaultProps).filter(([key]) => key !== 'onRename')
    ) as typeof defaultProps;

    render(<ItemMenu {...propsWithoutRename} />);
    
    const button = screen.getByRole('button', { name: 'Действия: Тестовый проект' });
    fireEvent.click(button);
    
    expect(screen.queryByText('Переименовать')).not.toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  it('открывает RenameDialog и закрывает меню при клике на "Переименовать"', () => {
    render(<ItemMenu {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Действия: Тестовый проект' }));
    fireEvent.click(screen.getByText('Переименовать'));
    
    // Меню закрылось
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    
    // Диалог открылся с правильными пропсами
    expect(screen.getByText('Переименование проекта')).toBeInTheDocument();
    expect(screen.getByLabelText('Новое название проекта:')).toBeInTheDocument();
    
    // Проверяем, что initialValue передан корректно (через value инпута)
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Тестовый проект');
  });

  it('открывает ConfirmDialog и закрывает меню при клике на "Удалить"', () => {
    render(<ItemMenu {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Действия: Тестовый проект' }));
    fireEvent.click(screen.getByText('Удалить'));
    
    // Меню закрылось
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    
    // Диалог открылся с правильными пропсами
    expect(screen.getByText('Удалить проект?')).toBeInTheDocument();
    
    // ИСПРАВЛЕНО: Находим сам диалог и проверяем его текстовое содержимое. 
    // Это надежно работает, даже если текст разбит тегами <span> на части.
    const dialog = screen.getByRole('dialog', { name: 'Удалить проект?' });
    expect(dialog).toHaveTextContent('Вы уверены, что хотите удалить «Тестовый проект»?');
    expect(dialog).toHaveTextContent('Все данные будут потеряны');
  });

  it('корректно обрабатывает закрытие диалога (возврат в исходное состояние)', async () => {
    render(<ItemMenu {...defaultProps} />);
    
    // Открываем диалог удаления
    fireEvent.click(screen.getByRole('button', { name: 'Действия: Тестовый проект' }));
    fireEvent.click(screen.getByText('Удалить'));
    
    // Находим кнопку "Отмена" внутри ConfirmDialog и нажимаем её
    const cancelButton = screen.getByRole('button', { name: 'Отмена' });
    fireEvent.click(cancelButton);
    
    // Диалог закрылся, меню тоже закрыто (оно закрылось при открытии диалога)
    expect(screen.queryByText('Удалить проект?')).not.toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    
    // Можем снова открыть меню
    fireEvent.click(screen.getByRole('button', { name: 'Действия: Тестовый проект' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});