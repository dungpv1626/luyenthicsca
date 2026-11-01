import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, type Subject } from "@/lib/constants";
import type { Breakdown } from "@/lib/scoring";
import type { AiReport } from "@/lib/ai";
import { TutorChat } from "@/components/TutorChat";
import { ScoreRing } from "@/components/ScoreRing";

export default async function Page({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const me = await requireMe(`/ket-qua/${attemptId}`);
  const db = adminDb();
  const { data: att } = await db.from("attempts").select("*").eq("id", attemptId).eq("user_id", me.id).single();
  if (!att) notFound();
  if (!att.submitted_at) redirect(`/thi/${attemptId}`);

  const b = att.breakdown as Breakdown;
  const ai = att.ai_report as AiReport;
  const { data: qs } = await db.from("questions").select("id, body, options, correct_answer, explanation, subject, topic").in("id", att.question_ids);
  const byId = new Map((qs ?? []).map((q) => [q.id, q]));
  const review = (att.question_ids as string[]).map((id) => byId.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof byId.get>>[];
  const ans = att.answers as Record<string, string>;
  const topicLabel = (k: string) => `${SUBJECTS[k.split("|")[0] as Subject]} – ${k.split("|")[1]}`;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col items-center text-center shadow-soft">
        <p className="text-sm text-stone-500">{att.title}</p>
        <p className="eyebrow mt-1">CSCA Readiness Score</p>
        <ScoreRing value={att.readiness ?? 0} size={150} />
        <p className="mt-2 text-stone-600">Đúng {att.score}/{b.total} câu · Chính xác {b.accuracy}% · Tốc độ {b.speed}%</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-bold">Kết quả theo môn</h2>
        <div className="space-y-2">
          {Object.entries(b.bySubject).map(([s, v]) => (
            <div key={s}>
              <div className="flex justify-between text-sm"><span>{SUBJECTS[s as Subject]}</span><span>{v.correct}/{v.total} ({v.pct}%)</span></div>
              <div className="h-2 rounded bg-stone-100"><div className="h-2 rounded bg-brand" style={{ width: `${v.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-lg font-bold">Phân tích AI {ai.source === "claude" ? "" : <span className="text-xs font-normal text-stone-400">(tự động)</span>}</h2>
        <p>{ai.summary}</p>
        {ai.strengths.length > 0 && <div><h3 className="font-semibold text-green-700">Điểm mạnh</h3><ul className="list-disc pl-6">{ai.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>}
        {ai.weaknesses.length > 0 && <div><h3 className="font-semibold text-red-700">Cần cải thiện</h3><ul className="list-disc pl-6">{ai.weaknesses.map((w) => <li key={w.topic}><b>{w.topic}:</b> {w.advice}</li>)}</ul></div>}
        <div><h3 className="font-semibold">Việc nên làm tiếp</h3><ol className="list-decimal pl-6">{ai.next_steps.map((s) => <li key={s}>{s}</li>)}</ol></div>
        {b.weaknesses.length > 0 && <p className="text-sm text-stone-500">Chủ đề yếu: {b.weaknesses.map(topicLabel).join(" · ")}</p>}
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-bold">Xem lại từng câu</h2>
        <div className="space-y-4">
          {review.map((q, i) => {
            const mine = ans[q.id];
            const ok = mine === q.correct_answer;
            return (
              <div key={q.id} className={`rounded-lg border p-3 ${ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <p className="font-medium">Câu {i + 1}. {q.body}</p>
                <ul className="mt-1 text-sm">
                  {Object.entries(q.options as Record<string, string>).map(([k, v]) => (
                    <li key={k} className={k === q.correct_answer ? "font-bold text-green-700" : k === mine ? "font-bold text-red-700" : ""}>{k}. {v}</li>
                  ))}
                </ul>
                <p className="mt-1 text-sm">Bạn chọn: <b>{mine ?? "—"}</b> · Đáp án: <b>{q.correct_answer}</b></p>
                {q.explanation && <p className="mt-1 text-sm text-stone-700">💡 {q.explanation}</p>}
                <details className="mt-2"><summary className="cursor-pointer text-sm font-bold text-brand">Hỏi Gia sư AI về câu này</summary><div className="mt-2 rounded-xl border border-stone-200 bg-white"><TutorChat compact ctx={{ attemptId, questionId: q.id }} suggestions={["Giải thích chi tiết từng bước", "Vì sao các đáp án còn lại sai?", "Cho mình một câu tương tự"]} /></div></details>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3"><Link href="/lo-trinh" className="btn">Tạo / xem lộ trình học</Link><Link href="/luyen-tap" className="btn-outline">Luyện tập chủ đề yếu</Link><Link href="/gia-su" className="btn-outline">Gia sư AI</Link><Link href="/dashboard" className="btn-outline">Dashboard</Link></div>
    </div>
  );
}
