"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setGeneralError("");
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    if (!email.trim()) {
      setEmailError("Поле обязательно для заполнения");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Неверный формат email");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Поле обязательно для заполнения");
      isValid = false;
    } else if (password.length < 8 || password.length > 30) {
      setPasswordError("Пароль должен содержать от 8 до 30 символов");
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Вход успешен:", data);
          router.push("/");
        } else {
          setGeneralError(data.message || "Неверный email или пароль.");
        }
      } catch (error) {
        console.error("Ошибка сети:", error);
        setGeneralError("Ошибка сети. Проверьте подключение к интернету.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white rounded-[25px] border border-main p-10 shadow-sm">
        
        <h1 className="text-[34px] leading-tight text-main-desaturated text-center font-['Inter'] font-normal tracking-tight mb-6">
          Вход
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[20px] text-[16px] text-center font-['Inter']">
              {generalError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[20px] text-black font-['Inter'] font-light mb-1.5 ml-2">
              Введите email:
            </label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
            />
            {emailError && (
              <p className="text-red-500 text-[18px] mt-1.5 ml-2 font-['Inter']">{emailError}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-[20px] text-black font-['Inter'] font-light mb-1.5 ml-2">
              Введите пароль:
            </label>
            <input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
            />
            {passwordError && (
              <p className="text-red-500 text-[18px] mt-1.5 ml-2 font-['Inter']">{passwordError}</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full mt-4 text-white font-normal text-[25px] py-4 rounded-[20px] transition-colors duration-200 ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#6B78E5] hover:bg-[#5A67D8]"
            }`}
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="flex flex-row items-center justify-center mt-6 gap-1.5">
          <span className="text-[19px] text-black font-['Inter'] font-light">
            Еще нет аккаунта?
          </span>
          <Link href="/register" className="text-[19px] text-main-desaturated hover:underline font-['Inter'] font-light">
            Зарегистрироваться
          </Link>
        </div>

      </div>
    </div>
  );
}