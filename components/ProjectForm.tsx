"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CreateCanvasModal from "@/components/create-canvas"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import TodoCard, { type TodoTask } from "@/components/todo-card"
import ItemMenu from "@/components/item-menu"
import PageHeader from "@/components/page-header"
import ProjectDescription from "@/components/ProjectDescription"
import {
  createCanvas,
  deleteCanvas,
  renameCanvas,
} from "@/lib/actions/canvases"

type Canvas = { id: string; title: string; tasks: TodoTask[] }

export default function ProjectForm({
  id,
  title,
  initialCanvases = [],
}: {
  id: string
  title?: string
  initialCanvases?: Canvas[]
}) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [canvs, setCanvs] = useState<Canvas[]>(initialCanvases)
  const [showAll, setShowAll] = useState(false)

  const handleCreateCanvas = async (canvasName: string) => {
    const result = await createCanvas(id, canvasName)
    if (!result.ok) return result.error
    const { id: canvasId, title } = result.data
    setCanvs((prev) => [...prev, { id: canvasId, title, tasks: [] }])
    setIsModalOpen(false)
  }

  const handleRenameCanvas = async (canvasId: string, newTitle: string) => {
    const result = await renameCanvas(canvasId, newTitle)
    if (!result.ok) return result.error
    setCanvs((prev) =>
      prev.map((c) =>
        c.id === canvasId ? { ...c, title: result.data.title } : c
      )
    )
  }

  const handleDeleteCanvas = async (canvasId: string) => {
    const result = await deleteCanvas(canvasId)
    if (!result.ok) return result.error
    setCanvs((prev) => prev.filter((c) => c.id !== canvasId))
  }

  const visibleCanvs = showAll ? canvs : canvs.slice(0, 2);
  const showViewAllButton = canvs.length >= 3 && !showAll;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
      <div className="flex w-full max-w-[1100px] flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        
        <PageHeader homeHref="/" title={title ?? "Проект"} />
        <ProjectDescription />

        {/* Белая карточка: адаптивные паддинги, убран min-h-[500px] */}
        <div className="flex w-full flex-col justify-center rounded-[16px] md:rounded-[20px] border border-main bg-white p-3 sm:p-4 md:p-6 lg:p-7 xl:p-8">
          {canvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 md:py-10">
              <p className="mb-4 md:mb-6 text-center font-['Inter'] text-[20px] md:text-[24px] lg:text-[26px] leading-snug font-light text-main-desaturated">
                У вас пока нет холстов,
                <br />
                создать?
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex h-[100px] w-[100px] md:h-[120px] md:w-[120px] lg:h-[130px] lg:w-[130px] xl:h-[140px] xl:w-[140px] items-center justify-center rounded-full bg-[#E6F0FF] text-main-desaturated transition-colors hover:bg-[#d4e5fc]"
              >
                <Plus size={80} className="size-12 md:size-14 lg:size-16 xl:size-[80px]" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 md:gap-4">
              
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                  {visibleCanvs.map((canvas) => (
                    <div 
                      key={canvas.id} 
                      onClick={() => router.push(`/canvas/${canvas.id}`)}
                      // Адаптивная высота холстов: на 2xl возвращается оригинальные 480px
                      className="flex flex-col gap-2 h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[440px] 2xl:h-[480px] w-full transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="flex flex-col h-full bg-overcast-sky rounded-[15px] p-3 md:p-4 transition-colors hover:bg-[#c2ddf8]">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="block whitespace-nowrap overflow-hidden text-ellipsis font-['Inter'] text-[20px] md:text-[22px] lg:text-[24px] xl:text-[26px] font-light text-black">
                            {canvas.title}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ItemMenu
                              itemTitle={canvas.title}
                              kind={{
                                label: "холста",
                                renameTitle: "Переименование",
                                deleteTitle: "Удалить холст?",
                                deleteWarning: "Все задачи холста будут удалены без возможности восстановления.",
                              }}
                              onRename={(newTitle) => handleRenameCanvas(canvas.id, newTitle)}
                              onDelete={() => handleDeleteCanvas(canvas.id)}
                            />
                          </div>
                        </div>
                        <div className="mt-auto flex-1 min-h-0 overflow-hidden flex flex-col justify-end">
                          <TodoCard canvasId={canvas.id} initialTasks={canvas.tasks} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {!showAll && (
                    <div className="flex flex-col gap-2 h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[440px] 2xl:h-[480px] w-full">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="group flex flex-col items-center justify-center h-full w-full rounded-[15px] bg-overcast-sky transition-colors hover:bg-[#c2ddf8]"
                      >
                        <div className="flex h-[50px] w-[50px] md:h-[60px] md:w-[60px] lg:h-[65px] lg:w-[65px] xl:h-[70px] xl:w-[70px] items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-105">
                          <Plus size={40} className="size-6 md:size-7 lg:size-8 xl:size-10" strokeWidth={2} />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showViewAllButton && (
                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => setShowAll(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-overcast-sky py-2.5 md:py-3 font-['Inter'] text-[14px] md:text-[15px] lg:text-[16px] font-normal text-main-desaturated transition-colors hover:bg-[#c2ddf8]"
                  >
                    Посмотреть все холсты ({canvs.length})
                    <ChevronDown size={20} className="size-4 md:size-5" />
                  </button>
                </div>
              )}

              {showAll && (
                <div className="w-full flex flex-col gap-3 mt-2 md:mt-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full rounded-[10px] bg-[#6B78E5] py-2.5 md:py-3 text-[16px] md:text-[17px] lg:text-[18px] font-normal text-white transition-colors duration-200 hover:bg-[#5A67D8]"
                  >
                    Создать холст
                  </button>
                  <button
                    onClick={() => setShowAll(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] py-2 font-['Inter'] text-[14px] md:text-[15px] lg:text-[16px] font-normal text-gray-500 transition-colors hover:text-main-desaturated"
                  >
                    Скрыть
                    <ChevronUp size={20} className="size-4 md:size-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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