import { adminDb } from "@/lib/supabase/admin";
import { SUBJECT_KEYS } from "@/lib/constants";

/** Các môn được gán cho giáo viên duyệt. Rỗng = chưa gán = được duyệt mọi môn. Chịu được việc cột chưa tồn tại. */
export async function reviewSubjectsOf(userId: string): Promise<string[]> {
  const { data, error } = await adminDb().from("profiles").select("review_subjects").eq("id", userId).single();
  if (error || !data) return [];
  return ((data.review_subjects as string[] | null) ?? []).filter((s) => (SUBJECT_KEYS as readonly string[]).includes(s));
}

/** Số mẫu giáo viên phải tự xác nhận trong một lô trước khi được xác nhận cả lô: 10% (tối thiểu 5, tối đa 20), không vượt quá cỡ lô. */
export const sampleNeeded = (batchSize: number) => Math.min(batchSize, Math.min(20, Math.max(5, Math.ceil(batchSize * 0.1))));
