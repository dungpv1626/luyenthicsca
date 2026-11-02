import { adminDb } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/Section";

export default async function Page() {
  const { data } = await adminDb().from("teachers").select("*").order("created_at");
  return (
    <div>
      <PageHeader en="Teachers" vi="Đội ngũ giáo viên" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((t) => (
          <div key={t.id} className="card text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand text-3xl font-black text-white">{t.name.slice(0, 1)}</span><h2 className="mt-3 font-bold">{t.name}</h2><p className="text-sm font-semibold text-brand">{t.title}</p><p className="mt-2 text-sm text-slate-600">{t.bio}</p></div>
        ))}
      </div>
    </div>
  );
}
