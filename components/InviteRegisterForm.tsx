"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { joinProjectByToken } from "@/lib/actions/projects";
import { authClient } from "@/lib/auth-client";

export default function InviteRegisterForm({ inviteToken }: { inviteToken?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setPending(true);
    setError("");

    try {
      // 1. РЕГИСТРАЦИЯ
      const { error: authError } = await authClient.signUp.email({ 
        email, 
        password, 
        name 
      });

      if (authError) {
        setError(authError.message || "Ошибка регистрации");
        return;
      }

      // 2. ПРИСОЕДИНЕНИЕ И ПЕРЕХОД В ПРОЕКТ
      if (inviteToken) {
        const joinResult = await joinProjectByToken(inviteToken);
        if (joinResult.ok && joinResult.data) {
          window.location.href = `/project/${joinResult.data}`;
          return;
        } else {
          setError(joinResult.error || "Не удалось присоединиться к проекту");
          return;
        }
      }

      // Если токена нет — на главную
      router.push("/");
      router.refresh();
      
    } catch (err) {
      setError("Произошла ошибка при регистрации");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      
      {/* Поле Имя */}
      <div>
        <label className="block text-[20px] text-black font-['Inter'] font-light mb-1 ml-2">
          Введите имя:
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          className="w-full text-black px-4 py-3 bg-white rounded-[20px] border-2 border-main focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
        />
      </div>

      {/* Поле Email */}
      <div>
        <label className="block text-[20px] text-black font-['Inter'] font-light mb-1 ml-2">
          Введите email:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          className="w-full text-black px-4 py-3 bg-white rounded-[20px] border-2 border-main focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
        />
      </div>

      {/* Поле Пароль с глазом */}
      <div>
        <label className="block text-[20px] text-black font-['Inter'] font-light mb-1 ml-2">
          Придумайте пароль:
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            className="w-full text-black px-4 py-3 pr-12 bg-white rounded-[20px] border-2 border-main focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-main transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-[14px] text-center font-['Inter']">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-2 bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[25px] py-3 rounded-[20px] transition-colors duration-200 disabled:opacity-60"
      >
        {pending ? "Регистрация..." : "Зарегистрироваться"}
      </button>

    </form>
  );
}