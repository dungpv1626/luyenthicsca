/* eslint-disable @next/next/no-img-element */
import { safeImageUrl } from "@/lib/school-image";

/** Ảnh trường (nếu có) với lớp phủ gradient để chữ đọc rõ; không có ảnh thì không hiển thị gì. */
export function SchoolPhoto({ url, credit, alt, className = "h-32", overlay = true }: { url?: string | null; credit?: string | null; alt: string; className?: string; overlay?: boolean }) {
  const src = safeImageUrl(url);
  if (!src) return null;
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
      {overlay && <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />}
      {credit && <span className="absolute bottom-1 right-2 max-w-[90%] truncate text-[10px] text-white/80" title={credit}>{credit}</span>}
    </div>
  );
}
