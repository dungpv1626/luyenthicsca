import { adminDb } from "./supabase/admin";
import { getSkillProfile } from "./skills";
import { LEVELS, recommendLevel } from "./levels";
import { score100 } from "./sim";
import { todayVN } from "./plan";
import { buildJourney } from "./journey";

type Att = { kind: string; test_id: string | null; readiness: number | null; score: number | null; breakdown: { insufficient?: boolean; total?: number } | null };

/** Lấy dữ liệu của học sinh và tính lộ trình dạng đường ống (xem journey.ts). */
export async function getJourney(userId: string) {
  const db = adminDb();
  const [{ data: prof }, { data: plan }, { data: att }, sk] = await Promise.all([
    db.from("profiles").select("target, exam_date").eq("id", userId).single(),
    db.from("study_plans").select("target_readiness").eq("user_id", userId).eq("active", true).maybeSingle(),
    db.from("attempts").select("kind, test_id, readiness, score, breakdown").eq("user_id", userId).not("submitted_at", "is", null).limit(2000),
    getSkillProfile(userId),
  ]);
  const rows = ((att ?? []) as Att[]).filter((a) => !a.breakdown?.insufficient); // bỏ bài làm quá ít câu
  const ids = [...new Set(rows.map((a) => a.test_id).filter(Boolean))] as string[];
  const { data: tests } = ids.length ? await db.from("tests").select("id, level, sim").in("id", ids) : { data: [] as { id: string; level: number | null; sim: boolean }[] };
  const t = new Map((tests ?? []).map((x) => [x.id, x]));
  const levelRows = rows.filter((a) => a.kind === "mock" && a.test_id && t.get(a.test_id)?.level && !t.get(a.test_id)?.sim);
  const simScores = rows.filter((a) => a.kind === "mock" && a.test_id && t.get(a.test_id)?.sim).map((a) => score100(a.score ?? 0, a.breakdown?.total ?? 0));
  const rec = recommendLevel(sk.latestReadiness);
  return buildJourney({
    hasQuick: rows.some((a) => a.kind === "quick"),
    hasTarget: !!prof?.target?.trim(), hasExamDate: !!prof?.exam_date, hasPlan: !!plan,
    examDate: prof?.exam_date ?? null, todayISO: todayVN(),
    practiceCount: rows.filter((a) => a.kind === "practice").length,
    weak: sk.topics.filter((x) => x.pct < 60).slice(0, 5).map((x) => ({ subject: x.subject, topic: x.topic, pct: x.pct })),
    levelAttempts: levelRows.length, bestLevelReadiness: levelRows.length ? Math.max(...levelRows.map((a) => a.readiness ?? 0)) : null,
    recommendedLevel: rec, recommendedLevelName: LEVELS[rec - 1].name,
    simCount: simScores.length, bestSim: simScores.length ? Math.max(...simScores) : null,
    targetScore: plan?.target_readiness ?? 80,
  });
}
