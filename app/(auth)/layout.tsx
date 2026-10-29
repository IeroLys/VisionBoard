import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server/session"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession()
  if (session) redirect("/")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-[500px] rounded-[25px] border border-main bg-white p-10 shadow-sm">
        {children}
      </div>
    </div>
  )
}
