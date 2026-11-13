import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, SUBJECTS, type Subject } from "@/lib/constants";
import { MODULES, moduleName } from "@/lib/syllabus";
import { reviewSubjectsOf, sampleNeeded } from "@/lib/reviewer";
import { Rich } from "@/components/Rich";
import { ReviewHotkeys } from "@/components/admin/ReviewHotkeys";
import { confirmBatchBySampleAction, disableBatchAction, reviewQuestionAction } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

const VERIFY = { pass: ["Giải độc lập: ĐẠT", "bg-success-bg text-success"], mismatch: ["Giải độc lập: LỆCH ĐÁP ÁN", "bg-danger-bg text-danger"], invalid: ["Lỗi cấu trúc", "bg-danger-bg text-danger"], unchecked: ["Chưa kiểm tra", "bg-slate-100 text-slate-600"] } as const;
type L = { body: string; options: Record<string, string>; explanation: string };
type SP = { view?: string; subject?: string; verify?: string; module?: string; difficulty?: string; origin?: string; q?: string; skip?: string; need_note?: string; not_mine?: string };

export const metadata = { title: "Duyệt câu hỏi – Quản trị" };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requireAdmin("questions");
  const sp = await searchParams;
  const { view = "offline", subject, verify, module: mod, difficulty, origin, skip, need_note, not_mine } = sp;
  const term = (sp.q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 60);
  const live = view === "live"; // live = đã công bố tự động, chờ giáo viên xác nhận
  const db = adminDb();
  const mine = me.role === "academic_reviewer" ? await reviewSubjectsOf(me.id) : [];
  const subjectOptions = Object.entries(SUBJECTS).filter(([k]) => !mine.length || mine.includes(k));

  const base = (head = false) => {
    let q = head ? db.from("questions").select("*", { count: "exact", head: true }) : db.from("questions").select("*");
    q = live ? q.eq("status", "approved").eq("auto_published", true) : q.eq("status", "review");
    if (mine.length) q = q.in("subject", mine);
    if (subject) q = q.eq("subject", subject);
    if (verify) q = q.eq("verify_status", verify);
    if (mod) q = mod === "none" ? q.is("module", null) : q.eq("module", mod);
    if (difficulty) q = q.eq("difficulty", difficulty);
    if (origin) q = q.eq("origin", origin);
    if (term) q = q.or(`body.ilike.%${term}%,topic.ilike.%${term}%,subtopic.ilike.%${term}%`);
    return q;
  };
  const scoped = (head: boolean, isLive: boolean) => {
    let q = head ? db.from("questions").select("*", { count: "exact", head: true }) : db.from("questions").select("*");
    q = isLive ? q.eq("status", "approved").eq("auto_published", true) : q.eq("status", "review");
    return mine.length ? q.in("subject", mine) : q;
  };
  const startOfDay = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) + "T00:00:00+07:00").toISOString();
  const [{ count: nLive }, { count: nOff }, { count: nFiltered }, { count: today }, { count: allMine }] = await Promise.all([
    scoped(true, true), scoped(true, false), base(true),
    db.from("questions").select("*", { count: "exact", head: true }).eq("reviewer", me.id).gte("reviewed_at", startOfDay),
    db.from("questions").select("*", { count: "exact", head: true }).eq("reviewer", me.id),
  ]);
  const { data: cand } = await base().order("created_at").limit(80);
  const ids = (cand ?? []).map((x) => x.id);
  const { data: reps } = ids.length ? await db.from("question_reports").select("question_id, reason, note").in("question_id", ids) : { data: [] as { question_id: string; reason: string; note: string | null }[] };
  const repCount = new Map<string, number>(); for (const r of reps ?? []) repCount.set(r.question_id, (repCount.get(r.question_id) ?? 0) + 1);
  // ưu tiên: nhiều báo lỗi → có cờ tự động → còn lại
  const order = ["mismatch", "invalid", "unchecked", "pass"];
  const q = (cand ?? []).filter((x) => x.id !== skip).sort((a, b) => (repCount.get(b.id) ?? 0) - (repCount.get(a.id) ?? 0) || order.indexOf(a.verify_status) - order.indexOf(b.verify_status))[0];
  const keep = Object.entries({ view, subject, verify, module: mod, difficulty, origin, q: term }).filter(([, v]) => v) as [string, string][];
  const qs = new URLSearchParams(keep).toString();
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  const notMyQ = !!q && mine.length > 0 && !mine.includes(q.subject);

  // lô công bố tự động: số còn lại, số mẫu bạn đã xem, điều kiện xác nhận theo mẫu
  const { data: liveBatches } = live ? await base().not("batch_id", "is", null).select("batch_id").limit(5000) : { data: [] as { batch_id: string }[] };
  const batchCount = new Map<string, number>(); for (const b of liveBatches ?? []) batchCount.set(b.batch_id, (batchCount.get(b.batch_id) ?? 0) + 1);
  const topBatches = [...batchCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const { data: bRows } = topBatches.length ? await db.from("questions").select("batch_id, status, reviewer, auto_published, confirmed_by_sample").in("batch_id", topBatches.map(([b]) => b)).limit(8000) : { data: [] as { batch_id: string; status: string; reviewer: string | null; auto_published: boolean; confirmed_by_sample: boolean }[] };
  const batchInfo = (b: string) => {
    const rows = (bRows ?? []).filter((r) => r.batch_id === b);
    return { total: rows.length, done: rows.filter((r) => r.reviewer === me.id && r.status === "approved" && !r.auto_published && !r.confirmed_by_sample).length, rejected: rows.filter((r) => r.reviewer === me.id && r.status === "rejected").length };
  };

  const langs: [string, string, L][] = q ? [["vi", "Tiếng Việt", { body: q.body, options: q.options, explanation: q.explanation }], ...(["en", "zh"] as const).filter((k) => q.translations?.[k]).map((k) => [k, k === "en" ? "English" : "中文", q.translations[k]] as [string, string, L])] : [];
  const verifyInfo = q ? VERIFY[q.verify_status as keyof typeof VERIFY] : null;
  const myReports = q ? (reps ?? []).filter((r) => r.question_id === q.id) : [];
  const skipHref = `/admin/review?${new URLSearchParams([...keep, ...(q ? [["skip", q.id]] : [])] as [string, string][])}`;
  const tab = (v: string, label: string, n: number | null) => <Link href={`/admin/review?view=${v}`} className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-sm font-semibold ${view === v || (v === "offline" && !live) ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand"}`}>{label} <span className="ml-1 opacity-80">({n ?? 0})</span></Link>;
  const modOptions = (Object.keys(MODULES) as Subject[]).filter((k) => !subject || subject === k).filter((k) => !mine.length || mine.includes(k));
  const cols = langs.length >= 3 ? "xl:grid-cols-3" : langs.length === 2 ? "xl:grid-cols-2" : "";

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Duyệt câu hỏi</h1>
          <p className="mt-1 text-sm text-slate-600">Hôm nay bạn đã xử lý <b>{today ?? 0}</b> câu · tổng cộng <b>{allMine ?? 0}</b> · còn <b>{nFiltered ?? 0}</b> câu trong bộ lọc hiện tại{mine.length > 0 && <> · bạn phụ trách: <b>{mine.map((s) => SUBJECTS[s as Subject]?.split(" (")[0]).join(", ")}</b></>}.</p></div>
      </div>
      <div className="flex flex-wrap gap-2">{tab("offline", "Chờ duyệt (chưa công bố)", nOff)}{tab("live", "Đã công bố, chờ giáo viên xác nhận", nLive)}</div>

      <form className="card flex flex-wrap gap-2 !p-3 text-sm">
        <input type="hidden" name="view" value={view} />
        <input name="q" defaultValue={term} placeholder="Tìm nội dung, chủ đề…" aria-label="Tìm câu hỏi" className="input min-w-0 flex-1 sm:w-56 sm:flex-none" />
        <select name="subject" aria-label="Lọc theo môn" defaultValue={subject ?? ""} className="input w-auto"><option value="">Mọi môn</option>{subjectOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="module" aria-label="Lọc theo mô-đun đề cương" defaultValue={mod ?? ""} className="input w-auto"><option value="">Mọi mô-đun</option>{modOptions.map((k) => <optgroup key={k} label={SUBJECTS[k].split(" (")[0]}>{MODULES[k].map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}</optgroup>)}<option value="none">Chưa phân loại</option></select>
        <select name="difficulty" aria-label="Lọc theo độ khó" defaultValue={difficulty ?? ""} className="input w-auto"><option value="">Mọi độ khó</option>{Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="origin" aria-label="Lọc theo nguồn" defaultValue={origin ?? ""} className="input w-auto"><option value="">Mọi nguồn</option><option value="ai">AI soạn</option><option value="template">Khuôn tham số</option><option value="manual">Soạn tay</option></select>
        <select name="verify" aria-label="Lọc theo kết quả kiểm tra AI" defaultValue={verify ?? ""} className="input w-auto"><option value="">Mọi kết quả kiểm tra</option><option value="mismatch">Lệch đáp án</option><option value="invalid">Lỗi cấu trúc</option><option value="pass">Đạt</option><option value="unchecked">Chưa kiểm tra</option></select>
        <button className="btn-outline">Lọc</button>
      </form>

      {live && <p className="rounded-xl bg-brand-soft p-3 text-sm text-slate-700">Các câu này <b>đang hiển thị cho học sinh</b>. <b>Duyệt</b> = xác nhận đúng. <b>Loại</b> = tắt ngay. Câu bị báo lỗi nhiều xếp lên đầu; đủ 3 lượt báo lỗi sẽ tự gỡ. Với lô lớn, xem đủ số câu mẫu rồi dùng “Xác nhận cả lô theo mẫu” ở cuối trang.</p>}
      {!canApprove && <p className="rounded-xl bg-warning-bg p-3 text-sm text-warning">Tài khoản của bạn có thể xem và loại câu, nhưng chỉ Academic Reviewer hoặc Super Admin mới được duyệt.</p>}
      {not_mine && <p className="rounded-xl bg-danger-bg p-3 text-sm text-danger">Câu này thuộc môn bạn không được gán duyệt.</p>}

      {!q ? <div className="card text-center text-slate-600">Hàng chờ trống{keep.length > 2 ? " với bộ lọc này" : ""}. 🎉</div> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-3">
            <div className="card flex flex-wrap items-center gap-2 text-sm">
              <span className="chip">{SUBJECTS[q.subject as Subject]}</span><span className="chip">{moduleName(q.subject, q.module)}</span><span className="chip">{q.topic}</span>{q.subtopic && <span className="chip">{q.subtopic}</span>}<span className="chip">{DIFFICULTY[q.difficulty as keyof typeof DIFFICULTY]}</span>
              {q.skill && <span className="text-muted">Kỹ năng: {q.skill}</span>}<span className="text-muted">~{q.est_time_sec}s</span>
              {verifyInfo && <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${verifyInfo[1]}`}>{verifyInfo[0]}</span>}
            </div>
            {myReports.length > 0 && <div className="rounded-xl border border-red-200 bg-danger-bg p-3 text-sm text-red-800"><b>{myReports.length} lượt báo lỗi từ học sinh:</b><ul className="mt-1 list-disc pl-5">{myReports.map((r, i) => <li key={i}>{({ wrong_answer: "Đáp án sai", unclear: "Đề không rõ", bad_translation: "Dịch sai", other: "Khác" } as Record<string, string>)[r.reason] ?? r.reason}{r.note ? ` – “${r.note}”` : ""}</li>)}</ul></div>}
            {q.verify_note && <p className="rounded-xl bg-warning-bg p-3 text-sm text-amber-900"><b>Ghi chú tự động:</b> {q.verify_note}</p>}
            <div className={`grid gap-3 ${cols}`}>
              {langs.map(([k, label, l]) => (
                <div key={k} className="card min-w-0">
                  <p className="eyebrow mb-2">{label}</p>
                  <div className="font-medium"><Rich text={l.body} /></div>
                  <ul className="mt-2 space-y-1 text-sm">{(["A", "B", "C", "D"] as const).map((o) => <li key={o} className={o === q.correct_answer ? "rounded-lg bg-success-bg px-2 py-1 font-bold text-emerald-800" : "px-2 py-1"}>{o}. <Rich text={l.options[o]} /></li>)}</ul>
                  <p className="mt-2 text-sm text-slate-600">💡 <Rich text={l.explanation} /></p>
                </div>
              ))}
            </div>
          </div>

          <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white p-3 shadow-[0_-4px_16px_rgba(15,23,42,.08)] lg:static lg:z-auto lg:h-fit lg:space-y-3 lg:rounded-2xl lg:border lg:p-4 lg:shadow-none lg:sticky lg:top-20">
            <p className="hidden text-sm text-slate-600 lg:block">Đáp án soạn: <b className="text-success">{q.correct_answer}</b>. Kiểm tra cả 3 ngôn ngữ có tương đương và đúng khoa học không.</p>
            {need_note && <p className="mb-2 rounded-lg bg-danger-bg p-2 text-sm text-danger">Cần nhập lý do khi loại câu.</p>}
            <form action={reviewQuestionAction.bind(null, q.id, `/admin/review${qs ? `?${qs}` : ""}`)} className="space-y-2">
              <textarea name="note" rows={2} placeholder="Ghi chú / lý do loại (bắt buộc khi loại)" aria-label="Ghi chú hoặc lý do loại" className="input" />
              <div className="grid grid-cols-2 gap-2">
                <button name="decision" value="approve" disabled={!canApprove || notMyQ} className="btn min-h-[2.75rem] disabled:opacity-40">{live ? "Xác nhận đúng" : "Duyệt"} <kbd className="ml-1 hidden rounded bg-white/25 px-1.5 text-xs lg:inline">A</kbd></button>
                <button name="decision" value="reject" disabled={notMyQ} className="btn-outline min-h-[2.75rem] !border-red-300 !text-danger">{live ? "Loại (tắt ngay)" : "Loại"} <kbd className="ml-1 hidden rounded bg-danger-bg px-1.5 text-xs lg:inline">R</kbd></button>
              </div>
            </form>
            <div className="mt-1 flex justify-between text-sm lg:mt-0"><Link href={`/admin/questions/${q.id}`} className="inline-flex min-h-[2.5rem] items-center font-semibold text-brand hover:underline">Sửa <kbd className="ml-1 hidden rounded bg-slate-100 px-1.5 text-xs lg:inline">E</kbd></Link><Link href={skipHref} className="inline-flex min-h-[2.5rem] items-center text-muted hover:underline">Bỏ qua <kbd className="ml-1 hidden rounded bg-slate-100 px-1.5 text-xs lg:inline">S</kbd></Link></div>
            <p className="hidden border-t border-slate-100 pt-2 text-xs text-muted lg:block">Phím tắt: A duyệt · R loại (gõ lý do trước, hoặc R để vào ô lý do) · S bỏ qua · E sửa. Lô {q.batch_id ?? "—"} · nguồn: {q.origin}</p>
          </aside>
          <ReviewHotkeys skipHref={skipHref} editHref={`/admin/questions/${q.id}`} canApprove={canApprove && !notMyQ} />
        </div>
      )}

      {live && topBatches.length > 0 && (
        <section className="card space-y-3">
          <div><h2 className="font-bold">Xử lý theo lô</h2><p className="text-sm text-muted">Xác nhận theo mẫu: bạn cần tự xem và xác nhận đủ số câu mẫu của lô (10%, tối thiểu 5, tối đa 20) và không loại câu nào; các câu còn lại được xác nhận hàng loạt và <b>đánh dấu “xác nhận theo mẫu”</b> để phân biệt với câu được xem từng câu. Nếu lô có vấn đề chung, hãy gỡ cả lô.</p></div>
          <div className="divide-y divide-slate-100">
            {topBatches.map(([b, n]) => { const i = batchInfo(b); const need = sampleNeeded(i.total); const ok = i.done >= need && i.rejected === 0; return (
              <div key={b} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <div className="min-w-0 flex-1"><p className="font-semibold">Lô …{b.slice(-9)} · còn {n} câu chờ xác nhận</p><p className="text-xs text-muted">Mẫu bạn đã xem: {i.done}/{need}{i.rejected > 0 ? ` · bạn đã loại ${i.rejected} câu → phải xem từng câu` : ""}</p></div>
                <form action={confirmBatchBySampleAction.bind(null, b)}><ConfirmButton disabled={!canApprove || !ok} className="btn-outline min-h-[2.5rem] disabled:opacity-40" title="Xác nhận cả lô theo mẫu?" message={`${n} câu còn lại của lô sẽ được đánh dấu “xác nhận theo mẫu” dựa trên ${i.done} câu bạn đã xem từng câu. Học viên vẫn thấy các câu này.`} confirmText="Xác nhận cả lô">Xác nhận theo mẫu</ConfirmButton></form>
                <form action={disableBatchAction.bind(null, b)}><ConfirmButton danger className="inline-flex min-h-[2.5rem] items-center rounded-full border border-red-200 px-4 text-xs font-semibold text-danger hover:bg-danger-bg" title="Gỡ cả lô câu hỏi?" message={`Toàn bộ ${n} câu của lô ${b} sẽ bị gỡ khỏi học viên và quay về hàng chờ duyệt. Các đề đã dựng từ những câu này sẽ thiếu câu.`} confirmText="Gỡ cả lô">Gỡ cả lô</ConfirmButton></form>
              </div>); })}
          </div>
        </section>
      )}
    </div>
  );
}
