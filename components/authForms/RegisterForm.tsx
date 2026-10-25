"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Функция для перевода ошибок от Better Auth на русский язык
function getRussianAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("invalid email")) return "Неверный формат email";
  if (msg.includes("already exists")) return "Пользователь с таким email уже зарегистрирован";
  if (msg.includes("password") && msg.includes("character")) return "Пароль должен содержать минимум 6 символов";
  return "Ошибка при регистрации. Проверьте введенные данные.";
}

export default function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors: { name?: string; email?: string; password?: string; general?: string } = {};

    if (!name.trim()) newErrors.name = "Поле обязательно для заполнения";
    if (!email.trim()) {
      newErrors.email = "Поле обязательно для заполнения";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Неверный формат email";
    }
    if (!password.trim()) {
      newErrors.password = "Поле обязательно для заполнения";
    } else if (password.length < 8 || password.length > 30) {
      newErrors.password = "Пароль должен содержать от 8 до 30 символов";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          router.push("/");
        } else {
          newErrors.general = getRussianAuthError(data.message || "Ошибка");
          setErrors(newErrors);
        }
      } catch (error) {
        console.error("Ошибка сети:", error);
        newErrors.general = "Ошибка сети. Проверьте подключение к интернету.";
        setErrors(newErrors);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-[500px] bg-white rounded-[25px] border border-main p-10 shadow-sm">
      <h1 className="text-[34px] leading-tight text-main-desaturated text-center font-inter font-normal tracking-tight mb-5">
        Регистрация
      </h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[20px] text-[16px] text-center font-inter">
            {errors.general}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-[20px] text-black font-inter font-light mb-1.5 ml-2">
            Введите имя:
          </label>
          <input 
            id="name"
            name="name"
            type="text" 
            className="w-full text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />
          {errors.name && (
            <p className="text-red-500 text-[18px] mt-1.5 ml-2 font-inter">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-[20px] text-black font-inter font-light mb-1.5 ml-2">
            Введите email:
          </label>
          <input 
            id="email"
            name="email"
            type="email" 
            className="w-full text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="text-red-500 text-[18px] mt-1.5 ml-2 font-inter">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-[20px] text-black font-inter font-light mb-1.5 ml-2">
            Придумайте пароль:
          </label>
          <input 
            id="password"
            name="password"
            type="password"
            className="w-full text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />
          {errors.password && (
            <p className="text-red-500 text-[18px] mt-1.5 ml-2 font-inter">{errors.password}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full mt-4 text-white font-normal text-[25px] py-4 rounded-[20px] transition-colors duration-200 ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#6B78E5] hover:bg-[#5A67D8]"
          }`}
        >
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      <div className="flex flex-row items-center justify-center mt-4 gap-1.5">
        <span className="text-[18px] text-black font-inter font-light">
          Уже есть аккаунт?
        </span>
        <Link href="/login" className="text-[18px] text-main-desaturated hover:underline font-inter font-light">
          Войти
        </Link>
      </div>
    </div>
  );
}