"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!projectName.trim()) {
      setError("Пожалуйста, введите название проекта");
      return;
    }

    console.log("Проект создан:", projectName);
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-[450px] bg-overcast-sky rounded-[25px] p-10">
        
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
            className="w-full text-gray-700 px-4 py-3 bg-white rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />

          {error && (
            <p className="text-red-500 text-[16px] mt-1.5 ml-2 font-['Inter']">{error}</p>
          )}

          <button 
            type="submit" 
            className="w-full mt-6 bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[25px] py-4 rounded-[20px] transition-colors duration-200"
          >
            Создать
          </button>
        </form>

      </div>
    </div>
  );
}