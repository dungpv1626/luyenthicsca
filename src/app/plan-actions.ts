"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { createAttempt, pickQuestions, wrongQuestionIds } from "@/lib/exam";
import { getSkillProfile } from "@/lib/skills";
import { availableTopics, expandTasks, generatePlan, todayVN } from "@/lib/plan";
import { QUICK_TEST, SUBJECT_KEYS, type Subject } from "@/lib/constants";

const clamp = (v: unknown, min: number, max: number, d: number) => Math.min(max, Math.max(min, Math.round(Number(v)) || d));

export async function createPlanAction(fd: FormData) {
  const me = await requireMe("/lo-trinh");
  const db = adminDb();
  const weeks = [4, 12, 24].includes(Number(fd.get("weeks"))) ? Number(fd.get("weeks")) : 4;
  const minutes = clamp(fd.get("minutes"), 15, 240, 60);
  const target = clamp(fd.get("target"), 40, 100, 80);
  const goal = String(fd.get("goal") ?? "").trim().slice(0, 200);
  const examDate = String(fd.get("exam_date") ?? "") || null;

  const [skills, topics] = await Promise.all([getSkillProfile(me.id), availableTopics()]);
  const plan = await generatePlan({ goal, target, weeks, minutes, examDate, skills, topics });
  const start = todayVN();
  const tasks = expandTasks(plan, start);
  if (!tasks.length) redirect("/lo-trinh?error=empty");

  await db.from("study_plans").update({ active: false }).eq("user_id", me.id).eq("active", true);
  const { data: row, error } = await db.from("study_plans").insert({
    user_id: me.id, goal, target_readiness: target, weeks, minutes_per_day: minutes,
    summary: plan.summary, source: plan.source, start_date: start,
  }).select("id").single();
  if (error) throw new Error(error.message);
  const { error: e2 } = await db.from("plan_tasks").insert(tasks.map((t) => ({ ...t, plan_id: row.id, user_id: me.id })));
  if (e2) throw new Error(e2.message);
  if (examDate) await db.from("profiles").update({ exam_date: examDate }).eq("id", me.id);
  revalidatePath("/lo-trinh");
  redirect("/lo-trinh");
}

export async function toggleTaskAction(taskId: string, done: boolean) {
  const me = await requireMe("/lo-trinh");
  await adminDb().from("plan_tasks").update({ done_at: done ? new Date().toISOString() : null }).eq("id", taskId).eq("user_id", me.id);
  revalidatePath("/lo-trinh"); revalidatePath("/dashboard");
}

export async function endPlanAction() {
  const me = await requireMe("/lo-trinh");
  await adminDb().from("study_plans").update({ active: false }).eq("user_id", me.id).eq("active", true);
  revalidatePath("/lo-trinh"); revalidatePath("/dashboard");
}

/** Bắt đầu làm nhiệm vụ: tạo bài thi gắn với nhiệm vụ; nộp bài xong thì nhiệm vụ tự hoàn thành. */
export async function startTaskAction(taskId: string) {
  const me = await requireMe("/lo-trinh");
  const db = adminDb();
  const { data: t } = await db.from("plan_tasks").select("*").eq("id", taskId).eq("user_id", me.id).single();
  if (!t) redirect("/lo-trinh");

  const { data: open } = await db.from("attempts").select("id, started_at, duration_sec").eq("plan_task_id", taskId).is("submitted_at", null).order("started_at", { ascending: false }).limit(1);
  if (open?.[0] && Date.now() < new Date(open[0].started_at).getTime() + open[0].duration_sec * 1000) redirect(`/thi/${open[0].id}`);

  const subject = SUBJECT_KEYS.includes(t.subject as Subject) ? (t.subject as Subject) : undefined;
  let ids: string[] = [];
  let kind: "practice" | "quick" = "practice";
  let minutes = Math.max(5, Math.round(t.question_count * 1.5));
  if (t.kind === "review") {
    ids = (await wrongQuestionIds(me.id)).slice(0, t.question_count);
    if (!ids.length) ids = await pickQuestions({ count: t.question_count });
  } else if (t.kind === "mock") {
    kind = "quick"; minutes = QUICK_TEST.minutes;
    ids = await pickQuestions({ count: QUICK_TEST.questions });
  } else if (t.kind === "mini_test") {
    ids = await pickQuestions({ count: t.question_count });
  } else {
    ids = await pickQuestions({ subjects: subject ? [subject] : undefined, topic: t.topic ?? undefined, count: t.question_count });
    if (!ids.length && t.topic) ids = await pickQuestions({ subjects: subject ? [subject] : undefined, count: t.question_count });
  }
  if (!ids.length) redirect("/lo-trinh?error=noquestions");
  const id = await createAttempt({ userId: me.id, kind, title: t.title, questionIds: ids, durationSec: minutes * 60, planTaskId: taskId });
  redirect(`/thi/${id}`);
}
