"use client";
import { useEffect } from "react";

/** Phím tắt cho màn duyệt: A = duyệt, R = loại (đưa con trỏ vào ô lý do), S = bỏ qua, E = sửa. Không kích hoạt khi đang gõ. */
export function ReviewHotkeys({ skipHref, editHref, canApprove }: { skipHref: string; editHref: string; canApprove: boolean }) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || (t && /^(input|textarea|select)$/i.test(t.tagName))) return;
      const k = e.key.toLowerCase();
      if (k === "a" && canApprove) { e.preventDefault(); document.querySelector<HTMLButtonElement>('button[name=decision][value=approve]')?.click(); }
      else if (k === "r") { e.preventDefault(); const n = document.querySelector<HTMLTextAreaElement>("textarea[name=note]"); if (n?.value.trim()) document.querySelector<HTMLButtonElement>('button[name=decision][value=reject]')?.click(); else n?.focus(); }
      else if (k === "s") { e.preventDefault(); location.assign(skipHref); }
      else if (k === "e") { e.preventDefault(); location.assign(editHref); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [skipHref, editHref, canApprove]);
  return null;
}
