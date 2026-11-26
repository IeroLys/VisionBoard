import Link from "next/link";
import { getProjectByToken } from "@/lib/actions/projects";
import InviteRegisterForm from "@/components/InviteRegisterForm";
import { notFound } from "next/navigation";

export default async function InviteRegisterPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ token?: string; title?: string }> 
}) {
  const { token } = await searchParams;

  if (!token) {
    return <div className="text-center p-10">Ссылка недействительна</div>;
  }

  const project = await getProjectByToken(token);
  if (!project) {
    notFound();
  }

  const projectTitle = project.title;

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-overcast-sky rounded-[25px] px-8 pb-8 pt-10 shadow-sm border border-main/20 text-center">
        
        {/* Текст приглашения */}
        <div className="mb-6">
          <p className="text-[20px] text-black font-['Inter'] font-light mb-2">
            Вас пригласили присоединиться к
          </p>
          <h1 className="text-[28px] leading-tight text-main-desaturated font-['Inter'] font-medium mb-2">
            {projectTitle}
          </h1>
          <div className="w-full h-[2px] bg-main/50 mb-4" />
          <p className="text-[19px] text-black font-['Inter'] font-light">
            Теперь вы сможете просматривать<br />этот проект
          </p>
        </div>

        <h2 className="text-[34px] text-main-desaturated text-center font-['Inter'] font-normal mb-6 mt-6">
          Регистрация
        </h2>
        
        <InviteRegisterForm inviteToken={token} />

        <div className="flex justify-center mt-6 gap-1 text-[19px] font-['Inter']">
          <span className="text-black">Уже есть аккаунт?</span>
          <Link 
            href={`/invite?token=${token}`} 
            className="text-main-desaturated hover:underline"
          >
            Войти
          </Link>
        </div>

      </div>
    </div>
  );
}