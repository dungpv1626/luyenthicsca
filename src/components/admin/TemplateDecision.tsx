import { ConfirmButton } from "@/components/ConfirmButton";

/** Form duyệt/loại một khuôn; `back` là trang quay về sau khi ghi nhận (giữ nguyên môn, chuyên đề, bộ lọc). */
export function TemplateDecision({ action, back }: { action: (fd: FormData) => Promise<void>; back: string }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="back" value={back} />
      <input name="note" className="input !w-auto min-w-0 flex-1" placeholder="Ghi chú (bắt buộc khi loại)" />
      <ConfirmButton name="decision" value="approve" className="btn !py-2" title="Duyệt khuôn này?" message="Toàn bộ biến thể sinh từ khuôn này sẽ được đánh dấu giáo viên đã xác nhận (có thể hàng chục đến hàng trăm câu). Biến thể bạn đã gỡ lẻ vẫn giữ nguyên là đã gỡ." confirmText="Duyệt khuôn">Duyệt khuôn</ConfirmButton>
      <ConfirmButton danger name="decision" value="reject" className="btn-outline !border-red-300 !py-2 !text-danger" title="Loại khuôn này?" message="Toàn bộ biến thể sinh từ khuôn này sẽ bị gỡ khỏi học viên. Cần ghi lý do ở ô ghi chú bên cạnh." confirmText="Loại khuôn">Loại khuôn</ConfirmButton>
    </form>
  );
}
