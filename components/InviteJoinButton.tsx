"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinProjectByToken } from "@/lib/actions/projects";

export default function InviteJoinButton({ token, projectTitle }: { token: string; projectTitle: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setPending(true);
    setError("");

    try {
      const result = await joinProjectByToken(token);
      if (result.ok && result.data) {
        window.location.href = `/project/${result.data}`;
      } else {
        setError(result.error || "Не удалось присоединиться");
      }
    } catch (err) {
      setError("Ошибка при присоединении");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 gap-2">
      <button
        onClick={handleJoin}
        disabled={pending}
        className="px-8 py-3 bg-white text-black text-[20px] font-['Inter'] rounded-[15px] border-2 border-main hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
      >
        {pending ? "Присоединение..." : "Присоединиться"}
      </button>
      {error && <p className="text-red-500 text-[14px] font-['Inter']">{error}</p>}
    </div>
  );
}