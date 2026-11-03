import Link from "next/link";

/** Phân trang cho danh sách quản trị (giữ nguyên các tham số lọc khác trong địa chỉ). */
export function Pagination({ base, params, page, total, perPage }: { base: string; params: Record<string, string | undefined>; page: number; total: number; perPage: number }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const href = (p: number) => { const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]); if (p > 1) q.set("page", String(p)); const s = q.toString(); return `${base}${s ? `?${s}` : ""}`; };
  const from = total ? (page - 1) * perPage + 1 : 0, to = Math.min(total, page * perPage);
  const window = [...new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const cls = "inline-flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-semibold";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <p>Hiển thị <b>{from.toLocaleString("vi-VN")}–{to.toLocaleString("vi-VN")}</b> / {total.toLocaleString("vi-VN")}</p>
      {pages > 1 && (
        <nav aria-label="Phân trang" className="flex flex-wrap items-center gap-1">
          {page > 1 && <Link href={href(page - 1)} className={`${cls} border-slate-200 hover:border-brand hover:text-brand`}>← Trước</Link>}
          {window.map((p, i) => (
            <span key={p} className="flex items-center gap-1">{i > 0 && p - window[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
              <Link href={href(p)} aria-current={p === page ? "page" : undefined} className={`${cls} ${p === page ? "border-brand bg-brand text-white" : "border-slate-200 hover:border-brand hover:text-brand"}`}>{p}</Link></span>))}
          {page < pages && <Link href={href(page + 1)} className={`${cls} border-slate-200 hover:border-brand hover:text-brand`}>Sau →</Link>}
        </nav>
      )}
    </div>
  );
}
