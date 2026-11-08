import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/page-header";
import TodoCard from "@/components/todo-card";
import { getServerSession } from "@/lib/server/session";
import { getCanvas } from "@/lib/actions/canvases";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const canvas = await getCanvas(id);
  return { title: canvas ? `${canvas.title} · ${canvas.project.title}` : "Холст не найден" };
}

export default async function CanvasPage({ params }: Props) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const canvas = await getCanvas(id);
  if (!canvas) notFound();

  const projectHref = `/project/${canvas.project.id}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[1100px] flex flex-col gap-8">
        <PageHeader
          backHref={projectHref}
          backLabel="К проекту"
          breadcrumbs={[
            { label: "Мои проекты", href: "/" },
            { label: canvas.project.title, href: projectHref },
            { label: canvas.title },
          ]}
          title={canvas.title}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="min-h-[500px] bg-white rounded-[20px] border border-main p-8 flex flex-col items-center justify-center text-center">
            <div className="w-[120px] h-[120px] bg-[#E6F0FF] rounded-full flex items-center justify-center text-main-desaturated mb-6">
              <LayoutDashboard size={56} strokeWidth={1.5} />
            </div>
            <p className="text-main-desaturated text-[26px] font-['Inter'] font-light leading-snug">
              Холст пока пуст
            </p>
            <p className="mt-2 text-gray-500 text-[16px] font-['Inter'] font-light">
              Скоро здесь можно будет размещать элементы доски
            </p>
          </div>

          <div className="bg-white rounded-[20px] border border-main">
            <TodoCard
              canvasId={canvas.id}
              defaultExpanded
              initialTasks={canvas.tasks.map((t) => ({
                id: t.id,
                title: t.title,
                completed: t.completed,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
