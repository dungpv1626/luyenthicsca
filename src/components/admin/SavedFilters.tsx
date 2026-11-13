"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Saved = { name: string; query: string };
const KEY = "admin.saved-filters:";

/** Bộ lọc lưu trên trình duyệt của người dùng (không đồng bộ giữa các máy). */
export function SavedFilters({ base, current }: { base: string; current: string }) {
  const [list, setList] = useState<Saved[]>([]);
  useEffect(() => {
    try { setList(JSON.parse(localStorage.getItem(KEY + base) || "[]")); } catch { /* bỏ qua */ }
  }, [base]);
  const persist = (next: Saved[]) => { setList(next); try { localStorage.setItem(KEY + base, JSON.stringify(next)); } catch { /* bỏ qua */ } };
  const save = () => {
    const name = window.prompt("Đặt tên cho bộ lọc này:")?.trim();
    if (name) persist([...list.filter((s) => s.name !== name), { name, query: current }].slice(-8));
  };
  return (
    <>
      {list.map((s) => (
        <span key={s.name} className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white font-semibold">
          <Link href={`${base}?${s.query}`} className="inline-flex min-h-[2.25rem] items-center px-3 text-slate-700 hover:text-brand">{s.name}</Link>
          <button type="button" aria-label={`Xóa bộ lọc ${s.name}`} onClick={() => persist(list.filter((x) => x.name !== s.name))} className="px-2 text-muted hover:text-danger">×</button>
        </span>
      ))}
      {current && <button type="button" onClick={save} className="inline-flex min-h-[2.25rem] items-center rounded-lg border border-dashed border-slate-300 px-3 font-semibold text-brand hover:bg-brand-soft">+ Lưu bộ lọc</button>}
    </>
  );
}
