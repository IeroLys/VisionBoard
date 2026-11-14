"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Overlay + card in the same style as the create modals.
 * Rendered in a portal and stops click propagation so it can be opened from
 * inside a <Link> card without triggering navigation.
 */
export function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation(); // Предотвращаем всплытие, чтобы не закрыть случайно родительские модалки
        onClose();
      }
    };
    
    // Сохраняем текущее значение overflow, чтобы восстановить его позже
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    document.addEventListener("keydown", onKey);
    
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Проверка на наличие document для безопасности (хотя use client гарантирует клиентскую среду)
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        // Закрываем только если клик был именно по затемненному фону, а не по карточке
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-[450px] bg-overcast-sky rounded-[25px] p-10 relative shadow-2xl animate-in zoom-in-95 duration-150">
        <button
          type="button"
          aria-label="Закрыть"
          onClick={(e) => {
            e.stopPropagation(); // Важно для предотвращения всплытия к Link
            onClose();
          }}
          className="absolute top-4 right-5 text-gray-500 hover:text-black transition-colors text-3xl font-light leading-none"
        >
          ×
        </button>

        <h2 className="text-[30px] leading-tight text-main-desaturated text-center font-['Inter'] font-normal tracking-tight mb-6">
          {title}
        </h2>

        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Удалить",
  onConfirm,
  onClose,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  /** Return an error message to keep the dialog open and show it. */
  onConfirm: () => Promise<string | void> | string | void;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setPending(true);
    setError("");
    try {
      const err = await onConfirm();
      if (err) setError(err);
      else onClose();
    } catch {
      setError("Что-то пошло не так. Попробуйте ещё раз");
    } finally {
      setPending(false);
    }
  };

  return (
    <DialogShell title={title} onClose={onClose}>
      <p className="text-center text-[18px] text-black font-['Inter'] font-light leading-snug">
        {message}
      </p>

      {error && (
        <p className="text-red-500 text-[16px] mt-3 text-center font-['Inter']">{error}</p>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-1 bg-white hover:bg-gray-50 text-black font-normal text-[18px] py-3 rounded-[20px] transition-colors"
        >
          Отмена
        </button>
                <button
          type="button"
          autoFocus
          disabled={pending}
          onClick={(e) => {
            e.stopPropagation();
            handleConfirm();
          }}

          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-normal text-[18px] py-3 rounded-[20px] transition-colors disabled:opacity-60"
        >
          {pending ? "Удаление..." : confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}

export function RenameDialog({
  title,
  label,
  initialValue,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  initialValue: string;
  /** Return an error message to keep the dialog open and show it. */
  onSubmit: (value: string) => Promise<string | void> | string | void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события submit
    
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Название не может быть пустым");
      return;
    }
    if (trimmed === initialValue) {
      onClose();
      return;
    }
    setPending(true);
    try {
      const err = await onSubmit(trimmed);
      if (err) setError(err);
      else onClose();
    } catch {
      setError("Не удалось сохранить. Попробуйте ещё раз");
    } finally {
      setPending(false);
    }
  };

  return (
    <DialogShell title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label
          htmlFor="renameInput"
          className="block w-full text-center text-[22px] leading-snug text-black font-['Inter'] font-light mb-2"
        >
          {label}
        </label>
        <input
          id="renameInput" // Связь с label
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          value={value}
          maxLength={100}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation(); // Доп. защита
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
          onClick={(e) => e.stopPropagation()} // Защита от всплытия клика
          className="w-full mt-6 bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[22px] py-4 rounded-[20px] transition-colors duration-200 disabled:opacity-60"
        >
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </DialogShell>
  );
}