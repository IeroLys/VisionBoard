"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { generateInviteToken, getProjectWithMembersByToken } from "@/lib/actions/projects";

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
  const [members, setMembers] = useState<any[]>([]); // Пока any, потом типизируем

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      
      // 1. Генерируем токен
      const result = await generateInviteToken(projectId);
      
      if (result.ok && result.data) {
        const baseUrl = window.location.origin;
        setLink(`${baseUrl}/invite?token=${result.data}&title=${encodeURIComponent(projectTitle)}`);

        // 2. Загружаем участников по этому токену
        const projectWithMembers = await getProjectWithMembersByToken(result.data);
        if (projectWithMembers) {
          setMembers(projectWithMembers.members || []);
        }
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

        {/* Список участников */}
        <div className="flex flex-col gap-2">
          <label className="text-[20px] text-black font-['Inter']">Участники проекта:</label>
          
          <div className="bg-white rounded-[15px] max-h-[200px] overflow-y-auto scrollbar-hide border-2 border-transparent">
            {members.length === 0 ? (
              <div className="p-6 text-center min-h-[100px] flex items-center justify-center">
                <p className="text-[16px] text-black font-['Inter']">
                  Здесь пока никого нет, поделитесь<br />ссылкой для приглашения
                </p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {members.map((member) => (
                  <li 
                    key={member.userId} 
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-default shrink-0 border-b border-gray-100 last:border-0"
                  >
                    {/* Аватарка (если есть image, иначе первая буква имени) */}
                    <div className="w-10 h-10 rounded-full bg-main flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden">
                      {member.user.image ? (
                        <img src={member.user.image} alt={member.user.name} className="w-full h-full object-cover" />
                      ) : (
                        member.user.name?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    {/* Имя и email */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[16px] text-black font-['Inter'] truncate">
                        {member.user.name}
                      </span>
                      <span className="text-[12px] text-gray-500 font-['Inter'] truncate">
                        {member.user.email}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="text-[14px] text-center text-gray-400 mt-4 font-['Inter']">
          Участники могут просматривать ваш проект
        </p>
      </div>
    </div>
  );
}