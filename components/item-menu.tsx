"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog, RenameDialog } from "@/components/dialog";

/**
 * "..." button with a dropdown (rename / delete). Safe to render inside a
 * <Link>: clicks are stopped so they don't trigger navigation.
 */
export default function ItemMenu({
  itemTitle,
  kind,
  onRename,
  onDelete,
}: {
  itemTitle: string;
  /** Labels for the item type, e.g. { one: "проект", accusative: "проект" }. */
  kind: { label: string; renameTitle: string; deleteTitle: string; deleteWarning?: string };
  /** Return an error message to keep the dialog open. */
  onRename?: (title: string) => Promise<string | void>;
  onDelete: () => Promise<string | void>;
}) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openDialog = (which: "rename" | "delete") => {
    setOpen(false);
    setDialog(which);
  };

  return (
    <>
      <div ref={ref} className="relative shrink-0" onClick={stop}>
        <button
          type="button"
          aria-label={`Действия: ${itemTitle}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`p-2 rounded-[10px] shadow-sm text-black transition-colors ${
            open ? "bg-gray-100" : "bg-white hover:bg-gray-50"
          }`}
        >
          <MoreHorizontal size={20} />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 z-20 min-w-[190px] bg-white rounded-[12px] shadow-lg ring-1 ring-black/5 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {onRename && (
              <button
                type="button"
                role="menuitem"
                onClick={() => openDialog("rename")}
                className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-[15px] text-black hover:bg-overcast-sky transition-colors"
              >
                <Pencil size={16} className="text-main-desaturated" />
                Переименовать
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => openDialog("delete")}
              className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-[15px] text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              Удалить
            </button>
          </div>
        )}
      </div>

      {dialog === "rename" && onRename && (
        <RenameDialog
          title={kind.renameTitle}
          label={`Новое название ${kind.label}:`}
          initialValue={itemTitle}
          onSubmit={onRename}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "delete" && (
        <ConfirmDialog
          title={kind.deleteTitle}
          message={
            <>
              Вы уверены, что хотите удалить «<span className="font-normal">{itemTitle}</span>»?
              {kind.deleteWarning && (
                <span className="block mt-2 text-[15px] text-gray-500">{kind.deleteWarning}</span>
              )}
            </>
          }
          onConfirm={onDelete}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
