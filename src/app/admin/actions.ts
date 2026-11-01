"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { markOrderPaid } from "@/lib/orders";
import { pickQuestions } from "@/lib/exam";
import { SUBJECT_KEYS, ROLES, type Role, type Subject } from "@/lib/constants";

const pick = <T extends string>(v: FormDataEntryValue | null, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);

export async function saveQuestion(id: string | null, fd: FormData) {
  const me = await requireAdmin("questions");
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  let status = pick(fd.get("status"), ["draft", "review", "approved"] as const, "draft");
  if (status === "approved" && !canApprove) status = "review"; // chỉ người review mới được duyệt

  const row = {
    subject: pick(fd.get("subject"), SUBJECT_KEYS, "math"),
    topic: String(fd.get("topic") ?? "").trim(),
    difficulty: pick(fd.get("difficulty"), ["easy", "medium", "hard"] as const, "medium"),
    language: pick(fd.get("language"), ["vi", "en", "zh"] as const, "vi"),
    body: String(fd.get("body") ?? "").trim(),
    options: Object.fromEntries((["A", "B", "C", "D"] as const).map((k) => [k, String(fd.get(`opt_${k}`) ?? "").trim()])),
    correct_answer: pick(fd.get("correct_answer"), ["A", "B", "C", "D"] as const, "A"),
    explanation: String(fd.get("explanation") ?? "").trim(),
    skill: String(fd.get("skill") ?? "").trim() || null,
    est_time_sec: Math.max(10, Number(fd.get("est_time_sec")) || 60),
    source: String(fd.get("source") ?? "").trim() || null,
    status,
    reviewer: status === "approved" ? me.id : null,
  };
  if (!row.topic || !row.body || Object.values(row.options).some((o) => !o)) redirect(`/admin/questions/${id ?? "new"}?error=1`);

  const db = adminDb();
  const { error } = id ? await db.from("questions").update(row).eq("id", id) : await db.from("questions").insert(row);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function setQuestionStatus(id: string, status: "draft" | "review" | "approved") {
  const me = await requireAdmin("questions");
  if (status === "approved" && me.role !== "super_admin" && me.role !== "academic_reviewer") return;
  await adminDb().from("questions").update({ status, reviewer: status === "approved" ? me.id : null }).eq("id", id);
  revalidatePath("/admin/questions");
}

export async function createTest(fd: FormData) {
  await requireAdmin("tests");
  const db = adminDb();
  const perSubject = Object.fromEntries(SUBJECT_KEYS.map((s) => [s, Math.max(0, Math.min(100, Number(fd.get(`n_${s}`)) || 0))])) as Record<Subject, number>;
  const ids: string[] = [];
  for (const s of SUBJECT_KEYS) if (perSubject[s]) ids.push(...(await pickQuestions({ subjects: [s], count: perSubject[s] })));
  if (!ids.length) redirect("/admin/tests?error=empty");

  const { data: t, error } = await db.from("tests").insert({
    title: String(fd.get("title") ?? "").trim() || "Mock Test",
    description: String(fd.get("description") ?? "").trim(),
    kind: "mock",
    duration_min: Math.max(5, Number(fd.get("duration_min")) || 60),
    price_vnd: Math.max(0, Number(fd.get("price_vnd")) || 0),
  }).select("id").single();
  if (error) throw new Error(error.message);
  await db.from("test_questions").insert(ids.map((question_id, i) => ({ test_id: t.id, question_id, position: i })));
  revalidatePath("/admin/tests");
}

export async function togglePublish(id: string, publish: boolean) {
  await requireAdmin("tests");
  await adminDb().from("tests").update({ is_published: publish }).eq("id", id);
  revalidatePath("/admin/tests");
}

export async function confirmOrder(id: string) {
  await requireAdmin("orders");
  await markOrderPaid({ id });
  revalidatePath("/admin/orders");
}

export async function setOrderStatus(id: string, status: "cancelled" | "refunded") {
  await requireAdmin("orders");
  await adminDb().from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
}

export async function setUserRole(userId: string, fd: FormData) {
  const me = await requireAdmin("users");
  if (me.role !== "super_admin") return; // chỉ Super Admin đổi vai trò
  const role = pick(fd.get("role"), Object.keys(ROLES) as Role[], "student");
  if (userId === me.id) return; // tránh tự hạ quyền
  await adminDb().from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}
