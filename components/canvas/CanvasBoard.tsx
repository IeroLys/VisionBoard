'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MousePointer2,
  Paintbrush,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  LogOut,
} from 'lucide-react';
import { Point, Viewport, Shape, Tool } from './types';
import { screenToWorld, hitTestShape } from './viewport';
import { TEST_SHAPES } from './test-shapes';

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

// Заглушки для инструментов, которые доделают фронтендеры
const PLACEHOLDER_TOOLS: Tool[] = ['brush', 'text', 'image'];

type DragMode = 'pan' | 'object' | 'create' | null;

export default function CanvasBoard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [shapes, setShapes] = useState<Shape[]>(TEST_SHAPES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [draft, setDraft] = useState<Shape | null>(null);

  // Рефы для drag-состояний (не вызывают ререндер на каждое движение)
  const dragModeRef = useRef<DragMode>(null);
  const lastScreenRef = useRef<Point>({ x: 0, y: 0 });
  const startWorldRef = useRef<Point>({ x: 0, y: 0 });
  const grabOffsetRef = useRef<Point>({ x: 0, y: 0 });

  /* ---------- Рендер с учётом devicePixelRatio ---------- */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Точечная сетка (как на макетах whiteboard)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    const gridSize = 40;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const startX = Math.floor(-viewport.x / viewport.scale / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.scale / gridSize) * gridSize;
    const endX = startX + w / viewport.scale + gridSize;
    const endY = startY + h / viewport.scale + gridSize;

    ctx.fillStyle = '#D7E3F4';
    for (let gx = startX; gx < endX; gx += gridSize) {
      for (let gy = startY; gy < endY; gy += gridSize) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5 / viewport.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const allShapes = draft ? [...shapes, draft] : shapes;
    allShapes.forEach((shape) => {
      ctx.fillStyle = shape.color;
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1 / viewport.scale;

      if (shape.type === 'rect') {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else {
        ctx.beginPath();
        ctx.arc(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          shape.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
      }

      if (shape.id === selectedId) {
        ctx.strokeStyle = '#6B78E5';
        ctx.lineWidth = 2 / viewport.scale;
        ctx.strokeRect(
          shape.x - 4,
          shape.y - 4,
          shape.width + 8,
          shape.height + 8
        );
      }
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [viewport, shapes, selectedId, draft]);

  // render через ref, чтобы ResizeObserver не пересоздавался
  const renderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  /* ---------- Адаптивный размер canvas ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const renderFn = renderRef.current;
      if (renderFn) {
        renderFn();
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ---------- Зум к курсору (non-passive wheel) ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 0.9;

      setViewport((prev) => {
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, prev.scale * factor)
        );
        const realFactor = nextScale / prev.scale;
        return {
          scale: nextScale,
          x: sx - (sx - prev.x) * realFactor,
          y: sy - (sy - prev.y) * realFactor,
        };
      });
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  /* ---------- Мышь ---------- */
  const getScreenPoint = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screen = getScreenPoint(e);
    const world = screenToWorld(screen, viewport);
    lastScreenRef.current = screen;
    startWorldRef.current = world;

    if (PLACEHOLDER_TOOLS.includes(tool)) {
      // Заглушка: инструмент доделают фронтендеры
      console.log(`[spike] Инструмент "${tool}" пока не реализован`);
      return;
    }

    if (tool === 'rect' || tool === 'circle') {
      dragModeRef.current = 'create';
      setDraft({
        id: 'draft',
        type: tool,
        x: world.x,
        y: world.y,
        width: 0,
        height: 0,
        color: '#6B78E5',
      });
      return;
    }

    // tool === 'select': FR-14 (пустая область = pan) + FR-14.1 (объект = выделение)
    const hit = [...shapes].reverse().find((s) => hitTestShape(world, s));

    if (hit) {
      setSelectedId(hit.id);
      dragModeRef.current = 'object';
      grabOffsetRef.current = { x: world.x - hit.x, y: world.y - hit.y };
    } else {
      setSelectedId(null);
      dragModeRef.current = 'pan';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mode = dragModeRef.current;
    if (!mode) return;

    const screen = getScreenPoint(e);
    const world = screenToWorld(screen, viewport);

    if (mode === 'pan') {
      const dx = screen.x - lastScreenRef.current.x;
      const dy = screen.y - lastScreenRef.current.y;
      lastScreenRef.current = screen;
      setViewport((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    } else if (mode === 'object' && selectedId) {
      setShapes((prev) =>
        prev.map((s) =>
          s.id === selectedId
            ? { ...s, x: world.x - grabOffsetRef.current.x, y: world.y - grabOffsetRef.current.y }
            : s
        )
      );
    } else if (mode === 'create') {
      const start = startWorldRef.current;
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              x: Math.min(start.x, world.x),
              y: Math.min(start.y, world.y),
              width: Math.abs(world.x - start.x),
              height: Math.abs(world.y - start.y),
            }
          : prev
      );
    }
  };

  const handleMouseUp = () => {
    if (dragModeRef.current === 'create' && draft) {
      if (draft.width > 4 && draft.height > 4) {
        setShapes((prev) => [
          ...prev,
          { ...draft, id: crypto.randomUUID() },
        ]);
      }
      setDraft(null);
    }
    dragModeRef.current = null;
  };

  /* ---------- Курсор под инструмент ---------- */
  const cursorMap: Record<Tool, string> = {
    select: 'default',
    brush: 'crosshair',
    text: 'text',
    image: 'copy',
    rect: 'crosshair',
    circle: 'crosshair',
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Курсор' },
    { id: 'brush', icon: <Paintbrush size={20} />, label: 'Кисть' },
    { id: 'text', icon: <Type size={20} />, label: 'Текст' },
    { id: 'image', icon: <ImageIcon size={20} />, label: 'Фото' },
    { id: 'rect', icon: <Square size={20} />, label: 'Прямоугольник' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Круг' },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="block touch-none"
        style={{ cursor: cursorMap[tool] }}
      />

      {/* Нижний тулбар по макету */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex items-center gap-2 rounded-2xl bg-[#A8CBF5] p-2 shadow-lg">
          {tools.map((t) => (
            <button
              key={t.id}
              title={t.label}
              onClick={() => setTool(t.id)}
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-800 transition-all hover:scale-105 ${
                tool === t.id
                  ? 'shadow-md ring-2 ring-[#6B78E5]'
                  : 'opacity-90'
              }`}
            >
              {t.icon}
            </button>
          ))}

          <div className="ml-auto">
            <button
              title="Выйти из холста"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-800 transition-all hover:scale-105"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}