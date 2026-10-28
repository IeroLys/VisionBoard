import Link from "next/link"
import RegisterForm from "@/components/authForms/RegisterForm"

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-5 text-center font-['Inter'] text-[34px] leading-tight font-normal tracking-tight text-main-desaturated">
        Регистрация
      </h1>
      <RegisterForm />
      <div className="mt-4 flex flex-row items-center justify-center gap-1.5">
        <span className="font-['Inter'] text-[18px] font-light text-black">
          Уже есть аккаунт?
        </span>
        <Link
          href="/login"
          className="font-['Inter'] text-[18px] font-light text-main-desaturated hover:underline"
        >
          Войти
        </Link>
      </div>
    </>
  )
}
