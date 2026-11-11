import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageSkeleton from './page-skeleton';

describe('Компонент PageSkeleton', () => {
  it('рендерит текст "Загрузка..." для скринридеров', () => {
    render(<PageSkeleton />);
    
    // sr-only скрывает элемент визуально, но оставляет его доступным для скринридеров
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.getByText('Загрузка...')).toHaveClass('sr-only');
  });

  it('устанавливает aria-busy="true" на корневой элемент', () => {
    render(<PageSkeleton />);
    
    // Ищем элемент с атрибутом aria-busy
    const skeletonContainer = document.querySelector('[aria-busy="true"]');
    expect(skeletonContainer).toBeInTheDocument();
  });

  it('рендерит правильное количество карточек-заглушек по умолчанию (3)', () => {
    const { container } = render(<PageSkeleton />);
    
    // Находим сетку, в которой рендерятся карточки
    const grid = container.querySelector('.grid.grid-cols-1');
    expect(grid).toBeInTheDocument();
    
    // Проверяем, что внутри сетки ровно 3 дочерних элемента (карточки)
    expect(grid?.children.length).toBe(3);
  });

  it('рендерит указанное количество карточек-заглушек при передаче пропа cards', () => {
    const { container } = render(<PageSkeleton cards={5} />);
    
    const grid = container.querySelector('.grid.grid-cols-1');
    expect(grid).toBeInTheDocument();
    
    // Проверяем, что внутри сетки ровно 5 дочерних элементов
    expect(grid?.children.length).toBe(5);
  });

  it('рендерит скелетон заголовка с правильными классами', () => {
    const { container } = render(<PageSkeleton />);
    
    // Проверяем наличие основных элементов скелетона заголовка
    const headerSkeleton = container.querySelector('.h-\\[160px\\].bg-overcast-sky');
    expect(headerSkeleton).toBeInTheDocument();
    
    // Проверяем наличие полосок-заглушек внутри заголовка
    const bars = container.querySelectorAll('.bg-white\\/70.rounded-full');
    expect(bars.length).toBe(2);
  });
});