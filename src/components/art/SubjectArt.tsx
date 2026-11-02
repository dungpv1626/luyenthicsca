/** Minh họa gốc cho 4 môn thi (SVG, có chuyển động nhẹ). */
type Subject = "math" | "physics" | "chemistry" | "chinese";

const BG: Record<Subject, [string, string]> = { math: ["#2563eb", "#4f46e5"], physics: ["#1e3a8a", "#2563eb"], chemistry: ["#0891b2", "#2563eb"], chinese: ["#4f46e5", "#1e3a8a"] };

export function SubjectArt({ subject, className = "" }: { subject: Subject; className?: string }) {
  const [a, b] = BG[subject];
  const id = `g-${subject}`;
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label={subject}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <radialGradient id={`${id}-glow`} cx=".7" cy=".2" r=".7"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="200" height="140" rx="18" fill={`url(#${id})`} />
      <rect width="200" height="140" rx="18" fill={`url(#${id}-glow)`} />
      {subject === "math" && (<g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M30 112h140M44 120V26" strokeOpacity=".55" strokeWidth="2" />
        <path d="M44 100C70 20 100 20 126 100S158 112 170 70" strokeWidth="3.5" strokeOpacity=".95" strokeDasharray="300" strokeDashoffset="300"><animate attributeName="stroke-dashoffset" from="300" to="0" dur="2.4s" fill="freeze" /></path>
        <circle cx="98" cy="44" r="5" fill="#fff" stroke="none" className="twinkle" />
        <text x="138" y="40" fill="#fff" fontSize="22" fontWeight="700" stroke="none" opacity=".9">π</text>
        <text x="52" y="44" fill="#fff" fontSize="14" fontWeight="600" stroke="none" opacity=".75">x² + 1</text>
        <text x="150" y="104" fill="#fff" fontSize="18" fontWeight="700" stroke="none" opacity=".55" className="float">Σ</text>
      </g>)}
      {subject === "physics" && (<g fill="none" stroke="#fff">
        <g className="spin-slow" style={{ transformOrigin: "100px 72px" }}>
          <ellipse cx="100" cy="72" rx="58" ry="20" strokeOpacity=".8" strokeWidth="2.5" />
          <ellipse cx="100" cy="72" rx="58" ry="20" strokeOpacity=".8" strokeWidth="2.5" transform="rotate(60 100 72)" />
          <ellipse cx="100" cy="72" rx="58" ry="20" strokeOpacity=".8" strokeWidth="2.5" transform="rotate(120 100 72)" />
          <circle cx="158" cy="72" r="5" fill="#67e8f9" stroke="none" /><circle cx="71" cy="22" r="5" fill="#67e8f9" stroke="none" /><circle cx="71" cy="122" r="5" fill="#67e8f9" stroke="none" />
        </g>
        <circle cx="100" cy="72" r="11" fill="#fff" stroke="none" className="twinkle" />
        <text x="22" y="30" fill="#fff" fontSize="13" fontWeight="600" stroke="none" opacity=".7">E = mc²</text>
      </g>)}
      {subject === "chemistry" && (<g>
        <path d="M84 26h32v34l30 52c4 8-1 16-10 16H64c-9 0-14-8-10-16l30-52z" fill="#fff" fillOpacity=".16" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 100h60l16 28c3 6-1 10-8 10H62c-7 0-11-4-8-10z" fill="#67e8f9" fillOpacity=".85" />
        <path d="M70 100c10-6 20 6 30 0s20-6 30 0" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
        {[0, 1, 2].map((i) => <circle key={i} cx={88 + i * 14} cy="104" r={3 + (i % 2)} fill="#fff" style={{ animation: `bubble 2.6s ${i * 0.8}s ease-in infinite` }} />)}
        <text x="140" y="34" fill="#fff" fontSize="14" fontWeight="700" opacity=".85">H₂O</text>
        <text x="30" y="52" fill="#fff" fontSize="12" fontWeight="600" opacity=".6">pH 7</text>
      </g>)}
      {subject === "chinese" && (<g>
        <rect x="62" y="22" width="76" height="76" rx="14" fill="#fff" fillOpacity=".18" stroke="#fff" strokeWidth="2.5" />
        <text x="100" y="82" textAnchor="middle" fill="#fff" fontSize="56" fontWeight="700" fontFamily="'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif">汉</text>
        <text x="100" y="120" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="600" opacity=".85">hàn · yǔ</text>
        <text x="26" y="48" fill="#fff" fontSize="20" opacity=".5" className="float" fontFamily="'Noto Sans SC','PingFang SC',sans-serif">文</text>
        <text x="158" y="104" fill="#fff" fontSize="20" opacity=".5" className="float float-d1" fontFamily="'Noto Sans SC','PingFang SC',sans-serif">学</text>
      </g>)}
      <circle cx="176" cy="22" r="3" fill="#fff" className="twinkle" /><circle cx="22" cy="112" r="2.5" fill="#fff" className="twinkle" style={{ animationDelay: "-1.4s" }} />
    </svg>
  );
}
