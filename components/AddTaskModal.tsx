"use client";

import { useEffect, useState } from "react";

export default function AddTaskModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (title: string) => Promise<string | void> | string | void;
}) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Закрытие по Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation(); // Предотвращаем всплытие события
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation(); // КРИТИЧЕСКИ ВАЖНО: предотвращаем всплытие к родительскому onClick (router.push)

    const trimmedName = title.trim();

    if (!trimmedName) {
      setError("Пожалуйста, введите название задачи");
      return; // Модальное окно останется открытым, перехода не будет
    }

    setPending(true);
    try {
      const serverError = await onAdd(trimmedName);
      if (serverError) {
        setError(serverError);
      } else {
        // Если ошибки нет — закрываем модалку
        onClose();
      }
    } catch {
      setError("Не удалось сохранить. Попробуйте ещё раз");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        e.stopPropagation(); // Предотвращаем всплытие клика по фону
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-[450px] bg-overcast-sky rounded-[25px] p-10 relative shadow-2xl">
        
        <button
          type="button"
          aria-label="Закрыть"
          onClick={(e) => {
            e.stopPropagation(); // КРИТИЧЕСКИ ВАЖНО: предотвращаем всплытие клика по крестику
            onClose();
          }}
          className="absolute top-4 right-5 text-gray-500 hover:text-black transition-colors text-3xl font-light leading-none"
        >
          ×
        </button>

        <h1 className="text-[34px] leading-tight text-main-desaturated text-center font-['Inter'] font-normal tracking-tight mb-6">
          Новая задача
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          
          <label htmlFor="taskName" className="block w-full text-center text-[24px] leading-snug text-black font-['Inter'] font-light mb-2">
            Введите задачу:
          </label>

          <input 
            autoFocus
            maxLength={100}
            id="taskName"
            name="taskName"
            type="text" 
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation(); // Доп. защита от всплытия события Enter
              }
            }}
            className="w-full text-[20px] text-gray-700 px-4 py-3 bg-white rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />

          {error && (
            <p className="text-red-500 text-[16px] mt-1.5 text-center font-['Inter']">{error}</p>
          )}

          <button 
            type="submit"
            disabled={pending}
            onClick={(e) => e.stopPropagation()} // Доп. защита от всплытия клика по кнопке
            className="w-full mt-6 disabled:opacity-60 bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[22px] py-4 rounded-[20px] transition-colors duration-200"
          >
            {pending ? "Добавление..." : "Добавить"}
          </button>
        </form>

      </div>
    </div>
  );
}