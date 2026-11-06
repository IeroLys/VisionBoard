import ProjectForm from "@/components/ProjectForm";


// Сырая версия страницы проекта
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
      <ProjectForm id={resolvedParams.id}/>
  )
}
