"use server";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";

const REASONS = ["wrong_answer", "unclear", "bad_translation", "other"] as const;
const AUTO_UNPUBLISH_REPORTS = 3;

/** Học sinh báo lỗi một câu đã làm. Đủ 3 người khác nhau báo thì câu tự được gỡ về hàng chờ duyệt. */
export async function reportQuestionAction(attemptId: string, questionId: string, fd: FormData) {
  const me = await requireMe(`/ket-qua/${attemptId}`);
  const db = adminDb();
  // chỉ người đã làm bài chứa câu này mới được báo lỗi
  const { data: att } = await db.from("attempts").select("question_ids, submitted_at").eq("id", attemptId).eq("user_id", me.id).single();
  if (!att?.submitted_at || !(att.question_ids as string[]).includes(questionId)) return;
  const raw = String(fd.get("reason") ?? "");
  const reason = (REASONS as readonly string[]).includes(raw) ? raw : "other";
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || null;
  await db.from("question_reports").upsert({ question_id: questionId, user_id: me.id, reason, note }, { onConflict: "question_id,user_id" });
  const { count } = await db.from("question_reports").select("*", { count: "exact", head: true }).eq("question_id", questionId);
  if ((count ?? 0) >= AUTO_UNPUBLISH_REPORTS) {
    await db.from("questions").update({ status: "review", auto_published: false, review_note: `Tự động gỡ: ${count} lượt báo lỗi từ học sinh` }).eq("id", questionId).eq("status", "approved");
  }
  revalidatePath(`/ket-qua/${attemptId}`);
}
