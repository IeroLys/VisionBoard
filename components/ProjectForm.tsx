"use client"

import { useState } from "react"
import CreateCanvasModal from "@/components/create-canvas"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import TodoCard, { type TodoTask } from "@/components/todo-card"
import ItemMenu from "@/components/item-menu"
import PageHeader from "@/components/page-header"
import {
  createCanvas,
  deleteCanvas,
  renameCanvas,
} from "@/lib/actions/canvases"
import { pluralRu } from "@/lib/format"

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
  const visibleCanvs = showAll ? canvs : canvs.slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12">
      <div className="flex w-full max-w-[1100px] flex-col gap-8">
        <PageHeader
          backHref="/"
          backLabel="К проектам"
          breadcrumbs={[
            { label: "Мои проекты", href: "/" },
            { label: title ?? "Проект" },
          ]}
          title={title ?? "Проект"}
          subtitle={
            canvs.length === 0
              ? "Нет холстов"
              : `${canvs.length} ${pluralRu(canvs.length, ["холст", "холста", "холстов"])}`
          }
        />

        <div className="flex min-h-[500px] w-full flex-col justify-center rounded-[20px] border border-main bg-white p-8">
          {canvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center">
              <p className="mb-6 text-center font-['Inter'] text-[26px] leading-snug font-light text-main-desaturated">
                У вас пока нет холстов,
                <br />
                создать?
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex h-[140px] w-[140px] items-center justify-center rounded-full bg-[#E6F0FF] text-main-desaturated transition-colors hover:bg-[#d4e5fc]"
              >
                <Plus
                  size={80}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:scale-110"
                />
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <div
                className={`grid w-full max-w-[900px] grid-cols-1 gap-4 pr-2 md:grid-cols-2 ${showAll ? "max-h-[400px] overflow-y-auto pb-4" : ""}`}
              >
                {visibleCanvs.map((canvas) => (
                  <div key={canvas.id}>
                    <Link
                      href={`/canvas/${canvas.id}`}
                      className="group flex h-[160px] cursor-pointer items-start justify-between gap-3 rounded-[15px] bg-overcast-sky p-6 transition-colors hover:bg-[#c2ddf8] focus-visible:ring-2 focus-visible:ring-main focus-visible:outline-none"
                    >
                      <span className="min-w-0 origin-left truncate font-['Inter'] text-[24px] font-light text-black transition-transform duration-200 group-hover:scale-105">
                        {canvas.title}
                      </span>

                      <ItemMenu
                        itemTitle={canvas.title}
                        kind={{
                          label: "холста",
                          renameTitle: "Переименование",
                          deleteTitle: "Удалить холст?",
                          deleteWarning:
                            "Все задачи холста будут удалены без возможности восстановления.",
                        }}
                        onRename={(newTitle) =>
                          handleRenameCanvas(canvas.id, newTitle)
                        }
                        onDelete={() => handleDeleteCanvas(canvas.id)}
                      />
                    </Link>

                    <TodoCard
                      canvasId={canvas.id}
                      initialTasks={canvas.tasks}
                    />
                  </div>
                ))}

                {!showAll && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group flex h-[160px] items-center justify-center rounded-[15px] bg-overcast-sky transition-colors hover:bg-[#c2ddf8]"
                  >
                    <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-105">
                      <Plus
                        size={40}
                        className="text-main-desaturated"
                        strokeWidth={2}
                      />
                    </div>
                  </button>
                )}
              </div>

              <div className="flex w-full max-w-[900px] flex-col gap-3">
                {canvs.length > 3 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-overcast-sky py-3 font-['Inter'] text-[16px] font-normal text-main-desaturated transition-colors hover:bg-[#c2ddf8]"
                  >
                    Посмотреть все холсты ({canvs.length})
                    <ChevronDown size={20} />
                  </button>
                )}

                {showAll && (
                  <>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full rounded-[10px] bg-[#6B78E5] py-3 text-[18px] font-normal text-white transition-colors duration-200 hover:bg-[#5A67D8]"
                    >
                      Создать холст
                    </button>

                    <button
                      onClick={() => setShowAll(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-[10px] py-2 font-['Inter'] text-[16px] font-normal text-gray-500 transition-colors hover:text-main-desaturated"
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
