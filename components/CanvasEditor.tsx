"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MousePointer2, Pencil, Type, Square, Circle, Search, Check, X } from "lucide-react";
import TodoCard, { type TodoTask } from "@/components/todo-card";
import { renameCanvas } from "@/lib/actions/canvases";

export default function CanvasEditor({ 
  canvasId, 
  canvasTitle: initialTitle, 
  initialTasks,
  projectId
}: { 
  canvasId: string; 
  canvasTitle: string; 
  initialTasks: TodoTask[]; 
  projectId: string;
}) {
  const [isTodoOpen, setIsTodoOpen] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(initialTitle);
  const [titleError, setTitleError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "#000";
        context.lineWidth = 3;
        setCtx(context);
      }
    }
  }, []);

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const handleSaveTitle = async () => {
    if (!editTitleValue.trim()) {
      setTitleError("Название не может быть пустым");
      return;
    }
    if (editTitleValue === title) {
      setIsEditingTitle(false);
      return;
    }

    const result = await renameCanvas(canvasId, editTitleValue);
    if (result.ok) {
      setTitle(editTitleValue);
      setIsEditingTitle(false);
      setTitleError("");
    } else {
      setTitleError(result.error);
    }
  };

  return (
    // h-dvh вместо h-screen для корректной работы с адресной строкой мобильных браузеров
    <div className="flex h-dvh w-full flex-col bg-gray-50 overflow-hidden relative">
      
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Холст для рисования */}
        <div className="flex-1 bg-white relative overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            // touch-none критически важен: запрещает скролл страницы при рисовании пальцем на телефоне
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* ПАНЕЛЬ TO DO (справа) */}
        <div 
          className={`
            absolute right-0 top-0 bottom-0 
            w-[85vw] max-w-[320px] md:w-[320px] 
            bg-[#E6F0FF] border-l border-main/20 shadow-2xl 
            transition-transform duration-300 ease-in-out z-20 flex flex-col
            ${isTodoOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Кнопка-язычок для сворачивания */}
          <button
            onClick={() => setIsTodoOpen(!isTodoOpen)}
            // На десктопе (md) строго -left-8, на мобильном -left-4, чтобы не вылезать за экран на узких устройствах
            className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 w-10 h-10 bg-[#9FCEFF] rounded-full flex items-center justify-center shadow-md hover:bg-[#7cb2eb] transition-colors z-30"
            title={isTodoOpen ? "Скрыть панель" : "Показать панель"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isTodoOpen ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>

          <div className="p-4 border-b border-main/10">
            {isEditingTitle ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => {
                    setEditTitleValue(e.target.value);
                    setTitleError("");
                  }}
                  className="w-full bg-white rounded px-3 py-2 text-[18px] text-black outline-none focus:ring-2 focus:ring-main"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                />
                <div className="flex justify-center gap-2">
                  <button onClick={handleSaveTitle} className="p-1 bg-white rounded hover:bg-gray-100 text-black">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setIsEditingTitle(false)} className="p-1 bg-white rounded hover:bg-gray-100 text-black">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => {
                  setEditTitleValue(title);
                  setIsEditingTitle(true);
                }}
                className="bg-[#9FCEFF] rounded-[15px] px-4 py-2 text-center cursor-pointer hover:bg-[#7cb2eb] transition-colors"
                title="Нажмите, чтобы изменить название"
              >
                <h2 className="text-[24px] font-['Inter'] font-medium text-black truncate">
                  {title}
                </h2>
              </div>
            )}
            {titleError && <p className="text-red-500 text-[14px] mt-1 text-center">{titleError}</p>}
          </div>

          {/* Задачи */}
          <div className="flex-1 overflow-y-auto p-2">
             <TodoCard canvasId={canvasId} initialTasks={initialTasks} hideToggle={true} isCanvasPage={true} />
          </div>
        </div>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <div 
        className={`
          absolute bottom-6 -translate-x-1/2 
          w-[95vw] max-w-[600px] md:w-[600px] 
          bg-[#6B78E5] rounded-[15px] 
          px-2 md:px-8 py-2 
          flex items-center justify-evenly shadow-lg z-30 transition-all duration-300
          /* На мобильном всегда по центру (left-1/2). На десктопе (md) работает твой исходный сдвиг */
          ${isTodoOpen ? 'md:left-[calc(50%-160px)]' : 'left-1/2'}
        `}
      >
        <Link 
          href={`/project/${projectId}`}
          className="p-2 bg-white/20 hover:bg-white/40 rounded-md transition-colors text-white"
          title="Назад к проекту"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="w-px h-6 bg-white/30"></div>

        <button className="p-2 bg-white rounded-md shadow-sm text-black"><MousePointer2 size={20} /></button>
        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white"><Pencil size={20} /></button>
        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white"><Type size={20} /></button>
        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white"><Square size={20} /></button>
        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white"><Circle size={20} /></button>
        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white"><Search size={20} /></button>
      </div>

    </div>
  );
}