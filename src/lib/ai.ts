import Anthropic from "@anthropic-ai/sdk";
import { SUBJECTS, type Subject } from "./constants";
import type { Breakdown } from "./scoring";

export type AiReport = {
  source: "claude" | "rule";
  summary: string;
  strengths: string[];
  weaknesses: { topic: string; advice: string }[];
  next_steps: string[];
};

const label = (key: string) => {
  const [s, t] = key.split("|");
  return `${SUBJECTS[s as Subject] ?? s} – ${t}`;
};

/** Báo cáo theo luật: luôn chạy được, dùng làm dự phòng khi Claude lỗi / chưa có API key. */
export function ruleReport(b: Breakdown, readiness: number): AiReport {
  const level = readiness >= 80 ? "rất tốt" : readiness >= 60 ? "khá" : readiness >= 40 ? "trung bình" : "cần cải thiện nhiều";
  return {
    source: "rule",
    summary: `Bạn trả lời đúng ${b.correct}/${b.total} câu (độ chính xác ${b.accuracy}%, tốc độ ${b.speed}%). Mức sẵn sàng CSCA: ${readiness}/100 – ${level}.`,
    strengths: b.strengths.map(label),
    weaknesses: b.weaknesses.map((k) => ({ topic: label(k), advice: "Ôn lại lý thuyết chủ đề này và luyện 20 câu cùng chủ đề ở mục Luyện tập." })),
    next_steps: [
      b.weaknesses.length ? `Luyện tập tập trung: ${b.weaknesses.map(label).join("; ")}.` : "Duy trì nhịp luyện tập và thử đề độ khó cao hơn.",
      "Xem lại giải thích của các câu đã sai.",
      "Làm lại một bài thi thử sau 1–2 tuần để so sánh tiến bộ.",
    ],
  };
}

const SYSTEM = `Bạn là cố vấn học thuật cho kỳ thi CSCA (China Scholastic Competency Assessment) dành cho học sinh Việt Nam.
Nhiệm vụ: dựa trên số liệu kết quả bài thi, viết báo cáo phân tích bằng tiếng Việt, rõ ràng, thân thiện, cụ thể, không bịa số liệu.
CHỈ trả về một JSON hợp lệ (không markdown) với dạng:
{"summary": string, "strengths": string[], "weaknesses": [{"topic": string, "advice": string}], "next_steps": string[]}
- summary: 2-3 câu tổng quan.
- strengths: tối đa 3 mục, nêu chủ đề mạnh.
- weaknesses: tối đa 3 mục, mỗi mục có lời khuyên ôn tập cụ thể.
- next_steps: 3-4 hành động ưu tiên cho 1-2 tuần tới.`;

export async function generateReport(b: Breakdown, readiness: number, ctx: { goal?: string | null }): Promise<AiReport> {
  const fallback = ruleReport(b, readiness);
  if (!process.env.ANTHROPIC_API_KEY) return fallback;
  try {
    const client = new Anthropic();
    const data = {
      readiness_score: readiness,
      correct: b.correct,
      total: b.total,
      accuracy_pct: b.accuracy,
      speed_pct: b.speed,
      goal: ctx.goal ?? null,
      by_subject: Object.entries(b.bySubject).map(([k, v]) => ({ subject: SUBJECTS[k as Subject] ?? k, ...v })),
      by_topic: Object.values(b.byTopic).map((v) => ({ subject: SUBJECTS[v.subject], topic: v.topic, total: v.total, correct: v.correct, pct: v.pct })),
    };
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(data) }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return {
      source: "claude",
      summary: String(json.summary ?? fallback.summary),
      strengths: Array.isArray(json.strengths) ? json.strengths.map(String).slice(0, 3) : fallback.strengths,
      weaknesses: Array.isArray(json.weaknesses)
        ? json.weaknesses.slice(0, 3).map((w: { topic?: unknown; advice?: unknown }) => ({ topic: String(w.topic ?? ""), advice: String(w.advice ?? "") }))
        : fallback.weaknesses,
      next_steps: Array.isArray(json.next_steps) ? json.next_steps.map(String).slice(0, 4) : fallback.next_steps,
    };
  } catch (e) {
    console.error("AI report failed, using rule-based fallback:", e);
    return fallback;
  }
}
