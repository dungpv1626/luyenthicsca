export function SectionTitle({ en, vi, center = false, light = false }: { en: string; vi: string; center?: boolean; light?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className={`display ${light ? "!text-white" : ""}`}>{en}</h2>
      <p className={`subtitle ${light ? "!text-white/80" : ""}`}>{vi}</p>
    </div>
  );
}

export function PageHeader({ en, vi, children }: { en: string; vi: string; children?: React.ReactNode }) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-9 text-white md:px-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
      <p className="eyebrow !text-white/70">{vi}</p>
      <h1 className="mt-1 text-3xl font-extrabold uppercase tracking-tight md:text-4xl">{en}</h1>
      {children && <div className="mt-3 max-w-2xl text-sm text-white/85">{children}</div>}
    </header>
  );
}
