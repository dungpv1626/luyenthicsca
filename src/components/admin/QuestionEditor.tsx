"use client";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { Rich } from "@/components/Rich";
import { formulaIssues, insertSnippet, SNIPPETS } from "@/lib/formula";

type Key = "A" | "B" | "C" | "D";
type Lang = "vi" | "en" | "zh";
type Content = { body: string; options: Record<Key, string>; explanation: string };
const KEYS: Key[] = ["A", "B", "C", "D"];
const LANGS: { id: Lang; label: string }[] = [{ id: "vi", label: "Tiếng Việt" }, { id: "en", label: "English" }, { id: "zh", label: "中文" }];

export type EditorProps = {
  action: (fd: FormData) => Promise<void>;
  isNew: boolean;
  back: string;
  error?: boolean;
  meta: { subject: string; topic: string; difficulty: string; language: string; skill: string; source: string; est_time_sec: number; status: string; correct: Key };
  content: Record<Lang, Content>;
  choices: { subjects: Record<string, string>; difficulty: Record<string, string>; languages: Record<string, string>; statuses: Record<string, string> };
};

/** Tên ô gửi lên server (giữ nguyên định dạng saveQuestion đang đọc). */
const fieldName = (lg: Lang, part: "body" | "explanation" | Key) =>
  lg === "vi" ? (part === "body" || part === "explanation" ? part : `opt_${part}`) : `tr_${lg}_${part === "body" || part === "explanation" ? part : `opt_${part}`}`;

/** Ô nhập tự giãn theo nội dung; báo vị trí con trỏ cho thanh chèn công thức. */
function Grow({ id, name, value, onChange, onFocus, rows = 1, placeholder, required, label }: { id: string; name: string; value: string; onChange: (v: string) => void; onFocus: () => void; rows?: number; placeholder?: string; required?: boolean; label: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => { const el = ref.current; if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight + 2}px`; } }, [value]);
  return <textarea ref={ref} id={id} name={name} value={value} rows={rows} placeholder={placeholder} required={required} aria-label={label} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} className="input resize-none overflow-hidden !leading-relaxed" />;
}

function Issues({ text }: { text: string }) {
  const list = text ? formulaIssues(text) : [];
  return list.length ? <ul className="mt-1 space-y-0.5 text-xs font-medium text-danger">{list.map((m, i) => <li key={i}>⚠ {m}</li>)}</ul> : null;
}

export function QuestionEditor({ action, isNew, back, error, meta, content: initial, choices }: EditorProps) {
  const [content, setContent] = useState(initial);
  const [correct, setCorrect] = useState<Key>(meta.correct);
  const [tab, setTab] = useState<Lang>("vi");
  const focused = useRef<{ id: string; set: (v: string) => void; get: () => string } | null>(null);

  const setPart = (lg: Lang, part: "body" | "explanation" | Key, v: string) =>
    setContent((c) => ({ ...c, [lg]: part === "body" || part === "explanation" ? { ...c[lg], [part]: v } : { ...c[lg], options: { ...c[lg].options, [part]: v } } }));
  const getPart = (lg: Lang, part: "body" | "explanation" | Key) => (part === "body" || part === "explanation" ? content[lg][part] : content[lg].options[part]);
  const bind = (lg: Lang, part: "body" | "explanation" | Key) => {
    const id = `q-${lg}-${part}`;
    return { id, name: fieldName(lg, part), value: getPart(lg, part), onChange: (v: string) => setPart(lg, part, v), onFocus: () => { focused.current = { id, set: (v) => setPart(lg, part, v), get: () => (document.getElementById(id) as HTMLTextAreaElement | null)?.value ?? "" }; } };
  };
  const insert = (s: (typeof SNIPPETS)[number]) => {
    const f = focused.current; const el = f && (document.getElementById(f.id) as HTMLTextAreaElement | null);
    if (!f || !el) return;
    const r = insertSnippet(f.get(), el.selectionStart, el.selectionEnd, s);
    f.set(r.value);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(r.caret, r.caret); });
  };

  const filled = (lg: Lang) => !!content[lg].body.trim();
  const issuesIn = (lg: Lang) => [content[lg].body, content[lg].explanation, ...KEYS.map((k) => content[lg].options[k])].some((t) => t && formulaIssues(t).length);
  const cur = content[tab];
  const sel = (name: string, map: Record<string, string>, value: string, label: string) => (
    <div><label className="label" htmlFor={`m-${name}`}>{label}</label><select id={`m-${name}`} name={name} defaultValue={value} className="input">{Object.entries(map).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
  );

  return (
    <form action={action} className="space-y-4 pb-24">
      <input type="hidden" name="back" value={back} />
      <input type="hidden" name="correct_answer" value={correct} />
      <div className="flex flex-wrap items-center gap-3">
        <Link href={back} className="text-sm font-semibold text-brand-text hover:underline">← Quay lại</Link>
        <h1 className="text-xl font-bold">{isNew ? "Câu hỏi mới" : "Sửa câu hỏi"}</h1>
      </div>
      {error && <p className="rounded-xl bg-danger-bg p-3 text-sm text-danger">Cần điền chủ đề, đề bài và đủ 4 phương án (bản tiếng Việt).</p>}

      <details className="card !p-4" open={isNew}>
        <summary className="cursor-pointer font-semibold">Thông tin câu hỏi <span className="ml-1 text-sm font-normal text-muted">· {choices.subjects[meta.subject] ?? "chọn môn"} · {meta.topic || "chủ đề"} · {choices.difficulty[meta.difficulty] ?? ""} · {choices.statuses[meta.status] ?? ""}</span></summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sel("subject", choices.subjects, meta.subject, "Môn")}
          <div><label className="label" htmlFor="m-topic">Chủ đề</label><input id="m-topic" name="topic" defaultValue={meta.topic} className="input" /></div>
          {sel("difficulty", choices.difficulty, meta.difficulty, "Độ khó")}
          {sel("status", choices.statuses, meta.status, "Trạng thái")}
          {sel("language", choices.languages, meta.language, "Ngôn ngữ gốc")}
          <div><label className="label" htmlFor="m-time">Thời gian dự kiến (giây)</label><input id="m-time" type="number" name="est_time_sec" defaultValue={meta.est_time_sec} className="input" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="m-skill">Kỹ năng</label><input id="m-skill" name="skill" defaultValue={meta.skill} className="input" /></div>
          <div className="sm:col-span-2 lg:col-span-4"><label className="label" htmlFor="m-source">Nguồn tham khảo</label><input id="m-source" name="source" defaultValue={meta.source} className="input" /></div>
        </div>
      </details>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="card min-w-0 space-y-4 !p-4">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Ngôn ngữ">
            {LANGS.map((l) => (
              <button key={l.id} type="button" role="tab" aria-selected={tab === l.id} onClick={() => setTab(l.id)} className={`inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ${tab === l.id ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand-text"}`}>
                {l.label}
                {issuesIn(l.id) ? <span className="h-2 w-2 rounded-full bg-red-500" title="Có công thức lỗi" /> : !filled(l.id) && l.id !== "vi" ? <span className={`text-xs font-normal ${tab === l.id ? "text-white/80" : "text-muted"}`}>(trống)</span> : null}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted">Đáp án A–D giống nhau ở cả 3 ngôn ngữ</span>
          </div>

          <div className="sticky top-14 z-10 -mx-1 flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-surface/95 p-1.5 backdrop-blur" aria-label="Chèn công thức">
            <span className="px-1 text-xs font-semibold text-muted">Chèn:</span>
            {SNIPPETS.map((s) => <button key={s.title} type="button" title={s.title} onMouseDown={(e) => e.preventDefault()} onClick={() => insert(s)} className="min-h-[2rem] min-w-[2rem] rounded-md border border-slate-200 px-2 text-sm hover:border-brand hover:bg-brand-soft">{s.label}</button>)}
          </div>

          {LANGS.map((l) => (
            <div key={l.id} hidden={tab !== l.id} className="space-y-4">
              <div>
                <label className="label" htmlFor={`q-${l.id}-body`}>Đề bài</label>
                <Grow {...bind(l.id, "body")} rows={3} label={`Đề bài (${l.label})`} placeholder={l.id === "vi" ? "Nội dung câu hỏi. Công thức đặt trong $...$, ví dụ $v_0 = 3\\ \\text{m/s}$" : "Để trống nếu chưa có bản dịch"} />
                <Issues text={content[l.id].body} />
              </div>
              <fieldset className="space-y-2">
                <legend className="label">Phương án <span className="font-normal text-muted">(chọn ô tròn ở phương án đúng)</span></legend>
                {KEYS.map((k) => (
                  <div key={k} className={`flex items-start gap-2 rounded-xl p-1.5 ${correct === k ? "bg-success-bg" : ""}`}>
                    <label className="mt-1.5 flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-bold" title="Đánh dấu là đáp án đúng">
                      <input type="radio" name={`ui-correct-${l.id}`} checked={correct === k} onChange={() => setCorrect(k)} className="h-4 w-4 accent-emerald-600" />
                      <span className={correct === k ? "text-success" : ""}>{k}</span>
                    </label>
                    <div className="min-w-0 flex-1">
                      <Grow {...bind(l.id, k)} label={`Phương án ${k} (${l.label})`} />
                      <Issues text={content[l.id].options[k]} />
                    </div>
                  </div>
                ))}
              </fieldset>
              <div>
                <label className="label" htmlFor={`q-${l.id}-explanation`}>Lời giải</label>
                <Grow {...bind(l.id, "explanation")} rows={3} label={`Lời giải (${l.label})`} />
                <Issues text={content[l.id].explanation} />
              </div>
            </div>
          ))}
        </div>

        <aside className="min-w-0 xl:sticky xl:top-20 xl:h-fit" aria-label="Xem trước">
          <div className="card space-y-3 !p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Xem trước · {LANGS.find((l) => l.id === tab)?.label}</p>
            {cur.body.trim() ? (
              <>
                <p className="font-medium leading-relaxed"><Rich text={cur.body} /></p>
                <ul className="space-y-1.5 text-sm">
                  {KEYS.map((k) => <li key={k} className={`rounded-lg px-2.5 py-1.5 ${correct === k ? "bg-success-bg font-semibold text-emerald-800" : "bg-mist"}`}>{k}. {cur.options[k] ? <Rich text={cur.options[k]} /> : <span className="text-muted">(trống)</span>}{correct === k && " ✓"}</li>)}
                </ul>
                {cur.explanation.trim() && <div className="border-t border-slate-100 pt-2 text-sm text-slate-600"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Lời giải</p><Rich text={cur.explanation} /></div>}
              </>
            ) : <p className="text-sm text-muted">{tab === "vi" ? "Gõ đề bài để xem trước." : "Chưa có bản dịch. Để trống thì học viên chọn ngôn ngữ này sẽ thấy bản tiếng Việt."}</p>}
          </div>
          <p className="mt-2 px-1 text-xs text-muted">Mẹo: chọn một đoạn chữ rồi bấm <b>$ $</b> để biến nó thành công thức. Đơn vị dùng nút <b>đơn vị</b>, ví dụ <code>3\ \text{"{m/s}"}</code>.</p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[92rem] items-center justify-end gap-2">
          {(["vi", "en", "zh"] as Lang[]).some(issuesIn) && <p className="mr-auto text-sm font-medium text-danger">Có công thức lỗi, xem các dòng ⚠ màu đỏ.</p>}
          <Link href={back} className="btn-outline">Hủy</Link>
          <button className="btn">Lưu câu hỏi</button>
        </div>
      </div>
    </form>
  );
}
