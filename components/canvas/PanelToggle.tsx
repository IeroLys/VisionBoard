'use client';

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PanelToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function PanelToggle({ isOpen, onToggle }: PanelToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? "Свернуть панель" : "Развернуть панель"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A8CBF5] text-gray-800 shadow-md transition-transform hover:scale-110"
    >
      {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </button>
  );
}