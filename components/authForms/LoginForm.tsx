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
} from "./shared"

type Field = "email" | "password"

export default function LoginForm() {
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    const fieldErrors = compactErrors<Field>({
      email: validateEmail(email),
      password: validatePassword(password),
    })
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsLoading(true)
    let general: string | undefined
    try {
      const { error } = await authClient.signIn.email({ email, password })
      if (error) general = authErrorMessage(error, "Неверный email или пароль.")
    } catch {
      general = NETWORK_ERROR
    }

    if (general) {
      setErrors({ general })
      setIsLoading(false)
      return
    }

    // Keep the button disabled while navigating; refresh so server
    // components pick up the new session cookie.
    router.replace("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError message={errors.general} />

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
        label="Введите пароль:"
        autoComplete="current-password"
        error={errors.password}
      />

      <SubmitButton isLoading={isLoading} label="Войти" loadingLabel="Вход..." />
    </form>
  )
}
