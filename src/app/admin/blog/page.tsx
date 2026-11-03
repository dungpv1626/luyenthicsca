import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { CARD_COLS, fmtDate, isLive, reviewFlags, type PostCard } from "@/lib/blog";
import { scheduleAllAction, setPostStatusAction } from "../blog-actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; scheduled?: string; skipped?: string }> }) {
  await requireAdmin("content");
  const sp = await searchParams;
  const db = adminDb();
  const [{ data }, { data: bodies }] = await Promise.all([db.from("posts").select(CARD_COLS).order("planned_no"), db.from("posts").select("id, body_md")]);
  const posts = (data ?? []) as PostCard[];
  const flags = new Map((bodies ?? []).map((b) => [b.id, reviewFlags(b.body_md)]));
  const n = (s: string) => posts.filter((p) => (s === "live" ? isLive(p) : p.status === s)).length;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Blog SEO</h1><p className="text-sm text-slate-500">{posts.length} bài · {n("draft")} nháp · {n("scheduled")} đã lên lịch · {n("live")} đang hiển thị công khai</p></div>
        <form action={scheduleAllAction}><button className="btn" title="Lên lịch mọi bài nháp không còn chỗ cần xử lý, theo ngày dự kiến">Lên lịch tất cả bài hợp lệ</button></form>
      </div>
      {sp.ok && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Đã cập nhật.</p>}
      {sp.scheduled && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Đã lên lịch {sp.scheduled} bài{Number(sp.skipped) ? `; bỏ qua ${sp.skipped} bài còn chỗ cần xử lý` : ""}. Bài tự hiển thị khi tới ngày dự kiến (9:00 giờ Việt Nam).</p>}
      {sp.error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{sp.error}</p>}
      <p className="rounded-xl bg-mist p-3 text-xs text-slate-600">Bài chỉ được công bố hoặc lên lịch khi không còn chỗ giữ chỗ “[CẦN XÁC MINH]”, “[CHÈN…]” và các câu cần kiểm tra (vd “đội ngũ giáo viên”, dòng nguồn nội bộ). Sửa nội dung trong trang chỉnh sửa rồi thử lại.</p>
      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="bg-mist text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3">#</th><th>Bài</th><th>Chủ đề</th><th>Ngày dự kiến</th><th>Trạng thái</th><th>Cần xử lý</th><th className="pr-3 text-right">Thao tác</th></tr></thead>
          <tbody>{posts.map((p) => { const f = flags.get(p.id) ?? []; const live = isLive(p); return (
            <tr key={p.id} className="border-t border-slate-100 align-top">
              <td className="p-3 text-slate-500">{p.planned_no ?? "·"}</td>
              <td className="max-w-xs py-3"><Link href={`/admin/blog/${p.id}`} className="font-semibold hover:text-brand">{p.title}</Link><p className="text-xs text-slate-500">/blog/{p.slug}{p.replaces_path ? ` · thay trang ${p.replaces_path}` : ""}</p></td>
              <td className="py-3 text-slate-600">{p.category}</td>
              <td className="py-3 text-slate-600">{fmtDate(p.planned_for)}</td>
              <td className="py-3"><span className={`chip ${live ? "!bg-emerald-50 !text-emerald-700" : p.status === "scheduled" ? "!bg-sky-50 !text-sky-700" : "!bg-slate-100 !text-slate-600"}`}>{live ? "Đang hiển thị" : p.status === "scheduled" ? `Lịch ${fmtDate(p.publish_at)}` : "Nháp"}</span></td>
              <td className="max-w-xs py-3">{f.length ? <ul className="list-disc pl-4 text-xs text-amber-800">{f.map((x) => <li key={x}>{x}</li>)}</ul> : <span className="text-xs text-emerald-700">Không</span>}</td>
              <td className="py-3 pr-3 text-right"><div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                <Link href={`/blog/${p.slug}`} target="_blank" className="inline-block py-1.5 text-brand hover:underline">Xem trước</Link>
                <Link href={`/admin/blog/${p.id}`} className="inline-block py-1.5 text-brand hover:underline">Sửa</Link>
                {p.status === "draft" ? <><form action={setPostStatusAction.bind(null, p.id, "scheduled")}><button className="py-1.5 font-semibold text-brand hover:underline">Lên lịch</button></form><form action={setPostStatusAction.bind(null, p.id, "published")}><button className="py-1.5 font-semibold text-brand hover:underline">Công bố ngay</button></form></> : <form action={setPostStatusAction.bind(null, p.id, "draft")}><button className="py-1.5 text-amber-700 hover:underline">Gỡ về nháp</button></form>}
              </div></td>
            </tr>); })}</tbody>
        </table>
        {!posts.length && <p className="p-5 text-sm text-slate-500">Chưa có bài nào. Chạy <code>node --env-file=.env.local scripts/import-seo-posts.mjs</code> để nhập.</p>}
      </div>
    </div>
  );
}
