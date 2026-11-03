import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, vnd } from "@/lib/constants";
import { createTest, togglePublish } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const metadata = { title: "Đề thi – Quản trị" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin("tests");
  const { error } = await searchParams;
  const { data } = await adminDb().from("tests").select("id, title, duration_min, price_vnd, is_published, level, test_questions(count)").order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đề thi</h1>
      <form action={createTest} className="card max-w-xl space-y-3">
        <h2 className="font-bold">Tạo đề ngẫu nhiên</h2><p className="text-xs text-slate-500">Lấy ngẫu nhiên câu đang công bố theo số câu từng môn. Đề mới ở trạng thái ẩn cho tới khi bạn công bố. Muốn đề theo mức hoặc đề mô phỏng đúng khuôn thi thật, dùng mục “Bộ đề theo mức”.</p>
        {error && <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">Không đủ câu hỏi đã duyệt để tạo đề.</p>}
        <input name="title" aria-label="Tên đề" placeholder="Tên đề" required className="input" />
        <input name="description" aria-label="Mô tả" placeholder="Mô tả" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="a-duration-min">Thời gian (phút)</label><input id="a-duration-min" type="number" name="duration_min" defaultValue={60} className="input" /></div>
          <div><label className="label" htmlFor="a-price-vnd">Giá (VNĐ, 0 = miễn phí)</label><input id="a-price-vnd" type="number" name="price_vnd" defaultValue={49000} className="input" /></div>
          {Object.entries(SUBJECTS).map(([k, v]) => <div key={k}><label className="label" htmlFor={`a-n-${k}`}>Số câu – {v}</label><input id={`a-n-${k}`} type="number" name={`n_${k}`} defaultValue={10} className="input" /></div>)}
        </div>
        <button className="btn">Tạo đề (chưa publish)</button>
      </form>
      <div className="card divide-y p-0">
        {data?.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3 text-sm">
            <div className="flex-1"><p className="font-medium">{t.title}{(t as { level?: number | null }).level ? <span className="chip ml-2">Mức {(t as { level?: number | null }).level}</span> : null}</p><p className="text-slate-500">{(t.test_questions as unknown as { count: number }[])[0]?.count ?? 0} câu · {t.duration_min} phút · {vnd(t.price_vnd)}</p></div>
            <form action={togglePublish.bind(null, t.id, !t.is_published)}><ConfirmButton className={`inline-flex min-h-[2.5rem] items-center rounded-lg px-3 font-semibold ${t.is_published ? "text-amber-700 hover:bg-amber-50" : "text-green-700 hover:bg-green-50"}`} title={t.is_published ? "Gỡ đề khỏi học viên?" : "Công bố đề cho học viên?"} message={t.is_published ? `“${t.title}” sẽ biến mất khỏi trang Thi thử. Các bài học viên đã làm vẫn được giữ.` : `“${t.title}” (${vnd(t.price_vnd)}) sẽ hiện cho mọi học viên. Hãy chắc chắn nội dung đã được kiểm tra.`} confirmText={t.is_published ? "Gỡ đề" : "Công bố"}>{t.is_published ? "Gỡ" : "Công bố"}</ConfirmButton></form>
          </div>
        ))}
        {!data?.length && <p className="p-4 text-slate-500">Chưa có đề.</p>}
      </div>
    </div>
  );
}
