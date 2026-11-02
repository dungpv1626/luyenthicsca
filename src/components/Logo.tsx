export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`grid h-9 w-9 place-items-center rounded-xl font-black ${light ? "bg-white text-brand" : "bg-brand text-white"}`}>L</span>
      <span className={`leading-tight ${light ? "text-white" : "text-ink"}`}>
        <b className="block text-[15px] font-extrabold tracking-tight">Luyenthicsca</b>
        <small className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${light ? "text-white/70" : "text-slate-500"}`}>Năng lực CSCA</small>
      </span>
    </span>
  );
}
