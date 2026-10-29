"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) newErrors.name = "Поле обязательно для заполнения";
    if (!email.trim()) {
      newErrors.email = "Поле обязательно для заполнения";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Неверный формат email";
    }
    if (!password.trim()) {
      newErrors.password = "Поле обязательно для заполнения";
    } else if (password.length < 6 || password.length > 30) {
      newErrors.password = "Пароль должен содержать от 6 до 30 символов";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Валидация пройдена (Регистрация):", { name, email, password });
    }
  };

  return (
    <div className="w-full max-w-[500px] min-w-[320px] bg-white rounded-[25px] border border-main p-10 shadow-sm">
      
      <h1 className="text-[34px] leading-tight text-main-desaturated text-center font-['Inter'] font-normal tracking-tight mb-6">
        Регистрация
      </h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div>
          <label htmlFor="name" className="block text-[18px] text-black font-['Inter'] font-light mb-1.5 ml-2">
            Введите имя:
          </label>
          <input 
            id="name"
            name="name"
            type="text" 
            className="w-full text-[20px] text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />
          {errors.name && (
            <p className="text-red-500 text-[16px] mt-1.5 ml-2 font-['Inter']">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-[18px] text-black font-['Inter'] font-light mb-1.5 ml-2">
            Введите email:
          </label>
          <input 
            id="email"
            name="email"
            type="email" 
            className="w-full text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="text-red-500 text-[16px] mt-1.5 ml-2 font-['Inter']">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-[18px] text-black font-['Inter'] font-light mb-1.5 ml-2">
            Придумайте пароль:
          </label>
          <div className="relative">
            <input 
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full text-[20px] text-gray-700 px-4 py-3 pr-12 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
            />
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B78E5] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[16px] mt-1.5 ml-2 font-['Inter']">{errors.password}</p>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full mt-4 bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[18px] py-4 rounded-[20px] transition-colors duration-200"
        >
          Зарегистрироваться
        </button>
      </form>

      <div className="flex flex-row items-center justify-center mt-4 gap-1.5">
        <span className="text-[18px] text-black font-['Inter'] font-light">
          Уже есть аккаунт?
        </span>
        <Link href="/login" className="text-[18px] text-main-desaturated hover:underline font-['Inter'] font-light">
          Войти
        </Link>
      </div>

    </div>
  );
}