import Link from "next/link";
import { signOut } from "@/app/actions";
import type { Me } from "@/lib/auth";

const NAV = [
  ["/", "Trang chủ"],
  ["/csca", "CSCA"],
  ["/thi-thu", "Thi thử"],
  ["/luyen-tap", "Luyện tập"],
] as const;

export function Header({ me }: { me: Me | null }) {
  const isStaff = me && me.role !== "student";
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold text-brand">Luyenthicsca</Link>
        <nav className="flex flex-1 flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-brand">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {me ? (
            <>
              {isStaff && <Link href="/admin" className="font-medium hover:text-brand">Admin</Link>}
              <Link href="/dashboard" className="font-medium hover:text-brand">{me.full_name || me.email}</Link>
              <form action={signOut}><button className="text-stone-500 hover:text-brand">Đăng xuất</button></form>
            </>
          ) : (
            <Link href="/dang-nhap" className="font-medium hover:text-brand">Đăng nhập</Link>
          )}
          <Link href="/quick-test" className="btn">Thi thử miễn phí</Link>
        </div>
      </div>
    </header>
  );
}
