import { getServerSession } from "@/lib/server/session";
import { redirect } from "next/navigation";
import MainDashboard from "@/components/MainDashboard";
import { getProjects } from "@/lib/actions/projects";

export default async function MainPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const projects = await getProjects();

  return (
    <MainDashboard
      userName={session.user.name}
      initialProjects={projects.map((p) => ({
        id: p.id,
        title: p.title,
        canvasCount: p.canvasCount,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
