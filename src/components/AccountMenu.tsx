"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Menu tài khoản (avatar). `children` là form đăng xuất render từ server. `roleLabel` có giá trị = nhân viên: menu chỉ gồm việc quản trị. */
export function AccountMenu({ name, roleLabel, plan = null, children }: { name: string; roleLabel: string | null; plan?: { label: string; days: number | null; paid: boolean } | null; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const item = "block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft hover:text-brand-text";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Tài khoản" aria-expanded={open} className="flex h-10 items-center gap-2 rounded-full border border-white/40 pl-1 pr-3 text-sm font-semibold text-white transition hover:bg-white/10">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-surface text-sm font-bold text-navy">{(name.trim()[0] ?? "?").toUpperCase()}</span>
        <span className="hidden max-w-[7rem] truncate xl:block">{name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-slate-200 bg-surface p-2 text-ink shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted">{name}</p>
            {roleLabel && <p className="mt-0.5 text-xs font-semibold text-brand-text">{roleLabel}</p>}
            {plan && <Link href="/bang-gia" className="mt-1 block rounded-lg bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-text hover:underline">Gói: {plan.label}{plan.days !== null && ` · còn ${plan.days} ngày`}{!plan.paid && " · Nâng cấp"}</Link>}
          </div>
          {roleLabel ? (
            <Link href="/admin" className={item}>Trang quản trị</Link>
          ) : (
            <>
              <Link href="/dashboard" className={item}>Dashboard</Link>
              <Link href="/lo-trinh" className={item}>Lộ trình của tôi</Link>
              <Link href="/khoa-hoc-cua-toi" className={item}>Khóa học của tôi</Link>
              <Link href="/don-hang" className={item}>Đơn hàng</Link>
            </>
          )}
          <Link href={roleLabel ? "/admin/doi-mat-khau" : "/doi-mat-khau"} className={item}>Đổi mật khẩu</Link>
          <div className="mt-1 border-t border-slate-100 pt-1">{children}</div>
        </div>
      )}
    </div>
  );
}
