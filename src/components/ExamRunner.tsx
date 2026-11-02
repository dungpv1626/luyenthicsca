"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { submitExamAction } from "@/app/exam-actions";
import { SUBJECTS, type Subject } from "@/lib/constants";
import { Rich } from "./Rich";

type Q = { id: string; subject: string; topic: string; body: string; options: Record<string, string>; tr?: Record<string, { body: string; options: Record<string, string> }> };
const LANGS = [["vi", "Tiếng Việt"], ["en", "English"], ["zh", "中文"]] as const;

export function ExamRunner({ attemptId, title, questions, deadline }: { attemptId: string; title: string; questions: Q[]; deadline: number }) {
  const storeKey = `exam:${attemptId}`;
  const [idx, setIdx] = useState(0);
  const [lang, setLang] = useState<"vi" | "en" | "zh">("vi");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [left, setLeft] = useState(() => Math.max(0, Math.round((deadline - Date.now()) / 1000)));
  const [pending, start] = useTransition();
  const spent = useRef<Record<string, number>>({});
  const submitted = useRef(false);

  // khôi phục bài làm dở khi tải lại trang
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(storeKey) ?? "null");
      if (s) { setAnswers(s.answers ?? {}); spent.current = s.spent ?? {}; }
      const l = localStorage.getItem("csca_lang");
      if (l === "vi" || l === "en" || l === "zh") setLang(l);
    } catch { /* bỏ qua */ }
  }, [storeKey]);

  const persist = useCallback(() => {
    try { localStorage.setItem(storeKey, JSON.stringify({ answers, spent: spent.current })); } catch { /* bỏ qua */ }
  }, [answers, storeKey]);
  useEffect(persist, [persist]);

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    start(async () => {
      await submitExamAction(attemptId, answers, spent.current);
      try { localStorage.removeItem(storeKey); } catch { /* bỏ qua */ }
    });
  }, [answers, attemptId, storeKey]);

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
  const done = Object.keys(answers).length;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="card sticky top-[4.4rem] z-20 flex flex-wrap items-center justify-between gap-3 !p-3 shadow-md sm:!p-5 lg:static lg:shadow-sm">
        <div><h1 className="font-bold">{title}</h1><p className="text-sm text-slate-500">Đã trả lời {done}/{questions.length}</p></div>
        {hasTr && <div className="flex rounded-full border border-slate-200 p-0.5 text-xs font-semibold">{LANGS.map(([k, label]) => <button key={k} onClick={() => pickLang(k)} className={`rounded-full px-3.5 py-2 transition sm:px-3 sm:py-1 ${lang === k ? "bg-brand text-white shadow" : "text-slate-600 hover:text-brand"}`}>{label}</button>)}</div>}
        <div className={`rounded-lg px-4 py-2 font-mono text-2xl font-bold ${left < 60 ? "bg-red-100 text-red-700" : "bg-slate-100"}`}>{mm}:{ss}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="card space-y-4">
          <p className="text-xs font-semibold uppercase text-brand">{SUBJECTS[q.subject as Subject]} · {q.topic}</p>
          <p className="text-lg">Câu {idx + 1}. <Rich text={view.body} /></p>
          <div className="space-y-2">
            {Object.entries(view.options).map(([k, v]) => (
              <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition active:scale-[.99] ${answers[q.id] === k ? "border-brand bg-brand-soft" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === k} onChange={() => setAnswers((a) => ({ ...a, [q.id]: k }))} className="mt-1" />
                <span><b>{k}.</b> <Rich text={v} /></span>
              </label>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button className="btn-outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Câu trước</button>
            {idx < questions.length - 1
              ? <button className="btn" onClick={() => setIdx(idx + 1)}>Câu sau →</button>
              : <button className="btn" disabled={pending} onClick={() => confirm("Nộp bài?") && submit()}>Nộp bài</button>}
          </div>
        </div>

        <aside className="card h-fit">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((x, i) => (
              <button key={x.id} onClick={() => setIdx(i)} className={`min-h-[2.5rem] rounded-lg py-2 text-sm font-semibold transition active:scale-95 sm:min-h-0 sm:py-1.5 ${i === idx ? "ring-2 ring-brand ring-offset-2" : ""} ${answers[x.id] ? "bg-brand text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200"}`}>{i + 1}</button>
            ))}
          </div>
          <button className="btn mt-4 w-full" disabled={pending} onClick={() => confirm(`Còn ${questions.length - done} câu chưa trả lời. Nộp bài?`) && submit()}>
            {pending ? "Đang chấm điểm & phân tích…" : "Nộp bài"}
          </button>
        </aside>
      </div>
    </div>
  );
}
