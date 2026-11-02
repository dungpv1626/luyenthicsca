/** Minh họa cho trạng thái trống. */
export function EmptyArt({ className = "h-28 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="62" r="44" fill="#eff6ff" />
      <g className="float"><rect x="34" y="30" width="52" height="64" rx="8" fill="#fff" stroke="#2563eb" strokeWidth="3" />
        <rect x="46" y="24" width="28" height="12" rx="5" fill="#2563eb" />
        <path d="M44 54h32M44 66h32M44 78h20" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" /></g>
      <path d="M92 36l2.2 6.2 6.2 2.2-6.2 2.2L92 53l-2.2-6.2-6.2-2.2 6.2-2.2z" fill="#f59e0b" className="twinkle" />
      <circle cx="26" cy="84" r="3" fill="#06b6d4" className="twinkle" style={{ animationDelay: "-1.2s" }} />
    </svg>
  );
}
