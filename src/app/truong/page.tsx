import Link from "next/link";
import { SchoolPhoto } from "@/components/SchoolPhoto";
import { adminDb } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Trường đại học" };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; major?: string; csca?: string; consult?: string }> }) {
  const { q, city, major, csca } = await searchParams;
  const { data } = await adminDb().from("schools").select("*").order("name");
  const all = data ?? [];
  const cities = [...new Set(all.map((s) => s.city).filter(Boolean))] as string[];
  const list = all.filter((s) =>
    (!q || `${s.name} ${s.name_zh ?? ""}`.toLowerCase().includes(q.toLowerCase())) &&
    (!city || s.city === city) &&
    (!major || (s.majors as string[]).some((m) => m.toLowerCase().includes(major.toLowerCase()))) &&
    (!csca || s.csca_required));
  const reqCount = (s: (typeof all)[number]) => [s.req_math, s.req_physics, s.req_chemistry, s.req_chinese].filter((v) => v !== null).length;

  return (
    <div>
      <PageHeader en="Universities" vi="Trường & học bổng">Tìm trường theo thành phố, ngành, yêu cầu CSCA; so sánh tối đa 3 trường và đăng ký tư vấn.</PageHeader>
      <div className="mb-6 flex flex-wrap gap-2 text-sm"><Link href="/truong" className="chip !min-h-[2.75rem] !px-4">Trường</Link><Link href="/hoc-bong" className="inline-flex min-h-[2.75rem] items-center rounded-full border border-slate-200 px-4 font-semibold hover:border-brand hover:text-brand-text">Học bổng</Link></div>
      <form method="get" className="card mb-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto_auto]">
        <input name="q" defaultValue={q} placeholder="Tìm tên trường…" className="input" />
        <select name="city" defaultValue={city ?? ""} className="input"><option value="">Mọi thành phố</option>{cities.map((c) => <option key={c}>{c}</option>)}</select>
        <input name="major" defaultValue={major} placeholder="Ngành học" className="input" />
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="csca" value="1" defaultChecked={!!csca} />Yêu cầu CSCA</label>
        <button className="btn">Lọc</button>
      </form>

      <form action="/truong/so-sanh" method="get">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <div key={s.id} className="card card-hover group relative flex flex-col overflow-hidden">
              {s.image_url && <div className="-mx-5 -mt-5 mb-4"><SchoolPhoto url={s.image_url} credit={s.image_credit} alt={s.name} className="h-36" /></div>}
              <label className="absolute right-2 top-2 flex min-h-[2.75rem] cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted hover:bg-brand-soft"><input type="checkbox" name="ids" value={s.id} />So sánh</label>
              <p className="text-3xl font-black text-brand/25">{s.name_zh}</p>
              <Link href={`/truong/${s.id}`} className="mt-1 inline-block py-1 text-lg font-bold hover:text-brand-text">{s.name}</Link>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted"><Icon name="map" className="h-4 w-4" />{s.city}{s.kind ? ` · ${s.kind}` : ""}</p>
              <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600">{s.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{s.csca_required && <span className="chip">Yêu cầu CSCA</span>}{reqCount(s) > 0 ? <span className="chip !bg-success-bg !text-success">Có mức chuẩn</span> : <span className="chip !bg-slate-100 !text-muted">Đang cập nhật</span>}</div>
            </div>
          ))}
        </div>
        {!list.length && <p className="py-10 text-center text-muted">Không tìm thấy trường phù hợp.</p>}
        {list.length > 1 && <div className="sticky bottom-20 mt-6 flex justify-center lg:bottom-4"><button className="btn !px-6">So sánh các trường đã chọn (tối đa 3)</button></div>}
      </form>
    </div>
  );
}
