/* eslint-disable @next/next/no-img-element */
/** Logo Luyenthicsca. `light` = bản chữ trắng cho nền xanh navy (Header/Footer); `vertical` = bản dọc cho nền sáng (đăng nhập…); `mark` = chỉ biểu tượng. */
export function Logo({ light = false, vertical = false, mark = false, className = "" }: { light?: boolean; vertical?: boolean; mark?: boolean; className?: string }) {
  if (vertical) return <img src="/brand/logo-vertical.png" width={700} height={901} alt="CSCA Việt Nam – Luyện thi CSCA" className={`mx-auto h-auto w-32 ${className}`} />;
  if (mark) return <img src="/brand/mark.png" width={512} height={477} alt="CSCA Việt Nam" className={`h-9 w-auto ${className}`} />;
  if (light) return <img src="/brand/logo-horizontal-light.png" width={900} height={332} alt="CSCA Việt Nam – Luyện thi CSCA" className={`h-12 w-auto sm:h-[3.25rem] ${className}`} />;
  return <img src="/brand/logo-vertical.png" width={700} height={901} alt="CSCA Việt Nam – Luyện thi CSCA" className={`h-12 w-auto ${className}`} />;
}
