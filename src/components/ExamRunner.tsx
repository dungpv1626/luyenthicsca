"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { submitExamAction } from "@/app/exam-actions";
import { SUBJECTS, type Subject } from "@/lib/constants";

type Q = { id: string; subject: string; topic: string; body: string; options: Record<string, string> };

export function ExamRunner({ attemptId, title, questions, deadline }: { attemptId: string; title: string; questions: Q[]; deadline: number }) {
  const storeKey = `exam:${attemptId}`;
  const [idx, setIdx] = useState(0);
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
  const done = Object.keys(answers).length;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-bold">{title}</h1><p className="text-sm text-stone-500">Đã trả lời {done}/{questions.length}</p></div>
        <div className={`rounded-lg px-4 py-2 font-mono text-2xl font-bold ${left < 60 ? "bg-red-100 text-red-700" : "bg-stone-100"}`}>{mm}:{ss}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="card space-y-4">
          <p className="text-xs font-semibold uppercase text-brand">{SUBJECTS[q.subject as Subject]} · {q.topic}</p>
          <p className="whitespace-pre-wrap text-lg">Câu {idx + 1}. {q.body}</p>
          <div className="space-y-2">
            {Object.entries(q.options).map(([k, v]) => (
              <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${answers[q.id] === k ? "border-brand bg-red-50" : "border-stone-200 hover:bg-stone-50"}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === k} onChange={() => setAnswers((a) => ({ ...a, [q.id]: k }))} className="mt-1" />
                <span><b>{k}.</b> {v}</span>
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
              <button key={x.id} onClick={() => setIdx(i)} className={`rounded py-1 text-sm font-medium ${i === idx ? "ring-2 ring-brand" : ""} ${answers[x.id] ? "bg-brand text-white" : "bg-stone-100"}`}>{i + 1}</button>
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
