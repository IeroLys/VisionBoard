import { redirect } from 'next/navigation'
import { getServerSession } from "@/lib/server/session";



export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (session) redirect("/");

  return children
}
