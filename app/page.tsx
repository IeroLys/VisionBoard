import { getServerSession } from "@/lib/server/session";
import { Camera, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from 'next/navigation'
import LogoutButton from "@/components/LogoutButton";


export default async function MainPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-[160px] h-[160px] bg-white rounded-[20px] border border-main flex items-center justify-center shrink-0 mx-auto md:mx-0">
            <button className="text-gray-800 hover:text-main transition-colors">
              <Camera size={56} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 bg-overcast-sky rounded-[20px] p-8 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-[34px] leading-tight text-main-desaturated font-['Inter'] font-normal tracking-tight">
                Название приложения
              </h1>

              <Link
                href="/user"
                className="text-[24px] text-black font-['Inter'] font-light hover:underline"
              >
                Имя пользователя
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Настройки"
                title="Настройки"
                className="bg-white p-3 rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-black hover:text-main-desaturated"
              >
                <Settings size={38} />
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="w-full min-h-[500px] bg-white rounded-[20px] border border-main flex flex-col items-center justify-center p-8">

          <p className="text-center text-main-desaturated text-[26px] font-['Inter'] font-light mb-6 leading-snug">
            У вас пока нет проектов,<br />
            начать работу?
          </p>

          <Link
            href="/create-project"
            className="flex items-center justify-center w-[100px] h-[100px] bg-[#DAECFF] rounded-full hover:bg-[#c2ddf8] transition-colors group"
          >
            <Plus size={64} className="text-main-desaturated" strokeWidth={1.5} />
          </Link>

        </div>

      </div>
    </div>
  );
}
