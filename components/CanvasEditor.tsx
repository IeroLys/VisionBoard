"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MousePointer2, 
  Pencil, 
  Type, 
  Image as ImageIcon,
  Square, 
  MessageCircle, 
  Check, 
  X, 
  ChevronsRight, 
  ChevronsLeft, 
  Minus, 
  Plus 
} from "lucide-react";
import TodoCard, { type TodoTask } from "@/components/todo-card";
import { renameCanvas } from "@/lib/actions/canvases";
import ObjectWrapper from "@/components/canvasObjectTypes/ObjectWrapper";
import type { CanvasObject } from "@/components/canvasObjectTypes/types";

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

  const MIN_PERCENT = 20;
  const MAX_PERCENT = 150;
  const PERCENT_STEP = 10;
  const [percent, setPercent] = useState(100);
  const zoom = 100 / percent;

  const [isZoomAnimating, setIsZoomAnimating] = useState(false);

  const zoomIn  = () => animate(() => setPercent((percent) => Math.max(MIN_PERCENT, percent - PERCENT_STEP)));
  const zoomOut = () => animate(() => setPercent((percent) => Math.min(MAX_PERCENT, percent + PERCENT_STEP)));
  const animate = (fn: () => void) => {
    setIsZoomAnimating(true);
    fn();
    window.setTimeout(() => setIsZoomAnimating(false), 220);
  };

  type Tool = "hand" | "pen";
  const [activeTool, setActiveTool] = useState<Tool>("hand");

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setSelectedId(null); 
    const isLeftHand = e.button === 0 && activeTool === "hand";
    const isMiddle = e.button === 1;
    if (!isLeftHand && !isMiddle) return;

    e.preventDefault();
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handlePanMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({
      x: panStart.current.panX + dx,
      y: panStart.current.panY + dy,
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleDeleteObject = (id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    setSelectedId(null);
  };

 
  const [objects, setObjects] = useState<CanvasObject[]>([
  {
    id: "circle-1",
    type: "testCircle",
    x: 200,
    y: 200,
    width: 120,
    height: 120,
  },
  {
    id: "rect-1",
    type: "testRectangle",
    x: 400,
    y: 300,
    width: 150,
    height: 100,
  },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    if (activeTool !== "pen") return;
    setIsZoomAnimating(false);
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "pen" || !isDrawing || !ctx) return;
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

  const taskCounter = initialTasks.length;
  const completedCounter = initialTasks.filter((t) => t.completed).length;
  const completedPercent = taskCounter === 0 ? 0 : (completedCounter / taskCounter) * 100;

  return (
    <div className="flex h-screen w-full flex-col bg-gray-200 overflow-hidden relative">
      <div className="flex flex-1 relative overflow-hidden">
        
        <div 
          className={`flex-1 relative overflow-hidden ${
            isPanning
              ? "cursor-grabbing"
              : "cursor-crosshair"
          }`}
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
        >
          <div
            className="absolute inset-0 bg-white"
            style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: isPanning
              ? "none"
              : isZoomAnimating
              ? "transform 200ms ease-out"
              : "none",
            backgroundImage:"radial-gradient(circle, #d4d4d8 2px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="absolute inset-0">
              {objects.map((obj) => (
                <ObjectWrapper
                  key={obj.id}
                  obj={obj}
                  isSelected={selectedId === obj.id}
                  onSelect={() => setSelectedId(obj.id)}
                  onDelete={() => handleDeleteObject(obj.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div 
          className={`
            absolute right-0 top-0 bottom-0 w-[380px] bg-[#E6F0FF] border-l border-main/20 shadow-2xl transition-transform duration-300 ease-in-out z-20 flex flex-col
            ${isTodoOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <button
            onClick={() => setIsTodoOpen(!isTodoOpen)}
            className="absolute top-1/2 -left-10 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity duration-200 z-30 text-black"
            title={isTodoOpen ? "Скрыть панель" : "Показать панель"}
          >
            {isTodoOpen ? <ChevronsRight size={36} /> : <ChevronsLeft size={36} />}
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
                  className="w-full bg-white rounded px-3 py-2 text-[16px] text-black outline-none focus:ring-2 focus:ring-main"
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
                <h2 className="text-[18px] font-['Inter'] font-medium text-black truncate">
                  {title}
                </h2>
              </div>
            )}
            {titleError && <p className="text-red-500 text-[12px] mt-1 text-center">{titleError}</p>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-0">
             <TodoCard canvasId={canvasId} initialTasks={initialTasks} hideToggle={true} isCanvasPage={true} hideProgress={true} />
          </div>

          <div className="p-4 border-t border-main/10 shrink-0">
            <div className="w-full bg-[#9FCEFF] rounded-full h-6 overflow-hidden">
              {completedCounter > 0 && (
                <div
                  className="bg-main h-full rounded-full transition-all duration-300"
                  style={{ width: `${completedPercent}%` }}
                />
              )}
            </div>
            <p className="mt-2 text-center text-[16px] text-black">
              {completedCounter} из {taskCounter}
            </p>
          </div>
        </div>
      </div>

      <div 
        className={`
          absolute bottom-6 -translate-x-1/2 w-[600px] bg-[#6B78E5] rounded-[15px] px-8 py-2 flex items-center justify-evenly shadow-lg z-30 transition-all duration-300
          ${isTodoOpen ? 'left-[calc(50%-190px)]' : 'left-1/2'}
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
        
        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white" title="Вставить изображение">
          <ImageIcon size={20} />
        </button>
        
        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white" title="Прямоугольник">
          <Square size={20} />
        </button>

        <button className="p-2 hover:bg-white/20 rounded-md transition-colors text-white" title="Комментарии">
          <MessageCircle size={20} />
        </button>

        <div className="w-px h-6 bg-white/30"></div>
        
        <div className="flex items-center gap-2 text-white">
          <button
            type="button"
            onClick={zoomOut}
            disabled={percent >= MAX_PERCENT}
            aria-label="Уменьшить"
            className="opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity"
          >
            <Minus size={18} />
          </button>
          <span className="text-[14px] font-['Inter'] select-none">{Math.round(percent)}%</span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={percent <= MIN_PERCENT}
            aria-label="Увеличить"
            className="opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}