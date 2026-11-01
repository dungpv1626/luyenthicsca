"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Menu tài khoản (avatar). `children` là form đăng xuất render từ server. */
export function AccountMenu({ name, isStaff, children }: { name: string; isStaff: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const item = "block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft hover:text-brand";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Tài khoản" aria-expanded={open} className="flex h-10 items-center gap-2 rounded-full border border-stone-200 pl-1 pr-3 text-sm font-semibold hover:border-brand">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">{(name.trim()[0] ?? "?").toUpperCase()}</span>
        <span className="hidden max-w-[7rem] truncate xl:block">{name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
          <p className="truncate px-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone-400">{name}</p>
          <Link href="/dashboard" className={item}>Dashboard</Link>
          <Link href="/lo-trinh" className={item}>Lộ trình của tôi</Link>
          <Link href="/khoa-hoc-cua-toi" className={item}>Khóa học của tôi</Link>
          <Link href="/don-hang" className={item}>Đơn hàng</Link>
          {isStaff && <Link href="/admin" className={item}>Trang quản trị</Link>}
          <div className="mt-1 border-t border-stone-100 pt-1">{children}</div>
        </div>
      )}
    </div>
  );
}
