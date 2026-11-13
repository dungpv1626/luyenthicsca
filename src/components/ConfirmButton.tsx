"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Nút gửi biểu mẫu có HỘP THOẠI XÁC NHẬN cho hành động khó hoàn tác.
 * Giữ nguyên name/value của nút (nhờ requestSubmit(submitter)), nên dùng được trong biểu mẫu có nhiều nút quyết định.
 * `message` có thể là hàm nhận dữ liệu biểu mẫu để mô tả đúng lựa chọn hiện tại (vd vai trò đang chọn).
 */
export function ConfirmButton({ children, className = "", title, message, confirmText = "Xác nhận", danger = false, name, value, disabled, field, valueLabels, extraWhen }: {
  children: React.ReactNode; className?: string; title: string; message: string; confirmText?: string; danger?: boolean; name?: string; value?: string; disabled?: boolean;
  /** Tên ô trong biểu mẫu để thay vào {value} trong message (vd vai trò đang chọn); valueLabels đổi giá trị → nhãn; extraWhen thêm câu cảnh báo cho một giá trị cụ thể. */
  field?: string; valueLabels?: Record<string, string>; extraWhen?: { value: string; text: string };
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const ref = useRef<HTMLButtonElement>(null);
  const confirmed = useRef(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey); const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);
  return (
    <>
      <button ref={ref} type="submit" name={name} value={value} disabled={disabled} className={className}
        onClick={(e) => {
          if (confirmed.current) { confirmed.current = false; return; } // lần gửi sau khi đã xác nhận
          e.preventDefault();
          const form = ref.current?.closest("form");
          const v = field && form ? String(new FormData(form).get(field) ?? "") : "";
          setText(message.replace("{value}", valueLabels?.[v] ?? v) + (extraWhen && v === extraWhen.value ? ` ${extraWhen.text}` : ""));
          setOpen(true);
        }}>{children}</button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div role="alertdialog" aria-modal="true" aria-label={title} className="pop w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-extrabold text-navy">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" autoFocus className="btn-outline" onClick={() => setOpen(false)}>Hủy</button>
              <button type="button" className={danger ? "inline-flex min-h-[2.5rem] items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700" : "btn"}
                onClick={() => { setOpen(false); confirmed.current = true; const form = ref.current?.closest("form"); if (form && ref.current) form.requestSubmit(ref.current); }}>{confirmText}</button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
