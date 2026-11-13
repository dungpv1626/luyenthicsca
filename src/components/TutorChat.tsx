"use client";
import { useRef, useState, useTransition, useEffect } from "react";
import { askTutor, type ChatMsg } from "@/app/tutor-actions";
import { Icon } from "./Icon";

export function TutorChat({ ctx, suggestions = [], compact = false }: { ctx?: { attemptId: string; questionId: string }; suggestions?: string[]; compact?: boolean }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs, pending]);

  function send(q: string) {
    const content = q.trim();
    if (!content || pending) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next); setText(""); setError("");
    start(async () => {
      const r = await askTutor(next, ctx);
      if (r.reply) setMsgs([...next, { role: "assistant", content: r.reply }]);
      if (r.error) setError(r.error);
      if (typeof r.left === "number") setLeft(r.left);
    });
  }

  return (
    <div className={`flex flex-col ${compact ? "" : "card !p-0 overflow-hidden"}`}>
      <div className={`space-y-3 overflow-y-auto p-4 ${compact ? "max-h-72" : "h-[26rem]"}`}>
        {!msgs.length && (
          <div className="py-4 text-center text-sm text-slate-500">
            <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-brand text-white"><Icon name="sparkles" /></span>
            {ctx ? "Hỏi mình bất cứ điều gì về câu này." : "Mình là Gia sư AI. Hỏi mình về Toán, Vật lý, Hóa học hoặc tiếng Trung chuyên ngành."}
            {suggestions.length > 0 && <div className="mt-3 flex flex-wrap justify-center gap-2">{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="inline-flex min-h-[2.75rem] items-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-ink hover:border-brand hover:text-brand">{s}</button>)}</div>}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-slate-100"}`}>{m.content}</div>
          </div>
        ))}
        {pending && <div className="flex"><div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3"><span className="inline-flex gap-1">{[0, 1, 2].map((i) => <i key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />)}</span></div></div>}
        <div ref={end} />
      </div>
      {error && <p className="mx-4 mb-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2 border-t border-slate-200 p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Nhập câu hỏi…" className="input !rounded-full" />
        <button disabled={pending || !text.trim()} className="btn !px-4" aria-label="Gửi"><Icon name="send" className="h-4 w-4" /></button>
      </form>
      {left !== null && <p className="px-4 pb-2 text-right text-xs text-slate-500">Còn {left} lượt hỏi hôm nay</p>}
    </div>
  );
}
