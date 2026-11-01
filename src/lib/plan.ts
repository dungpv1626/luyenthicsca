import Anthropic from "@anthropic-ai/sdk";
import { adminDb } from "./supabase/admin";
import { SUBJECTS, SUBJECT_KEYS, type Subject } from "./constants";
import type { SkillProfile } from "./skills";

export type PlanTask = { dow: number; title: string; kind: "practice" | "review" | "mini_test" | "mock"; subject?: Subject; topic?: string; count: number };
export type PlanPhase = { name: string; weeks: number; tasks: PlanTask[] }; // tasks lặp lại mỗi tuần của giai đoạn
export type GeneratedPlan = { source: "claude" | "rule"; summary: string; phases: PlanPhase[]; fallback_reason?: string };

const KINDS = ["practice", "review", "mini_test", "mock"] as const;

/** Ngày hôm nay theo giờ Việt Nam (YYYY-MM-DD). */
export const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
export const addDays = (iso: string, n: number) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

type Input = { goal: string; target: number; weeks: number; minutes: number; examDate?: string | null; skills: SkillProfile; topics: { subject: Subject; topic: string }[] };

/** Kế hoạch theo luật (mẫu §VIII tài liệu): T2–T5 luyện chủ đề yếu, T6 mini test, T7 xem lại câu sai, CN mock test. */
export function ruleBasedPlan(i: Input): GeneratedPlan {
  const weak = i.skills.weak.length ? i.skills.weak : i.topics.slice(0, 4).map((t) => ({ ...t, total: 0, correct: 0, pct: 0 }));
  const per = Math.max(10, Math.min(30, Math.round(i.minutes / 3)));
  const w = (n: number) => weak[n % Math.max(1, weak.length)];
  const days = (cycle: number): PlanTask[] => [
    { dow: 1, kind: "practice", count: per, subject: w(cycle).subject, topic: w(cycle).topic, title: `${per} câu ${w(cycle).topic}` },
    { dow: 2, kind: "practice", count: per, subject: w(cycle + 1).subject, topic: w(cycle + 1).topic, title: `${per} câu ${w(cycle + 1).topic}` },
    { dow: 3, kind: "practice", count: per, subject: w(cycle).subject, topic: w(cycle).topic, title: `Củng cố ${w(cycle).topic} (${per} câu)` },
    { dow: 4, kind: "review", count: 15, title: "Luyện lại các câu đã sai" },
    { dow: 5, kind: "mini_test", count: 10, title: "Mini Test 10 câu hỗn hợp" },
    { dow: 7, kind: "mock", count: 20, title: "Quick Test / Mock Test cuối tuần" },
  ];
  const total = i.weeks;
  const p1 = Math.max(1, Math.round(total * 0.5)), p3 = total >= 4 ? Math.max(1, Math.round(total * 0.2)) : 0, p2 = Math.max(0, total - p1 - p3);
  const phases: PlanPhase[] = [{ name: "Củng cố điểm yếu", weeks: p1, tasks: days(0) }];
  if (p2) phases.push({ name: "Mở rộng & tăng tốc", weeks: p2, tasks: days(1).map((t) => (t.kind === "practice" ? { ...t, count: per + 5, title: t.title.replace(/\(\d+ câu\)/, `(${per + 5} câu)`) } : t)) });
  if (p3) phases.push({ name: "Mô phỏng thi thật", weeks: p3, tasks: [{ dow: 1, kind: "mini_test", count: 20, title: "Mini Test 20 câu" }, { dow: 3, kind: "review", count: 20, title: "Ôn lại câu sai" }, { dow: 5, kind: "mini_test", count: 20, title: "Mini Test 20 câu" }, { dow: 7, kind: "mock", count: 20, title: "Mock Test mô phỏng kỳ thi" }] });
  return {
    source: "rule",
    summary: weak[0] && i.skills.weak.length
      ? `Lộ trình ${i.weeks} tuần hướng tới ${i.target}/100. Ưu tiên chủ đề yếu: ${i.skills.weak.slice(0, 3).map((t) => t.topic).join(", ")}.`
      : `Lộ trình ${i.weeks} tuần hướng tới ${i.target}/100. Hãy làm Quick Test để lộ trình bám sát điểm yếu của bạn.`,
    phases,
  };
}

const SYSTEM = `Bạn là cố vấn học tập cho kỳ thi CSCA. Lập lộ trình ôn thi theo giai đoạn cho học sinh Việt Nam, dựa trên hồ sơ kỹ năng được cung cấp.
CHỈ trả về một JSON hợp lệ (không markdown):
{"summary": string, "phases": [{"name": string, "weeks": number, "tasks": [{"dow": 1-7, "title": string, "kind": "practice"|"review"|"mini_test"|"mock", "subject": "math"|"physics"|"chemistry"|"chinese", "topic": string, "count": number}]}]}
Quy tắc:
- 1-4 giai đoạn; tổng "weeks" đúng bằng số tuần yêu cầu. Các task của một giai đoạn LẶP LẠI mỗi tuần trong giai đoạn đó.
- dow: 1=Thứ 2 ... 7=Chủ nhật. Mỗi tuần 4-7 ngày có nhiệm vụ, có ít nhất 1 "review" (làm lại câu sai) và 1 "mini_test" hoặc "mock".
- "topic" PHẢI lấy nguyên văn từ danh sách chủ đề có sẵn; với review/mini_test/mock có thể bỏ subject/topic.
- count 5-50, phù hợp số phút học mỗi ngày (~1 phút/câu kể cả đọc giải thích).
- Ưu tiên chủ đề yếu trước, sau đó mở rộng, cuối cùng mô phỏng thi thật. Viết title ngắn gọn bằng tiếng Việt (tối đa 10 từ), summary 2 câu.`;

export async function generatePlan(i: Input): Promise<GeneratedPlan> {
  const fallback = ruleBasedPlan(i);
  if (!process.env.ANTHROPIC_API_KEY) return { ...fallback, fallback_reason: "no_api_key" };
  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 6000,
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify({
        muc_tieu: i.goal, readiness_muc_tieu: i.target, so_tuan: i.weeks, phut_moi_ngay: i.minutes, ngay_thi: i.examDate ?? null,
        readiness_hien_tai: i.skills.latestReadiness,
        theo_mon: Object.entries(i.skills.bySubject).map(([k, v]) => ({ mon: k, ...v })),
        chu_de_yeu: i.skills.weak.map((t) => ({ subject: t.subject, topic: t.topic, pct: t.pct })),
        chu_de_manh: i.skills.strong.map((t) => ({ subject: t.subject, topic: t.topic, pct: t.pct })),
        danh_sach_chu_de_co_san: i.topics,
      }) }],
    });
    if (res.stop_reason === "max_tokens") throw new Error("Phản hồi AI bị cắt do vượt max_tokens");
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const known = new Set(i.topics.map((t) => `${t.subject}|${t.topic}`));
    let phases: PlanPhase[] = (Array.isArray(json.phases) ? json.phases : []).slice(0, 4).map((p: { name?: unknown; weeks?: unknown; tasks?: unknown[] }) => ({
      name: String(p.name ?? "Giai đoạn").slice(0, 60),
      weeks: Math.max(1, Math.round(Number(p.weeks) || 1)),
      tasks: (Array.isArray(p.tasks) ? p.tasks : []).slice(0, 7).map((t) => {
        const x = t as { dow?: unknown; title?: unknown; kind?: unknown; subject?: unknown; topic?: unknown; count?: unknown };
        const kind = KINDS.includes(x.kind as never) ? (x.kind as PlanTask["kind"]) : "practice";
        const subject = SUBJECT_KEYS.includes(x.subject as Subject) ? (x.subject as Subject) : undefined;
        const topic = subject && known.has(`${subject}|${x.topic}`) ? String(x.topic) : undefined;
        return { dow: Math.min(7, Math.max(1, Math.round(Number(x.dow) || 1))), title: String(x.title ?? "Nhiệm vụ").slice(0, 80), kind, subject, topic, count: Math.min(50, Math.max(5, Math.round(Number(x.count) || 10))) } satisfies PlanTask;
      }),
    })).filter((p: PlanPhase) => p.tasks.length);
    if (!phases.length) throw new Error("AI không trả về giai đoạn hợp lệ");
    // ép tổng số tuần đúng bằng yêu cầu
    let remaining = i.weeks;
    const fit: PlanPhase[] = [];
    for (const p of phases) { if (remaining <= 0) break; const w = Math.min(p.weeks, remaining); fit.push({ ...p, weeks: w }); remaining -= w; }
    if (remaining > 0) fit[fit.length - 1].weeks += remaining;
    phases = fit;
    return { source: "claude", summary: String(json.summary ?? fallback.summary).slice(0, 400), phases };
  } catch (e) {
    console.error("AI plan failed, using rule-based fallback:", e);
    return { ...fallback, fallback_reason: String(e instanceof Error ? `${e.name}: ${e.message}` : e).slice(0, 400) };
  }
}

/** Danh sách chủ đề có thật trong ngân hàng (đã duyệt) — AI chỉ được chọn trong đây. */
export async function availableTopics() {
  const { data } = await adminDb().from("questions").select("subject, topic").eq("status", "approved");
  const seen = new Set<string>();
  return (data ?? []).filter((q) => { const k = `${q.subject}|${q.topic}`; if (seen.has(k)) return false; seen.add(k); return true; }) as { subject: Subject; topic: string }[];
}

/** Mở rộng các giai đoạn thành nhiệm vụ có ngày cụ thể. */
export function expandTasks(plan: GeneratedPlan, startISO: string) {
  const out: { due_date: string; title: string; kind: string; subject: string | null; topic: string | null; question_count: number }[] = [];
  const startDow = ((new Date(startISO + "T00:00:00Z").getUTCDay() + 6) % 7) + 1; // 1=Thứ 2
  let weekIdx = 0;
  for (const ph of plan.phases) for (let w = 0; w < ph.weeks; w++, weekIdx++)
    for (const t of ph.tasks) {
      const offset = weekIdx * 7 + (t.dow - startDow);
      if (offset < 0) continue; // bỏ các ngày đã qua của tuần đầu
      out.push({ due_date: addDays(startISO, offset), title: t.title, kind: t.kind, subject: t.subject ?? null, topic: t.topic ?? null, question_count: t.count });
    }
  return out.sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export const subjectName = (s?: string | null) => (s ? SUBJECTS[s as Subject] ?? s : "");
