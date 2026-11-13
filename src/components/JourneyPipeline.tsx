import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { Stage } from "@/lib/journey";

type J = { stages: Stage[]; currentIndex: number; doneCount: number; allDone: boolean; examDays: number | null };
const STATUS = { done: "Đã xong", current: "Đang ở đây", todo: "Chưa tới" } as const;

function Node({ s, size = "h-11 w-11" }: { s: Stage; size?: string }) {
  const base = `grid ${size} shrink-0 place-items-center rounded-full border-2 text-sm font-extrabold`;
  return (
    <span className={s.status === "done" ? `${base} border-success bg-success text-white` : s.status === "current" ? `${base} border-brand bg-brand text-white shadow-[0_0_0_6px_rgb(37_99_235/0.18)]` : `${base} border-border-strong bg-surface text-muted`}>
      {s.status === "done" ? <Icon name="check" className="h-5 w-5" /> : String(s.no).padStart(2, "0")}
      <span className="sr-only">{STATUS[s.status]}</span>
    </span>
  );
}

function Card({ s }: { s: Stage }) {
  const pct = s.progress.total ? Math.round((s.progress.done / s.progress.total) * 100) : 0;
  const tone = s.status === "done" ? "border-success/40 bg-success-bg" : s.status === "current" ? "border-brand bg-surface ring-2 ring-brand/20" : "border-slate-200 bg-surface";
  return (
    <article className={`w-full rounded-2xl border p-4 text-left shadow-sm ${tone}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">Chặng {s.no}</span>
        <span className={`chip ${s.status === "done" ? "!bg-success-bg !text-success" : s.status === "current" ? "" : "!bg-slate-100 !text-muted"}`}>{STATUS[s.status]}</span>
      </div>
      <h3 className="mt-1 font-extrabold leading-snug text-navy">{s.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ chặng ${s.no}`}>
        <span className={`block h-full rounded-full ${s.status === "done" ? "bg-success" : "bg-brand"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs font-semibold text-muted">{s.progress.label}</p>
      {s.status !== "done" && (
        <ul className="mt-2 space-y-1 text-sm">
          {s.items.slice(0, 3).map((x) => (
            <li key={x.text} className={`flex items-start gap-1.5 ${x.done ? "text-success" : "text-slate-700"}`}>
              <span aria-hidden="true" className="mt-0.5 shrink-0">{x.done ? "✓" : "○"}</span><span>{x.text}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        {s.status === "current" ? <Link href={s.cta.href} className="btn w-full">{s.cta.label} <Icon name="arrow" className="h-4 w-4" /></Link>
          : <Link href={s.cta.href} className="inline-flex min-h-[2.5rem] items-center text-sm font-semibold text-brand-text hover:underline">{s.status === "done" ? "Làm thêm" : "Xem chặng này"} →</Link>}
      </div>
    </article>
  );
}

/** Lộ trình dạng đường ống: máy tính nằm ngang (thẻ xen kẽ trên/dưới), điện thoại xếp dọc. Máy bay chỉ chặng đang ở. */
export function JourneyPipeline({ journey }: { journey: J }) {
  const { stages, currentIndex, doneCount, allDone, examDays } = journey;
  const n = stages.length, cur = stages[currentIndex];
  const plane = <span aria-hidden="true" className="float text-brand"><Icon name="send" className="h-6 w-6" /></span>;
  return (
    <section aria-labelledby="journey-title" className="card !p-4 sm:!p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Hành trình ôn thi</p>
          <h2 id="journey-title" className="text-xl font-extrabold text-navy">{allDone ? "Bạn đã đi hết mọi chặng" : `Bạn đang ở chặng ${cur.no}: ${cur.title}`}</h2>
          <p className="mt-1 text-sm text-slate-600">Đã qua <b>{doneCount}/{n}</b> chặng{!allDone && <>. Còn <b>{n - doneCount}</b> chặng nữa, bắt đầu từ chặng {cur.no}</>}.</p>
        </div>
        {examDays != null && examDays >= 0 && <span className="chip !px-3 !py-1.5 text-sm"><Icon name="clock" className="mr-1 h-4 w-4" />Còn {examDays} ngày đến kỳ thi</span>}
      </div>

      {/* Máy tính: đường ống nằm ngang */}
      <div className="mt-6 hidden lg:block">
        <div className="relative grid items-center gap-x-3" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: "auto 2.75rem auto" }}>
          <span aria-hidden="true" className="h-1.5 self-center rounded-full bg-slate-200" style={{ gridColumn: "1 / -1", gridRow: 2, marginInline: `${50 / n}%` }} />
          <span aria-hidden="true" className="h-1.5 self-center justify-self-start rounded-full bg-success" style={{ gridColumn: "1 / -1", gridRow: 2, marginLeft: `${50 / n}%`, width: `${(currentIndex / n) * 100}%` }} />
          {stages.map((s, i) => {
            const top = i % 2 === 0, isCur = i === currentIndex;
            return [
              // thẻ rộng 2 cột; thẻ trên neo từ cột của nút, thẻ dưới neo kết thúc ở cột của nút → các thẻ cùng hàng không chồng nhau
              <div key={`c${s.key}`} className={`relative flex ${top ? "items-end pb-6" : "items-start pt-6"}`} style={{ gridColumn: `${top ? i + 1 : i} / span 2`, gridRow: top ? 1 : 3 }}>
                <Card s={s} />
                <span aria-hidden="true" className={`absolute h-6 w-px bg-slate-300 ${top ? "bottom-0 left-1/4" : "left-3/4 top-0"}`} />
              </div>,
              <div key={`n${s.key}`} className="relative z-10 flex justify-center" style={{ gridColumn: i + 1, gridRow: 2 }} aria-current={isCur ? "step" : undefined}>
                <Node s={s} />
                {isCur && !allDone && <span className={`absolute top-1/2 -translate-y-1/2 ${i === n - 1 ? "right-[calc(50%+2rem)]" : "left-[calc(50%+2rem)]"}`}>{plane}</span>}
              </div>,
            ];
          })}
        </div>
      </div>

      {/* Điện thoại: xếp dọc */}
      <ol className="mt-5 space-y-3 lg:hidden">
        {stages.map((s, i) => (
          <li key={s.key} className="relative flex gap-3" aria-current={i === currentIndex ? "step" : undefined}>
            <div className="relative flex flex-col items-center">
              <Node s={s} />
              {i < n - 1 && <span aria-hidden="true" className={`mt-1 w-1 flex-1 rounded-full ${s.status === "done" ? "bg-success" : "bg-slate-200"}`} />}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              {i === currentIndex && !allDone && <p className="mb-1 flex items-center gap-1 text-xs font-bold text-brand-text">{plane}Bạn đang ở đây</p>}
              <Card s={s} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Bản thu nhỏ cho dashboard: dãy chấm các chặng + chặng đang ở, bấm để xem lộ trình. */
export function JourneyMini({ journey }: { journey: J }) {
  const { stages, currentIndex, doneCount, allDone } = journey;
  return (
    <Link href="/lo-trinh" className="card card-hover flex flex-wrap items-center gap-x-4 gap-y-2" aria-label={`Hành trình ôn thi: đã qua ${doneCount}/${stages.length} chặng, xem chi tiết`}>
      <ol className="flex items-center" aria-hidden="true">
        {stages.map((s, i) => (
          <li key={s.key} className="flex items-center">
            <span className={`grid h-7 w-7 place-items-center rounded-full border-2 text-[11px] font-extrabold ${s.status === "done" ? "border-success bg-success text-white" : s.status === "current" ? "border-brand bg-brand text-white" : "border-border-strong text-muted"}`}>{s.status === "done" ? "✓" : s.no}</span>
            {i < stages.length - 1 && <span className={`h-1 w-3 sm:w-5 ${s.status === "done" ? "bg-success" : "bg-slate-200"}`} />}
          </li>
        ))}
      </ol>
      <div className="min-w-0 flex-1 basis-48"><p className="text-sm font-extrabold text-navy">{allDone ? "Bạn đã đi hết mọi chặng" : `Chặng ${stages[currentIndex].no}: ${stages[currentIndex].title}`}</p><p className="text-xs text-muted">Đã qua {doneCount}/{stages.length} chặng · bấm để xem lộ trình</p></div>
      <Icon name="arrow" className="h-5 w-5 text-brand" />
    </Link>
  );
}
