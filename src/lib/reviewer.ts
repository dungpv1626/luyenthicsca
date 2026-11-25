import { adminDb } from "@/lib/supabase/admin";
import { SUBJECT_KEYS } from "@/lib/constants";
import { TEMPLATES } from "@/lib/templates/index.ts";

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

/** Số mẫu giáo viên phải tự xác nhận trong một lô trước khi được xác nhận cả lô: 10% (tối thiểu 5, tối đa 20), không vượt quá cỡ lô. */
export const sampleNeeded = (batchSize: number) => Math.min(batchSize, Math.min(20, Math.max(5, Math.ceil(batchSize * 0.1))));
