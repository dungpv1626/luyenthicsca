"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export const NAV = [
  ["/thi-thu", "Thi thử"],
  ["/luyen-tap", "Luyện tập"],
  ["/lo-trinh", "Lộ trình"],
  ["/ai", "Hồ sơ năng lực"],
  ["/gia-su", "Gia sư AI"],
  ["/truong", "Trường & Học bổng"],
] as const;

/** Nhóm "Khám phá": nội dung giới thiệu và đọc thêm, đi cùng menu thả xuống. */
export const EXPLORE = [
  ["/csca", "CSCA là gì?"],
  ["/blog", "Blog"],
  ["/academy", "Academy"],
] as const;

const active = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function DesktopNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const exploreActive = EXPLORE.some(([href]) => active(path, href));
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const pill = (on: boolean) => `whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition xl:px-3 xl:text-sm ${on ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`;
  return (
    <nav aria-label="Menu chính" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
      {NAV.map(([href, label]) => (
        <Link key={href} href={href} aria-current={active(path, href) ? "page" : undefined} className={pill(active(path, href))}>{label}</Link>
      ))}
      <div ref={box} className="relative">
        <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)} className={`${pill(exploreActive || open)} inline-flex items-center gap-1`}>
          Khám phá<svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {open && (
          <div className="absolute left-1/2 top-full z-40 mt-2 w-48 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-1.5 text-ink shadow-xl">
            {EXPLORE.map(([href, label]) => (
              <Link key={href} href={href} aria-current={active(path, href) ? "page" : undefined} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${active(path, href) ? "bg-brand-soft text-brand" : "hover:bg-slate-100"}`}>{label}</Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const item = (href: string, label: string) => (
    <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(path, href) ? "page" : undefined} className={`rounded-xl px-3 py-2.5 font-semibold ${active(path, href) ? "bg-brand-soft text-brand" : ""}`}>{label}</Link>
  );
  return (
    <div className="lg:hidden">
      <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full border border-white/40 text-white"><Icon name={open ? "x" : "menu"} /></button>
      {open && (
        <div className="absolute inset-x-0 top-full max-h-[75vh] overflow-y-auto border-b border-slate-200 bg-white p-4 text-ink shadow-xl">
          <div className="mx-auto grid max-w-6xl gap-1">
            {NAV.map(([href, label]) => item(href, label))}
            <p className="mt-2 px-3 pt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Khám phá</p>
            {EXPLORE.map(([href, label]) => item(href, label))}
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [["/thi-thu", "test", "Thi thử"], ["/luyen-tap", "pencil", "Luyện tập"], ["/gia-su", "sparkles", "Gia sư"]] as const;
const MORE = [["/", "Trang chủ"], ["/lo-trinh", "Lộ trình"], ["/ai", "Hồ sơ năng lực"], ["/truong", "Trường & Học bổng"], ["/csca", "CSCA là gì?"], ["/blog", "Blog"], ["/academy", "Academy"]] as const;

export function BottomNav() {
  const path = usePathname();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [path]);
  if (path.startsWith("/thi/") || path.startsWith("/admin")) return null;
  const moreActive = MORE.some(([href]) => active(path, href));
  const tab = (on: boolean) => `relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${on ? "text-brand" : "text-slate-500"}`;
  const bar = (on: boolean) => on && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />;
  return (
    <>
      {more && (
        <div className="fixed inset-0 z-20 lg:hidden" onMouseDown={() => setMore(false)}>
          <div role="dialog" aria-label="Khám phá" onMouseDown={(e) => e.stopPropagation()} className="absolute inset-x-0 bottom-14 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white p-4 pb-6 shadow-2xl">
            <div className="grid gap-1">
              {MORE.map(([href, label]) => (
                <Link key={href} href={href} aria-current={active(path, href) ? "page" : undefined} className={`rounded-xl px-3 py-3 font-semibold ${active(path, href) ? "bg-brand-soft text-brand" : ""}`}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav aria-label="Menu nhanh" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {TABS.map(([href, icon, label]) => (
          <Link key={href} href={href} className={tab(active(path, href))}>
            {bar(active(path, href))}
            <Icon name={icon} className={`h-5 w-5 transition ${active(path, href) ? "-translate-y-0.5 scale-110" : ""}`} />{label}
          </Link>
        ))}
        <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className={tab(moreActive || more)}>
          {bar(moreActive || more)}<Icon name="compass" className="h-5 w-5" />Khám phá
        </button>
        <Link href="/dashboard" className={tab(active(path, "/dashboard"))}>
          {bar(active(path, "/dashboard"))}<Icon name="user" className="h-5 w-5" />Tôi
        </Link>
      </nav>
    </>
  );
}
