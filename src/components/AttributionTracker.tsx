"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ATTR_COOKIE } from "@/lib/attribution";

/** Ghi nguồn truy cập đầu tiên của khách vào cookie (30 ngày). Chỉ ghi một lần, bỏ qua khu quản trị. */
export function AttributionTracker() {
  const path = usePathname();
  useEffect(() => {
    try {
      if (path.startsWith("/admin") || document.cookie.includes(`${ATTR_COOKIE}=`)) return;
      const q = new URLSearchParams(location.search);
      let ref = "";
      try { if (document.referrer) { const h = new URL(document.referrer).hostname; if (h !== location.hostname) ref = h; } } catch { /* bỏ qua */ }
      const a = { src: q.get("utm_source") ?? "", med: q.get("utm_medium") ?? "", camp: q.get("utm_campaign") ?? "", ref, lp: path };
      document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(JSON.stringify(a))}; max-age=${30 * 86400}; path=/; SameSite=Lax`;
    } catch { /* trình duyệt chặn cookie: bỏ qua */ }
  }, [path]);
  return null;
}
