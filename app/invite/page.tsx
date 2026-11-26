import Link from "next/link";
import { getServerSession } from "@/lib/server/session";
import { getProjectByToken } from "@/lib/actions/projects";
import InviteAuthForm from "@/components/InviteAuthForm";
import InviteJoinButton from "@/components/InviteJoinButton";
import { notFound } from "next/navigation";

export default async function InvitePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ token?: string; title?: string }> 
}) {
  const { token } = await searchParams;

  if (!token) return <div className="text-center p-10">Ссылка недействительна</div>;

  const project = await getProjectByToken(token);
  if (!project) notFound();

  const projectTitle = project.title;
  const session = await getServerSession();
  const isAuth = !!session;

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-overcast-sky rounded-[25px] px-8 pb-8 pt-10 shadow-sm border border-main/20 text-center">
        
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

        {isAuth ? (
          <InviteJoinButton token={token} projectTitle={projectTitle} />
        ) : (
          <>
            <h2 className="text-[34px] text-main-desaturated text-center font-['Inter'] font-normal mb-6 mt-6">
              Вход
            </h2>
            <InviteAuthForm inviteToken={token} />
            <div className="flex justify-center mt-6 gap-1 text-[19px] font-['Inter']">
              <span className="text-black">Еще нет аккаунта?</span>
              <Link 
                href={`/invite/register?token=${token}`} 
                className="text-main-desaturated hover:underline"
              >
                Зарегистрироваться
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}