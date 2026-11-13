import Link from "next/link";
import { MODULES, TOPICS, type Subject } from "@/lib/syllabus";
import { SUBJECTS } from "@/lib/constants";
import type { TopicStats } from "@/lib/topic-stats";
import { startPracticeAction } from "@/app/exam-actions";
import { SubmitButton } from "@/components/SubmitButton";

const SUBJ = Object.keys(SUBJECTS) as Subject[];
const short = (s: Subject) => SUBJECTS[s].split(" (")[0];

/** Học theo chuyên đề: mô-đun của đề cương → các chuyên đề, mỗi chuyên đề một thẻ có số câu và nút luyện. */
export function TopicExplorer({ subject, stats }: { subject: Subject; stats: TopicStats }) {
  const mods = MODULES[subject];
  const isChinese = subject === "chinese";
  return (
    <section id="chuyen-de" className="card mb-6 space-y-4 !p-4 sm:!p-5" aria-label="Học theo chuyên đề">
      <div>
        <p className="eyebrow">Theo đề cương CSCA</p>
        <h2 className="text-xl font-extrabold text-navy">Học theo chuyên đề</h2>
        <p className="mt-1 text-sm text-slate-600">Mỗi chuyên đề là một mục trong đề cương chính thức. Chọn chuyên đề, luyện 10 câu, rồi quay lại chuyên đề khác.</p>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Chọn môn">
        {SUBJ.map((s) => <Link key={s} href={`/luyen-tap?subject=${s}#chuyen-de`} scroll={false} aria-current={s === subject ? "page" : undefined} className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-sm font-semibold ${s === subject ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand"}`}>{short(s)}</Link>)}
      </nav>
      {isChinese && <p className="rounded-xl bg-brand-soft p-3 text-sm text-slate-700">Đề cương Tiếng Trung chuyên ngành chia theo <b>dạng câu</b> (nhận biết chữ Hán, chọn từ điền chỗ trống, phân biệt từ, chọn từ thành đoạn, hoàn thành câu, đọc hiểu) và hai khối văn – khoa học. Hiện ngân hàng đang chia theo 3 nhóm bên dưới; phần chia theo dạng câu và khối sẽ được bổ sung.</p>}
      {mods.map((m) => {
        const topics = isChinese ? [] : (TOPICS as Record<string, typeof TOPICS.math>)[subject].filter((t) => t.module === m.key);
        const total = stats.byModule[subject]?.[m.key] ?? 0;
        return (
          <div key={m.key}>
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3"><h3 className="font-bold text-ink">{m.name}</h3><span className="text-xs text-slate-500">{total.toLocaleString("vi-VN")} câu</span></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {isChinese ? (
                <Card key={m.key} subject={subject} field="module" value={m.key} vi={m.name} en="" zh="" desc={m.scope} n={total} />
              ) : topics.map((t) => <Card key={t.key} subject={subject} field="topic_key" value={t.key} vi={t.vi} en={t.en} zh={t.zh} desc={t.desc} n={stats.byTopic[subject]?.[t.key] ?? 0} sample={t.sample} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Card({ subject, field, value, vi, en, zh, desc, n, sample }: { subject: string; field: "topic_key" | "module"; value: string; vi: string; en: string; zh: string; desc: string; n: number; sample?: boolean }) {
  const soon = n === 0, few = n > 0 && n < 15;
  return (
    <form action={startPracticeAction} className={`flex flex-col rounded-xl border p-3 ${soon ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 bg-white"}`}>
      <input type="hidden" name="subject" value={subject} /><input type="hidden" name={field} value={value} /><input type="hidden" name="count" value="10" />
      <p className="font-bold leading-snug text-ink">{vi}</p>
      {(en || zh) && <p className="mt-0.5 text-xs text-slate-500">{[en, zh].filter(Boolean).join(" · ")}</p>}
      <p className="mt-1.5 flex-1 text-sm text-slate-600">{desc}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={`chip ${soon ? "!bg-slate-200 !text-slate-600" : few ? "!bg-amber-50 !text-amber-800" : ""}`}>{soon ? "Sắp có" : `${n.toLocaleString("vi-VN")} câu`}</span>
        {sample && <span className="chip !bg-emerald-50 !text-emerald-700" title="Nội dung này xuất hiện trong đề mẫu chính thức của CSC">Có trong đề mẫu chính thức</span>}
      </div>
      <SubmitButton disabled={soon} className="btn mt-3 w-full disabled:opacity-40" pendingText="Đang chọn câu…">{soon ? "Chưa có câu" : `Luyện ${Math.min(10, n)} câu`}</SubmitButton>
    </form>
  );
}
