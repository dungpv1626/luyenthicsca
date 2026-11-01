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
    translations: Object.fromEntries((["en", "zh"] as const).flatMap((lg) => {
      const body = String(fd.get(`tr_${lg}_body`) ?? "").trim();
      if (!body) return [];
      return [[lg, {
        body,
        options: Object.fromEntries((["A", "B", "C", "D"] as const).map((k) => [k, String(fd.get(`tr_${lg}_opt_${k}`) ?? "").trim()])),
        explanation: String(fd.get(`tr_${lg}_explanation`) ?? "").trim(),
      }]];
    })),
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

// ===== CRUD dùng chung cho Phase 2 (trường, học bổng, giáo viên, khóa học, bài giảng) =====
import { RESOURCES } from "@/lib/admin-resources";

export async function saveResource(key: string, id: string | null, fd: FormData) {
  const res = RESOURCES[key];
  if (!res) throw new Error("Resource không hợp lệ");
  await requireAdmin(res.area);
  const row: Record<string, unknown> = {};
  for (const f of res.fields) {
    const raw = fd.get(f.name);
    const str = typeof raw === "string" ? raw.trim() : "";
    switch (f.type) {
      case "checkbox": row[f.name] = raw === "on"; break;
      case "number": row[f.name] = str === "" ? (f.nullable ? null : 0) : Math.min(f.max ?? 1e9, Math.max(f.min ?? -1e9, Math.round(Number(str)) || 0)); break;
      case "tags": row[f.name] = str.split(",").map((t) => t.trim()).filter(Boolean); break;
      case "date": row[f.name] = /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null; break;
      case "ref": row[f.name] = /^[0-9a-f-]{36}$/.test(str) ? str : null; break;
      case "select": row[f.name] = f.options && str in f.options && str !== "" ? str : null; break;
      default: row[f.name] = str === "" ? (f.nullable ? null : "") : str;
    }
    if (f.required && (row[f.name] === null || row[f.name] === "")) redirect(`/admin/data/${key}/${id ?? "new"}?error=1`);
  }
  const db = adminDb();
  const { error } = id ? await db.from(res.table).update(row).eq("id", id) : await db.from(res.table).insert(row);
  if (error) redirect(`/admin/data/${key}/${id ?? "new"}?error=1`);
  revalidatePath(`/admin/data/${key}`);
  redirect(`/admin/data/${key}`);
}

export async function deleteResource(key: string, id: string) {
  const res = RESOURCES[key];
  if (!res) return;
  await requireAdmin(res.area);
  await adminDb().from(res.table).delete().eq("id", id);
  revalidatePath(`/admin/data/${key}`);
  redirect(`/admin/data/${key}`);
}

export async function setLeadStatus(id: string, status: "new" | "contacted" | "closed") {
  await requireAdmin("leads");
  await adminDb().from("consultations").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}

// ===== Duyệt câu hỏi (giáo viên) =====
export async function reviewQuestionAction(id: string, next: string, fd: FormData) {
  const me = await requireAdmin("questions");
  const decision = String(fd.get("decision"));
  const note = String(fd.get("note") ?? "").trim().slice(0, 500);
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  const db = adminDb();
  if (decision === "approve" && canApprove) {
    await db.from("questions").update({ status: "approved", reviewer: me.id, review_note: note || null, reviewed_at: new Date().toISOString() }).eq("id", id).eq("status", "review");
  } else if (decision === "reject") {
    if (!note) redirect(`${next}${next.includes("?") ? "&" : "?"}need_note=1`);
    await db.from("questions").update({ status: "rejected", reviewer: me.id, review_note: note, reviewed_at: new Date().toISOString() }).eq("id", id).in("status", ["review", "draft"]);
  }
  revalidatePath("/admin/review");
  redirect(next.startsWith("/admin/review") ? next : "/admin/review");
}
