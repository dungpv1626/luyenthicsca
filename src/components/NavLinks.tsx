"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";

export const NAV = [
  ["/csca", "CSCA"],
  ["/thi-thu", "Thi thử"],
  ["/luyen-tap", "Luyện tập"],
  ["/ai", "AI CSCA"],
  ["/lo-trinh", "Lộ trình"],
  ["/truong", "Trường & Học bổng"],
  ["/academy", "Academy"],
] as const;

const active = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function DesktopNav() {
  const path = usePathname();
  return (
    <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
      {NAV.map(([href, label]) => (
        <Link key={href} href={href} className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition xl:px-3 xl:text-sm ${active(path, href) ? "bg-white/15 text-white" : "text-white/80 hover:text-white"}`}>{label}</Link>
      ))}
    </nav>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <div className="lg:hidden">
      <button aria-label="Menu" onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full border border-white/40 text-white"><Icon name={open ? "x" : "menu"} /></button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white p-4 text-ink shadow-xl">
          <div className="mx-auto grid max-w-6xl gap-1">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`rounded-xl px-3 py-2.5 font-semibold ${active(path, href) ? "bg-brand-soft text-brand" : ""}`}>{label}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [["/", "home", "Trang chủ"], ["/thi-thu", "test", "Thi thử"], ["/luyen-tap", "pencil", "Luyện tập"], ["/ai", "sparkles", "AI"], ["/dashboard", "user", "Tôi"]] as const;

export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/thi/") || path.startsWith("/admin")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {TABS.map(([href, icon, label]) => (
        <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active(path, href) ? "text-brand" : "text-slate-500"}`}>
          <Icon name={icon} className="h-5 w-5" />{label}
        </Link>
      ))}
    </nav>
  );
}
