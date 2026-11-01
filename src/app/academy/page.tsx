import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { vnd } from "@/lib/constants";

export default async function Page() {
  const { data } = await adminDb().from("courses").select("id, title, description, level, price_vnd, teachers(name), lessons(count)").eq("is_published", true).order("created_at", { ascending: false });
  return (
    <div>
      <PageHeader en="Academy" vi="Khóa học CSCA">Học theo bài bản với giáo viên: video, nội dung, quiz cuối bài và theo dõi tiến độ.</PageHeader>
      <div className="mb-6 flex flex-wrap gap-2 text-sm"><Link href="/academy" className="chip !px-4 !py-1.5">Khóa học</Link><Link href="/giao-vien" className="rounded-full border border-stone-200 px-4 py-1.5 font-semibold hover:border-brand hover:text-brand">Giáo viên</Link><Link href="/khoa-hoc-cua-toi" className="rounded-full border border-stone-200 px-4 py-1.5 font-semibold hover:border-brand hover:text-brand">Khóa học của tôi</Link></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((c) => {
          const t = c.teachers as unknown as { name: string } | null;
          const n = (c.lessons as unknown as { count: number }[])[0]?.count ?? 0;
          return (
            <Link key={c.id} href={`/academy/${c.id}`} className="card card-hover overflow-hidden !p-0">
              <div className="grid h-32 place-items-center bg-gradient-to-br from-brand to-brand-dark text-white"><Icon name="play" className="h-12 w-12 opacity-80" /></div>
              <div className="p-5">
                <div className="flex gap-1.5">{c.level && <span className="chip">{c.level}</span>}{c.price_vnd === 0 && <span className="chip !bg-emerald-50 !text-emerald-700">Miễn phí</span>}</div>
                <h2 className="mt-2 text-lg font-bold">{c.title}</h2><p className="mt-1 line-clamp-2 text-sm text-stone-600">{c.description}</p>
                <p className="mt-4 flex items-center justify-between text-sm text-stone-500"><span>{t?.name ?? "—"} · {n} bài</span><b className="text-ink">{vnd(c.price_vnd)}</b></p>
              </div>
            </Link>
          );
        })}
      </div>
      {!data?.length && <p className="py-10 text-center text-stone-500">Chưa có khóa học nào được công bố.</p>}
    </div>
  );
}
