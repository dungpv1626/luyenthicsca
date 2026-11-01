import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { vnd } from "@/lib/constants";

export default async function Page() {
  const supabase = await createClient();
  const { data: tests } = await supabase.from("tests").select("id, title, description, duration_min, price_vnd").eq("is_published", true).order("price_vnd");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Thi thử CSCA</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-brand">
          <h2 className="text-lg font-bold">Quick Test <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Miễn phí</span></h2>
          <p className="mt-1 text-sm text-stone-600">20 câu · 15 phút · AI phân tích ngay.</p>
          <Link href="/quick-test" className="btn mt-4">Làm ngay</Link>
        </div>
        {(tests ?? []).map((t) => (
          <div key={t.id} className="card">
            <h2 className="text-lg font-bold">{t.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{t.description}</p>
            <p className="mt-2 text-sm text-stone-500">{t.duration_min} phút · <b className="text-ink">{vnd(t.price_vnd)}</b></p>
            <Link href={`/thi-thu/${t.id}`} className="btn-outline mt-4">Xem đề</Link>
          </div>
        ))}
      </div>
      {!tests?.length && <p className="text-stone-500">Chưa có đề thi thử nào được công bố.</p>}
    </div>
  );
}
