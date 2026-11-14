import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectDescription from './ProjectDescription';

describe('Компонент ProjectDescription', () => {
  beforeEach(() => {
    // Мокаем console.log, чтобы не засорять вывод тестов и иметь возможность проверить его вызов
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('рендерит заголовок и по умолчанию свернут', () => {
    render(<ProjectDescription />);
    
    expect(screen.getByText('Описание')).toBeInTheDocument();
    // Содержимого не должно быть в DOM, так как панель свернута
    expect(screen.queryByText('Описание пока не добавлено')).not.toBeInTheDocument();
  });

  it('разворачивает и сворачивает содержимое при клике на заголовок или шеврон', () => {
    render(<ProjectDescription />);
    
    // Разворачиваем по клику на заголовок
    fireEvent.click(screen.getByText('Описание'));
    expect(screen.getByText('Описание пока не добавлено')).toBeInTheDocument();
    
    // Сворачиваем по клику на иконку шеврона
    const collapseButton = screen.getByLabelText('Свернуть');
    fireEvent.click(collapseButton);
    expect(screen.queryByText('Описание пока не добавлено')).not.toBeInTheDocument();
  });

  it('корректно отображает initialDescription при разворачивании', () => {
    render(<ProjectDescription initialDescription="Это тестовый проект" />);
    
    fireEvent.click(screen.getByText('Описание'));
    expect(screen.getByText('Это тестовый проект')).toBeInTheDocument();
  });

  it('переходит в режим редактирования при клике на иконку карандаша', () => {
    render(<ProjectDescription initialDescription="Старое описание" />);
    
    // 1. Открываем панель
    fireEvent.click(screen.getByText('Описание'));
    
    // 2. Нажимаем редактировать
    const editButton = screen.getByLabelText('Редактировать описание');
    fireEvent.click(editButton);
    
    // 3. Проверяем появление textarea и кнопок
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Старое описание');
    
    expect(screen.getByText('Отмена')).toBeInTheDocument();
    expect(screen.getByText('Сохранить')).toBeInTheDocument();
  });

  it('отменяет редактирование и сбрасывает изменения в textarea', () => {
    render(<ProjectDescription initialDescription="Старое описание" />);
    
    fireEvent.click(screen.getByText('Описание'));
    fireEvent.click(screen.getByLabelText('Редактировать описание'));
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Новое описание' } });
    
    // Нажимаем Отмена
    fireEvent.click(screen.getByText('Отмена'));
    
    // Режим редактирования должен закрыться, а старое описание вернуться
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Старое описание')).toBeInTheDocument();
  });

  it('сохраняет новое описание и вызывает console.log', () => {
    render(<ProjectDescription initialDescription="Старое описание" />);
    
    fireEvent.click(screen.getByText('Описание'));
    fireEvent.click(screen.getByLabelText('Редактировать описание'));
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Совершенно новое описание' } });
    
    // Нажимаем Сохранить
    fireEvent.click(screen.getByText('Сохранить'));
    
    // Режим редактирования закрыт, отображается новый текст
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Совершенно новое описание')).toBeInTheDocument();
    
    // Проверяем, что заглушка API была вызвана с правильными данными
    expect(console.log).toHaveBeenCalledWith('Сохранено описание:', 'Совершенно новое описание');
  });

  it('не показывает кнопку редактирования, когда панель свернута', () => {
    render(<ProjectDescription initialDescription="Тест" />);
    
    // Кнопка редактирования не должна рендериться, пока isOpen === false
    expect(screen.queryByLabelText('Редактировать описание')).not.toBeInTheDocument();
    
    // Открываем -> появляется
    fireEvent.click(screen.getByText('Описание'));
    expect(screen.getByLabelText('Редактировать описание')).toBeInTheDocument();
  });
});