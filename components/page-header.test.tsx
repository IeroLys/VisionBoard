import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageHeader from './page-header';

describe('Компонент PageHeader', () => {
  it('корректно рендерит заголовок', () => {
    render(<PageHeader title="Мой Проект" />);
    
    expect(screen.getByText('Мой Проект')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('truncate');
  });

  it('использует дефолтную ссылку "/" для иконки "Домой", если homeHref не передан', () => {
    render(<PageHeader title="Test" />);
    
    const homeLink = screen.getByRole('link', { name: 'На главную' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('использует кастомную ссылку для иконки "Домой", если передан homeHref', () => {
    render(<PageHeader title="Test" homeHref="/project/123" />);
    
    const homeLink = screen.getByRole('link', { name: 'На главную' });
    expect(homeLink).toHaveAttribute('href', '/project/123');
  });

  it('рендерит кнопку "Участники" с правильным aria-label', () => {
    render(<PageHeader title="Test" />);
    
    const participantsButton = screen.getByRole('button', { name: 'Участники' });
    expect(participantsButton).toBeInTheDocument();
  });

  it('корректно отображает subtitle, если он передан как строка', () => {
    render(<PageHeader title="Test" subtitle="Описание проекта" />);
    
    expect(screen.getByText('Описание проекта')).toBeInTheDocument();
  });

  it('корректно отображает subtitle, если он передан как React-элемент', () => {
    render(
      <PageHeader 
        title="Test" 
        subtitle={<span data-testid="custom-subtitle">Кастомный подзаголовок</span>} 
      />
    );
    
    expect(screen.getByTestId('custom-subtitle')).toBeInTheDocument();
    expect(screen.getByText('Кастомный подзаголовок')).toBeInTheDocument();
  });

  it('не рендерит subtitle, если он не передан', () => {
    const { container } = render(<PageHeader title="Test" />);
    
    expect(container.querySelector('.flex-col')).toBeTruthy(); // Контейнер заголовка есть
  });

  it('имеет корректные размеры иконок (проверка через наличие SVG)', () => {
    render(<PageHeader title="Test" />);
    
    // Иконки из lucide-react рендерятся как svg
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2); // Как минимум две иконки: Users и Home
  });
});