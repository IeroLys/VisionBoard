'use client';

import { useState } from "react";
import TodoCard from "@/components/todo-card";
import CanvasBoard from "./CanvasBoard";
import PanelToggle from "./PanelToggle";

interface CanvasLayoutProps {
  canvas: {
    id: string;
    title: string;
    project: { id: string; title: string };
    tasks: { id: string; title: string; completed: boolean }[];
  };
  projectHref: string;
}

export default function CanvasLayout({ canvas }: CanvasLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Область холста (занимает всё доступное пространство) */}
      <div className="relative flex-1">
        <CanvasBoard />
      </div>

      {/* Кнопка переключения (позиционируется относительно границы панели) */}
      <div 
        className={`absolute top-1/2 z-20 -translate-y-1/2 transition-all duration-300 max-lg:right-0 ${
          isSidebarOpen ? 'right-[340px]' : 'right-0'
        }`}
      >
        <PanelToggle 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      </div>

      {/* Боковая панель To do */}
      <aside
        className={`relative bg-[#EAF3FC] border-l border-main transition-all duration-300 ease-in-out max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:shadow-xl max-lg:z-10 ${
          isSidebarOpen 
            ? "w-[340px] translate-x-0 opacity-100" 
            : "w-0 translate-x-full opacity-0 overflow-hidden"
        }`}
      >
        {/* min-w-[340px] нужен, чтобы контент не сплющивался при анимации закрытия */}
        <div className="flex h-full flex-col gap-4 p-4 min-w-[340px]">
          <div className="rounded-2xl bg-[#A8CBF5] px-5 py-3 text-center text-[22px] font-['Inter'] text-black">
            {canvas.title}
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl bg-white">
            <TodoCard
              canvasId={canvas.id}
              defaultExpanded
              initialTasks={canvas.tasks.map((t) => ({
                id: t.id,
                title: t.title,
                completed: t.completed,
              }))}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}