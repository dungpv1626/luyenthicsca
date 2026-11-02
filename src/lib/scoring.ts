import type { Difficulty, Subject } from "./constants";

export type ScoredQuestion = {
  id: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  correct_answer: string;
  est_time_sec: number;
};

export type Bucket = { total: number; correct: number; pct: number };
export type Breakdown = {
  correct: number;
  total: number;
  accuracy: number; // 0-100
  speed: number; // 0-100
  bySubject: Record<string, Bucket>;
  byTopic: Record<string, Bucket & { subject: Subject; topic: string }>;
  strengths: string[]; // "subject|topic"
  weaknesses: string[];
  insufficient?: boolean; // làm quá ít câu: không đủ dữ liệu để đánh giá
};

const WEIGHT: Record<Difficulty, number> = { easy: 1, medium: 1.5, hard: 2 };

const bucket = (b?: { total: number; correct: number }): Bucket => {
  const total = b?.total ?? 0;
  const correct = b?.correct ?? 0;
  return { total, correct, pct: total ? Math.round((correct / total) * 100) : 0 };
};

/**
 * Readiness = 80% độ chính xác (có trọng số theo độ khó) + 20% tốc độ.
 * Tốc độ: thời gian dự kiến / thời gian thực tế (tối đa 100); câu bỏ trống không tính tốc độ.
 */
export function scoreAttempt(
  questions: ScoredQuestion[],
  answers: Record<string, string>,
  timeSpent: Record<string, number>,
): { correct: number; readiness: number; breakdown: Breakdown } {
  let wCorrect = 0;
  let wTotal = 0;
  let correct = 0;
  let estSum = 0;
  let spentSum = 0;
  const subj: Record<string, { total: number; correct: number }> = {};
  const topic: Record<string, { total: number; correct: number; subject: Subject; topic: string }> = {};

  for (const q of questions) {
    const ok = answers[q.id] === q.correct_answer;
    const w = WEIGHT[q.difficulty];
    wTotal += w;
    if (ok) {
      wCorrect += w;
      correct++;
    }
    (subj[q.subject] ??= { total: 0, correct: 0 }).total++;
    if (ok) subj[q.subject].correct++;
    const key = `${q.subject}|${q.topic}`;
    const t = (topic[key] ??= { total: 0, correct: 0, subject: q.subject, topic: q.topic });
    t.total++;
    if (ok) t.correct++;
    if (answers[q.id] && timeSpent[q.id] > 0) {
      estSum += q.est_time_sec;
      spentSum += timeSpent[q.id];
    }
  }

  const accuracy = wTotal ? (wCorrect / wTotal) * 100 : 0;
  const speed = spentSum ? Math.min(100, (estSum / spentSum) * 100) : 0;
  const readiness = Math.round(accuracy * 0.8 + speed * 0.2 * (accuracy > 0 ? 1 : 0));

  const byTopic = Object.fromEntries(Object.entries(topic).map(([k, v]) => [k, { ...v, ...bucket(v) }]));
  const ranked = Object.entries(byTopic).sort((a, b) => a[1].pct - b[1].pct);
  const weaknesses = ranked.filter(([, v]) => v.pct < 60).slice(0, 3).map(([k]) => k);
  const strengths = [...ranked].reverse().filter(([, v]) => v.pct >= 70).slice(0, 3).map(([k]) => k);

  return {
    correct,
    readiness: Math.max(0, Math.min(100, readiness)),
    breakdown: {
      correct,
      total: questions.length,
      accuracy: Math.round(accuracy),
      speed: Math.round(speed),
      bySubject: Object.fromEntries(Object.entries(subj).map(([k, v]) => [k, bucket(v)])),
      byTopic,
      strengths,
      weaknesses,
    },
  };
}
