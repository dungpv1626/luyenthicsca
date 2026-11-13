import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { getMe } from "@/lib/auth";
import { canAccessCourse, embedUrl } from "@/lib/access";
import { Icon } from "@/components/Icon";
import { startPracticeAction } from "../../../../exam-actions";
import { toggleLessonAction } from "../../../../academy-actions";

export const metadata = { title: "Bài học" };

export default async function Page({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  if (![id, lessonId].every((x) => /^[0-9a-f-]{36}$/.test(x))) notFound();
  const db = adminDb();
  const { data: c } = await db.from("courses").select("id, title, price_vnd").eq("id", id).eq("is_published", true).maybeSingle();
  if (!c) notFound();
  const { data: lessons } = await db.from("lessons").select("*").eq("course_id", id).order("position");
  const idx = (lessons ?? []).findIndex((l) => l.id === lessonId);
  if (idx < 0) notFound();
  const l = lessons![idx];
  const me = await getMe();
  if (!l.is_free_preview && !(await canAccessCourse(me?.id, c))) redirect(`/academy/${id}`);
  const { data: p } = me ? await db.from("lesson_progress").select("lesson_id").eq("user_id", me.id).eq("lesson_id", lessonId).maybeSingle() : { data: null };
  const done = !!p;
  const video = embedUrl(l.video_url);
  const prev = lessons![idx - 1], next = lessons![idx + 1];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <article className="space-y-5">
        <Link href={`/academy/${id}`} className="text-sm font-semibold text-brand hover:underline">← {c.title}</Link>
        <h1 className="work-title">{l.title}</h1>
        {video ? <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-soft"><iframe src={video} title={l.title} className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
          : l.video_url ? <a href={l.video_url} target="_blank" rel="noopener noreferrer" className="btn-outline"><Icon name="play" className="h-4 w-4" />Xem video</a> : null}
        {l.content && <div className="card whitespace-pre-wrap leading-relaxed text-slate-800">{l.content}</div>}
        {l.practice_subject && (
          <form action={startPracticeAction} className="card flex flex-wrap items-center gap-3 !border-brand/30 bg-brand-soft/40">
            <input type="hidden" name="subject" value={l.practice_subject} /><input type="hidden" name="topic" value={l.practice_topic ?? ""} /><input type="hidden" name="count" value="10" />
            <div className="flex-1"><p className="font-bold">Quiz cuối bài</p><p className="text-sm text-slate-600">10 câu về {l.practice_topic ?? "chủ đề của bài"}.</p></div>
            <button className="btn">Làm quiz</button>
          </form>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">{prev && <Link href={`/academy/${id}/hoc/${prev.id}`} className="btn-outline">← Bài trước</Link>}{next && <Link href={`/academy/${id}/hoc/${next.id}`} className="btn-outline">Bài sau →</Link>}</div>
          {me && <form action={toggleLessonAction.bind(null, lessonId, id, !done)}><button className={done ? "btn-outline" : "btn"}>{done ? "✓ Đã hoàn thành (bỏ đánh dấu)" : "Đánh dấu hoàn thành"}</button></form>}
        </div>
      </article>
      <aside className="card h-fit"><h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">Bài học</h2><ol className="space-y-1">{lessons!.map((x, i) => <li key={x.id}><Link href={`/academy/${id}/hoc/${x.id}`} className={`block rounded-lg px-3 py-2 text-sm ${x.id === lessonId ? "bg-brand text-white" : "hover:bg-brand-soft"}`}>{i + 1}. {x.title}</Link></li>)}</ol></aside>
    </div>
  );
}
