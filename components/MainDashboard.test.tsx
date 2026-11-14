import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainDashboard from './MainDashboard';
import * as projectActions from '@/lib/actions/projects';

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// 1. Мокаем серверные действия
vi.mock('@/lib/actions/projects', () => ({
  createProject: vi.fn(),
  renameProject: vi.fn(),
  deleteProject: vi.fn(),
}));

// 2. Мокаем форматирование для предсказуемого вывода
vi.mock('@/lib/format', () => ({
  formatDateRu: () => '01.01.2024',
  pluralRu: (count: number, forms: string[]) => {
    if (count === 1) return forms[0];
    if (count >= 2 && count <= 4) return forms[1];
    return forms[2];
  },
}));

// 3. Мокаем дочерние компоненты, чтобы тестировать только логику MainDashboard
vi.mock('@/components/create-project', () => ({
  default: ({ onCreate, onClose }: { onCreate: (name: string) => void; onClose: () => void }) => (
    <div data-testid="create-project-modal" role="dialog">
      <button data-testid="mock-create-btn" onClick={() => onCreate('Новый тестовый проект')}>
        Создать (Mock)
      </button>
      <button data-testid="mock-close-btn" onClick={onClose}>
        Закрыть (Mock)
      </button>
    </div>
  ),
}));

vi.mock('@/components/item-menu', () => ({
  default: ({
    itemTitle,
    onRename,
    onDelete,
  }: {
    itemTitle: string;
    onRename?: (title: string) => void;
    onDelete: () => void;
  }) => (
    <div data-testid={`item-menu-${itemTitle}`}>
      {onRename && (
        <button data-testid={`rename-${itemTitle}`} onClick={() => onRename('Переименованный проект')}>
          Переименовать
        </button>
      )}
      <button data-testid={`delete-${itemTitle}`} onClick={() => onDelete()}>
        Удалить
      </button>
    </div>
  ),
}));

vi.mock('@/components/LogoutButton', () => ({
  default: () => <button aria-label="Выйти">Mocked Logout</button>,
}));

describe('Компонент MainDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('корректно рендерит пустое состояние и имя пользователя', () => {
    render(<MainDashboard userName="Иван Иванов" />);
    
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText(/У вас пока нет проектов/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Создать проект' })).toBeInTheDocument();
  });

  it('открывает модальное окно при клике на кнопку создания в пустом состоянии', () => {
    render(<MainDashboard />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Создать проект' }));
    
    expect(screen.getByTestId('create-project-modal')).toBeInTheDocument();
  });

  it('успешно создает новый проект через модальное окно и обновляет состояние', async () => {
    vi.mocked(projectActions.createProject).mockResolvedValue({
      ok: true,
      data: {
        id: 'proj-1',
        title: 'Новый тестовый проект',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        userId: 'user-1',
      },
    } as ActionResult<{
      id: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
    }>);

    render(<MainDashboard />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Создать проект' }));
    expect(screen.getByTestId('create-project-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('mock-create-btn'));
    
    await waitFor(() => {
      expect(projectActions.createProject).toHaveBeenCalledWith('Новый тестовый проект');
    });
    
    expect(screen.queryByTestId('create-project-modal')).not.toBeInTheDocument();
    expect(screen.getByText('Новый тестовый проект')).toBeInTheDocument();
    expect(screen.getByText('0 холстов · создан 01.01.2024')).toBeInTheDocument();
  });

  it('корректно работает переключатель "Посмотреть все проекты" и "Скрыть"', async () => {
    const initialProjects = [
      { id: 'p1', title: 'Проект 1', canvasCount: 1, createdAt: '2024-01-01' },
      { id: 'p2', title: 'Проект 2', canvasCount: 2, createdAt: '2024-01-01' },
      { id: 'p3', title: 'Проект 3', canvasCount: 3, createdAt: '2024-01-01' },
      { id: 'p4', title: 'Проект 4', canvasCount: 0, createdAt: '2024-01-01' },
    ];
    
    render(<MainDashboard initialProjects={initialProjects} />);
    
    expect(screen.getByText('Проект 3')).toBeInTheDocument();
    expect(screen.queryByText('Проект 4')).not.toBeInTheDocument();
    
    const showAllBtn = screen.getByRole('button', { name: /Посмотреть все проекты \(4\)/i });
    fireEvent.click(showAllBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Проект 4')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Скрыть/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Скрыть/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Проект 4')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Скрыть/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Посмотреть все проекты \(4\)/i })).toBeInTheDocument();
    });
  });

  it('успешно переименовывает проект и обновляет состояние', async () => {
    // ✅ ИСПРАВЛЕНО: добавлены недостающие поля createdAt, updatedAt, userId
    vi.mocked(projectActions.renameProject).mockResolvedValue({
      ok: true,
      data: { 
        id: 'p1', 
        title: 'Переименованный проект',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
      },
    } as ActionResult<{ 
      id: string; 
      title: string; 
      createdAt: Date; 
      updatedAt: Date; 
      userId: string; 
    }>);

    const initialProjects = [{ id: 'p1', title: 'Старое имя', canvasCount: 0 }];
    render(<MainDashboard initialProjects={initialProjects} />);
    
    fireEvent.click(screen.getByTestId('rename-Старое имя'));
    
    await waitFor(() => {
      expect(projectActions.renameProject).toHaveBeenCalledWith('p1', 'Переименованный проект');
    });
    
    expect(screen.queryByText('Старое имя')).not.toBeInTheDocument();
    expect(screen.getByText('Переименованный проект')).toBeInTheDocument();
  });

  it('успешно удаляет проект и обновляет состояние', async () => {
    // ✅ Для надежности явно указываем тип и для deleteProject
    vi.mocked(projectActions.deleteProject).mockResolvedValue({
      ok: true,
      data: { id: 'p1' },
    } as ActionResult<{ id: string }>);

    const initialProjects = [{ id: 'p1', title: 'Проект для удаления', canvasCount: 0 }];
    render(<MainDashboard initialProjects={initialProjects} />);
    
    fireEvent.click(screen.getByTestId('delete-Проект для удаления'));
    
    await waitFor(() => {
      expect(projectActions.deleteProject).toHaveBeenCalledWith('p1');
    });
    
    expect(screen.queryByText('Проект для удаления')).not.toBeInTheDocument();
    expect(screen.getByText(/У вас пока нет проектов/i)).toBeInTheDocument();
  });
});