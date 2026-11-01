import Link from "next/link";
import { signOut } from "@/app/actions";
import type { Me } from "@/lib/auth";
import { AccountMenu } from "./AccountMenu";
import { Logo } from "./Logo";
import { DesktopNav, MobileMenu } from "./NavLinks";

export function Header({ me }: { me: Me | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-1 shrink-0"><Logo /></Link>
        <DesktopNav />
        <div className="ml-auto flex items-center gap-2 text-sm lg:ml-0">
          <Link href="/quick-test" className="btn hidden !px-4 sm:inline-flex">Thi thử miễn phí</Link>
          {me ? (
            <AccountMenu name={me.full_name || me.email} isStaff={me.role !== "student"}>
              <form action={signOut}><button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-600 hover:bg-stone-100">Đăng xuất</button></form>
            </AccountMenu>
          ) : (
            <Link href="/dang-nhap" className="rounded-full border border-stone-200 px-4 py-2 font-semibold hover:border-brand hover:text-brand">Đăng nhập</Link>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
