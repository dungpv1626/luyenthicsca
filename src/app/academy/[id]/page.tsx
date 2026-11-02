import { notFound } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { getMe } from "@/lib/auth";
import { canAccessCourse } from "@/lib/access";
import { vnd } from "@/lib/constants";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { buyCourseAction } from "../../academy-actions";

export const metadata = { title: "Khóa học" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = adminDb();
  const { data: c } = await db.from("courses").select("*, teachers(name, title, bio)").eq("id", id).eq("is_published", true).maybeSingle();
  if (!c) notFound();
  const { data: lessons } = await db.from("lessons").select("id, title, position, is_free_preview").eq("course_id", id).order("position");
  const me = await getMe();
  const access = await canAccessCourse(me?.id, c);
  const { data: prog } = me ? await db.from("lesson_progress").select("lesson_id").eq("user_id", me.id).in("lesson_id", (lessons ?? []).map((l) => l.id)) : { data: [] };
  const doneSet = new Set((prog ?? []).map((p) => p.lesson_id));
  const t = c.teachers as unknown as { name: string; title: string; bio: string } | null;
  const total = lessons?.length ?? 0;
  const pct = total ? Math.round((doneSet.size / total) * 100) : 0;
  const first = lessons?.find((l) => !doneSet.has(l.id)) ?? lessons?.[0];

  return (
    <div className="space-y-6">
      <PageHeader en={c.title} vi={c.level ?? "Khóa học"}>{c.description}</PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card !p-0">
          <h2 className="border-b border-slate-100 p-5 font-bold">Nội dung ({total} bài)</h2>
          <ol className="divide-y divide-slate-100">
            {(lessons ?? []).map((l, i) => {
              const open = access || l.is_free_preview;
              return (
                <li key={l.id}>
                  {open ? (
                    <Link href={`/academy/${id}/hoc/${l.id}`} className="flex items-center gap-3 p-4 hover:bg-brand-soft/50">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${doneSet.has(l.id) ? "bg-emerald-500 text-white" : "bg-brand-soft text-brand"}`}>{doneSet.has(l.id) ? <Icon name="check" className="h-4 w-4" /> : i + 1}</span>
                      <span className="flex-1 font-medium">{l.title}</span>{!access && <span className="chip">Học thử</span>}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-4 text-slate-400"><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100"><Icon name="lock" className="h-4 w-4" /></span><span className="flex-1">{l.title}</span></div>
                  )}
                </li>
              );
            })}
          </ol>
          {!total && <p className="p-5 text-sm text-slate-500">Khóa học đang được cập nhật bài giảng.</p>}
        </section>
        <aside className="space-y-4">
          <div className="card">
            <p className="text-3xl font-black text-brand">{vnd(c.price_vnd)}</p>
            {access && me ? (<>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div><p className="mt-1 text-xs text-slate-500">Tiến độ {pct}% ({doneSet.size}/{total})</p>
              {first && <Link href={`/academy/${id}/hoc/${first.id}`} className="btn mt-4 w-full">{doneSet.size ? "Tiếp tục học" : "Bắt đầu học"}</Link>}
            </>) : me ? (
              <form action={buyCourseAction.bind(null, id)}><button className="btn mt-4 w-full">Đăng ký khóa học</button></form>
            ) : <Link href={`/dang-nhap?next=/academy/${id}`} className="btn mt-4 w-full">Đăng nhập để đăng ký</Link>}
          </div>
          {t && <div className="card"><p className="eyebrow">Giáo viên</p><p className="mt-1 font-bold">{t.name}</p><p className="text-sm text-brand">{t.title}</p><p className="mt-2 text-sm text-slate-600">{t.bio}</p></div>}
        </aside>
      </div>
    </div>
  );
}
