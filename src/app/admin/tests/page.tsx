import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, vnd } from "@/lib/constants";
import { createTest, togglePublish } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Pagination } from "@/components/admin/Pagination";
import Link from "next/link";

export const metadata = { title: "Đề thi – Quản trị" };

const PER = 30;
const GROUPS: [string, string][] = [["", "Tất cả"], ["sim", "Đề mô phỏng"], ["m1", "Mức 1"], ["m2", "Mức 2"], ["m3", "Mức 3"], ["m4", "Mức 4"], ["other", "Đề khác"]];

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; g?: string; pub?: string; q?: string; page?: string }> }) {
  await requireAdmin("tests");
  const { error, g = "", pub = "", q: qs = "" } = await searchParams;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const term = qs.replace(/[,()%*\\]/g, " ").trim().slice(0, 60);
  let query = adminDb().from("tests").select("id, title, duration_min, price_vnd, is_published, level, sim, test_questions(count)", { count: "exact" }).order("sim", { ascending: false }).order("level", { ascending: true, nullsFirst: false }).order("title").range((page - 1) * PER, page * PER - 1);
  if (g === "sim") query = query.eq("sim", true); else if (/^m[1-4]$/.test(g)) query = query.eq("sim", false).eq("level", Number(g[1])); else if (g === "other") query = query.eq("sim", false).is("level", null);
  if (pub === "1") query = query.eq("is_published", true); else if (pub === "0") query = query.eq("is_published", false);
  if (term) query = query.ilike("title", `%${term}%`);
  const { data, count } = await query;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đề thi</h1>
      <form action={createTest} className="card max-w-xl space-y-3">
        <h2 className="font-bold">Tạo đề ngẫu nhiên</h2><p className="text-xs text-slate-500">Lấy ngẫu nhiên câu đang công bố theo số câu từng môn. Đề mới ở trạng thái ẩn cho tới khi bạn công bố. Muốn đề theo mức hoặc đề mô phỏng đúng khuôn thi thật, dùng mục “Bộ đề theo mức”.</p>
        {error && <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">Không đủ câu hỏi đã duyệt để tạo đề.</p>}
        <input name="title" aria-label="Tên đề" placeholder="Tên đề" required className="input" />
        <input name="description" aria-label="Mô tả" placeholder="Mô tả" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="a-duration-min">Thời gian (phút)</label><input id="a-duration-min" type="number" name="duration_min" defaultValue={60} className="input" /></div>
          <div><label className="label" htmlFor="a-price-vnd">Giá (VNĐ, 0 = miễn phí)</label><input id="a-price-vnd" type="number" name="price_vnd" defaultValue={49000} className="input" /></div>
          {Object.entries(SUBJECTS).map(([k, v]) => <div key={k}><label className="label" htmlFor={`a-n-${k}`}>Số câu – {v}</label><input id={`a-n-${k}`} type="number" name={`n_${k}`} defaultValue={10} className="input" /></div>)}
        </div>
        <button className="btn">Tạo đề (chưa publish)</button>
      </form>
      <form className="card flex flex-wrap items-center gap-2 text-sm">
        <input type="search" name="q" defaultValue={term} aria-label="Tìm theo tên đề" placeholder="Tìm theo tên đề…" className="input min-w-[12rem] flex-1" />
        <select name="g" aria-label="Nhóm đề" defaultValue={g} className="input min-w-0 flex-1 sm:w-auto sm:flex-none">{GROUPS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="pub" aria-label="Trạng thái công bố" defaultValue={pub} className="input min-w-0 flex-1 sm:w-auto sm:flex-none"><option value="">Mọi trạng thái</option><option value="1">Đang công bố</option><option value="0">Đang ẩn</option></select>
        <button className="btn">Lọc</button>{(g || pub || term) && <Link href="/admin/tests" className="inline-flex min-h-[2.5rem] items-center px-2 font-semibold text-brand hover:underline">Xóa lọc</Link>}
      </form>
      <div className="card divide-y p-0">
        {data?.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3 text-sm">
            <div className="flex-1"><p className="font-medium">{t.title}{(t as { sim?: boolean }).sim ? <span className="chip ml-2">Mô phỏng</span> : (t as { level?: number | null }).level ? <span className="chip ml-2">Mức {(t as { level?: number | null }).level}</span> : null}</p><p className="text-slate-500">{(t.test_questions as unknown as { count: number }[])[0]?.count ?? 0} câu · {t.duration_min} phút · {vnd(t.price_vnd)}</p></div>
            <form action={togglePublish.bind(null, t.id, !t.is_published)}><ConfirmButton className={`inline-flex min-h-[2.5rem] items-center rounded-lg px-3 font-semibold ${t.is_published ? "text-amber-700 hover:bg-amber-50" : "text-green-700 hover:bg-green-50"}`} title={t.is_published ? "Gỡ đề khỏi học viên?" : "Công bố đề cho học viên?"} message={t.is_published ? `“${t.title}” sẽ biến mất khỏi trang Thi thử. Các bài học viên đã làm vẫn được giữ.` : `“${t.title}” (${vnd(t.price_vnd)}) sẽ hiện cho mọi học viên. Hãy chắc chắn nội dung đã được kiểm tra.`} confirmText={t.is_published ? "Gỡ đề" : "Công bố"}>{t.is_published ? "Gỡ" : "Công bố"}</ConfirmButton></form>
          </div>
        ))}
        {!data?.length && <p className="p-4 text-slate-500">Không có đề nào khớp.</p>}
      </div>
      <Pagination base="/admin/tests" params={{ q: term || undefined, g: g || undefined, pub: pub || undefined }} page={page} total={count ?? 0} perPage={PER} />
    </div>
  );
}
