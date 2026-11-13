export function SectionTitle({ en, vi, center = false, light = false }: { en: string; vi: string; center?: boolean; light?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className={`display ${light ? "!text-white" : ""}`}>{en}</h2>
      <span className={`mt-3 block h-1 w-14 rounded-full bg-gradient-to-r ${light ? "from-white to-white/30" : "from-brand to-accent"} ${center ? "mx-auto" : ""}`} />
      <p className={`subtitle ${light ? "!text-white/80" : ""}`}>{vi}</p>
    </div>
  );
}

export function PageHeader({ en, vi, children }: { en: string; vi: string; children?: React.ReactNode }) {
  return (
    <header className="mesh-navy relative isolate mb-8 overflow-hidden rounded-3xl px-5 py-8 text-white shadow-[0_24px_60px_-28px_rgb(30_58_138/0.7)] sm:rounded-3xl sm:px-10 sm:py-11">
      <div className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="drift pointer-events-none absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full bg-white/10 blur-xl" />
      <div className="drift pointer-events-none absolute -bottom-20 right-24 -z-10 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" style={{ animationDelay: "-7s" }} />
      <p className="rise eyebrow !text-sky-200">{vi}</p>
      <h1 className="rise rise-2 mt-1.5 text-[1.75rem] font-extrabold uppercase leading-tight tracking-tight sm:text-4xl">{en}</h1>
      {children && <div className="rise rise-3 mt-3 max-w-2xl text-sm text-white/85 sm:text-base">{children}</div>}
    </header>
  );
}
