"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import AuthField from "./AuthField"
import {
  authErrorMessage,
  compactErrors,
  FieldErrors,
  FormError,
  NETWORK_ERROR,
  SubmitButton,
  validateEmail,
  validatePassword,
  validateRequired,
} from "./shared"

type Field = "name" | "email" | "password"

export default function RegisterForm() {
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    const fieldErrors = compactErrors<Field>({
      name: validateRequired(name),
      email: validateEmail(email),
      password: validatePassword(password),
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsLoading(true)
    let general: string | undefined
    try {
      const { error } = await authClient.signUp.email({ name, email, password })
      if (error)
        general = authErrorMessage(
          error,
          "Ошибка при регистрации. Возможно, этот email уже используется."
        )
    } catch {
      general = NETWORK_ERROR
    }

    if (general) {
      setErrors({ general })
      setIsLoading(false)
      return
    }

    router.replace("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={errors.general} />

      <AuthField
        name="name"
        label="Введите имя:"
        autoComplete="name"
        error={errors.name}
      />
      <AuthField
        name="email"
        type="email"
        label="Введите email:"
        autoComplete="email"
        error={errors.email}
      />
      <AuthField
        name="password"
        type="password"
        label="Придумайте пароль:"
        autoComplete="new-password"
        error={errors.password}
      />

      <SubmitButton
        isLoading={isLoading}
        label="Зарегистрироваться"
        loadingLabel="Регистрация..."
      />
    </form>
  )
}
