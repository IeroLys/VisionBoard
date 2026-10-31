"use client";

import { Camera, Settings, Plus, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import CreateBoardModal from "@/components/create-project";

type Project = { id: number; title: string };

export default function MainDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAll, setShowAll] = useState(false);

  const handleCreateProject = (projectName: string) => {
    const newProject = { id: Date.now(), title: projectName };
    setProjects((prev) => [...prev, newProject]);
    setIsModalOpen(false);
  };

  const visibleProjects = showAll ? projects : projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[1100px] flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-[160px] h-[160px] bg-white rounded-[20px] border border-main flex items-center justify-center shrink-0 mx-auto md:mx-0">
            <button className="text-gray-800 hover:text-main transition-colors">
              <Camera size={56} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 bg-overcast-sky rounded-[20px] p-8 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-[34px] leading-tight text-main-desaturated font-['Inter'] font-normal tracking-tight">
                Vision Board
              </h1>
              <Link
                href="/user"
                className="text-[24px] text-black font-['Inter'] font-light hover:underline"
              >
                Имя пользователя
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Настройки"
                title="Настройки"
                className="bg-white p-3 rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-black hover:text-main-desaturated"
              >
                <Settings size={38} />
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="w-full min-h-[500px] bg-white rounded-[20px] border border-main p-8 flex flex-col justify-center">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center">
              <p className="text-center text-main-desaturated text-[26px] font-['Inter'] font-light mb-6 leading-snug">
                У вас пока нет проектов,<br />
                начать работу?
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
                {visibleProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group bg-overcast-sky rounded-[15px] p-6 h-[160px] flex justify-between items-start hover:bg-[#c2ddf8] transition-colors cursor-pointer"
                  >
                    <span className="text-[24px] font-['Inter'] font-light text-black transition-transform duration-200 origin-left group-hover:scale-105">
                      {project.title}
                    </span>
                    <button className="bg-white p-2 rounded-[10px] shadow-sm hover:bg-gray-50 text-black">
                      <MoreHorizontal size={20} />
                    </button>
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
                {projects.length > 3 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full bg-overcast-sky text-main-desaturated py-3 rounded-[10px] text-[16px] font-['Inter'] font-normal hover:bg-[#c2ddf8] transition-colors flex items-center justify-center gap-2"
                  >
                    Посмотреть все проекты ({projects.length})
                    <ChevronDown size={20} />
                  </button>
                )}

                {showAll && (
                  <>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[18px] py-3 rounded-[10px] transition-colors duration-200"
                    >
                      Создать проект
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
      </div>

      {isModalOpen && (
        <CreateBoardModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateProject}
          existingProjects={projects.map((p) => p.title)}
        />
      )}
    </div>
  );
}