"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

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
    } else if (password.length < 6 || password.length > 30) {
      setPasswordError("Пароль должен содержать от 6 до 30 символов");
      isValid = false;
    }

    if (isValid) {
      console.log("Валидация пройдена:", { email, password });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-[500px] bg-white rounded-[25px] border border-main p-10 shadow-sm">
        
        <h1 className="text-[34px] leading-tight text-main-desaturated text-center font-['Inter'] font-normal tracking-tight mb-6">
          Вход
        </h1>
        
        <div className="flex flex-col gap-5">
          
          <div>
            <label className="block text-[20px] text-black font-['Inter'] font-light mb-1.5 ml-2">
              Введите email:
            </label>
            <input 
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
            <label className="block text-[20px] text-black font-['Inter'] font-light mb-1.5 ml-2">
              Введите пароль:
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-700 px-4 py-3 bg-[#E3F0FF] border border-main-desaturated rounded-[20px] focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent transition-all"
            />
            {passwordError && (
              <p className="text-red-500 text-[18px] mt-1.5 ml-2 font-['Inter']">{passwordError}</p>
            )}
          </div>

        </div>

        <button 
          type="button" 
          onClick={handleLogin}
          className="w-full mt-8 bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[25px] py-4 rounded-[20px] transition-colors duration-200"
        >
          Войти
        </button>

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