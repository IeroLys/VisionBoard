import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Crumb = { label: string; href?: string };

/** Header card for inner pages, matching the dashboard header style. */
export default function PageHeader({
  backHref,
  backLabel = "Назад",
  breadcrumbs,
  title,
  subtitle,
  actions,
}: {
  backHref: string;
  backLabel?: string;
  breadcrumbs: Crumb[];
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="w-full bg-overcast-sky rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5 min-w-0">
        <Link
          href={backHref}
          aria-label={backLabel}
          title={backLabel}
          className="bg-white p-3 rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-black hover:text-main-desaturated shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main"
        >
          <ArrowLeft size={32} />
        </Link>

        <div className="flex flex-col gap-1 min-w-0">
          <nav aria-label="Навигация" className="flex items-center gap-1 text-[15px] font-['Inter'] text-main-desaturated/80 min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight size={14} className="shrink-0" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-main-desaturated hover:underline truncate">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="truncate">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-[30px] md:text-[34px] leading-tight text-main-desaturated font-['Inter'] font-normal tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[16px] text-black font-['Inter'] font-light">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {actions}
        <LogoutButton />
      </div>
    </div>
  );
}
