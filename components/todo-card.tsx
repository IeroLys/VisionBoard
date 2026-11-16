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
  // --- Машины пропсы для холста ---
  hideToggle?: boolean;
  isCanvasPage?: boolean;
  hideProgress?: boolean;
}

export default function TodoCard({
  canvasId,
  initialTasks = [],
  defaultExpanded = false,
  hideToggle = false,
  isCanvasPage = false,
  hideProgress = false,
}: TodoProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [tasks, setTasks] = useState<TodoTask[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // На холсте список всегда раскрыт (hideToggle), на проекте — по isExpanded (как у Саши)
  const showTasks = hideToggle || isExpanded;

  const taskCounter = tasks.length;
  const completedCounter = tasks.filter((t) => t.completed).length;

  const completedPercent =
    taskCounter === 0 ? 0 : (completedCounter / taskCounter) * 100;

  // Сашина сортировка: выполненные вниз
  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed)
  );

  const handleAddTask = async (title: string) => {
    const result = await createTask(canvasId, title);
    if (!result.ok) return result.error;

    const { id, completed } = result.data;
    setTasks((prev) => [...prev, { id, title: result.data.title, completed }]);

    // Сашино авто-закрытие модалки
    setIsModalOpen(false);
  };

  const handleToggle = async (
    task: TodoTask,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    const completed = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed } : t))
    );

    const result = await setTaskCompleted(task.id, completed);
    if (!result.ok) {
      // откат при ошибке
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        )
      );
    }
  };

  const handleDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await deleteTask(taskId);
    if (result.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const progressBar = (
    <div
      className={`w-full bg-[#9FCEFF] rounded-full overflow-hidden ${
        isCanvasPage ? "h-6" : "h-6" // у Саши всегда h-6; оставляем h-6 и на холсте
      }`}
    >
      {completedCounter > 0 && (
        <div
          className="bg-main h-full rounded-full transition-all duration-300"
          style={{ width: `${completedPercent}%` }}
        />
      )}
    </div>
  );

  // --- Классы: на проекте — Сашины размеры, на холсте — Машины ---
  const listClasses = isCanvasPage
    ? "flex flex-col gap-3 px-2 flex-1 overflow-y-auto"
    : "flex flex-col px-4 max-h-[84px] overflow-y-auto scrollbar-hide";

  const itemClasses = isCanvasPage
    ? "flex items-center gap-3 h-[48px] shrink-0 rounded-md px-2 transition-colors hover:bg-gray-100"
    : "flex items-center gap-3 h-[28px] shrink-0 rounded-md px-2 -mx-2 transition-colors hover:bg-gray-100";

  const textClasses = isCanvasPage
    ? "flex-1 text-[20px] font-['Inter']"
    : "flex-1";

  return (
    <>
      <div
        className={`rounded-[15px] flex flex-col shadow-sm bg-white ${
          isCanvasPage ? "p-4 h-full" : "p-2"
        }`}
        // Сашин «гаситель кликов» — только на проекте (на холсте корень не должен глушить всплытие)
        onClick={isCanvasPage ? undefined : (e) => e.stopPropagation()}
      >
        {/* Заголовок To do */}
        <div
          className={`flex items-center bg-white shrink-0 ${
            isCanvasPage ? "mb-2" : "p-2"
          } ${hideToggle ? "justify-center" : "justify-between"}`}
        >
          <label
            className={isCanvasPage ? "text-[28px] font-['Inter']" : "text-[25px]"}
            style={{ color: "#000000" }}
          >
            To do
          </label>
          {!hideToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-3 bg-[#9FCEFF] rounded-full shadow-sm hover:bg-[#7cb2eb] transition-colors"
              aria-label={isExpanded ? "Свернуть" : "Развернуть"}
            >
              {isExpanded ? (
                <ChevronDown size={20} style={{ color: "#000000" }} />
              ) : (
                <ChevronUp size={20} style={{ color: "#000000" }} />
              )}
            </button>
          )}
        </div>

        {showTasks && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className={
                isCanvasPage
                  ? "p-3 mb-3 bg-[#9FCEFF] rounded-[15px] hover:bg-[#7cb2eb] transition-colors text-[18px] shrink-0"
                  : "p-2 ml-4 mr-4 mb-2 bg-[#9FCEFF] rounded-[15px] hover:bg-[#7cb2eb] transition-colors"
              }
              style={{ color: "#000000" }}
            >
              Добавить задачу
            </button>

            <div className={isCanvasPage ? "flex-1 overflow-hidden flex flex-col" : ""}>
              {tasks.length > 0 && (
                <ul className={listClasses}>
                  {sortedTasks.map((task) => (
                    <li key={task.id} className={itemClasses}>
                      <label className="relative flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => handleToggle(task, e)}
                          className="peer sr-only"
                        />
                        <div
                          className={`${
                            isCanvasPage ? "h-6 w-6" : "h-5 w-5"
                          } rounded-[4px] border-2 border-[#6B78E5] bg-[#E6F0FF] peer-checked:bg-[#6B78E5] peer-checked:border-[#6B78E5] transition-colors flex items-center justify-center`}
                        >
                          <svg
                            className={`${
                              isCanvasPage ? "w-4 h-4" : "w-3.5 h-3.5"
                            } text-white opacity-0 peer-checked:opacity-100 transition-opacity`}
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
                        className={`${textClasses} truncate ${
                          task.completed ? "line-through" : ""
                        }`}
                        title={task.title}
                        style={{ color: task.completed ? "#9CA3AF" : "#000000" }}
                      >
                        {task.title}
                      </span>

                      <button
                        aria-label="Удалить задачу"
                        onClick={(e) => handleDelete(task.id, e)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X size={isCanvasPage ? 20 : 18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Прогресс: на проекте — всегда как у Саши; на холсте — скрываем, если hideProgress */}
        {!(isCanvasPage && hideProgress) && (
          <div
            className={`text-center ${
              isCanvasPage ? "p-2 mt-auto shrink-0 pt-3" : "p-2 mt-2"
            }`}
          >
            {progressBar}
            <p
              className={isCanvasPage ? "mt-2 text-[18px]" : "mt-3"}
              style={{ color: "#000000" }}
            >
              {completedCounter} из {taskCounter}
            </p>
          </div>
        )}
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