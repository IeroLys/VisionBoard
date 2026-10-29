import { getServerSession } from "@/lib/server/session";
import { redirect } from 'next/navigation'
import MainDashboard from "@/components/MainDashboard";


export default async function MainPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return <MainDashboard />;
}
