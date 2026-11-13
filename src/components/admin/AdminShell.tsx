"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/actions";
import { ThemeToggle } from "../ThemeToggle";

export type NavItem = { href: string; label: string; badge?: number };
export type NavGroup = { title: string; items: NavItem[] };

/** Khung riêng cho khu quản trị: thanh trên gọn + menu nhóm có huy hiệu số việc, trang hiện tại được tô sáng. */
export function AdminShell({ groups, name, roleLabel, children }: { groups: NavGroup[]; name: string; roleLabel: string; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));
  const total = groups.flatMap((g) => g.items).reduce((s, i) => s + (i.badge ?? 0), 0);

  const nav = (
    <nav aria-label="Menu quản trị" className="space-y-4 text-sm">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted">{g.title}</p>
          <ul className="space-y-0.5">{g.items.map((i) => (
            <li key={i.href}><Link href={i.href} aria-current={active(i.href) ? "page" : undefined} className={`flex min-h-[2.25rem] items-center justify-between gap-2 rounded-lg px-3 font-medium transition ${active(i.href) ? "bg-brand text-white shadow-sm" : "text-slate-700 hover:bg-brand-soft hover:text-brand-text"}`}>
              <span>{i.label}</span>
              {i.badge ? <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active(i.href) ? "bg-white/25 text-white" : "bg-amber-100 text-warning"}`} aria-label={`${i.badge} việc cần xử lý`}>{i.badge > 999 ? "999+" : i.badge}</span> : null}
            </Link></li>))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[92rem] items-center gap-3 px-3 py-2 sm:px-5">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-menu-mobile" className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold md:hidden">
            ☰ Menu{total > 0 && <span className="rounded-full bg-amber-100 px-1.5 text-xs font-bold text-warning">{total > 99 ? "99+" : total}</span>}
          </button>
          <Link href="/admin" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark.png" alt="" width={36} height={34} className="h-8 w-auto" />
            <span className="leading-tight"><b className="block text-[15px] font-extrabold text-navy">Quản trị</b><small className="hidden text-xs font-semibold uppercase tracking-wider text-muted sm:block">CSCA Việt Nam</small></span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link href="/" className="hidden min-h-[2.5rem] items-center rounded-lg px-3 font-semibold text-brand-text hover:bg-brand-soft sm:inline-flex">Xem trang học viên ↗</Link>
            <div className="hidden text-right leading-tight sm:block"><p className="max-w-[12rem] truncate font-semibold">{name}</p><p className="text-xs text-muted">{roleLabel}</p></div>
            <ThemeToggle />
            <form action={signOut}><button className="btn-outline !min-h-[2.5rem] !px-4">Đăng xuất</button></form>
          </div>
        </div>
        {open && <div id="admin-menu-mobile" className="max-h-[70vh] overflow-y-auto border-t border-slate-100 bg-surface p-3 md:hidden">{nav}<Link href="/" className="mt-3 inline-flex min-h-[2.5rem] items-center px-3 text-sm font-semibold text-brand-text">Xem trang học viên ↗</Link></div>}
      </header>
      <div className="mx-auto grid max-w-[92rem] grid-cols-[minmax(0,1fr)] gap-6 px-3 py-5 sm:px-5 md:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden md:block"><div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-surface p-3 shadow-sm">{nav}</div></aside>
        <main id="admin-main" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
