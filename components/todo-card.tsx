"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TodoProps {
  title: string;
}

export default function TodoCard({ title }: TodoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskCounter, setTaskCounter] = useState(0);
  const [completedCounter, setCompletedCounter] = useState(0);

  const completedPercent = taskCounter === 0 
    ? 7 
    : (completedCounter / taskCounter) * 100;

  return (
    <div className="rounded-[15px] overflow-hidden flex flex-col-reverse shadow-sm p-3">
      {!isExpanded ?
        <div className="flex flex-col"> 
          <div className="p-4 flex justify-between items-center bg-white">
            <label className="text-black text-[25px]">To do</label>
            <button 
              onClick={() => {setIsExpanded(!isExpanded);}}
              className="p-3 bg-[#9FCEFF] rounded-full shadow-sm hover:bg-[#7cb2eb] transition-colors"
            >
              <ChevronUp size={20} className="text-black"/>
            </button>
          </div>
          <div className="pr-4 pl-4 p text-center">
            <div className="w-full bg-[#9FCEFF] rounded-full h-6 overflow-hidden">
              <div 
                className="bg-main h-full rounded-full transition-all duration-300"
                style={{ width: `${completedPercent}%` }} 
              />
            </div>
          </div>
        </div> 
      : <div className="flex flex-col gap-2">
          <div className="p-4 flex justify-between items-center bg-white">
            <label className="text-black text-[25px]">To do</label>
            <button 
              onClick={(e) => {setIsExpanded(!isExpanded);}}
              className="p-3 bg-[#9FCEFF] rounded-full shadow-sm hover:bg-[#7cb2eb] transition-colors">
              <ChevronDown size={20} className="text-black"/>
            </button>
          </div>

          <button className="p-2 ml-6 mr-6 mb-4 bg-[#9FCEFF] rounded-[15px] hover:bg-[#7cb2eb] transition-colors text-black">
            Добавить задачу
          </button>

          <div className="p-4 text-center">
            <div className="w-full bg-[#9FCEFF] rounded-full h-6 overflow-hidden">
              <div 
                className="bg-main h-full rounded-full transition-all duration-300"
                style={{ width: `${completedPercent}%` }} 
              />
            </div>
            <p className="text-black">{completedCounter} из {taskCounter}</p>
          </div>
        </div>
      }
    </div>
  );
}
