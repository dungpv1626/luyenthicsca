"use client";
import { useEffect, useState } from "react";

/** Thanh thao tác hàng loạt: hiện khi có dòng được tích (ô tích gắn vào biểu mẫu qua thuộc tính form). */
export function BulkBar({ formId, canApprove }: { formId: string; canApprove: boolean }) {
  const [n, setN] = useState(0);
  const boxes = () => Array.from(document.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="ids"][form="${formId}"]`));
  useEffect(() => {
    const on = () => setN(boxes().filter((b) => b.checked).length);
    document.addEventListener("change", on);
    return () => document.removeEventListener("change", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);
  const all = (v: boolean) => { boxes().forEach((b) => { b.checked = v; }); setN(v ? boxes().length : 0); };
  if (!n) return <p className="text-xs text-muted"><button type="button" onClick={() => all(true)} className="font-semibold text-brand hover:underline">Chọn tất cả trên trang</button> để duyệt hoặc gửi duyệt hàng loạt.</p>;
  return (
    <div role="region" aria-label="Thao tác hàng loạt" className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-brand/30 bg-white p-3 text-sm shadow-lg">
      <b>{n} câu đã chọn</b>
      <button type="button" onClick={() => all(false)} className="inline-flex min-h-[2.25rem] items-center px-2 font-semibold text-muted hover:text-ink">Bỏ chọn</button>
      <span className="ml-auto flex flex-wrap gap-2">
        <button name="status" value="review" className="btn-outline btn-sm">Gửi duyệt</button>
        {canApprove && <button name="status" value="approved" className="btn btn-sm">Duyệt</button>}
      </span>
    </div>
  );
}
