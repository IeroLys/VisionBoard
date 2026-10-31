"use client";

import { useState } from "react";

export default function CreateBoardModal({ 
  onClose, 
  onCreate,
  existingProjects = []
}: { 
  onClose: () => void; 
  onCreate: (name: string) => void; 
  existingProjects?: string[];
}) {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setError("Пожалуйста, введите название проекта");
      return;
    }

    const isDuplicate = existingProjects.some(
      (title) => title.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError("Проект с таким названием уже существует");
      return;
    }

    onCreate(trimmedName); 
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-[450px] bg-overcast-sky rounded-[25px] p-10 relative shadow-2xl">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-500 hover:text-black transition-colors text-3xl font-light leading-none"
        >
          ×
        </button>

        <h1 className="text-[34px] leading-tight text-main-desaturated text-center font-['Inter'] font-normal tracking-tight mb-6">
          Создание проекта
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          
          <label htmlFor="projectName" className="block w-full text-center text-[24px] leading-snug text-black font-['Inter'] font-light mb-2">
            Введите название проекта:
          </label>

          <input 
            id="projectName"
            name="projectName"
            type="text" 
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setError("");
            }}
            className="w-full text-[20px] text-gray-700 px-4 py-3 bg-white rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />

          {error && (
            <p className="text-red-500 text-[16px] mt-1.5 text-center font-['Inter']">{error}</p>
          )}

          <button 
            type="submit" 
            className="w-full mt-6 bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[22px] py-4 rounded-[20px] transition-colors duration-200"
          >
            Создать
          </button>
        </form>

      </div>
    </div>
  );
}