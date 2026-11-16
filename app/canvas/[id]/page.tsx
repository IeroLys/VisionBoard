import { notFound } from "next/navigation";
import { getCanvas } from "@/lib/actions/canvases";
import CanvasEditor from "@/components/CanvasEditor";

export default async function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const canvas = await getCanvas(id);

  if (!canvas) {
    notFound();
  }

  return (
    <CanvasEditor 
      canvasId={canvas.id} 
      canvasTitle={canvas.title} 
      initialTasks={canvas.tasks} 
      projectId={canvas.project.id} // <-- Передаем ID проекта
    />
  );
}