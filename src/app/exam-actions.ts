"use server";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { canAccessTest, createAttempt, pickQuestions, startQuickTest, submitAttempt, wrongQuestionIds } from "@/lib/exam";
import { SUBJECT_KEYS, type Difficulty, type Subject } from "@/lib/constants";

export async function startQuickTestAction() {
  const me = await requireMe("/quick-test");
  let id: string;
  try {
    id = await startQuickTest(me.id);
  } catch {
    redirect("/quick-test?error=empty");
  }
  redirect(`/thi/${id}`);
}

export async function startPracticeAction(fd: FormData) {
  const me = await requireMe("/luyen-tap");
  const subject = String(fd.get("subject") ?? "");
  const difficulty = String(fd.get("difficulty") ?? "");
  const topic = String(fd.get("topic") ?? "").trim();
  const mod = String(fd.get("module") ?? "").trim();
  const count = Math.min(50, Math.max(5, Number(fd.get("count")) || 10));
  const wrongMode = fd.get("mode") === "wrong";
  const ids = wrongMode
    ? (await wrongQuestionIds(me.id)).slice(0, count)
    : await pickQuestions({
        subjects: SUBJECT_KEYS.includes(subject as Subject) ? [subject as Subject] : undefined,
        difficulty: ["easy", "medium", "hard"].includes(difficulty) ? (difficulty as Difficulty) : undefined,
        topic: topic || undefined,
        module: /^[a-z_]{2,20}$/.test(mod) ? mod : undefined,
        count,
      });
  if (!ids.length) redirect("/luyen-tap?error=empty");
  const id = await createAttempt({ userId: me.id, kind: "practice", title: wrongMode ? "Luyện lại câu đã sai" : "Luyện tập", questionIds: ids, durationSec: ids.length * 90 });
  redirect(`/thi/${id}`);
}

/** Làm đề thi thử: kiểm tra quyền → tiếp tục bài đang dở hoặc tạo bài mới. */
export async function startMockAction(testId: string) {
  const me = await requireMe(`/thi-thu/${testId}`);
  const db = adminDb();
  const { data: test } = await db.from("tests").select("*").eq("id", testId).eq("is_published", true).single();
  if (!test) redirect("/thi-thu");
  if (!(await canAccessTest(me.id, test))) redirect(`/thi-thu/${testId}`);

  const { data: open } = await db.from("attempts").select("id, started_at, duration_sec").eq("user_id", me.id).eq("test_id", testId).is("submitted_at", null).order("started_at", { ascending: false }).limit(1);
  if (open?.[0] && Date.now() < new Date(open[0].started_at).getTime() + open[0].duration_sec * 1000) redirect(`/thi/${open[0].id}`);

  const { data: tq } = await db.from("test_questions").select("question_id").eq("test_id", testId).order("position");
  const all = (tq ?? []).map((r) => r.question_id);
  // bỏ qua câu đã bị gỡ/loại sau khi đề được dựng
  const { data: live } = all.length ? await db.from("questions").select("id").in("id", all).eq("status", "approved") : { data: [] as { id: string }[] };
  const liveSet = new Set((live ?? []).map((q) => q.id));
  const ids = all.filter((id) => liveSet.has(id));
  if (!ids.length) redirect(`/thi-thu/${testId}`);
  const id = await createAttempt({ userId: me.id, kind: test.kind, title: test.title, questionIds: ids, durationSec: test.duration_min * 60, testId });
  redirect(`/thi/${id}`);
}

export async function submitExamAction(attemptId: string, answers: Record<string, string>, timeSpent: Record<string, number>) {
  const me = await requireMe();
  await submitAttempt(attemptId, me.id, answers, timeSpent);
  redirect(`/ket-qua/${attemptId}`);
}

/** Lưu nháp đáp án khi đang làm (để tiếp tục ở thiết bị khác / sau khi tải lại). Không chấm điểm. */
export async function saveDraftAction(attemptId: string, answers: Record<string, string>, timeSpent: Record<string, number>) {
  const me = await requireMe();
  const db = adminDb();
  const { data: att } = await db.from("attempts").select("question_ids, started_at, duration_sec, submitted_at").eq("id", attemptId).eq("user_id", me.id).single();
  if (!att || att.submitted_at) return;
  if ((Date.now() - new Date(att.started_at).getTime()) / 1000 > att.duration_sec + 60) return; // quá hạn: bỏ qua
  const ids = new Set(att.question_ids as string[]);
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(answers ?? {})) if (ids.has(k) && ["A", "B", "C", "D"].includes(v)) clean[k] = v;
  const spent: Record<string, number> = {};
  for (const [k, v] of Object.entries(timeSpent ?? {})) if (ids.has(k) && Number.isFinite(v)) spent[k] = Math.min(3600, Math.max(0, Math.round(v)));
  await db.from("attempts").update({ answers: clean, time_spent: spent }).eq("id", attemptId).is("submitted_at", null);
}
