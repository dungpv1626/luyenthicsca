import { Icon } from "../Icon";
import { ScoreRing } from "../ScoreRing";

/** Minh họa hero: bảng điều khiển Readiness + gia sư AI + nhiệm vụ hôm nay (dữ liệu ví dụ). */
export function HeroArt() {
  const bars: [string, number][] = [["Toán", 78], ["Vật lý", 65], ["Hóa học", 72], ["Tiếng Trung", 81]];
  return (
    <div className="relative mx-auto aspect-[4/4.1] w-full max-w-[26rem] sm:aspect-[5/4.3] sm:max-w-[34rem]" aria-hidden="true">
      <div className="absolute inset-[4%] rounded-full bg-white/10 blur-2xl" />
      <div className="spin-slower absolute inset-[3%] rounded-full border border-dashed border-white/25" />
      <div className="spin-slow absolute inset-[15%] rounded-full border border-white/15" />

      {/* chip môn học quay quanh */}
      {[["π", "left-[1%] top-[26%]", ""], ["H₂O", "right-[0%] top-[40%]", "float-d1"], ["E=mc²", "left-[6%] bottom-[30%]", "float-d2"], ["汉", "right-[8%] top-[2%]", "float-d1"]].map(([t, pos, d]) => (
        <span key={t} className={`float absolute ${pos} ${d} hidden rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur sm:block`}>{t}</span>
      ))}

      {/* thẻ chính */}
      <div className="float-slow absolute left-1/2 top-[6%] w-[80%] -translate-x-1/2 rounded-3xl bg-white p-4 text-ink shadow-2xl ring-1 ring-white/40 sm:p-5">
        <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.2em] text-brand sm:text-xs">CSCA Readiness</span><span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">Ví dụ</span></div>
        <div className="mt-3 flex items-center gap-4">
          <ScoreRing value={72} size={92} />
          <div className="min-w-0 flex-1 space-y-1.5">
            {bars.map(([n, v]) => (
              <div key={n}><div className="flex justify-between text-xs font-semibold sm:text-xs"><span>{n}</span><span className="text-muted">{v}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="bar-anim h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${v}%` }} /></div></div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2 text-xs text-slate-700 sm:text-xs"><Icon name="sparkles" className="h-4 w-4 shrink-0 text-brand" /><span className="min-w-0"><b className="text-brand">AI:</b> mạnh Đại số, cần luyện Xác suất.</span></div>
      </div>

      {/* gia sư AI */}
      <div className="float absolute -left-1 bottom-[5%] w-[56%] rounded-2xl bg-white/95 p-3 text-ink shadow-xl sm:left-0">
        <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand to-indigo text-white"><Icon name="sparkles" className="h-4 w-4" /></span><span className="text-xs font-bold">Gia sư AI</span><span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" /></div>
        <p className="mt-2 rounded-xl rounded-tl-sm bg-slate-100 px-2.5 py-1.5 text-xs leading-snug">Vì sao tổng hai nghiệm bằng 5?</p>
        <p className="caret mt-1.5 rounded-xl rounded-tr-sm bg-brand px-2.5 py-1.5 text-xs leading-snug text-white">Theo Vi-ét: x₁ + x₂ = −b/a = 5</p>
      </div>

      {/* nhiệm vụ hôm nay */}
      <div className="float float-d2 absolute -right-1 bottom-[1%] w-[47%] rounded-2xl bg-white/95 p-3 text-ink shadow-xl">
        <div className="flex items-center justify-between"><span className="text-xs font-bold">Hôm nay</span><span className="text-xs font-semibold text-muted">2/3</span></div>
        {[["20 câu Đại số", true], ["Xem lại câu sai", true], ["Mini Test", false]].map(([t, d], i) => (
          <div key={String(t)} className="mt-1.5 flex items-center gap-2 text-xs"><span className={`pop grid h-4 w-4 shrink-0 place-items-center rounded-full ${d ? "bg-emerald-500 text-white" : "border border-slate-300"}`} style={{ animationDelay: `${0.6 + i * 0.25}s` }}>{d ? <Icon name="check" className="h-3 w-3" /> : null}</span><span className={d ? "text-muted line-through" : "font-medium"}>{t}</span></div>
        ))}
      </div>

      <span className="pop float absolute right-[3%] top-[28%] hidden items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-white shadow-lg sm:flex" style={{ animationDelay: "1s" }}>▲ +12 điểm</span>
    </div>
  );
}
