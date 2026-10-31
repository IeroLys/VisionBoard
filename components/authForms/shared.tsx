export type FieldErrors<T extends string> = Partial<
  Record<T | "general", string>
>

const REQUIRED = "Поле обязательно для заполнения"

export function validateEmail(email: string) {
  if (!email) return REQUIRED
  if (!/\S+@\S+\.\S+/.test(email)) return "Неверный формат email"
}

export function validatePassword(password: string) {
  if (!password.trim()) return REQUIRED
  if (password.length < 8 || password.length > 30)
    return "Пароль должен содержать от 8 до 30 символов"
}

export function validateRequired(value: string) {
  if (!value) return REQUIRED
}

// Drops undefined entries so an empty object means "no errors".
export function compactErrors<T extends string>(errors: FieldErrors<T>) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, v]) => v)
  ) as FieldErrors<T>
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Неверный email или пароль.",
  INVALID_EMAIL: "Неверный формат email",
  USER_ALREADY_EXISTS: "Этот email уже используется.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Этот email уже используется.",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий.",
  PASSWORD_TOO_LONG: "Пароль слишком длинный.",
}

export const NETWORK_ERROR = "Ошибка сети. Проверьте подключение к интернету."

export function authErrorMessage(
  error: { code?: string; message?: string },
  fallback: string
) {
  return (
    (error.code && AUTH_ERROR_MESSAGES[error.code]) || error.message || fallback
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-center font-['Inter'] text-[16px] text-red-600"
    >
      {message}
    </div>
  )
}

export function SubmitButton({
  isLoading,
  label,
  loadingLabel,
}: {
  isLoading: boolean
  label: string
  loadingLabel: string
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`mt-4 w-full rounded-[20px] py-4 text-[25px] font-normal text-white transition-colors duration-200 ${
        isLoading
          ? "cursor-not-allowed bg-gray-400"
          : "bg-[#6B78E5] hover:bg-[#5A67D8]"
      }`}
    >
      {isLoading ? loadingLabel : label}
    </button>
  )
}
