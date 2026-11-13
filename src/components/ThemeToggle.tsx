"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** Chuyển giao diện sáng/tối; lưu lựa chọn trong trình duyệt. Script trong layout áp chủ đề trước khi vẽ trang. */
export function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* bỏ qua */ }
    setDark(!dark);
  };
  return (
    <button type="button" onClick={flip} aria-pressed={dark} aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"} title={dark ? "Giao diện sáng" : "Giao diện tối"}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${onDark ? "border-white/40 text-white hover:bg-white/10" : "border-slate-300 text-slate-600 hover:border-brand hover:text-brand-text"}`}>
      <Icon name={dark ? "sun" : "moon"} className="h-5 w-5" />
    </button>
  );
}
