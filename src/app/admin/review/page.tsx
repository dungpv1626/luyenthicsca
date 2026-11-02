import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, SUBJECTS, type Subject } from "@/lib/constants";
import { Rich } from "@/components/Rich";
import { disableBatchAction, reviewQuestionAction } from "../actions";

const VERIFY = { pass: ["Giải độc lập: ĐẠT", "bg-emerald-50 text-emerald-700"], mismatch: ["Giải độc lập: LỆCH ĐÁP ÁN", "bg-red-50 text-red-700"], invalid: ["Lỗi cấu trúc", "bg-red-50 text-red-700"], unchecked: ["Chưa kiểm tra", "bg-slate-100 text-slate-600"] } as const;
type L = { body: string; options: Record<string, string>; explanation: string };

export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string; subject?: string; verify?: string; skip?: string; need_note?: string }> }) {
  const me = await requireAdmin("questions");
  const { view = "offline", subject, verify, skip, need_note } = await searchParams;
  const live = view === "live"; // live = đã công bố tự động, chờ giáo viên xác nhận
  const db = adminDb();
  const base = () => {
    let q = db.from("questions").select("*");
    q = live ? q.eq("status", "approved").eq("auto_published", true) : q.eq("status", "review");
    if (subject) q = q.eq("subject", subject);
    if (verify) q = q.eq("verify_status", verify);
    return q;
  };
  const [{ count: nLive }, { count: nOff }] = await Promise.all([
    db.from("questions").select("*", { count: "exact", head: true }).eq("status", "approved").eq("auto_published", true),
    db.from("questions").select("*", { count: "exact", head: true }).eq("status", "review"),
  ]);
  const { data: cand } = await base().order("created_at").limit(80);
  const ids = (cand ?? []).map((x) => x.id);
  const { data: reps } = ids.length ? await db.from("question_reports").select("question_id, reason, note").in("question_id", ids) : { data: [] as { question_id: string; reason: string; note: string | null }[] };
  const repCount = new Map<string, number>(); for (const r of reps ?? []) repCount.set(r.question_id, (repCount.get(r.question_id) ?? 0) + 1);
  // ưu tiên: nhiều báo lỗi → có cờ tự động → còn lại
  const order = ["mismatch", "invalid", "unchecked", "pass"];
  const q = (cand ?? []).filter((x) => x.id !== skip).sort((a, b) => (repCount.get(b.id) ?? 0) - (repCount.get(a.id) ?? 0) || order.indexOf(a.verify_status) - order.indexOf(b.verify_status))[0];
  const qs = new URLSearchParams(Object.entries({ view, subject, verify }).filter(([, v]) => v) as [string, string][]).toString();
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  const { data: liveBatches } = live ? await db.from("questions").select("batch_id").eq("status", "approved").eq("auto_published", true).not("batch_id", "is", null).limit(5000) : { data: [] as { batch_id: string }[] };
  const batchCount = new Map<string, number>(); for (const b of liveBatches ?? []) batchCount.set(b.batch_id, (batchCount.get(b.batch_id) ?? 0) + 1);

  const langs: [string, string, L][] = q ? [["vi", "Tiếng Việt", { body: q.body, options: q.options, explanation: q.explanation }], ...(["en", "zh"] as const).filter((k) => q.translations?.[k]).map((k) => [k, k === "en" ? "English" : "中文", q.translations[k]] as [string, string, L])] : [];
  const verifyInfo = q ? VERIFY[q.verify_status as keyof typeof VERIFY] : null;
  const myReports = q ? (reps ?? []).filter((r) => r.question_id === q.id) : [];
  const tab = (v: string, label: string, n: number | null) => <Link href={`/admin/review?view=${v}`} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === v || (v === "offline" && !live && view !== "live") ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand"}`}>{label} <span className="opacity-80">({n ?? 0})</span></Link>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Duyệt câu hỏi</h1>
        <form className="flex gap-2 text-sm">
          <input type="hidden" name="view" value={view} />
          <select name="subject" defaultValue={subject ?? ""} className="input w-auto"><option value="">Mọi môn</option>{Object.entries(SUBJECTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select name="verify" defaultValue={verify ?? ""} className="input w-auto"><option value="">Mọi kết quả kiểm tra</option><option value="mismatch">Lệch đáp án</option><option value="invalid">Lỗi cấu trúc</option><option value="pass">Đạt</option><option value="unchecked">Chưa kiểm tra</option></select>
          <button className="btn-outline">Lọc</button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2">{tab("offline", "Chờ duyệt (chưa công bố)", nOff)}{tab("live", "Đã công bố, chờ giáo viên xác nhận", nLive)}</div>
      {live && <p className="rounded-xl bg-brand-soft p-3 text-sm text-slate-700">Các câu này <b>đang hiển thị cho học sinh</b> (công bố tự động sau kiểm tra của AI). <b>Duyệt</b> = xác nhận đúng. <b>Loại</b> = tắt ngay khỏi học sinh. Câu có nhiều lượt báo lỗi được xếp lên đầu; đủ 3 lượt báo lỗi sẽ tự gỡ.</p>}
      {!canApprove && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Tài khoản của bạn có thể xem và loại câu, nhưng chỉ Academic Reviewer hoặc Super Admin mới được duyệt.</p>}

      {!q ? <div className="card text-center text-slate-600">Hàng chờ trống. 🎉</div> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <div className="card flex flex-wrap items-center gap-2 text-sm">
              <span className="chip">{SUBJECTS[q.subject as Subject]}</span><span className="chip">{q.topic}</span>{q.subtopic && <span className="chip">{q.subtopic}</span>}<span className="chip">{DIFFICULTY[q.difficulty as keyof typeof DIFFICULTY]}</span>
              {q.skill && <span className="text-slate-500">Kỹ năng: {q.skill}</span>}<span className="text-slate-500">~{q.est_time_sec}s</span>
              {verifyInfo && <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${verifyInfo[1]}`}>{verifyInfo[0]}</span>}
            </div>
            {myReports.length > 0 && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><b>{myReports.length} lượt báo lỗi từ học sinh:</b><ul className="mt-1 list-disc pl-5">{myReports.map((r, i) => <li key={i}>{({ wrong_answer: "Đáp án sai", unclear: "Đề không rõ", bad_translation: "Dịch sai", other: "Khác" } as Record<string, string>)[r.reason] ?? r.reason}{r.note ? ` – “${r.note}”` : ""}</li>)}</ul></div>}
            {q.verify_note && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><b>Ghi chú tự động:</b> {q.verify_note}</p>}
            {langs.map(([k, label, l]) => (
              <div key={k} className="card">
                <p className="eyebrow mb-2">{label}</p>
                <p className="font-medium"><Rich text={l.body} /></p>
                <ul className="mt-2 space-y-1 text-sm">{(["A", "B", "C", "D"] as const).map((o) => <li key={o} className={o === q.correct_answer ? "rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-800" : "px-2 py-1"}>{o}. <Rich text={l.options[o]} /></li>)}</ul>
                <p className="mt-2 text-sm text-slate-600">💡 <Rich text={l.explanation} /></p>
              </div>
            ))}
          </div>

          <aside className="card h-fit space-y-3 lg:sticky lg:top-24">
            <p className="text-sm text-slate-600">Đáp án soạn: <b className="text-emerald-700">{q.correct_answer}</b>. Kiểm tra cả 3 ngôn ngữ có tương đương và đúng khoa học không.</p>
            {need_note && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">Cần nhập lý do khi loại câu.</p>}
            <form action={reviewQuestionAction.bind(null, q.id, `/admin/review${qs ? `?${qs}` : ""}`)} className="space-y-3">
              <textarea name="note" rows={3} placeholder="Ghi chú / lý do loại (bắt buộc khi loại)" className="input" />
              <div className="grid grid-cols-2 gap-2">
                <button name="decision" value="approve" disabled={!canApprove} className="btn disabled:opacity-40">{live ? "Xác nhận đúng" : "Duyệt"}</button>
                <button name="decision" value="reject" className="btn-outline !border-red-300 !text-red-700">{live ? "Loại (tắt ngay)" : "Loại"}</button>
              </div>
            </form>
            <div className="flex justify-between text-sm"><Link href={`/admin/questions/${q.id}`} className="font-semibold text-brand hover:underline">Sửa câu hỏi</Link><Link href={`/admin/review?${new URLSearchParams({ ...(view ? { view } : {}), ...(subject ? { subject } : {}), ...(verify ? { verify } : {}), skip: q.id })}`} className="text-slate-500 hover:underline">Bỏ qua</Link></div>
            <p className="border-t border-slate-100 pt-2 text-xs text-slate-400">Lô {q.batch_id ?? "—"} · nguồn: {q.origin}</p>
          </aside>
        </div>
      )}

      {live && batchCount.size > 0 && (
        <section className="card"><h2 className="mb-1 font-bold">Gỡ cả lô</h2><p className="mb-3 text-sm text-slate-500">Nếu một lô sinh ra có vấn đề chung, gỡ toàn bộ lô khỏi học sinh (các câu quay về hàng chờ duyệt).</p>
          <div className="flex flex-wrap gap-2">{[...batchCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([b, n]) => <form key={b} action={disableBatchAction.bind(null, b)}><button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50" title={b}>Gỡ lô {b.slice(-9)} ({n} câu)</button></form>)}</div></section>
      )}
    </div>
  );
}
