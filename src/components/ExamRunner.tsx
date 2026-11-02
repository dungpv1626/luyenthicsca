"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { saveDraftAction, submitExamAction } from "@/app/exam-actions";
import { SUBJECTS, type Subject } from "@/lib/constants";
import { Rich } from "./Rich";

type Q = { id: string; subject: string; topic: string; body: string; options: Record<string, string>; tr?: Record<string, { body: string; options: Record<string, string> }> };
const LANGS = [["vi", "Tiếng Việt", "VI"], ["en", "English", "EN"], ["zh", "中文", "中文"]] as const;
type Save = "idle" | "saving" | "saved" | "error";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Hộp thoại có thể truy cập: Esc để đóng, khóa cuộn nền, tiêu điểm đặt vào nút an toàn. */
function Modal({ open, onClose, label, children, sheet = false }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode; sheet?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex bg-navy/60 backdrop-blur-sm ${sheet ? "items-end md:items-center" : "items-center"} justify-center p-3`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={label} className={`pop max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl ${sheet ? "rounded-b-none md:rounded-b-3xl" : ""}`}>{children}</div>
    </div>
  );
}

export function ExamRunner({ attemptId, title, questions, deadline, draft, draftSpent }: { attemptId: string; title: string; questions: Q[]; deadline: number; draft: Record<string, string>; draftSpent: Record<string, number> }) {
  const storeKey = `exam:${attemptId}`;
  const [idx, setIdx] = useState(0);
  const [lang, setLang] = useState<"vi" | "en" | "zh">("vi");
  const [answers, setAnswers] = useState<Record<string, string>>(draft);
  const [flags, setFlags] = useState<string[]>([]);
  const [left, setLeft] = useState(() => Math.max(0, Math.round((deadline - Date.now()) / 1000)));
  const [pending, start] = useTransition();
  const [dlg, setDlg] = useState<null | "submit" | "grid" | "leave">(null);
  const [save, setSave] = useState<Save>("idle");
  const spent = useRef<Record<string, number>>({ ...draftSpent });
  const submitted = useRef(false);
  const dirty = useRef(false);
  const hydrated = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // chế độ tập trung: ẩn menu/chân trang của trang web khi đang thi
  useEffect(() => { document.documentElement.dataset.exam = "1"; return () => { delete document.documentElement.dataset.exam; }; }, []);

  // khôi phục: gộp bản nháp trên máy chủ với bản lưu trên máy này (bản trên máy ưu tiên vì mới hơn)
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(storeKey) ?? "null");
      if (s) {
        setAnswers((a) => ({ ...a, ...(s.answers ?? {}) }));
        for (const [k, v] of Object.entries((s.spent ?? {}) as Record<string, number>)) spent.current[k] = Math.max(spent.current[k] ?? 0, v);
        if (Array.isArray(s.flags)) setFlags(s.flags);
      }
      const l = localStorage.getItem("csca_lang");
      if (l === "vi" || l === "en" || l === "zh") setLang(l);
    } catch { /* bỏ qua */ }
    hydrated.current = true;
  }, [storeKey]);

  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem(storeKey, JSON.stringify({ answers, flags, spent: spent.current })); } catch { /* bỏ qua */ }
  }, [answers, flags, storeKey]);

  // lưu nháp lên máy chủ: sau mỗi lần chọn (trễ ~1,2 giây), mỗi 20 giây, và khi rời tab
  const flush = useCallback(async () => {
    if (submitted.current || !dirty.current) return;
    dirty.current = false; setSave("saving");
    try { await saveDraftAction(attemptId, answersRef.current, spent.current); setSave("saved"); }
    catch { dirty.current = true; setSave("error"); }
  }, [attemptId]);
  useEffect(() => {
    if (!hydrated.current) return;
    dirty.current = true; setSave("idle");
    const t = setTimeout(flush, 1200);
    return () => clearTimeout(t);
  }, [answers, flush]);
  useEffect(() => {
    const iv = setInterval(() => { if (dirty.current) flush(); }, 20000);
    const vis = () => { if (document.visibilityState === "hidden") flush(); };
    const warn = (e: BeforeUnloadEvent) => { if (!submitted.current && (dirty.current || save === "error")) { e.preventDefault(); e.returnValue = ""; } };
    document.addEventListener("visibilitychange", vis); window.addEventListener("beforeunload", warn);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", vis); window.removeEventListener("beforeunload", warn); };
  }, [flush, save]);

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    start(async () => {
      await submitExamAction(attemptId, answersRef.current, spent.current);
      try { localStorage.removeItem(storeKey); } catch { /* bỏ qua */ }
    });
  }, [attemptId, storeKey]);

  // đồng hồ + ghi nhận thời gian trên câu hiện tại
  const curId = questions[idx]?.id;
  useEffect(() => {
    const t = setInterval(() => {
      setLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
      if (curId) spent.current[curId] = (spent.current[curId] ?? 0) + 1;
    }, 1000);
    return () => clearInterval(t);
  }, [deadline, curId]);
  useEffect(() => { if (left === 0) submit(); }, [left, submit]);

  const q = questions[idx];
  const view = lang !== "vi" && q.tr?.[lang] ? q.tr[lang] : { body: q.body, options: q.options };
  const hasTr = questions.some((x) => x.tr && Object.keys(x.tr).length);
  const pickLang = (l: "vi" | "en" | "zh") => { setLang(l); try { localStorage.setItem("csca_lang", l); } catch { /* bỏ qua */ } };
  const done = questions.filter((x) => answers[x.id]).length;
  const unanswered = questions.map((x, i) => (answers[x.id] ? 0 : i + 1)).filter(Boolean);
  const flagged = questions.map((x, i) => (flags.includes(x.id) ? i + 1 : 0)).filter(Boolean);
  const isFlag = flags.includes(q.id);
  const toggleFlag = () => setFlags((f) => (f.includes(q.id) ? f.filter((x) => x !== q.id) : [...f, q.id]));
  const jump = (n: number) => { setIdx(n - 1); setDlg(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const last = idx === questions.length - 1;

  const grid = (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((x, i) => (
        <button key={x.id} onClick={() => jump(i + 1)} aria-label={`Câu ${i + 1}${answers[x.id] ? ", đã trả lời" : ", chưa trả lời"}${flags.includes(x.id) ? ", đã đánh dấu" : ""}`} aria-current={i === idx ? "true" : undefined}
          className={`relative min-h-[2.75rem] rounded-lg text-sm font-semibold transition active:scale-95 md:min-h-[2.25rem] ${i === idx ? "ring-2 ring-brand ring-offset-2" : ""} ${answers[x.id] ? "bg-brand text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200"}`}>
          {i + 1}{flags.includes(x.id) && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-gold" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
  const legend = <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500"><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded bg-brand" />Đã làm</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded bg-slate-200" />Chưa làm</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-gold" />Xem lại</span></p>;
  const saveText = save === "saving" ? "Đang lưu…" : save === "saved" ? "Đã lưu ✓" : save === "error" ? "Chưa lưu được, đang thử lại" : "";

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <div className="card sticky top-2 z-30 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 !p-3 shadow-md sm:flex sm:flex-wrap sm:justify-between sm:!p-4">
        <div className="col-span-2 min-w-0 sm:col-auto"><h1 className="truncate text-sm font-bold sm:text-base">{title}</h1><p className="text-xs text-slate-500 sm:text-sm">Đã trả lời {done}/{questions.length}{saveText && <span className={`ml-2 ${save === "error" ? "font-semibold text-red-600" : "text-slate-400"}`} role="status">{saveText}</span>}</p></div>
        {hasTr && <div className="flex w-fit rounded-full border border-slate-200 p-0.5 text-xs font-semibold">{LANGS.map(([k, label, short]) => <button key={k} onClick={() => pickLang(k)} aria-label={label} className={`min-h-[2.25rem] rounded-full px-2.5 transition sm:px-3 ${lang === k ? "bg-brand text-white shadow" : "text-slate-600 hover:text-brand"}`}><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{label}</span></button>)}</div>}
        <div className="flex items-center gap-2">
          <div className={`rounded-lg px-3 py-1.5 font-mono text-xl font-bold sm:px-4 sm:text-2xl ${left < 60 ? "bg-red-100 text-red-700" : "bg-slate-100"}`} aria-label="Thời gian còn lại" role="timer">{fmt(left)}</div>
          <button className="btn !px-3 !py-2 text-xs md:hidden" disabled={pending} onClick={() => setDlg("submit")}>Nộp bài</button>
          <button className="hidden rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 hover:text-brand md:block" onClick={() => setDlg("leave")}>Thoát</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-brand">{SUBJECTS[q.subject as Subject]} · {q.topic}</p>
            <button onClick={toggleFlag} aria-pressed={isFlag} className={`inline-flex min-h-[2.5rem] shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isFlag ? "border-gold bg-amber-50 text-amber-800" : "border-slate-200 text-slate-500 hover:border-gold hover:text-amber-800"}`}>{isFlag ? "🚩 Đã đánh dấu" : "🏳 Đánh dấu xem lại"}</button>
          </div>
          <p className="text-lg">Câu {idx + 1}. <Rich text={view.body} /></p>
          <div className="space-y-2" role="radiogroup" aria-label={`Đáp án câu ${idx + 1}`}>
            {Object.entries(view.options).map(([k, v]) => (
              <label key={k} className={`flex min-h-[3rem] cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition active:scale-[.99] ${answers[q.id] === k ? "border-brand bg-brand-soft" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === k} onChange={() => setAnswers((a) => ({ ...a, [q.id]: k }))} className="mt-1" />
                <span><b>{k}.</b> <Rich text={v} /></span>
              </label>
            ))}
          </div>
          <div className="hidden justify-between pt-2 md:flex">
            <button className="btn-outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Câu trước</button>
            {!last ? <button className="btn" onClick={() => setIdx(idx + 1)}>Câu sau →</button> : <button className="btn" disabled={pending} onClick={() => setDlg("submit")}>Nộp bài</button>}
          </div>
        </div>

        <aside className="card hidden h-fit md:block">
          {grid}{legend}
          <button className="btn mt-4 w-full" disabled={pending} onClick={() => setDlg("submit")}>{pending ? "Đang chấm điểm & phân tích…" : "Nộp bài"}</button>
        </aside>
      </div>

      {/* thanh điều hướng cố định cho điện thoại */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-slate-200 bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden" aria-label="Điều hướng câu hỏi">
        <button className="btn-outline flex-1" disabled={idx === 0} onClick={() => setIdx(idx - 1)} aria-label="Câu trước">←</button>
        <button className="btn-outline flex-[2]" onClick={() => setDlg("grid")}>Câu {idx + 1}/{questions.length} ▾</button>
        {!last ? <button className="btn flex-1" onClick={() => setIdx(idx + 1)} aria-label="Câu sau">→</button> : <button className="btn flex-1" disabled={pending} onClick={() => setDlg("submit")}>Nộp</button>}
      </nav>

      <Modal open={dlg === "grid"} onClose={() => setDlg(null)} label="Danh sách câu hỏi" sheet>
        <h2 className="mb-3 text-lg font-extrabold text-navy">Danh sách câu hỏi</h2>{grid}{legend}
        <button className="btn mt-4 w-full" onClick={() => setDlg("submit")}>Nộp bài</button>
      </Modal>

      <Modal open={dlg === "submit"} onClose={() => setDlg(null)} label="Xác nhận nộp bài">
        <h2 className="text-xl font-extrabold text-navy">Nộp bài?</h2>
        <p className="mt-1 text-sm text-slate-600">Còn lại <b className="font-mono">{fmt(left)}</b>. Sau khi nộp bạn không thể sửa đáp án.</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-emerald-50 p-2"><dt className="text-[11px] text-emerald-700">Đã làm</dt><dd className="text-xl font-black text-emerald-700">{done}</dd></div>
          <div className={`rounded-xl p-2 ${unanswered.length ? "bg-rose-50" : "bg-slate-50"}`}><dt className={`text-[11px] ${unanswered.length ? "text-rose-700" : "text-slate-500"}`}>Chưa làm</dt><dd className={`text-xl font-black ${unanswered.length ? "text-rose-700" : "text-slate-400"}`}>{unanswered.length}</dd></div>
          <div className="rounded-xl bg-amber-50 p-2"><dt className="text-[11px] text-amber-800">Đánh dấu</dt><dd className="text-xl font-black text-amber-800">{flagged.length}</dd></div>
        </dl>
        {unanswered.length > 0 && <div className="mt-3"><p className="text-xs font-semibold text-slate-500">Câu chưa làm (bấm để nhảy tới):</p><div className="mt-1.5 flex flex-wrap gap-1.5">{unanswered.slice(0, 40).map((n) => <button key={n} onClick={() => jump(n)} className="min-h-[2.25rem] min-w-[2.25rem] rounded-lg bg-rose-50 px-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">{n}</button>)}{unanswered.length > 40 && <span className="self-center text-xs text-slate-400">…và {unanswered.length - 40} câu nữa</span>}</div></div>}
        {flagged.length > 0 && <div className="mt-3"><p className="text-xs font-semibold text-slate-500">Câu đánh dấu xem lại:</p><div className="mt-1.5 flex flex-wrap gap-1.5">{flagged.map((n) => <button key={n} onClick={() => jump(n)} className="min-h-[2.25rem] min-w-[2.25rem] rounded-lg bg-amber-50 px-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">{n}</button>)}</div></div>}
        <div className="mt-5 flex gap-2"><button autoFocus className="btn-outline flex-1" onClick={() => setDlg(null)}>Làm tiếp</button><button className="btn flex-1" disabled={pending} onClick={() => { setDlg(null); submit(); }}>{pending ? "Đang chấm…" : "Nộp bài"}</button></div>
      </Modal>

      <Modal open={dlg === "leave"} onClose={() => setDlg(null)} label="Thoát bài thi">
        <h2 className="text-xl font-extrabold text-navy">Thoát tạm thời?</h2>
        <p className="mt-2 text-sm text-slate-600">Đáp án của bạn được lưu, bạn có thể vào lại từ trang Thi thử. <b>Đồng hồ vẫn chạy</b>; hết giờ bài sẽ tự nộp.</p>
        <div className="mt-5 flex gap-2"><button autoFocus className="btn-outline flex-1" onClick={() => setDlg(null)}>Ở lại làm bài</button><Link href="/dashboard" onClick={() => { flush(); }} className="btn flex-1">Thoát</Link></div>
      </Modal>
    </div>
  );
}
