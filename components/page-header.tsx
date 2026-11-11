import { Users, Home } from "lucide-react";
import Link from "next/link";

export default function PageHeader({
  homeHref = "/",
  title,
  subtitle,
  actions,
}: {
  homeHref?: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="w-full bg-overcast-sky rounded-[20px] p-6 md:p-8 flex items-center justify-between gap-4 min-h-[160px]">
      
      <div className="flex flex-col gap-3 min-w-0">
        <h1 className="text-[30px] md:text-[34px] leading-tight text-main-desaturated font-['Inter'] font-normal tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Правая часть: Иконки */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Иконка Участники */}
        <button
          aria-label="Участники"
          title="Участники"
          className="bg-white p-3 rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-black hover:text-main-desaturated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main"
        >
          <Users size={38} /> {/* Увеличили с 28 до 34 */}
        </button>

        {/* Иконка Домой */}
        <Link
          href={homeHref}
          aria-label="На главную"
          title="На главную"
          className="bg-white p-3 rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-black hover:text-main-desaturated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main"
        >
          <Home size={38} /> {/* Увеличили с 28 до 34 */}
        </Link>
      </div>
    </div>
  );
}