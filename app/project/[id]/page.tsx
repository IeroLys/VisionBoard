import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import { getServerSession } from "@/lib/server/session";
import { getProjectWithCanvases } from "@/lib/actions/canvases";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectWithCanvases(id);
  return { title: project ? project.title : "Проект не найден" };
}

export default async function ProjectPage({ params }: Props) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const project = await getProjectWithCanvases(id);
  if (!project) notFound();

  return (
    <ProjectForm
      id={project.id}
      title={project.title}
      initialCanvases={project.canvases.map((c) => ({
        id: c.id,
        title: c.title,
        tasks: c.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
        })),
      }))}
    />
  );
}
