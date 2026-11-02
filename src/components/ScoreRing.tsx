export function ScoreRing({ value, size = 140, label = "/100", light = false }: { value: number; size?: number; label?: string; light?: boolean }) {
  const r = 52, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className={light ? "stroke-white/20" : "stroke-slate-100"} />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} className={light ? "stroke-white" : "stroke-brand"} />
      </svg>
      <div className="text-center leading-none">
        <b className={`block text-4xl font-black ${light ? "text-white" : "text-ink"}`}>{value}</b>
        <span className={`text-xs font-semibold ${light ? "text-white/70" : "text-slate-400"}`}>{label}</span>
      </div>
    </div>
  );
}
