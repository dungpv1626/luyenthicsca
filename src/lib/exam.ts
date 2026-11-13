import { adminDb } from "./supabase/admin";
import { getPlan } from "./entitlement";
import { generateReport } from "./ai";
import { scoreAttempt, type ScoredQuestion } from "./scoring";
import { QUICK_TEST, SUBJECT_KEYS, type Difficulty, type Subject } from "./constants";
import { classify, topicByKey, zhTrackOf, type ZhTrack } from "./syllabus";

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Chọn ngẫu nhiên câu hỏi đã duyệt, chia đều theo môn. */
export async function pickQuestions(opts: { subjects?: Subject[]; topic?: string; module?: string; topicKey?: string; track?: ZhTrack; difficulty?: Difficulty; count: number }) {
  const db = adminDb();
  const subjects = opts.subjects?.length ? opts.subjects : SUBJECT_KEYS;
  let q = db.from("questions").select("id, subject").eq("status", "approved").in("subject", subjects);
  if (opts.topic) q = q.eq("topic", opts.topic);
  if (opts.module) q = q.eq("module", opts.module);
  if (opts.difficulty) q = q.eq("difficulty", opts.difficulty);
  let { data } = await q;
  // chuyên đề theo đề cương: lọc theo mô-đun trong DB rồi phân loại từng câu (chuyên đề được tính, không lưu)
  if (opts.topicKey && opts.subjects?.length === 1) {
    const top = topicByKey(opts.subjects[0], opts.topicKey);
    if (!top) return [];
    const { data: rows } = await db.from("questions").select("id, subject, topic, subtopic").eq("status", "approved").eq("subject", opts.subjects[0]).eq("module", top.module).limit(1000);
    const ok = new Set((rows ?? []).filter((r) => classify(r).topic === opts.topicKey && (!opts.track || zhTrackOf(r.subtopic) === opts.track)).map((r) => r.id));
    data = (data ?? []).filter((r) => ok.has(r.id));
  }
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
  planTaskId?: string;
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
      plan_task_id: p.planTaskId ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Đề miễn phí, hoặc có gói trả phí đang hiệu lực, hoặc đã mua lẻ trước đây → được làm bài. */
export async function canAccessTest(userId: string, test: { id: string; price_vnd: number }) {
  if (test.price_vnd === 0) return true;
  if ((await getPlan(userId)).plan !== "free") return true;
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

  // Làm dưới 20% số câu: không đủ dữ liệu để chấm Readiness hay phân tích (không gọi AI)
  const answered = Object.keys(clean).length;
  const insufficient = ordered.length > 0 && answered < Math.ceil(ordered.length * 0.2);
  const wrong_ids = ordered.filter((q) => (insufficient ? clean[q.id] !== undefined : true) && clean[q.id] !== q.correct_answer).map((q) => q.id);
  const { data: prof } = insufficient ? { data: null } : await db.from("profiles").select("target").eq("id", userId).single();
  const ai_report = insufficient
    ? { source: "rule" as const, summary: `Bạn mới trả lời ${answered}/${ordered.length} câu nên chưa đủ dữ liệu để đánh giá. Bài này không được tính vào Readiness và tiến bộ của bạn.`, strengths: [], weaknesses: [], next_steps: ["Làm lại bài và cố gắng trả lời hết các câu (câu chưa chắc có thể đánh dấu để xem lại).", "Nếu bạn chưa quen dạng đề, hãy luyện tập theo chủ đề trước khi thi thử."] }
    : await generateReport(breakdown, readiness, { goal: prof?.target });

  await db
    .from("attempts")
    .update({ answers: clean, time_spent: timeSpent, submitted_at: new Date().toISOString(), score: correct, readiness, breakdown: insufficient ? { ...breakdown, insufficient: true } : breakdown, ai_report, wrong_ids })
    .eq("id", attemptId)
    .is("submitted_at", null);
  // Hoàn thành nhiệm vụ trong lộ trình nếu bài làm bắt đầu từ nhiệm vụ đó
  if (att.plan_task_id) await db.from("plan_tasks").update({ done_at: new Date().toISOString() }).eq("id", att.plan_task_id).eq("user_id", userId).is("done_at", null);
}

/** Các câu người dùng từng làm sai (mới nhất trước), chỉ lấy câu còn ở trạng thái approved. */
export async function wrongQuestionIds(userId: string, limit = 200) {
  const db = adminDb();
  const { data } = await db.from("attempts").select("wrong_ids").eq("user_id", userId).not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(30);
  const ids = [...new Set((data ?? []).flatMap((a) => a.wrong_ids as string[]))];
  if (!ids.length) return [];
  const { data: ok } = await db.from("questions").select("id").in("id", ids).eq("status", "approved");
  const set = new Set((ok ?? []).map((q) => q.id));
  return ids.filter((id) => set.has(id)).slice(0, limit);
}

export { shuffle };
