import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { QUICK_TEST, vnd } from "@/lib/constants";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";

export default async function Page() {
  const { data: tests } = await adminDb().from("tests").select("id, title, description, duration_min, price_vnd").eq("is_published", true).order("price_vnd");
  return (
    <div>
      <PageHeader en="Mock Test" vi="Thi thử CSCA">Mô phỏng kỳ thi thật: tính giờ, chấm điểm tự động, báo cáo AI sau khi nộp.</PageHeader>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="card card-hover !border-brand/30 bg-gradient-to-br from-brand-soft to-white">
          <span className="chip">MIỄN PHÍ</span><h2 className="mt-3 text-lg font-bold">Quick Test</h2><p className="mt-1 text-sm text-stone-600">{QUICK_TEST.questions} câu · {QUICK_TEST.minutes} phút · AI phân tích ngay.</p>
          <Link href="/quick-test" className="btn mt-5">Làm ngay</Link>
        </div>
        {(tests ?? []).map((t) => (
          <div key={t.id} className="card card-hover">
            <span className="chip">{t.price_vnd ? "HOT" : "MIỄN PHÍ"}</span><h2 className="mt-3 text-lg font-bold">{t.title}</h2><p className="mt-1 text-sm text-stone-600">{t.description}</p>
            <p className="mt-3 flex items-center justify-between text-sm"><span className="flex items-center gap-1 text-stone-500"><Icon name="clock" className="h-4 w-4" />{t.duration_min} phút</span><b>{vnd(t.price_vnd)}</b></p>
            <Link href={`/thi-thu/${t.id}`} className="btn-outline mt-4">Xem đề</Link>
          </div>
        ))}
      </div>
      {!tests?.length && <p className="mt-6 text-stone-500">Chưa có đề thi thử nào được công bố.</p>}
    </div>
  );
}
