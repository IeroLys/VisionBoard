"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { authClient } from "@/lib/auth-client"

export default function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await authClient.signOut()
      router.replace("/login")
      router.refresh()
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="Выйти"
      title="Выйти"
      className="rounded-[15px] bg-white p-3 text-black shadow-sm transition-shadow hover:text-main-desaturated hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut size={38} />
    </button>
  )
}
