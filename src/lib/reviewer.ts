import { adminDb } from "@/lib/supabase/admin";
import { SUBJECT_KEYS } from "@/lib/constants";
import { TEMPLATES } from "@/lib/templates/index.ts";
import { lotKey, lotState, type LotState } from "@/lib/batch-sample";

/** Các môn được gán cho giáo viên duyệt. Rỗng = chưa gán = được duyệt mọi môn. Chịu được việc cột chưa tồn tại. */
export async function reviewSubjectsOf(userId: string): Promise<string[]> {
  const { data, error } = await adminDb().from("profiles").select("review_subjects").eq("id", userId).single();
  if (error || !data) return [];
  return ((data.review_subjects as string[] | null) ?? []).filter((s) => (SUBJECT_KEYS as readonly string[]).includes(s));
}

/** Phạm vi môn khi làm việc với câu hỏi/khuôn: giáo viên đã được gán môn chỉ thấy các môn đó; null = không giới hạn. */
export async function subjectScope(me: { id: string; role: string }): Promise<string[] | null> {
  if (me.role !== "academic_reviewer") return null;
  const s = await reviewSubjectsOf(me.id);
  return s.length ? s : null;
}
export const inScope = (scope: string[] | null, subject: string) => !scope || scope.includes(subject);

/** Số khuôn chờ duyệt trong phạm vi môn (khuôn chưa có quyết định cũng tính là chờ duyệt, giống trang Khuôn câu hỏi). */
export async function pendingTemplateCount(scope: string[] | null) {
  const { data } = await adminDb().from("template_reviews").select("template_key, status");
  const done = new Set((data ?? []).filter((r) => r.status !== "pending").map((r) => r.template_key as string));
  return TEMPLATES.filter((t) => inScope(scope, t.subject) && !done.has(t.key)).length;
}

export { sampleNeeded } from "@/lib/batch-sample";

export type Lot = LotState & { batch: string; subject: string; key: string; created: string };

/**
 * Các lô câu do AI soạn đã công bố tự động (kiểm tra AI đạt), tách theo môn, kèm trạng thái kiểm tra mẫu.
 * Biến thể khuôn không tính ở đây: chúng được duyệt theo khuôn. Có thể giới hạn một lô qua `only`.
 */
export async function loadLots(scope: string[] | null, only?: { batch: string; subject: string }): Promise<Lot[]> {
  const db = adminDb();
  const rows: { id: string; batch_id: string; subject: string; status: string; auto_published: boolean; created_at: string }[] = [];
  for (let from = 0; ; from += 1000) { // PostgREST trả tối đa 1000 dòng mỗi lần
    let q = db.from("questions").select("id, batch_id, subject, status, auto_published, created_at").eq("origin", "ai_generated").eq("verify_status", "pass").not("batch_id", "is", null);
    if (only) q = q.eq("batch_id", only.batch).eq("subject", only.subject);
    else if (scope) q = q.in("subject", scope);
    const { data } = await q.order("id").range(from, from + 999);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const groups = new Map<string, typeof rows>();
  for (const r of rows) { const k = lotKey(r.batch_id, r.subject); groups.set(k, [...(groups.get(k) ?? []), r]); }
  return [...groups.entries()].map(([key, list]) => ({
    ...lotState(list, key), key, batch: list[0].batch_id, subject: list[0].subject,
    created: list.reduce((m, r) => (r.created_at < m ? r.created_at : m), list[0].created_at),
  }));
}

/**
 * Báo lỗi còn mở: lượt báo gửi sau lần giáo viên xử lý gần nhất của câu (hoặc câu chưa từng được xử lý),
 * trên câu đang hiển thị. Trả về id câu → số lượt báo còn mở.
 */
export async function openReports(scope: string[] | null): Promise<Map<string, number>> {
  const db = adminDb();
  const { data: reps } = await db.from("question_reports").select("question_id, created_at").limit(5000);
  if (!reps?.length) return new Map();
  const ids = [...new Set(reps.map((r) => r.question_id as string))];
  let q = db.from("questions").select("id, reviewed_at, subject").in("id", ids).eq("status", "approved");
  if (scope) q = q.in("subject", scope);
  const { data: qs } = await q;
  const seen = new Map((qs ?? []).map((x) => [x.id as string, x.reviewed_at as string | null]));
  const out = new Map<string, number>();
  for (const r of reps) {
    if (!seen.has(r.question_id)) continue;
    const at = seen.get(r.question_id);
    if (!at || r.created_at > at) out.set(r.question_id, (out.get(r.question_id) ?? 0) + 1);
  }
  return out;
}
