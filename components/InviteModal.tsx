"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { generateInviteToken } from "@/lib/actions/projects";

export default function InviteModal({ 
  onClose,
  projectTitle = "Проект",
  projectId
}: { 
  onClose: () => void;
  projectTitle?: string;
  projectId: string;
}) {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      const result = await generateInviteToken(projectId);
      
      if (result.ok && result.data) {
        const baseUrl = window.location.origin;
        setLink(`${baseUrl}/invite?token=${result.data}&title=${encodeURIComponent(projectTitle)}`);
      } else {
        setError("Не удалось сгенерировать ссылку");
      }
      setLoading(false);
    };
    
    generate();
  }, [projectId, projectTitle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-[550px] bg-overcast-sky rounded-[25px] px-8 pb-8 pt-6 relative shadow-2xl">
        
        <div className="flex items-center justify-between border-b-2 border-main pb-3 mb-5">
          <h2 className="text-[28px] leading-tight text-main-desaturated font-['Inter'] font-normal tracking-tight truncate pr-4">
            {projectTitle}
          </h2>
          <button onClick={onClose} className="text-main hover:text-main-desaturated transition-colors shrink-0" title="Закрыть">
            <ArrowRight size={28} />
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-[20px] text-black font-['Inter']">Ссылка приглашение:</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={loading ? "Генерация..." : link}
              readOnly
              className="flex-1 bg-white rounded-[15px] px-4 py-3 text-[18px] text-black outline-none border-2 border-main"
            />
            <button
              onClick={handleCopy}
              disabled={loading || !link}
              className={`px-6 py-3 bg-white rounded-[15px] text-[16px] text-black border-2 transition-colors whitespace-nowrap shadow-sm disabled:opacity-50 ${
                copied ? "border-main" : "border-main hover:bg-gray-50"
              }`}
            >
              {copied ? "Скопировано!" : "Копировать"}
            </button>
          </div>
          {error && <p className="text-red-500 text-[14px] text-center">{error}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[20px] text-black font-['Inter']">Участники проекта:</label>
          <div className="bg-white rounded-[15px] p-6 text-center min-h-[150px] flex items-center justify-center border-2 border-transparent">
            <p className="text-[16px] text-black font-['Inter']">
              Здесь пока никого нет, поделитесь<br />ссылкой для приглашения
            </p>
          </div>
        </div>

        <p className="text-[14px] text-center text-gray-400 mt-4 font-['Inter']">
          Участники могут просматривать ваш проект
        </p>
      </div>
    </div>
  );
}