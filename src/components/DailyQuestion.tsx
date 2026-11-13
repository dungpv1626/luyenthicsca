"use client";
import { useState } from "react";
import Link from "next/link";
import { Rich } from "./Rich";
import { Icon } from "./Icon";

export type DailyQ = { id: string; subject: string; topic: string; body: string; options: Record<string, string>; correct: string; explanation: string };
const SUB: Record<string, string> = { math: "Toán", physics: "Vật lý", chemistry: "Hóa học" };

/** Câu hỏi hôm nay: làm thử ngay trên trang chủ, có đáp án tức thì (không cần đăng nhập). */
export function DailyQuestion({ q }: { q: DailyQ }) {
  const [pick, setPick] = useState<string | null>(null);
  const done = pick !== null, ok = pick === q.correct;
  return (
    <div className="relative mx-auto w-full max-w-md lg:ml-auto">
      <span className="float absolute -left-3 -top-4 z-10 rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-white shadow-lg sm:-left-6">Câu hỏi hôm nay</span>
      <span className="float float-d1 absolute -bottom-3 -right-2 z-10 hidden rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy shadow-lg backdrop-blur sm:block">Không cần đăng nhập</span>
      <div className="glass rounded-3xl p-4 text-ink shadow-[0_30px_80px_-30px_rgb(15_23_42/0.6)] sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold"><span className="chip">{SUB[q.subject] ?? q.subject}</span><span className="text-muted">{q.topic}</span><span className="ml-auto text-muted">Dễ · ~45 giây</span></div>
        <p className="text-[15px] font-semibold leading-relaxed sm:text-base"><Rich text={q.body} /></p>
        <div className="mt-4 grid gap-2" role="group" aria-label="Các đáp án">
          {(["A", "B", "C", "D"] as const).map((k) => {
            const isPick = pick === k, isRight = q.correct === k;
            const tone = !done ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft" : isRight ? "border-emerald-500 bg-success-bg" : isPick ? "border-red-400 bg-danger-bg" : "border-slate-200 bg-white opacity-60";
            return (
              <button key={k} type="button" disabled={done} onClick={() => setPick(k)} aria-pressed={isPick} className={`flex min-h-[2.75rem] items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition duration-200 ${tone}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${done && isRight ? "bg-emerald-500 text-white" : done && isPick ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600"}`}>{done && isRight ? "✓" : done && isPick ? "✗" : k}</span>
                <span className="min-w-0"><Rich text={q.options[k]} /></span>
              </button>
            );
          })}
        </div>
        {done ? (
          <div className="pop mt-4 space-y-3" role="status">
            <p className={`text-sm font-extrabold ${ok ? "text-emerald-600" : "text-red-600"}`}>{ok ? "Chính xác! 🎉" : `Chưa đúng — đáp án là ${q.correct}.`}</p>
            <p className="max-h-28 overflow-y-auto rounded-xl bg-mist p-3 text-xs leading-relaxed text-slate-600"><Rich text={q.explanation} /></p>
            <Link href="/quick-test" className="btn w-full">Làm Quick Test 15 phút <Icon name="arrow" className="h-4 w-4" /></Link>
          </div>
        ) : <p className="mt-4 text-center text-xs text-muted">Chọn một đáp án để xem kết quả ngay</p>}
      </div>
    </div>
  );
}
