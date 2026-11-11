import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectForm from './ProjectForm';
import * as canvasActions from '@/lib/actions/canvases';

// 1. ИСПРАВЛЕНО: data теперь обязательна, если ok: true (Discriminated Union)
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// 2. Мокаем next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// 3. Мокаем серверные действия
vi.mock('@/lib/actions/canvases', () => ({
  createCanvas: vi.fn(),
  renameCanvas: vi.fn(),
  deleteCanvas: vi.fn(),
}));

// 4. Мокаем дочерние компоненты со строгой типизацией пропсов
vi.mock('@/components/create-canvas', () => ({
  default: ({ onCreate, onClose }: { onCreate: (name: string) => void; onClose: () => void }) => (
    <div data-testid="create-canvas-modal">
      <button data-testid="mock-create-btn" onClick={() => onCreate('Новый холст')}>
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
        <button onClick={() => onRename('Переименованный холст')}>Переименовать</button>
      )}
      <button onClick={() => onDelete()}>Удалить</button>
    </div>
  ),
}));

vi.mock('@/components/todo-card', () => ({
  default: ({ canvasId }: { canvasId: string }) => (
    <div data-testid={`todo-card-${canvasId}`}>TodoCard Mock</div>
  ),
}));

vi.mock('@/components/page-header', () => ({
  default: ({ title }: { title: string }) => <h1 data-testid="page-header">{title}</h1>,
}));

vi.mock('@/components/ProjectDescription', () => ({
  default: ({ initialDescription }: { initialDescription?: string }) => (
    <div data-testid="project-description">ProjectDescription Mock ({initialDescription})</div>
  ),
}));

describe('Компонент ProjectForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('отображает пустое состояние, когда нет холстов', () => {
    const { container } = render(<ProjectForm id="proj-1" title="Тестовый проект" />);
    
    expect(screen.getByText('Тестовый проект')).toBeInTheDocument();
    expect(screen.getByText(/У вас пока нет холстов/i)).toBeInTheDocument();
    
    const addButton = container.querySelector('button.group');
    expect(addButton).toBeInTheDocument();
  });

  it('отображает список начальных холстов', () => {
    const initialCanvases = [
      { id: 'c1', title: 'Холст 1', tasks: [] },
      { id: 'c2', title: 'Холст 2', tasks: [] },
    ];
    render(<ProjectForm id="proj-1" title="Тест" initialCanvases={initialCanvases} />);
    
    expect(screen.getByText('Холст 1')).toBeInTheDocument();
    expect(screen.getByText('Холст 2')).toBeInTheDocument();
    expect(screen.getByTestId('todo-card-c1')).toBeInTheDocument();
  });

  it('открывает модальное окно создания холста при клике на кнопку добавления', () => {
    const { container } = render(<ProjectForm id="proj-1" title="Тест" />);
    
    const addButton = container.querySelector('button.group');
    fireEvent.click(addButton!);
    
    expect(screen.getByTestId('create-canvas-modal')).toBeInTheDocument();
  });

  it('успешно создает новый холст, обновляет состояние и закрывает модалку', async () => {
    // ИСПРАВЛЕНО: data теперь обязательна, тип точно соответствует ожидаемому CanvasWithTasks
    vi.mocked(canvasActions.createCanvas).mockResolvedValue({
      ok: true,
      data: {
        id: 'new-canvas-id',
        title: 'Новый холст',
        tasks: [],
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        projectId: 'proj-1',
      },
    } as ActionResult<{
      id: string;
      title: string;
      tasks: {
        title: string;
        canvasId: string;
        id: string;
        createdAt: Date;
        completed: boolean;
      }[];
      createdAt: Date;
      updatedAt: Date;
      projectId: string;
    }>);

    const { container } = render(<ProjectForm id="proj-1" title="Тест" />);

    fireEvent.click(container.querySelector('button.group')!);
    expect(screen.getByTestId('create-canvas-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-create-btn'));

    await waitFor(() => {
      expect(canvasActions.createCanvas).toHaveBeenCalledWith('proj-1', 'Новый холст');
    });

    expect(screen.queryByTestId('create-canvas-modal')).not.toBeInTheDocument();
    expect(screen.getByText('Новый холст')).toBeInTheDocument();
  });

  it('успешно переименовывает холст и обновляет состояние', async () => {
    // ИСПРАВЛЕНО: data обязательна
    vi.mocked(canvasActions.renameCanvas).mockResolvedValue({
      ok: true,
      data: {
        id: 'c1',
        title: 'Переименованный холст',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        projectId: 'proj-1',
      },
    } as ActionResult<{
      id: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      projectId: string;
    }>);

    const initialCanvases = [{ id: 'c1', title: 'Холст 1', tasks: [] }];
    render(<ProjectForm id="proj-1" title="Тест" initialCanvases={initialCanvases} />);

    fireEvent.click(screen.getByText('Переименовать'));

    await waitFor(() => {
      expect(canvasActions.renameCanvas).toHaveBeenCalledWith('c1', 'Переименованный холст');
    });

    expect(screen.queryByText('Холст 1')).not.toBeInTheDocument();
    expect(screen.getByText('Переименованный холст')).toBeInTheDocument();
  });

  it('успешно удаляет холст и обновляет состояние', async () => {
    // ИСПРАВЛЕНО: deleteCanvas возвращает { id: string } в data, согласно ошибке TS
    vi.mocked(canvasActions.deleteCanvas).mockResolvedValue({
      ok: true,
      data: { id: 'c1' }, 
    } as ActionResult<{ id: string }>);

    const initialCanvases = [{ id: 'c1', title: 'Холст 1', tasks: [] }];
    render(<ProjectForm id="proj-1" title="Тест" initialCanvases={initialCanvases} />);

    fireEvent.click(screen.getByText('Удалить'));

    await waitFor(() => {
      expect(canvasActions.deleteCanvas).toHaveBeenCalledWith('c1');
    });

    expect(screen.queryByText('Холст 1')).not.toBeInTheDocument();
  });

  it('переходит на страницу холста при клике на карточку', () => {
    const initialCanvases = [{ id: 'c1', title: 'Холст 1', tasks: [] }];
    render(<ProjectForm id="proj-1" title="Тест" initialCanvases={initialCanvases} />);
    
    const card = screen.getByText('Холст 1').closest('.cursor-pointer');
    fireEvent.click(card!);
    
    expect(mockPush).toHaveBeenCalledWith('/canvas/c1');
  });

  it('показывает кнопку "Посмотреть все холсты", если их 3 и более, и корректно переключает режим', () => {
    const initialCanvases = [
      { id: 'c1', title: 'Холст 1', tasks: [] },
      { id: 'c2', title: 'Холст 2', tasks: [] },
      { id: 'c3', title: 'Холст 3', tasks: [] },
    ];
    render(<ProjectForm id="proj-1" title="Тест" initialCanvases={initialCanvases} />);
    
    expect(screen.getByText('Посмотреть все холсты (3)')).toBeInTheDocument();
    expect(screen.queryByText('Холст 3')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Посмотреть все холсты (3)'));
    
    expect(screen.getByText('Холст 3')).toBeInTheDocument();
    expect(screen.getByText('Скрыть')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Скрыть'));
    expect(screen.queryByText('Холст 3')).not.toBeInTheDocument();
  });
});