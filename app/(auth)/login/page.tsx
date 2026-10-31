import Link from "next/link"
import LoginForm from "@/components/authForms/LoginForm"

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-center font-['Inter'] text-[34px] leading-tight font-normal tracking-tight text-main-desaturated">
        Вход
      </h1>
      <LoginForm />
      <div className="mt-6 flex flex-row items-center justify-center gap-1.5">
        <span className="font-['Inter'] text-[19px] font-light text-black">
          Еще нет аккаунта?
        </span>
        <Link
          href="/register"
          className="font-['Inter'] text-[19px] font-light text-main-desaturated hover:underline"
        >
          Зарегистрироваться
        </Link>
      </div>
    </>
  )
}
