import { adminDb } from "./supabase/admin";
import { generateReport } from "./ai";
import { scoreAttempt, type ScoredQuestion } from "./scoring";
import { QUICK_TEST, SUBJECT_KEYS, type Difficulty, type Subject } from "./constants";

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Chọn ngẫu nhiên câu hỏi đã duyệt, chia đều theo môn. */
export async function pickQuestions(opts: { subjects?: Subject[]; topic?: string; difficulty?: Difficulty; count: number }) {
  const db = adminDb();
  const subjects = opts.subjects?.length ? opts.subjects : SUBJECT_KEYS;
  let q = db.from("questions").select("id, subject").eq("status", "approved").in("subject", subjects);
  if (opts.topic) q = q.eq("topic", opts.topic);
  if (opts.difficulty) q = q.eq("difficulty", opts.difficulty);
  const { data } = await q;
  const pool = shuffle(data ?? []);
  // round-robin theo môn để bài thi cân bằng
  const by: Record<string, string[]> = {};
  for (const r of pool) (by[r.subject] ??= []).push(r.id);
  const out: string[] = [];
  while (out.length < opts.count && Object.values(by).some((l) => l.length)) {
    for (const s of Object.keys(by)) {
      const id = by[s].pop();
      if (id && out.length < opts.count) out.push(id);
    }
  }
  return out;
}

export async function createAttempt(p: {
  userId: string;
  kind: "quick" | "mock" | "practice";
  title: string;
  questionIds: string[];
  durationSec: number;
  testId?: string;
}) {
  const { data, error } = await adminDb()
    .from("attempts")
    .insert({
      user_id: p.userId,
      test_id: p.testId ?? null,
      kind: p.kind,
      title: p.title,
      question_ids: p.questionIds,
      duration_sec: p.durationSec,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Đã mua (hoặc miễn phí) → được làm bài. */
export async function canAccessTest(userId: string, test: { id: string; price_vnd: number }) {
  if (test.price_vnd === 0) return true;
  const { data } = await adminDb().from("orders").select("id").eq("user_id", userId).eq("test_id", test.id).eq("status", "paid").limit(1);
  return !!data?.length;
}

export async function startQuickTest(userId: string) {
  const ids = await pickQuestions({ count: QUICK_TEST.questions });
  if (!ids.length) throw new Error("Ngân hàng câu hỏi chưa có câu đã duyệt.");
  return createAttempt({ userId, kind: "quick", title: "Quick Test CSCA", questionIds: ids, durationSec: QUICK_TEST.minutes * 60 });
}

/** Chấm điểm + gọi AI. Idempotent: nộp lại không đổi kết quả. */
export async function submitAttempt(attemptId: string, userId: string, answers: Record<string, string>, timeSpent: Record<string, number>) {
  const db = adminDb();
  const { data: att } = await db.from("attempts").select("*").eq("id", attemptId).eq("user_id", userId).single();
  if (!att) throw new Error("Không tìm thấy bài thi");
  if (att.submitted_at) return;

  // Quá hạn quá 60s thì không chấp nhận đáp án mới (chống gian lận thời gian)
  const elapsed = (Date.now() - new Date(att.started_at).getTime()) / 1000;
  const late = elapsed > att.duration_sec + 60;

  const { data: qs } = await db
    .from("questions")
    .select("id, subject, topic, difficulty, correct_answer, est_time_sec")
    .in("id", att.question_ids);
  const byId = new Map((qs ?? []).map((q) => [q.id, q as ScoredQuestion]));
  const ordered = (att.question_ids as string[]).map((id) => byId.get(id)).filter(Boolean) as ScoredQuestion[];

  const clean: Record<string, string> = {};
  if (!late) for (const q of ordered) if (["A", "B", "C", "D"].includes(answers[q.id])) clean[q.id] = answers[q.id];
  const { correct, readiness, breakdown } = scoreAttempt(ordered, clean, timeSpent);

  const { data: prof } = await db.from("profiles").select("target").eq("id", userId).single();
  const ai_report = await generateReport(breakdown, readiness, { goal: prof?.target });

  await db
    .from("attempts")
    .update({ answers: clean, time_spent: timeSpent, submitted_at: new Date().toISOString(), score: correct, readiness, breakdown, ai_report })
    .eq("id", attemptId)
    .is("submitted_at", null);
}
