"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/** Giữ thuộc tính data-admin của <html> khớp với đường dẫn hiện tại (layout gốc không render lại khi chuyển trang phía trình duyệt). */
export function ChromeSync() {
  const path = usePathname();
  useLayoutEffect(() => {
    const el = document.documentElement;
    if (path.startsWith("/admin")) el.dataset.admin = "1"; else delete el.dataset.admin;
  }, [path]);
  return null;
}
