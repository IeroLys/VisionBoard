"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

type AuthFieldProps = {
  name: string
  label: string
  type?: "text" | "email" | "password"
  autoComplete?: string
  error?: string
}

export default function AuthField({
  name,
  label,
  type = "text",
  autoComplete,
  error,
}: AuthFieldProps) {
  const [show, setShow] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword && show ? "text" : type

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 ml-2 block font-['Inter'] text-[20px] font-light text-black"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full rounded-[20px] border border-main-desaturated bg-[#E3F0FF] px-4 py-3 text-gray-700 transition-all focus:border-transparent focus:ring-2 focus:ring-main focus:outline-none ${
            isPassword ? "pr-12" : ""
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B78E5] transition-colors"
            aria-label={show ? "Скрыть пароль" : "Показать пароль"}
            title={show ? "Скрыть пароль" : "Показать пароль"}
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1.5 ml-2 font-['Inter'] text-[18px] text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  )
}