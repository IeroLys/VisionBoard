import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] rounded-[25px] border border-main bg-white p-10 shadow-sm text-center">
        <p className="text-[72px] leading-none text-main-desaturated font-['Inter'] font-light">404</p>
        <h1 className="mt-4 text-[28px] text-main-desaturated font-['Inter'] font-normal tracking-tight">
          Страница не найдена
        </h1>
        <p className="mt-2 text-[17px] text-gray-500 font-['Inter'] font-light">
          Возможно, она была удалена или у вас нет к ней доступа.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center gap-2 w-full bg-[#6B78E5] hover:bg-[#5A67D8] text-white font-normal text-[18px] py-3 rounded-[20px] transition-colors"
        >
          <ArrowLeft size={20} />
          К моим проектам
        </Link>
      </div>
    </div>
  );
}
