"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { createTask, deleteTask, setTaskCompleted } from "@/lib/actions/tasks";

export type TodoTask = { id: string; title: string; completed: boolean };

interface TodoProps {
  canvasId: string;
  initialTasks?: TodoTask[];
  defaultExpanded?: boolean;
}

export default function TodoCard({ canvasId, initialTasks = [], defaultExpanded = false }: TodoProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [tasks, setTasks] = useState<TodoTask[]>(initialTasks);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const taskCounter = tasks.length;
  const completedCounter = tasks.filter((t) => t.completed).length;

  const completedPercent = taskCounter === 0
    ? 7
    : (completedCounter / taskCounter) * 100;

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      setError("Введите название задачи");
      return;
    }
    setPending(true);
    const result = await createTask(canvasId, title);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { id, completed } = result.data;
    setTasks((prev) => [...prev, { id, title: result.data.title, completed }]);
    setNewTitle("");
    setIsAdding(false);
  };

  const handleToggle = async (task: TodoTask) => {
    const completed = !task.completed;
    // Optimistic update, rolled back if the server rejects it.
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed } : t)));
    const result = await setTaskCompleted(task.id, completed);
    if (!result.ok) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t)));
    }
  };

  const handleDelete = async (taskId: string) => {
    const result = await deleteTask(taskId);
    if (result.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const progressBar = (
    <div className="w-full bg-[#9FCEFF] rounded-full h-6 overflow-hidden">
      <div
        className="bg-main h-full rounded-full transition-all duration-300"
        style={{ width: `${completedPercent}%` }}
      />
    </div>
  );

  return (
    <div className="rounded-[15px] overflow-hidden flex flex-col shadow-sm p-3 bg-white">
      {!isExpanded ?
        <div className="flex flex-col">
          <div className="p-4 flex justify-between items-center bg-white">
            <label className="text-black text-[25px]">To do</label>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-3 bg-[#9FCEFF] rounded-full shadow-sm hover:bg-[#7cb2eb] transition-colors"
            >
              <ChevronUp size={20} className="text-black"/>
            </button>
          </div>
          <div className="pr-4 pl-4 p text-center">{progressBar}</div>
        </div>
      : <div className="flex flex-col gap-2">
          <div className="p-4 flex justify-between items-center bg-white">
            <label className="text-black text-[25px]">To do</label>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-3 bg-[#9FCEFF] rounded-full shadow-sm hover:bg-[#7cb2eb] transition-colors">
              <ChevronDown size={20} className="text-black"/>
            </button>
          </div>

          {tasks.length > 0 && (
            <ul className="flex flex-col gap-1 px-6">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 text-black">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task)}
                    className="h-5 w-5 accent-main"
                  />
                  <span className={`flex-1 break-words ${task.completed ? "line-through text-gray-400" : ""}`}>
                    {task.title}
                  </span>
                  <button
                    aria-label="Удалить задачу"
                    onClick={() => handleDelete(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isAdding ? (
            <form onSubmit={handleAdd} className="flex flex-col gap-2 mx-6 mb-4">
              <input
                autoFocus
                aria-label="Название задачи"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setError("");
                }}
                className="w-full px-3 py-2 bg-white rounded-[10px] text-black focus:outline-none focus:ring-2 focus:ring-main"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 p-2 bg-[#9FCEFF] rounded-[15px] hover:bg-[#7cb2eb] transition-colors text-black disabled:opacity-60"
                >
                  {pending ? "Добавление..." : "Добавить"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle("");
                    setError("");
                  }}
                  className="p-2 px-4 rounded-[15px] text-gray-500 hover:text-black transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="p-2 ml-6 mr-6 mb-4 bg-[#9FCEFF] rounded-[15px] hover:bg-[#7cb2eb] transition-colors text-black"
            >
              Добавить задачу
            </button>
          )}

          <div className="p-4 text-center">
            {progressBar}
            <p className="text-black">{completedCounter} из {taskCounter}</p>
          </div>
        </div>
      }
    </div>
  );
}
