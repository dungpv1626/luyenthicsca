/** Biểu đồ đường SVG đơn giản (không cần thư viện). */
export function LineChart({ points, height = 160 }: { points: { label: string; value: number }[]; height?: number }) {
  if (!points.length) return null;
  const W = 600, H = height, pad = 28;
  const x = (i: number) => (points.length === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (points.length - 1));
  const y = (v: number) => H - pad - (Math.max(0, Math.min(100, v)) / 100) * (H - pad * 2);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Biểu đồ tiến bộ Readiness Score">
      {[0, 50, 100].map((g) => <g key={g}><line x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} className="stroke-slate-200" strokeDasharray="4 4" /><text x={4} y={y(g) + 4} className="fill-slate-400 text-xs">{g}</text></g>)}
      {points.length > 1 && <path d={`${path} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} className="fill-brand/10" />}
      <path d={path} fill="none" className="stroke-brand" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => <g key={i}><circle cx={x(i)} cy={y(p.value)} r="5" className="fill-surface stroke-brand" strokeWidth="3" /><text x={x(i)} y={y(p.value) - 11} textAnchor="middle" className="fill-ink text-xs font-bold">{p.value}</text><text x={x(i)} y={H - 6} textAnchor="middle" className="fill-slate-400 text-xs">{p.label}</text></g>)}
    </svg>
  );
}
