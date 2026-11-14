import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import CanvasLayout from "@/components/canvas/CanvasLayout";
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
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Шапка: крошки + заголовок (фиксированная высота, не скроллится с холстом) */}
      <div className="flex flex-col gap-3 px-6 pt-4 pb-2 shrink-0 z-10 bg-gray-50">
        <nav className="flex items-center gap-2 text-gray-500 text-[14px] font-['Inter'] font-light">
          <Link href="/" className="hover:text-main-desaturated transition-colors">
            Мои проекты
          </Link>
          <span>/</span>
          <Link href={projectHref} className="hover:text-main-desaturated transition-colors">
            {canvas.project.title}
          </Link>
          <span>/</span>
          <span className="text-main-desaturated">{canvas.title}</span>
        </nav>
        
        <PageHeader homeHref={projectHref} title={canvas.title} />
      </div>

      {/* Основная область: делегируем интерактивность клиентскому компоненту */}
      <CanvasLayout canvas={canvas} projectHref={projectHref} />
    </div>
  );
}