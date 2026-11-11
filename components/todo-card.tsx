"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { createTask, deleteTask, setTaskCompleted } from "@/lib/actions/tasks";
import AddTaskModal from "@/components/AddTaskModal";

export type TodoTask = { id: string; title: string; completed: boolean };

interface TodoProps {
  canvasId: string;
  initialTasks?: TodoTask[];
  defaultExpanded?: boolean;
}

export default function TodoCard({ canvasId, initialTasks = [], defaultExpanded = false }: TodoProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [tasks, setTasks] = useState<TodoTask[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const taskCounter = tasks.length;
  const completedCounter = tasks.filter((t) => t.completed).length;

  const completedPercent = taskCounter === 0
    ? 0
    : (completedCounter / taskCounter) * 100;

  const handleAddTask = async (title: string) => {
    const result = await createTask(canvasId, title);
    if (!result.ok) return result.error;
    const { id, completed } = result.data;
    setTasks((prev) => [...prev, { id, title: result.data.title, completed }]);
  };

  // Исправлен тип события на ChangeEvent
  const handleToggle = async (task: TodoTask, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Останавливаем всплытие
    const completed = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed } : t)));
    const result = await setTaskCompleted(task.id, completed);
    if (!result.ok) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t)));
    }
  };

  const handleDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие
    const result = await deleteTask(taskId);
    if (result.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const progressBar = (
    <div className="w-full bg-[#9FCEFF] rounded-full h-6 overflow-hidden">
      {completedCounter > 0 && (
        <div
          className="bg-main h-full rounded-full transition-all duration-300"
          style={{ width: `${completedPercent}%` }}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="rounded-[15px] flex flex-col shadow-sm p-2 bg-white">
        <div className="p-2 flex justify-between items-center bg-white">
          <label className="text-[25px]" style={{ color: '#000000' }}>To do</label>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Останавливаем всплытие
              setIsExpanded(!isExpanded);
            }}
            className="p-3 bg-[#9FCEFF] rounded-full shadow-sm hover:bg-[#7cb2eb] transition-colors"
          >
            {isExpanded ? <ChevronDown size={20} style={{ color: '#000000' }} /> : <ChevronUp size={20} style={{ color: '#000000' }} />}
          </button>
        </div>

        {isExpanded && (
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Останавливаем всплытие
                setIsModalOpen(true);
              }}
              className="p-2 ml-4 mr-4 mb-2 bg-[#9FCEFF] rounded-[15px] hover:bg-[#7cb2eb] transition-colors"
              style={{ color: '#000000' }}
            >
              Добавить задачу
            </button>

            {tasks.length > 0 && (
              <ul className="flex flex-col px-4 max-h-[84px] overflow-y-auto scrollbar-hide">
                {tasks.map((task) => (
                  <li 
                    key={task.id} 
                    className="flex items-center gap-3 h-[28px] shrink-0 rounded-md px-2 -mx-2 transition-colors hover:bg-gray-100"
                  >
                    <label className="relative flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleToggle(task, e)} // Передаем событие
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded-[4px] border-2 border-[#6B78E5] bg-[#E6F0FF] peer-checked:bg-[#6B78E5] peer-checked:border-[#6B78E5] transition-colors flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </label>

                    <span 
                      className={`flex-1 truncate ${task.completed ? "line-through" : ""}`}
                      title={task.title}
                      style={{ color: task.completed ? '#9CA3AF' : '#000000' }}
                    >
                      {task.title}
                    </span>
                    
                    <button
                      aria-label="Удалить задачу"
                      onClick={(e) => handleDelete(task.id, e)} // Передаем событие
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="p-2 text-center mt-2">
          {progressBar}
          <p className="mt-3" style={{ color: '#000000' }}>{completedCounter} из {taskCounter}</p>
        </div>
      </div>

      {isModalOpen && typeof document !== "undefined" && createPortal(
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTask}
        />,
        document.body
      )}
    </>
  );
}