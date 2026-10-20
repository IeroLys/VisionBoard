"use client";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  // Состояния для значений полей
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Состояния для ошибок (если пусто — ошибки нет)
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleRegister = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Неверный формат email");
      isValid = false;
    }

    if (!password.trim()) {
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      
        <div className="w-[425px] h-[400px] bg-white rounded-[25px] border-3 border-main-desaturated p-8">
        
            <h1 className="text-2xl text-main text-center font-['Inter'] mb-6">
            Регистрация
            </h1>
            
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
            Введите email:
            </label>

            <input 
            type="email" 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="w-full text-gray-700 px-4 py-2 bg-overcast-sky border-[3px] border-main rounded-[25px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
            Придумайте пароль:
            </label>

            <input 
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="w-full text-gray-700 px-4 py-2 bg-overcast-sky border-[3px] border-main rounded-[25px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}

            <button 
            type="button" 
            onClick={handleRegister}
            className="w-full mt-4 bg-main hover:bg-indigo-600 text-white font-medium text-lg py-3 rounded-[25px] transition-colors duration-200">
            Зарегистрироваться
            </button>

            <div className="flex flex-row items-center justify-center">

              <label className="block mt-[5px] text-sm font-medium text-gray-700 mb-3 text-center">
              Уже есть аккаунт? 
              </label>

              <Link href="/login"  className="block ml-[2px] mt-[5px] text-sm font-medium mb-3 text-center text-blue-500 hover:underline">
              Войти
              </Link>

            </div>

        </div>

    </div>
  );
}