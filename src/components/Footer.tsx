import Link from "next/link";
import { Logo } from "./Logo";
import { COMPANY } from "@/lib/company";
import { POLICIES } from "@/content/policies";

const COLS = [
  ["Học tập", [["/thi-thu", "Thi thử"], ["/luyen-tap", "Luyện tập"], ["/ai", "Hồ sơ năng lực"], ["/lo-trinh", "Lộ trình"], ["/gia-su", "Gia sư AI"]]],
  ["Khám phá", [["/csca", "CSCA là gì?"], ["/blog", "Blog CSCA"], ["/truong", "Trường"], ["/hoc-bong", "Học bổng"], ["/academy", "Academy"], ["/bang-gia", "Bảng giá"], ["/giao-vien", "Giáo viên"]]],
  ["Tài khoản", [["/dashboard", "Dashboard"], ["/don-hang", "Đơn hàng"], ["/khoa-hoc-cua-toi", "Khóa học của tôi"], ["/dang-nhap", "Đăng nhập"]]],
] as const;

export function Footer() {
  return (
    <footer className="relative mt-20 bg-navy-deep pb-20 text-white lg:pb-0">
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="absolute inset-x-0 -top-[47px] h-[48px] w-full text-navy-deep" aria-hidden="true"><path fill="currentColor" d="M0 48V22C160 2 320 0 480 12s320 30 480 22 320-26 480-12v26z" /></svg>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo light className="!h-16 sm:!h-[4.5rem]" />
          <p className="mt-4 max-w-xs text-sm text-white/70">Hệ thống đánh giá và nâng cao năng lực CSCA: thi thử, AI phân tích, lộ trình cá nhân, kết nối trường và học bổng.</p>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title}>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">{title}</h4>
            <ul className="mt-2 text-sm">{links.map(([h, l]) => <li key={h}><Link href={h} className="-mx-2 block rounded-lg px-2 py-2 text-white/85 transition hover:bg-white/10 hover:text-white">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>

      {/* Thông tin doanh nghiệp và chính sách: công bố theo quy định với website thương mại điện tử. */}
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 text-sm md:grid-cols-[1.4fr_2fr]">
          <address className="not-italic text-white/80">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Đơn vị chủ quản</h4>
            <p className="mt-2 font-semibold text-white">{COMPANY.name}</p>
            <p className="mt-1">Mã số doanh nghiệp: {COMPANY.taxCode}</p>
            <p>Địa chỉ: {COMPANY.address}</p>
            <p>Người đại diện: {COMPANY.representative}</p>
            <p className="mt-2">Điện thoại/Zalo: <a href={`tel:${COMPANY.phoneHref}`} className="font-semibold text-white hover:underline">{COMPANY.phone}</a></p>
            <p>Email: <span className="font-semibold text-white">{COMPANY.email}</span></p>
            <p>Hỗ trợ: {COMPANY.hours}</p>
          </address>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Chính sách và điều khoản</h4>
            <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
              {POLICIES.map((p) => <li key={p.slug}><Link href={`/${p.slug}`} className="-mx-2 block rounded-lg px-2 py-1.5 text-white/85 transition hover:bg-white/10 hover:text-white">{p.title}</Link></li>)}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">© {new Date().getFullYear()} {COMPANY.name} · {COMPANY.brand} (luyenthicsca.edu.vn) — Readiness Score là chỉ số ước lượng, không phải điểm thi chính thức.</div>
    </footer>
  );
}
