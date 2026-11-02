import { notFound, redirect } from "next/navigation";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { ExamRunner } from "@/components/ExamRunner";

export const metadata = { title: "Đang làm bài" };

export default async function Page({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const me = await requireMe(`/thi/${attemptId}`);
  const db = adminDb();
  const { data: att } = await db.from("attempts").select("*").eq("id", attemptId).eq("user_id", me.id).single();
  if (!att) notFound();
  if (att.submitted_at) redirect(`/ket-qua/${attemptId}`);

  // KHÔNG gửi đáp án đúng xuống trình duyệt.
  const { data: qs } = await db.from("questions").select("id, subject, topic, body, options, translations").in("id", att.question_ids);
  const byId = new Map((qs ?? []).map((q) => [q.id, q]));
  type Tr = Record<string, { body: string; options: Record<string, string> }>;
  const questions = ((att.question_ids as string[]).map((id) => byId.get(id)).filter(Boolean) as { id: string; subject: string; topic: string; body: string; options: Record<string, string>; translations: Record<string, { body: string; options: Record<string, string>; explanation?: string }> }[]).map((q) => ({
    id: q.id, subject: q.subject, topic: q.topic, body: q.body, options: q.options,
    // chỉ lấy body/options của bản dịch; không gửi explanation xuống trình duyệt khi đang thi
    tr: Object.fromEntries(Object.entries(q.translations ?? {}).map(([k, v]) => [k, { body: v.body, options: v.options }])) as Tr,
  }));
  const deadline = new Date(att.started_at).getTime() + att.duration_sec * 1000;

  return <ExamRunner attemptId={attemptId} title={att.title} questions={questions} deadline={deadline} draft={(att.answers ?? {}) as Record<string, string>} draftSpent={(att.time_spent ?? {}) as Record<string, number>} />;
}
