import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Học bổng" };

export default async function Page() {
  const { data } = await adminDb().from("scholarships").select("*, schools(id, name)").eq("is_active", true).order("deadline", { nullsFirst: false });
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <PageHeader en="Scholarships" vi="Học bổng Trung Quốc">Các chương trình học bổng. Điều kiện và hạn nộp thay đổi theo năm, luôn đối chiếu thông báo chính thức.</PageHeader>
      <div className="mb-6 flex flex-wrap gap-2 text-sm"><Link href="/truong" className="inline-flex min-h-[2.75rem] items-center rounded-full border border-slate-200 px-4 font-semibold hover:border-brand hover:text-brand">Trường</Link><Link href="/hoc-bong" className="chip !min-h-[2.75rem] !px-4">Học bổng</Link></div>
      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((s) => {
          const school = s.schools as unknown as { id: string; name: string } | null;
          const expired = s.deadline && s.deadline < today;
          return (
            <article key={s.id} className="card card-hover">
              <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white"><Icon name="award" /></span>
                <div><h2 className="font-bold">{s.name}</h2><p className="text-sm text-slate-500">{s.provider}{school && <> · <Link href={`/truong/${school.id}`} className="text-brand hover:underline">{school.name}</Link></>}</p></div></div>
              <p className="mt-3 text-sm text-slate-700"><b>Quyền lợi:</b> {s.coverage}</p>
              {s.requirements && <p className="mt-1 text-sm text-slate-600"><b>Điều kiện:</b> {s.requirements}</p>}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className={expired ? "font-semibold text-slate-500" : "font-semibold text-brand"}>{s.deadline ? `${expired ? "Đã hết hạn" : "Hạn nộp"}: ${new Date(s.deadline).toLocaleDateString("vi-VN")}` : "Hạn nộp: theo thông báo"}</span>
                {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">Chi tiết ↗</a>}
              </div>
            </article>
          );
        })}
      </div>
      {!data?.length && <p className="py-10 text-center text-slate-500">Chưa có học bổng nào.</p>}
    </div>
  );
}
