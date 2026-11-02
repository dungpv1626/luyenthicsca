/** Hình nền "khuôn viên đại học" (silhouette gốc) cho khối Trường & học bổng. */
export function CampusArt({ className = "" }: { className?: string }) {
  const win = (x: number, y: number, c = 4, r = 3, gap = 9, o = 0.28) =>
    Array.from({ length: r }, (_, j) => Array.from({ length: c }, (_, i) => <rect key={`${x}${y}${i}${j}`} x={x + i * gap} y={y + j * gap} width="4" height="5" rx="1" fill="#fff" opacity={o} />));
  return (
    <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs><linearGradient id="campus-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".12" /></linearGradient></defs>
      <rect width="1200" height="220" fill="url(#campus-fade)" />
      <g className="drift"><ellipse cx="180" cy="46" rx="60" ry="14" fill="#fff" opacity=".12" /><ellipse cx="220" cy="38" rx="40" ry="11" fill="#fff" opacity=".12" /></g>
      <g className="drift" style={{ animationDelay: "-8s" }}><ellipse cx="860" cy="30" rx="70" ry="15" fill="#fff" opacity=".1" /><ellipse cx="905" cy="22" rx="42" ry="11" fill="#fff" opacity=".1" /></g>
      {/* dãy xa */}
      <g fill="#fff" opacity=".09"><rect x="40" y="120" width="90" height="100" /><rect x="150" y="100" width="70" height="120" /><rect x="880" y="110" width="100" height="110" /><rect x="1000" y="126" width="80" height="94" /><rect x="1090" y="104" width="90" height="116" /></g>
      {/* tháp nhiều tầng kiểu mái cong (nguyên bản) */}
      <g fill="#fff" opacity=".2">
        <rect x="560" y="150" width="80" height="70" />
        <path d="M545 150h110l-14-16H559z" /><rect x="572" y="116" width="56" height="20" /><path d="M560 116h80l-12-14H572z" /><rect x="584" y="86" width="32" height="16" /><path d="M576 86h48l-8-12h-32z" /><path d="M600 74l-3-22h6z" />
      </g>
      <g fill="#fff" opacity=".28">{win(572, 160, 5, 5, 14, 1)}</g>
      {/* tòa chính */}
      <g fill="#fff" opacity=".16"><rect x="230" y="118" width="250" height="102" /><path d="M222 118h266l-14-18H236z" /><rect x="320" y="84" width="70" height="34" /><path d="M312 84h86l-12-16h-62z" /></g>
      <g>{win(246, 130, 12, 3, 19, 0.3)}</g>
      <g fill="#fff" opacity=".13"><rect x="690" y="128" width="170" height="92" /><path d="M682 128h186l-12-14H694z" /></g>
      <g>{win(704, 140, 9, 3, 17, 0.28)}</g>
      {/* cây & hàng rào */}
      <g fill="#fff" opacity=".2"><circle cx="498" cy="196" r="18" /><circle cx="520" cy="200" r="14" /><circle cx="668" cy="198" r="16" /><circle cx="880" cy="198" r="17" /><circle cx="150" cy="198" r="15" /></g>
      <rect x="0" y="206" width="1200" height="14" fill="#fff" opacity=".12" />
    </svg>
  );
}
