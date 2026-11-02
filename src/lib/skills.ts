import { adminDb } from "./supabase/admin";
import type { Breakdown } from "./scoring";
import { SUBJECT_KEYS, type Subject } from "./constants";

export type TopicSkill = { subject: Subject; topic: string; total: number; correct: number; pct: number };
export type SkillProfile = {
  attempts: { id: string; title: string; kind: string; readiness: number; at: string }[];
  latestReadiness: number | null;
  bySubject: Record<Subject, { total: number; correct: number; pct: number }>;
  topics: TopicSkill[]; // yếu nhất trước
  weak: TopicSkill[];
  strong: TopicSkill[];
  lastReport: { summary: string; source: string } | null;
};

/** Hồ sơ kỹ năng: gộp mọi bài thi đã nộp (Accuracy · Topic · Subject). */
export async function getSkillProfile(userId: string): Promise<SkillProfile> {
  const { data } = await adminDb()
    .from("attempts")
    .select("id, title, kind, readiness, breakdown, ai_report, submitted_at")
    .eq("user_id", userId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: true });
  const rows = (data ?? []).filter((r) => !(r.breakdown as Breakdown | null)?.insufficient); // bỏ bài làm quá ít câu
  const subj = Object.fromEntries(SUBJECT_KEYS.map((s) => [s, { total: 0, correct: 0, pct: 0 }])) as SkillProfile["bySubject"];
  const topic: Record<string, TopicSkill> = {};
  for (const r of rows) {
    const b = r.breakdown as Breakdown | null;
    if (!b) continue;
    for (const [s, v] of Object.entries(b.bySubject)) if (subj[s as Subject]) { subj[s as Subject].total += v.total; subj[s as Subject].correct += v.correct; }
    for (const [k, v] of Object.entries(b.byTopic)) {
      const t = (topic[k] ??= { subject: v.subject, topic: v.topic, total: 0, correct: 0, pct: 0 });
      t.total += v.total; t.correct += v.correct;
    }
  }
  for (const v of Object.values(subj)) v.pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
  const topics = Object.values(topic).map((t) => ({ ...t, pct: Math.round((t.correct / t.total) * 100) })).sort((a, b) => a.pct - b.pct);
  const last = rows.at(-1);
  const rep = last?.ai_report as { summary?: string; source?: string } | null;
  return {
    attempts: rows.filter((r) => r.kind !== "practice").map((r) => ({ id: r.id, title: r.title, kind: r.kind, readiness: r.readiness ?? 0, at: r.submitted_at! })),
    latestReadiness: rows.filter((r) => r.kind !== "practice").at(-1)?.readiness ?? null,
    bySubject: subj,
    topics,
    weak: topics.filter((t) => t.pct < 60).slice(0, 5),
    strong: [...topics].reverse().filter((t) => t.pct >= 70).slice(0, 3),
    lastReport: rep?.summary ? { summary: rep.summary, source: rep.source ?? "rule" } : null,
  };
}
