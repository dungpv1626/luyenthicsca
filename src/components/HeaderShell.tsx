"use client";
import { useEffect, useState } from "react";

/** Thanh menu: đổ bóng và thu gọn nhẹ khi cuộn xuống. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-30 bg-navy/95 text-white backdrop-blur-md transition-all duration-300 ${scrolled ? "shadow-[0_8px_30px_-12px_rgb(15_23_42/0.55)]" : "shadow-none"}`}>
      <div className={`transition-all duration-300 ${scrolled ? "py-0" : "py-0.5"}`}>{children}</div>
      <div className="h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </header>
  );
}
