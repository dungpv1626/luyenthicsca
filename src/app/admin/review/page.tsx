import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, SUBJECTS, type Subject } from "@/lib/constants";
import { MODULES, moduleName } from "@/lib/syllabus";
import { loadLots, openReports, reviewSubjectsOf, type Lot } from "@/lib/reviewer";
import { parseLotKey } from "@/lib/batch-sample";
import { Rich } from "@/components/Rich";
import { ReviewHotkeys } from "@/components/admin/ReviewHotkeys";
import { confirmLotAction, returnLotAction, reviewQuestionAction } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

const VERIFY = { pass: ["Giải độc lập: ĐẠT", "bg-success-bg text-success"], mismatch: ["Giải độc lập: LỆCH ĐÁP ÁN", "bg-danger-bg text-danger"], invalid: ["Lỗi cấu trúc", "bg-danger-bg text-danger"], unchecked: ["Chưa kiểm tra", "bg-slate-100 text-slate-600"] } as const;
const REASON: Record<string, string> = { wrong_answer: "Đáp án sai", unclear: "Đề không rõ", bad_translation: "Dịch sai", other: "Khác" };
const LOT_STATUS: Record<Lot["status"], [string, string]> = {
  passed: ["Đã xem đủ mẫu, không lỗi", "bg-success-bg text-success"],
  failed: ["Có câu mẫu bị loại", "bg-danger-bg text-danger"],
  doing: ["Đang kiểm tra", "bg-brand-soft text-brand-text"],
  todo: ["Chưa kiểm tra", "bg-slate-100 text-slate-600"],
  done: ["Xong", "bg-success-bg text-success"],
};
const LOT_ORDER: Lot["status"][] = ["passed", "failed", "doing", "todo", "done"];
type L = { body: string; options: Record<string, string>; explanation: string };
type SP = { view?: string; lot?: string; subject?: string; verify?: string; module?: string; difficulty?: string; origin?: string; q?: string; skip?: string; need_note?: string; not_mine?: string; ok?: string };
type View = "offline" | "lots" | "reports" | "live";

export const metadata = { title: "Duyệt câu hỏi – Quản trị" };

const subjectName = (s: string) => SUBJECTS[s as Subject]?.split(" (")[0] ?? s;
const lotName = (l: { batch: string; subject: string }) => `Lô …${l.batch.slice(-6)} · ${subjectName(l.subject)}`;

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requireAdmin("questions");
  const sp = await searchParams;
  const view: View = (["lots", "reports", "live"] as const).find((v) => v === sp.view) ?? "offline";
  const { subject, verify, module: mod, difficulty, origin, skip, need_note, not_mine, ok } = sp;
  const term = (sp.q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 60);
  const db = adminDb();
  const mine = me.role === "academic_reviewer" ? await reviewSubjectsOf(me.id) : [];
  const scope = mine.length ? mine : null;
  const subjectOptions = Object.entries(SUBJECTS).filter(([k]) => !mine.length || mine.includes(k));
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";

  const base = (head = false) => {
    let q = head ? db.from("questions").select("*", { count: "exact", head: true }) : db.from("questions").select("*");
    q = view === "live" ? q.eq("status", "approved").eq("auto_published", true) : q.eq("status", "review");
    if (mine.length) q = q.in("subject", mine);
    if (subject) q = q.eq("subject", subject);
    if (verify) q = q.eq("verify_status", verify);
    if (mod) q = mod === "none" ? q.is("module", null) : q.eq("module", mod);
    if (difficulty) q = q.eq("difficulty", difficulty);
    if (origin) q = q.eq("origin", origin);
    if (term) q = q.or(`body.ilike.%${term}%,topic.ilike.%${term}%,subtopic.ilike.%${term}%`);
    return q;
  };
  const scoped = (isLive: boolean) => {
    const q = db.from("questions").select("*", { count: "exact", head: true });
    const r = isLive ? q.eq("status", "approved").eq("auto_published", true) : q.eq("status", "review");
    return mine.length ? r.in("subject", mine) : r;
  };
  const startOfDay = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) + "T00:00:00+07:00").toISOString();
  const [{ count: nLive }, { count: nOff }, { count: today }, { count: allMine }, reports, lots] = await Promise.all([
    scoped(true), scoped(false),
    db.from("questions").select("*", { count: "exact", head: true }).eq("reviewer", me.id).gte("reviewed_at", startOfDay),
    db.from("questions").select("*", { count: "exact", head: true }).eq("reviewer", me.id),
    openReports(scope),
    loadLots(scope),
  ]);
  const openLots = lots.filter((l) => l.status !== "done");

  // Câu đang xem: theo từng tab
  const lotSel = view === "lots" ? parseLotKey(sp.lot) : null;
  const lot = lotSel ? lots.find((l) => l.batch === lotSel.batch && l.subject === lotSel.subject) ?? null : null;
  let cand: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (view === "offline" || view === "live") cand = (await base().order("created_at").limit(80)).data ?? [];
  else if (view === "reports" && reports.size) cand = (await db.from("questions").select("*").in("id", [...reports.keys()].slice(0, 200))).data ?? [];
  else if (lot?.next && lot.status !== "failed") cand = (await db.from("questions").select("*").eq("id", lot.next)).data ?? [];
  const ids = cand.map((x) => x.id);
  const { data: reps } = ids.length ? await db.from("question_reports").select("question_id, reason, note").in("question_id", ids) : { data: [] as { question_id: string; reason: string; note: string | null }[] };
  const repCount = new Map<string, number>(); for (const r of reps ?? []) repCount.set(r.question_id, (repCount.get(r.question_id) ?? 0) + 1);
  // ưu tiên: nhiều báo lỗi → có cờ tự động → còn lại
  const order = ["mismatch", "invalid", "unchecked", "pass"];
  const q = cand.filter((x) => x.id !== skip).sort((a, b) => (repCount.get(b.id) ?? 0) - (repCount.get(a.id) ?? 0) || order.indexOf(a.verify_status) - order.indexOf(b.verify_status))[0];

  const keep = Object.entries({ view: view === "offline" ? undefined : view, lot: lot ? sp.lot : undefined, subject, verify, module: mod, difficulty, origin, q: term }).filter(([, v]) => v) as [string, string][];
  const qs = new URLSearchParams(keep).toString();
  const here = `/admin/review${qs ? `?${qs}` : ""}`;
  const editHref = q ? `/admin/questions/${q.id}?back=${encodeURIComponent(here)}` : "";
  const notMyQ = !!q && mine.length > 0 && !mine.includes(q.subject);
  const lotsHref = "/admin/review?view=lots";
  const skipHref = lot ? lotsHref : `/admin/review?${new URLSearchParams([...keep, ...(q ? [["skip", q.id]] : [])] as [string, string][])}`;

  const langs: [string, string, L][] = q ? [["vi", "Tiếng Việt", { body: q.body, options: q.options, explanation: q.explanation }], ...(["en", "zh"] as const).filter((k) => q.translations?.[k]).map((k) => [k, k === "en" ? "English" : "中文", q.translations[k]] as [string, string, L])] : [];
  const verifyInfo = q ? VERIFY[q.verify_status as keyof typeof VERIFY] : null;
  const myReports = q ? (reps ?? []).filter((r) => r.question_id === q.id) : [];
  const modOptions = (Object.keys(MODULES) as Subject[]).filter((k) => !subject || subject === k).filter((k) => !mine.length || mine.includes(k));
  const cols = langs.length >= 3 ? "xl:grid-cols-3" : langs.length === 2 ? "xl:grid-cols-2" : "";
  const live = view === "live" || view === "reports" || !!lot;
  const tab = (v: View, label: string, n: number) => (
    <Link href={v === "offline" ? "/admin/review" : `/admin/review?view=${v}`} aria-current={view === v ? "page" : undefined} className={`inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full px-4 text-sm font-semibold ${view === v ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand-text"}`}>
      {label}<span className={`rounded-full px-1.5 text-xs font-bold ${view === v ? "bg-white/25" : n > 0 ? "bg-amber-100 text-warning" : "bg-slate-100 text-slate-500"}`}>{n.toLocaleString("vi-VN")}</span>
    </Link>
  );

  const decision = q && (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-3">
        <div className="card flex flex-wrap items-center gap-2 text-sm">
          <span className="chip">{SUBJECTS[q.subject as Subject]}</span><span className="chip">{moduleName(q.subject, q.module)}</span><span className="chip">{q.topic}</span>{q.subtopic && <span className="chip">{q.subtopic}</span>}<span className="chip">{DIFFICULTY[q.difficulty as keyof typeof DIFFICULTY]}</span>
          {q.skill && <span className="text-muted">Kỹ năng: {q.skill}</span>}<span className="text-muted">~{q.est_time_sec}s</span>
          {verifyInfo && <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${verifyInfo[1]}`}>{verifyInfo[0]}</span>}
        </div>
        {myReports.length > 0 && <div className="rounded-xl border border-red-200 bg-danger-bg p-3 text-sm text-red-800"><b>{myReports.length} lượt báo lỗi từ học viên:</b><ul className="mt-1 list-disc pl-5">{myReports.map((r, i) => <li key={i}>{REASON[r.reason] ?? r.reason}{r.note ? ` – “${r.note}”` : ""}</li>)}</ul></div>}
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

      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-surface p-3 shadow-[0_-4px_16px_rgba(15,23,42,.08)] lg:static lg:z-auto lg:h-fit lg:space-y-3 lg:rounded-2xl lg:border lg:p-4 lg:shadow-none lg:sticky lg:top-20">
        <p className="hidden text-sm text-slate-600 lg:block">Đáp án soạn: <b className="text-success">{q.correct_answer}</b>. Kiểm tra cả 3 ngôn ngữ có tương đương và đúng khoa học không.</p>
        {need_note && <p className="mb-2 rounded-lg bg-danger-bg p-2 text-sm text-danger">Cần nhập lý do khi loại câu.</p>}
        <form action={reviewQuestionAction.bind(null, q.id, here)} className="space-y-2">
          <textarea name="note" rows={2} placeholder="Ghi chú / lý do loại (bắt buộc khi loại)" aria-label="Ghi chú hoặc lý do loại" className="input" />
          <div className="grid grid-cols-2 gap-2">
            <button name="decision" value="approve" disabled={!canApprove || notMyQ} className="btn min-h-[2.75rem] disabled:opacity-40">{live ? "Xác nhận đúng" : "Duyệt"} <kbd className="ml-1 hidden rounded bg-white/25 px-1.5 text-xs lg:inline">A</kbd></button>
            <button name="decision" value="reject" disabled={notMyQ} className="btn-outline min-h-[2.75rem] !border-red-300 !text-danger">{live ? "Loại (tắt ngay)" : "Loại"} <kbd className="ml-1 hidden rounded bg-danger-bg px-1.5 text-xs lg:inline">R</kbd></button>
          </div>
        </form>
        <div className="mt-1 flex justify-between text-sm lg:mt-0"><Link href={editHref} className="inline-flex min-h-[2.5rem] items-center font-semibold text-brand-text hover:underline">Sửa <kbd className="ml-1 hidden rounded bg-slate-100 px-1.5 text-xs lg:inline">E</kbd></Link><Link href={skipHref} className="inline-flex min-h-[2.5rem] items-center text-muted hover:underline">{lot ? "Tạm dừng" : "Bỏ qua"} <kbd className="ml-1 hidden rounded bg-slate-100 px-1.5 text-xs lg:inline">S</kbd></Link></div>
        <p className="hidden border-t border-slate-100 pt-2 text-xs text-muted lg:block">Phím tắt: A duyệt · R loại (gõ lý do trước, hoặc R để vào ô lý do) · S {lot ? "tạm dừng" : "bỏ qua"} · E sửa. Lô {q.batch_id ?? "—"} · nguồn: {q.origin}</p>
      </aside>
      <ReviewHotkeys skipHref={skipHref} editHref={editHref} canApprove={canApprove && !notMyQ} />
    </div>
  );

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Duyệt câu hỏi</h1>
        <p className="mt-1 text-sm text-slate-600">Hôm nay bạn đã xử lý <b>{today ?? 0}</b> câu · tổng cộng <b>{allMine ?? 0}</b>{mine.length > 0 && <> · bạn phụ trách: <b>{mine.map(subjectName).join(", ")}</b></>}.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {tab("offline", "Chờ duyệt", nOff ?? 0)}
        {tab("lots", "Kiểm tra mẫu lô", openLots.length)}
        {tab("reports", "Báo lỗi từ học viên", reports.size)}
        <Link href="/admin/review?view=live" className={`ml-auto text-sm hover:underline ${view === "live" ? "font-semibold text-brand-text" : "text-muted"}`}>Tất cả câu đang hiển thị ({(nLive ?? 0).toLocaleString("vi-VN")})</Link>
      </div>

      {ok && <p className="rounded-xl bg-success-bg p-3 text-sm text-emerald-800">{ok === "passed" ? "Đã ghi nhận: lô đạt kiểm tra mẫu." : ok === "returned" ? "Đã đưa các câu còn lại của lô về hàng Chờ duyệt. Học viên không thấy các câu này cho đến khi được duyệt." : "Đã ghi nhận."}</p>}
      {!canApprove && <p className="rounded-xl bg-warning-bg p-3 text-sm text-warning">Tài khoản của bạn có thể xem và loại câu, nhưng chỉ giáo viên duyệt chuyên môn hoặc quản trị cấp cao mới được duyệt.</p>}
      {not_mine && <p className="rounded-xl bg-danger-bg p-3 text-sm text-danger">Câu này thuộc môn bạn không được gán duyệt.</p>}

      {(view === "offline" || view === "live") && (
        <>
          <p className="rounded-xl bg-brand-soft p-3 text-sm text-slate-700">{view === "offline"
            ? <>Câu <b>chưa hiển thị cho học viên</b>: câu AI soạn chưa qua kiểm tra tự động, câu bị học viên báo lỗi nhiều, và các lô không đạt kiểm tra mẫu. <b>Duyệt</b> = công bố. <b>Loại</b> = bỏ hẳn (ghi lý do).</>
            : <>Toàn bộ câu <b>đang hiển thị</b> nhưng chưa có giáo viên xem. Không cần làm hết danh sách này: câu AI soạn được kiểm tra qua tab <b>Kiểm tra mẫu lô</b>, biến thể khuôn được duyệt ở <b>Khuôn câu hỏi</b>.</>}</p>
          <form className="card flex flex-wrap gap-2 !p-3 text-sm">
            {view === "live" && <input type="hidden" name="view" value="live" />}
            <input name="q" defaultValue={term} placeholder="Tìm nội dung, chủ đề…" aria-label="Tìm câu hỏi" className="input min-w-0 flex-1 sm:w-56 sm:flex-none" />
            <select name="subject" aria-label="Lọc theo môn" defaultValue={subject ?? ""} className="input w-auto"><option value="">{mine.length ? "Môn của tôi" : "Mọi môn"}</option>{subjectOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select name="module" aria-label="Lọc theo mô-đun đề cương" defaultValue={mod ?? ""} className="input w-auto"><option value="">Mọi mô-đun</option>{modOptions.map((k) => <optgroup key={k} label={subjectName(k)}>{MODULES[k].map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}</optgroup>)}<option value="none">Chưa phân loại</option></select>
            <select name="difficulty" aria-label="Lọc theo độ khó" defaultValue={difficulty ?? ""} className="input w-auto"><option value="">Mọi độ khó</option>{Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select name="origin" aria-label="Lọc theo nguồn" defaultValue={origin ?? ""} className="input w-auto"><option value="">Mọi nguồn</option><option value="ai_generated">AI soạn</option><option value="template">Khuôn tham số</option><option value="teacher">Soạn tay</option></select>
            <select name="verify" aria-label="Lọc theo kết quả kiểm tra AI" defaultValue={verify ?? ""} className="input w-auto"><option value="">Mọi kết quả kiểm tra</option><option value="mismatch">Lệch đáp án</option><option value="invalid">Lỗi cấu trúc</option><option value="pass">Đạt</option><option value="unchecked">Chưa kiểm tra</option></select>
            <button className="btn-outline">Lọc</button>
          </form>
          {decision || <div className="card text-center text-slate-600">{view === "offline" ? "Hàng chờ trống. Chuyển sang tab Kiểm tra mẫu lô." : "Không còn câu nào khớp bộ lọc."}</div>}
        </>
      )}

      {view === "reports" && (
        <>
          <p className="rounded-xl bg-brand-soft p-3 text-sm text-slate-700">Câu <b>đang hiển thị</b> bị học viên báo lỗi mà chưa giáo viên nào xem lại. <b>Xác nhận đúng</b> nếu câu không sai (lượt báo được coi là đã xử lý); <b>Loại</b> để tắt ngay. Câu nhận đủ 3 lượt báo sẽ tự chuyển về tab Chờ duyệt.</p>
          {decision || <div className="card text-center text-slate-600">Không có báo lỗi nào đang chờ xử lý.</div>}
        </>
      )}

      {view === "lots" && !lot && <LotList lots={lots} />}
      {view === "lots" && lot && (
        <>
          <div className="card flex flex-wrap items-center gap-3 !p-3 text-sm">
            <Link href={lotsHref} className="font-semibold text-brand-text hover:underline">← Danh sách lô</Link>
            <b>{lotName(lot)}</b>
            <span className="text-muted">{lot.total} câu · mẫu ngẫu nhiên {lot.sample.length} câu</span>
            <span className="ml-auto font-semibold">Đã xem {lot.reviewed}/{lot.sample.length}</span>
            <span className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><span className={`block h-full ${lot.rejected ? "bg-red-400" : "bg-brand"}`} style={{ width: `${(lot.reviewed / Math.max(1, lot.sample.length)) * 100}%` }} /></span>
          </div>
          {lot.status === "failed" || !lot.next ? <LotResult lot={lot} /> : decision}
        </>
      )}
    </div>
  );
}

function LotActions({ lot }: { lot: Lot }) {
  if (lot.status === "passed") return (
    <form action={confirmLotAction.bind(null, lot.key)}>
      <ConfirmButton className="btn min-h-[2.5rem]" title="Kết luận lô đạt?" message={`${lot.remaining} câu còn lại của ${lotName(lot)} được đánh dấu “đạt kiểm tra mẫu” (${lot.sample.length} câu ngẫu nhiên đã xem, không có lỗi). Học viên vẫn thấy các câu này như hiện tại.`} confirmText="Kết luận đạt">Kết luận: lô đạt</ConfirmButton>
    </form>
  );
  if (lot.status === "failed") return (
    <form action={returnLotAction.bind(null, lot.key)}>
      <ConfirmButton danger className="btn-outline min-h-[2.5rem] !border-red-300 !text-danger" title="Đưa lô về hàng chờ?" message={`${lot.remaining} câu chưa được xem của ${lotName(lot)} sẽ ẩn khỏi học viên và chuyển sang tab Chờ duyệt để xem từng câu. Các đề đã lắp sẵn từ những câu này có thể bị thiếu câu.`} confirmText="Đưa về hàng chờ">Đưa lô về hàng chờ</ConfirmButton>
    </form>
  );
  if (lot.status === "done") return null;
  return <Link href={`/admin/review?view=lots&lot=${encodeURIComponent(lot.key)}`} className={lot.status === "doing" ? "btn min-h-[2.5rem]" : "btn-outline min-h-[2.5rem]"}>{lot.status === "doing" ? "Tiếp tục" : "Kiểm tra mẫu"} →</Link>;
}

function LotResult({ lot }: { lot: Lot }) {
  const failed = lot.status === "failed";
  return (
    <div className={`card space-y-3 ${failed ? "!border-red-200" : "!border-emerald-200"}`}>
      <h2 className={`text-lg font-bold ${failed ? "text-danger" : "text-success"}`}>{failed ? `Lô không đạt: ${lot.rejected} câu mẫu bị loại` : lot.status === "done" ? "Lô đã xử lý xong" : "Đã xem hết mẫu, không có lỗi"}</h2>
      <p className="max-w-2xl text-sm text-slate-600">{failed
        ? "Câu mẫu được rút ngẫu nhiên, nên lỗi ở mẫu cho thấy các câu khác của lô cũng có thể sai. Hãy đưa phần còn lại của lô về hàng Chờ duyệt để xem từng câu."
        : lot.status === "done" ? "Không còn câu nào của lô đang chờ giáo viên." : `Bạn có thể kết luận lô đạt: ${lot.remaining} câu còn lại được ghi nhận “đạt kiểm tra mẫu”.`}</p>
      <LotActions lot={lot} />
    </div>
  );
}

function LotList({ lots }: { lots: Lot[] }) {
  const open = lots.filter((l) => l.status !== "done").sort((a, b) => LOT_ORDER.indexOf(a.status) - LOT_ORDER.indexOf(b.status) || b.remaining - a.remaining);
  const done = lots.length - open.length;
  const left = open.reduce((s, l) => s + l.remaining, 0);
  return (
    <>
      <div className="rounded-xl bg-brand-soft p-3 text-sm text-slate-700">
        <p>Câu do AI soạn được công bố theo <b>lô</b> sau khi qua kiểm tra tự động. Thay vì xem từng câu, bạn xem <b>một mẫu ngẫu nhiên</b> của mỗi lô (10% số câu, tối thiểu 5, tối đa 20):</p>
        <ul className="mt-1 list-disc pl-5"><li><b>Không câu mẫu nào sai</b> → kết luận lô đạt.</li><li><b>Có câu mẫu sai</b> → đưa phần còn lại của lô về hàng Chờ duyệt để xem từng câu.</li></ul>
      </div>
      <p className="text-sm text-muted">{open.length} lô cần xử lý · {left.toLocaleString("vi-VN")} câu chưa có giáo viên xem{done > 0 && ` · ${done} lô đã xong`}</p>
      {open.length === 0 ? <div className="card text-center text-slate-600">Không còn lô nào cần kiểm tra.</div> : (
        <ul className="card divide-y divide-slate-100 !p-0">
          {open.map((l) => {
            const [label, cls] = LOT_STATUS[l.status];
            return (
              <li key={l.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1 basis-60">
                  <p className="font-semibold text-ink">{lotName(l)} <span className="font-normal text-muted">· {new Date(l.created).toLocaleDateString("vi-VN")}</span></p>
                  <p className="text-sm text-muted">{l.remaining.toLocaleString("vi-VN")} câu chưa có giáo viên xem · mẫu {l.reviewed}/{l.sample.length}{l.rejected > 0 && <b className="text-danger"> · {l.rejected} câu mẫu bị loại</b>}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{label}</span>
                <LotActions lot={l} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
