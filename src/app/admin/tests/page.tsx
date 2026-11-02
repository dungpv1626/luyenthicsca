import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, vnd } from "@/lib/constants";
import { createTest, togglePublish } from "../actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin("tests");
  const { error } = await searchParams;
  const { data } = await adminDb().from("tests").select("id, title, duration_min, price_vnd, is_published, level, test_questions(count)").order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mock Test</h1>
      <form action={createTest} className="card max-w-xl space-y-3">
        <h2 className="font-bold">Tạo đề (random câu từ ngân hàng đã duyệt)</h2>
        {error && <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">Không đủ câu hỏi đã duyệt để tạo đề.</p>}
        <input name="title" placeholder="Tên đề" required className="input" />
        <input name="description" placeholder="Mô tả" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Thời gian (phút)</label><input type="number" name="duration_min" defaultValue={60} className="input" /></div>
          <div><label className="label">Giá (VNĐ, 0 = miễn phí)</label><input type="number" name="price_vnd" defaultValue={49000} className="input" /></div>
          {Object.entries(SUBJECTS).map(([k, v]) => <div key={k}><label className="label">Số câu – {v}</label><input type="number" name={`n_${k}`} defaultValue={10} className="input" /></div>)}
        </div>
        <button className="btn">Tạo đề (chưa publish)</button>
      </form>
      <div className="card divide-y p-0">
        {data?.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3 text-sm">
            <div className="flex-1"><p className="font-medium">{t.title}{(t as { level?: number | null }).level ? <span className="chip ml-2">Cấp {(t as { level?: number | null }).level}</span> : null}</p><p className="text-stone-500">{(t.test_questions as unknown as { count: number }[])[0]?.count ?? 0} câu · {t.duration_min} phút · {vnd(t.price_vnd)}</p></div>
            <form action={togglePublish.bind(null, t.id, !t.is_published)}><button className={t.is_published ? "text-amber-700 hover:underline" : "text-green-700 hover:underline"}>{t.is_published ? "Gỡ" : "Publish"}</button></form>
          </div>
        ))}
        {!data?.length && <p className="p-4 text-stone-500">Chưa có đề.</p>}
      </div>
    </div>
  );
}
