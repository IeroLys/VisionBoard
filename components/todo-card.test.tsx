import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoCard, { type TodoTask } from './todo-card'; 
import * as taskActions from '@/lib/actions/tasks';

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

vi.mock('@/lib/actions/tasks', () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  setTaskCompleted: vi.fn(),
}));

vi.mock('@/components/AddTaskModal', () => ({
  default: ({ onClose, onAdd }: { onClose: () => void; onAdd: (title: string) => Promise<void | string> }) => (
    <div data-testid="add-task-modal" role="dialog">
      <button data-testid="mock-add-btn" onClick={() => onAdd('Новая тестовая задача')}>
        Добавить (Mock)
      </button>
      <button data-testid="mock-close-btn" onClick={onClose}>
        Закрыть (Mock)
      </button>
    </div>
  ),
}));

describe('Компонент TodoCard', () => {
  const mockCanvasId = 'canvas-123';
  
  const mockTasks: TodoTask[] = [
    { id: 'task-1', title: 'Задача 1', completed: false },
    { id: 'task-2', title: 'Задача 2', completed: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает начальное состояние в свернутом виде (по умолчанию)', () => {
    render(<TodoCard canvasId={mockCanvasId} initialTasks={mockTasks} />);
    expect(screen.getByText('To do')).toBeInTheDocument();
    expect(screen.queryByText('Задача 1')).not.toBeInTheDocument();
    expect(screen.getByText('1 из 2')).toBeInTheDocument();
  });

  it('отображает задачи и кнопку добавления, если defaultExpanded=true', () => {
    render(<TodoCard canvasId={mockCanvasId} initialTasks={mockTasks} defaultExpanded={true} />);
    expect(screen.getByText('Задача 1')).toBeInTheDocument();
    expect(screen.getByText('Добавить задачу')).toBeInTheDocument();
  });

  it('корректно переключает состояние раскрытия/скрытия при клике на кнопку', () => {
    render(<TodoCard canvasId={mockCanvasId} initialTasks={mockTasks} />);
    expect(screen.queryByText('Задача 1')).not.toBeInTheDocument();
    
    const toggleButton = screen.getByRole('button', { name: /Свернуть|Развернуть/i });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Задача 1')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Задача 1')).not.toBeInTheDocument();
  });

  it('успешно добавляет новую задачу через модальное окно и закрывает его', async () => {
    const newTaskData = { 
      id: 'task-3', 
      title: 'Новая тестовая задача', 
      completed: false,
      createdAt: new Date(),
      canvasId: mockCanvasId,
    };

    vi.mocked(taskActions.createTask).mockResolvedValue({
      ok: true,
      data: newTaskData,
    } as ActionResult<typeof newTaskData>);

    render(<TodoCard canvasId={mockCanvasId} initialTasks={[]} defaultExpanded={true} />);
    
    fireEvent.click(screen.getByText('Добавить задачу'));
    expect(screen.getByTestId('add-task-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('mock-add-btn'));
    
    await waitFor(() => {
      expect(taskActions.createTask).toHaveBeenCalledWith(mockCanvasId, 'Новая тестовая задача');
    });
    
    expect(screen.getByText('Новая тестовая задача')).toBeInTheDocument();
    
    // Теперь это сработает, так как мы добавили setIsModalOpen(false) в компонент
    await waitFor(() => {
      expect(screen.queryByTestId('add-task-modal')).not.toBeInTheDocument();
    });
  });

  it('успешно переключает статус задачи и обновляет состояние', async () => {
    vi.mocked(taskActions.setTaskCompleted).mockResolvedValue({
      ok: true,
      data: { id: 'task-1', title: 'Задача 1', completed: true, createdAt: new Date(), canvasId: mockCanvasId },
    } as ActionResult<{ id: string; title: string; completed: boolean; createdAt: Date; canvasId: string }>);

    render(<TodoCard canvasId={mockCanvasId} initialTasks={[mockTasks[0]]} defaultExpanded={true} />);
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true); // Оптимистичное обновление
    
    await waitFor(() => {
      expect(taskActions.setTaskCompleted).toHaveBeenCalledWith('task-1', true);
    });
    
    expect(screen.getByText('Задача 1')).toHaveClass('line-through');
  });

  it('откатывает статус задачи при ошибке сервера', async () => {
    vi.mocked(taskActions.setTaskCompleted).mockResolvedValue({
      ok: false,
      error: 'Ошибка сети',
    } as ActionResult<never>);

    render(<TodoCard canvasId={mockCanvasId} initialTasks={[mockTasks[0]]} defaultExpanded={true} />);
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true); 
    
    await waitFor(() => {
      expect(checkbox.checked).toBe(false); // Откат
    });
  });

  it('успешно удаляет задачу', async () => {
    vi.mocked(taskActions.deleteTask).mockResolvedValue({
      ok: true,
      data: { id: 'task-1' },
    } as ActionResult<{ id: string }>);

    render(<TodoCard canvasId={mockCanvasId} initialTasks={[mockTasks[0]]} defaultExpanded={true} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Удалить задачу' }));
    
    await waitFor(() => {
      expect(taskActions.deleteTask).toHaveBeenCalledWith('task-1');
    });
    
    expect(screen.queryByText('Задача 1')).not.toBeInTheDocument();
  });

  it('корректно рассчитывает и отображает прогресс-бар и счетчик', () => {
    const tasks: TodoTask[] = [
      { id: '1', title: 'T1', completed: true },
      { id: '2', title: 'T2', completed: true },
      { id: '3', title: 'T3', completed: false },
    ];
    
    render(<TodoCard canvasId={mockCanvasId} initialTasks={tasks} defaultExpanded={true} />);
    
    expect(screen.getByText('2 из 3')).toBeInTheDocument();
    
    // ✅ ИСПРАВЛЕНИЕ: используем querySelector напрямую, так как getByTestId выбрасывает ошибку при неудаче
    const progressBarFill = document.querySelector('.bg-main.h-full.rounded-full') as HTMLElement;
    expect(progressBarFill).toBeInTheDocument();
    expect(progressBarFill).toHaveStyle({ width: '66.66666666666666%' });
  });

  it('обрабатывает пустой список задач (0 из 0)', () => {
    render(<TodoCard canvasId={mockCanvasId} initialTasks={[]} defaultExpanded={true} />);
    expect(screen.getByText('0 из 0')).toBeInTheDocument();
    
    const progressBarFill = document.querySelector('.bg-main.h-full.rounded-full');
    expect(progressBarFill).not.toBeInTheDocument();
  });
});