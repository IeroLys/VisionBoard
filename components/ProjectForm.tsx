"use client";

import { useState } from "react";
import CreateCanvasModal from "@/components/create-canvas";
import { Plus, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import TodoCard from "@/components/todo-card";

type Canvas = { id: number; title: string };

export default function ProjectForm({ id }: { id: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canvs, setCanvs] = useState<Canvas[]>([]);
  const [showAll, setShowAll] = useState(false);
  const handleCreateCanvas = (canvasName: string) => {
    const newCanvas = { id: Date.now(), title: canvasName };
    setCanvs((prev) => [...prev, newCanvas]);
    setIsModalOpen(false);
  };
  const visibleCanvs = showAll ? canvs : canvs.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <h1 className="mb-6 text-center font-['Inter'] text-[34px] leading-tight font-normal tracking-tight text-main-desaturated">
        PROJECT PAGE
      </h1>
      <p className="mt-4 text-xl text-main-desaturated">
        ID этого проекта: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{id}</span>
      </p>

      <div className="w-full mt-9 min-h-[500px] bg-white rounded-[20px] border border-main p-8 flex flex-col justify-center">
          {canvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center">
              <p className="text-center text-main-desaturated text-[26px] font-['Inter'] font-light mb-6 leading-snug">
                У вас пока нет холстов,<br />
                создать?
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center w-[140px] h-[140px] bg-[#E6F0FF] rounded-full hover:bg-[#d4e5fc] transition-colors text-main-desaturated group"
              >
                <Plus size={80} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <div className={`w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 gap-4 pr-2 ${showAll ? 'max-h-[400px] overflow-y-auto pb-4' : ''}`}>
                {visibleCanvs.map((canvas) => ( 
                  // Карточка холста
                  <div key={canvas.id}>
                    <Link
                      href={`/canvas/${canvas.id}`}
                      className="group bg-overcast-sky rounded-[15px] p-6 h-[160px] flex justify-between items-start hover:bg-[#c2ddf8] transition-colors cursor-pointer"
                    >
                      <span className="text-[24px] font-['Inter'] font-light text-black transition-transform duration-200 origin-left group-hover:scale-105">
                        {canvas.title}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); 
                          // Здесь должен быть код при нажатии на троеточие 
                        }}
                        className="bg-white p-2 rounded-[10px] shadow-sm hover:bg-gray-50 text-black"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </Link>

                    <TodoCard title={canvas.title}></TodoCard>
                  </div>
                ))}

                {!showAll && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-overcast-sky rounded-[15px] h-[160px] flex items-center justify-center hover:bg-[#c2ddf8] transition-colors group"
                  >
                    <div className="w-[70px] h-[70px] bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Plus size={40} className="text-main-desaturated" strokeWidth={2} />
                    </div>
                  </button>
                )}
              </div>

              <div className="w-full max-w-[900px] flex flex-col gap-3">
                {canvs.length > 3 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full bg-overcast-sky text-main-desaturated py-3 rounded-[10px] text-[16px] font-['Inter'] font-normal hover:bg-[#c2ddf8] transition-colors flex items-center justify-center gap-2"
                  >
                    Посмотреть все холсты ({canvs.length})
                    <ChevronDown size={20} />
                  </button>
                )}

                {showAll && (
                  <>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[18px] py-3 rounded-[10px] transition-colors duration-200"
                    >
                      Создать холст
                    </button>

                    <button
                      onClick={() => setShowAll(false)}
                      className="w-full text-gray-500 hover:text-main-desaturated py-2 rounded-[10px] text-[16px] font-['Inter'] font-normal transition-colors flex items-center justify-center gap-2"
                    >
                      Скрыть
                      <ChevronUp size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      {isModalOpen && (
          <CreateCanvasModal
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateCanvas}
            existingCanvs={canvs.map((p) => p.title)}
          />
        )}
    </div>
  )
}
