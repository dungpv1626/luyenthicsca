import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, STATUS_LABEL, SUBJECTS, type Subject } from "@/lib/constants";
import { MODULES, moduleName } from "@/lib/syllabus";
import { Rich } from "@/components/Rich";
import { Pagination } from "@/components/admin/Pagination";
import { setQuestionStatus, bulkSetQuestionStatus } from "../actions";
import { BulkBar } from "@/components/admin/BulkBar";
import { SavedFilters } from "@/components/admin/SavedFilters";

export const metadata = { title: "Ngân hàng câu hỏi – Quản trị" };
const PER = 30;
const ORIGIN: Record<string, string> = { ai_generated: "AI soạn", template: "Khuôn", teacher: "Giáo viên", open_source: "Nguồn mở" };

type SP = { q?: string; subject?: string; status?: string; module?: string; difficulty?: string; origin?: string; confirm?: string; page?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requireAdmin("questions");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const term = (sp.q ?? "").replace(/[,()%*\\]/g, " ").trim().slice(0, 80);
  let q = adminDb().from("questions").select("id, subject, topic, subtopic, difficulty, body, status, auto_published, origin, module", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  if (term) q = q.or(`body.ilike.%${term}%,topic.ilike.%${term}%,subtopic.ilike.%${term}%`);
  if (sp.subject) q = q.eq("subject", sp.subject);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.confirm === "1") q = q.eq("status", "approved").eq("auto_published", true);
  if (sp.difficulty) q = q.eq("difficulty", sp.difficulty);
  if (sp.origin) q = q.eq("origin", sp.origin);
  if (sp.module === "none") q = q.is("module", null); else if (sp.module) q = q.eq("module", sp.module);
  const { data, count } = await q;
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  const params = { q: term || undefined, subject: sp.subject, status: sp.status, module: sp.module, difficulty: sp.difficulty, origin: sp.origin, confirm: sp.confirm };
  const filtered = Object.values(params).some(Boolean);
  const sel = "input min-w-0 flex-1 sm:w-auto sm:flex-none";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Ngân hàng câu hỏi <span className="text-base font-semibold text-muted">({(count ?? 0).toLocaleString("vi-VN")}{filtered ? " khớp bộ lọc" : ""})</span></h1><Link href="/admin/questions/new" className="btn">+ Câu hỏi mới</Link></div>
      <nav aria-label="Bộ lọc nhanh" className="flex flex-wrap gap-2 text-sm">
        {([["Tất cả", "/admin/questions", !filtered], ["Chờ duyệt", "/admin/questions?status=review", sp.status === "review"], ["Nháp", "/admin/questions?status=draft", sp.status === "draft"], ["Đã duyệt", "/admin/questions?status=approved", sp.status === "approved"], ["Chưa phân loại", "/admin/questions?module=none", sp.module === "none"]] as const).map(([label, href, on]) => (
          <Link key={label} href={href} aria-current={on ? "true" : undefined} className={`inline-flex min-h-[2.25rem] items-center rounded-lg border px-3 font-semibold ${on ? "border-brand bg-brand text-white" : "border-slate-200 bg-surface text-slate-700 hover:border-brand hover:text-brand-text"}`}>{label}</Link>
        ))}
        <SavedFilters base="/admin/questions" current={Object.entries(params).filter(([k, v]) => v && k !== "confirm").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")} />
      </nav>
      <form className="card flex flex-wrap items-center gap-2 text-sm">
        <input name="q" defaultValue={term} aria-label="Tìm trong nội dung, chủ đề" placeholder="Tìm trong nội dung, chủ đề…" className="input min-w-[12rem] flex-1" type="search" />
        <select name="subject" aria-label="Lọc theo môn" defaultValue={sp.subject ?? ""} className={sel}><option value="">Mọi môn</option>{Object.entries(SUBJECTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="module" aria-label="Lọc theo mô-đun đề cương" defaultValue={sp.module ?? ""} className={sel}><option value="">Mọi mô-đun</option>
          {Object.entries(MODULES).map(([s, mods]) => <optgroup key={s} label={SUBJECTS[s as Subject]}>{mods.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}</optgroup>)}
          <option value="out">Ngoài phần liệt kê của đề cương</option><option value="none">Chưa phân loại</option></select>
        <select name="difficulty" aria-label="Lọc theo độ khó" defaultValue={sp.difficulty ?? ""} className={sel}><option value="">Mọi độ khó</option>{Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="status" aria-label="Lọc theo trạng thái" defaultValue={sp.status ?? ""} className={sel}><option value="">Mọi trạng thái</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="origin" aria-label="Lọc theo nguồn" defaultValue={sp.origin ?? ""} className={sel}><option value="">Mọi nguồn</option>{Object.entries(ORIGIN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <label className="flex min-h-[2.5rem] items-center gap-2 px-1"><input type="checkbox" name="confirm" value="1" defaultChecked={sp.confirm === "1"} />Chỉ câu chờ giáo viên xác nhận</label>
        <button className="btn">Lọc</button>{filtered && <Link href="/admin/questions" className="inline-flex min-h-[2.5rem] items-center px-2 font-semibold text-brand-text hover:underline">Xóa lọc</Link>}
      </form>
      <div className="card divide-y divide-slate-100 !p-0">
        {data?.map((x) => (
          <div key={x.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3 text-sm">
            <input type="checkbox" name="ids" value={x.id} form="bulk" aria-label="Chọn câu hỏi" className="shrink-0" />
            <div className="min-w-0 flex-1 basis-64">
              <div className="line-clamp-2 font-medium"><Rich text={x.body} /></div>
              <p className="mt-0.5 text-xs text-muted">{SUBJECTS[x.subject as Subject]} · {x.topic}{x.subtopic ? ` › ${x.subtopic}` : ""} · {DIFFICULTY[x.difficulty as keyof typeof DIFFICULTY]} · {moduleName(x.subject, x.module)} · {ORIGIN[x.origin] ?? x.origin}</p>
            </div>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${x.status === "approved" ? (x.auto_published ? "bg-warning-bg text-warning" : "bg-success-bg text-success") : "bg-slate-100 text-slate-600"}`}>{x.status === "approved" && x.auto_published ? "Đã công bố, chờ xác nhận" : STATUS_LABEL[x.status as keyof typeof STATUS_LABEL]}</span>
            {canApprove && x.status !== "approved" && <form action={setQuestionStatus.bind(null, x.id, "approved")}><button className="inline-flex min-h-[2.5rem] items-center rounded-lg px-3 text-green-700 hover:bg-green-50">Duyệt</button></form>}
            {x.status === "draft" && <form action={setQuestionStatus.bind(null, x.id, "review")}><button className="inline-flex min-h-[2.5rem] items-center rounded-lg px-3 text-amber-700 hover:bg-warning-bg">Gửi duyệt</button></form>}
            <Link href={`/admin/questions/${x.id}`} className="inline-flex min-h-[2.5rem] items-center rounded-lg px-3 font-semibold text-brand-text hover:bg-brand-soft">Sửa</Link>
          </div>
        ))}
        {!data?.length && <p className="p-5 text-muted">{filtered ? "Không có câu hỏi nào khớp bộ lọc." : "Chưa có câu hỏi."}</p>}
      </div>
      <form id="bulk" action={bulkSetQuestionStatus}><BulkBar formId="bulk" canApprove={canApprove} /></form>
      <Pagination base="/admin/questions" params={params} page={page} total={count ?? 0} perPage={PER} />
    </div>
  );
}
