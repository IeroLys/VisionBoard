"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";

export default function ProjectDescription({ 
  initialDescription = "" 
}: { 
  initialDescription?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(initialDescription);

  const handleSave = () => {
    setDescription(tempDescription);
    setIsEditing(false);
    // Здесь в будущем будет вызов API для сохранения в БД
    console.log("Сохранено описание:", tempDescription);
  };

  return (
    <div className="w-full bg-white rounded-[15px] border border-main/20 shadow-sm overflow-hidden">
      
      {/* Шапка панели */}
      <div className="w-full p-4 flex justify-between items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 text-left text-main-desaturated hover:opacity-80 transition-opacity"
        >
          <span className="font-['Inter'] text-[22px] font-normal">Описание</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Кнопка редактирования (только когда панель открыта и не в режиме редактирования) */}
          {isOpen && !isEditing && (
            <button
              onClick={() => {
                setTempDescription(description);
                setIsEditing(true);
              }}
              className="p-1 text-gray-400 hover:text-main-desaturated transition-colors"
              aria-label="Редактировать описание"
              title="Редактировать"
            >
              <Pencil size={20} />
            </button>
          )}

          {/* Кнопка сворачивания/разворачивания */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-main-desaturated hover:opacity-80 transition-opacity"
            aria-label={isOpen ? "Свернуть" : "Развернуть"}
          >
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
      </div>

      {/* Содержимое (раскрывается) */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="w-full min-h-[100px] p-3 bg-gray-50 rounded-[10px] text-black focus:outline-none focus:ring-2 focus:ring-main resize-none font-['Inter'] text-[20px]"
                placeholder="Введите описание проекта..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setTempDescription(description);
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-black transition-colors font-['Inter'] text-[16px] flex items-center gap-1"
                >
                  <X size={18} /> Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-[#6B78E5] hover:bg-[#5A67D8] text-white rounded-[10px] transition-colors font-['Inter'] text-[16px] flex items-center gap-1"
                >
                  <Check size={18} /> Сохранить
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
             {description ? (
                <p className="text-black font-['Inter'] text-[18px] whitespace-pre-wrap pt-2">
                  {description}
                </p>
              ) : (
                <p className="text-gray-400 font-['Inter'] text-[18px] italic pt-2">
                  Описание пока не добавлено
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}