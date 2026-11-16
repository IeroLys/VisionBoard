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
    <div className="w-full bg-overcast-sky rounded-[20px] p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 flex items-center justify-between gap-3 md:gap-4 min-h-[90px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] xl:min-h-[150px] 2xl:min-h-[160px]">
      
      <div className="flex flex-col gap-1.5 md:gap-2 lg:gap-3 min-w-0">
        <h1 className="text-[22px] sm:text-[26px] md:text-[28px] lg:text-[30px] xl:text-[32px] 2xl:text-[34px] leading-tight text-main-desaturated font-['Inter'] font-normal tracking-tight truncate">
          {title}
        </h1>
        
        {subtitle && (
          <div className="text-gray-600 text-[14px] md:text-[15px] lg:text-[16px] font-['Inter'] font-light leading-snug">
            {subtitle}
          </div>
        )}
      </div>

      {/* Правая часть: Иконки и действия */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {actions ? (
          actions
        ) : (
          <>
            {/* Иконка Участники */}
            <button
              aria-label="Участники"
              title="Участники"
              className="bg-white p-2 md:p-2.5 lg:p-3 rounded-[12px] md:rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-black hover:text-main-desaturated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main"
            >
              <Users size={38} className="size-5 md:size-6 lg:size-7 xl:size-8 2xl:size-[38px]" />
            </button>

            {/* Иконка Домой */}
            <Link
              href={homeHref}
              aria-label="На главную"
              title="На главную"
              className="bg-white p-2 md:p-2.5 lg:p-3 rounded-[12px] md:rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-black hover:text-main-desaturated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main"
            >
              <Home size={38} className="size-5 md:size-6 lg:size-7 xl:size-8 2xl:size-[38px]" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}