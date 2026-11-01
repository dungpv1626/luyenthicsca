import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/Section";

export default async function Page() {
  const me = await requireMe("/khoa-hoc-cua-toi");
  const db = adminDb();
  const [{ data: paid }, { data: free }, { data: prog }] = await Promise.all([
    db.from("orders").select("course_id").eq("user_id", me.id).eq("status", "paid").not("course_id", "is", null),
    db.from("courses").select("id").eq("is_published", true).eq("price_vnd", 0),
    db.from("lesson_progress").select("lesson_id, lessons(course_id)").eq("user_id", me.id),
  ]);
  const progressed = new Set((prog ?? []).map((p) => (p.lessons as unknown as { course_id: string } | null)?.course_id).filter(Boolean) as string[]);
  const ids = [...new Set([...(paid ?? []).map((o) => o.course_id as string), ...progressed, ...(free ?? []).map((c) => c.id)])];
  const { data: courses } = ids.length ? await db.from("courses").select("id, title, level, lessons(id)").in("id", ids).eq("is_published", true) : { data: [] };
  const doneIds = new Set((prog ?? []).map((p) => p.lesson_id));
  return (
    <div>
      <PageHeader en="My Courses" vi="Khóa học của tôi" />
      <div className="grid gap-4 sm:grid-cols-2">
        {(courses ?? []).map((c) => {
          const ls = c.lessons as unknown as { id: string }[];
          const d = ls.filter((l) => doneIds.has(l.id)).length;
          const pct = ls.length ? Math.round((d / ls.length) * 100) : 0;
          return <Link key={c.id} href={`/academy/${c.id}`} className="card card-hover"><span className="chip">{c.level ?? "Khóa học"}</span><h2 className="mt-2 font-bold">{c.title}</h2><div className="mt-3 h-2.5 rounded-full bg-stone-100"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div><p className="mt-1 text-xs text-stone-500">{d}/{ls.length} bài · {pct}%</p></Link>;
        })}
      </div>
      {!courses?.length && <div className="card text-center"><p>Bạn chưa có khóa học nào.</p><Link href="/academy" className="btn mt-4">Xem khóa học</Link></div>}
    </div>
  );
}
