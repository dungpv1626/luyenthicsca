"use client";
import { useFormStatus } from "react-dom";

/** Nút gửi biểu mẫu có phản hồi tức thì: hiện vòng xoay và khóa nút khi máy chủ đang xử lý (tránh bấm nhiều lần). */
export function SubmitButton({ children, pendingText = "Đang xử lý…", className = "btn", disabled = false }: { children: React.ReactNode; pendingText?: string; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} aria-busy={pending} className={`${className} ${pending ? "!cursor-wait" : ""}`}>
      {pending ? <><span className="spinner" aria-hidden="true" />{pendingText}</> : children}
    </button>
  );
}
