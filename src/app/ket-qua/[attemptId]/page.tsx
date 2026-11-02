import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, type Subject } from "@/lib/constants";
import type { Breakdown } from "@/lib/scoring";
import type { AiReport } from "@/lib/ai";
import { TutorChat } from "@/components/TutorChat";
import { Rich } from "@/components/Rich";
import { reportQuestionAction } from "../../report-actions";
import { ScoreRing } from "@/components/ScoreRing";

export default async function Page({ params, searchParams }: { params: Promise<{ attemptId: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { attemptId } = await params;
  const lang = (await searchParams).lang === "en" ? "en" : (await searchParams).lang === "zh" ? "zh" : "vi";
  const me = await requireMe(`/ket-qua/${attemptId}`);
  const db = adminDb();
  const { data: att } = await db.from("attempts").select("*").eq("id", attemptId).eq("user_id", me.id).single();
  if (!att) notFound();
  if (!att.submitted_at) redirect(`/thi/${attemptId}`);

  const b = att.breakdown as Breakdown;
  const ai = att.ai_report as AiReport;
  const { data: qs } = await db.from("questions").select("id, body, options, correct_answer, explanation, subject, topic, translations").in("id", att.question_ids);
  const byId = new Map((qs ?? []).map((q) => [q.id, q]));
  const review = (att.question_ids as string[]).map((id) => byId.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof byId.get>>[];
  const ans = att.answers as Record<string, string>;
  const { data: myReps } = await db.from("question_reports").select("question_id").eq("user_id", me.id).in("question_id", att.question_ids as string[]);
  const reported = new Set((myReps ?? []).map((r) => r.question_id));
  const topicLabel = (k: string) => `${SUBJECTS[k.split("|")[0] as Subject]} – ${k.split("|")[1]}`;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col items-center text-center shadow-soft">
        <p className="text-sm text-slate-500">{att.title}</p>
        <p className="eyebrow mt-1">CSCA Readiness Score</p>
        <ScoreRing value={att.readiness ?? 0} size={150} />
        <p className="mt-2 text-slate-600">Đúng {att.score}/{b.total} câu · Chính xác {b.accuracy}% · Tốc độ {b.speed}%</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-bold">Kết quả theo môn</h2>
        <div className="space-y-2">
          {Object.entries(b.bySubject).map(([s, v]) => (
            <div key={s}>
              <div className="flex justify-between text-sm"><span>{SUBJECTS[s as Subject]}</span><span>{v.correct}/{v.total} ({v.pct}%)</span></div>
              <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand" style={{ width: `${v.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-lg font-bold">Phân tích AI {ai.source === "claude" ? "" : <span className="text-xs font-normal text-slate-400">(tự động)</span>}</h2>
        <p>{ai.summary}</p>
        {ai.strengths.length > 0 && <div><h3 className="font-semibold text-green-700">Điểm mạnh</h3><ul className="list-disc pl-6">{ai.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>}
        {ai.weaknesses.length > 0 && <div><h3 className="font-semibold text-red-700">Cần cải thiện</h3><ul className="list-disc pl-6">{ai.weaknesses.map((w) => <li key={w.topic}><b>{w.topic}:</b> {w.advice}</li>)}</ul></div>}
        <div><h3 className="font-semibold">Việc nên làm tiếp</h3><ol className="list-decimal pl-6">{ai.next_steps.map((s) => <li key={s}>{s}</li>)}</ol></div>
        {b.weaknesses.length > 0 && <p className="text-sm text-slate-500">Chủ đề yếu: {b.weaknesses.map(topicLabel).join(" · ")}</p>}
      </div>

      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">Xem lại từng câu</h2><p className="text-xs text-slate-500">Ngân hàng câu hỏi đang được mở rộng và rà soát liên tục. Nếu thấy câu nào sai hoặc khó hiểu, hãy bấm “Báo lỗi câu hỏi”.</p></div><div className="flex rounded-full border border-slate-200 p-0.5 text-xs font-semibold">{([["vi", "Tiếng Việt"], ["en", "English"], ["zh", "中文"]] as const).map(([k, label]) => <Link key={k} href={`?lang=${k}`} className={`rounded-full px-3 py-1 ${lang === k ? "bg-brand text-white" : "text-slate-600 hover:text-brand"}`}>{label}</Link>)}</div></div>
        <div className="space-y-4">
          {review.map((q, i) => {
            const mine = ans[q.id];
            const ok = mine === q.correct_answer;
            const tr = lang !== "vi" ? (q.translations as Record<string, { body: string; options: Record<string, string>; explanation: string }> | null)?.[lang] : null;
            const view = { body: tr?.body ?? q.body, options: (tr?.options ?? q.options) as Record<string, string>, explanation: tr?.explanation ?? q.explanation };
            return (
              <div key={q.id} className={`rounded-lg border p-3 ${ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <p className="font-medium">Câu {i + 1}. <Rich text={view.body} /></p>
                <ul className="mt-1 text-sm">
                  {Object.entries(view.options).map(([k, v]) => (
                    <li key={k} className={k === q.correct_answer ? "font-bold text-green-700" : k === mine ? "font-bold text-red-700" : ""}>{k}. {v}</li>
                  ))}
                </ul>
                <p className="mt-1 text-sm">Bạn chọn: <b>{mine ?? "—"}</b> · Đáp án: <b>{q.correct_answer}</b></p>
                {view.explanation && <p className="mt-1 text-sm text-slate-700">💡 <Rich text={view.explanation} /></p>}
                <details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-red-600">{reported.has(q.id) ? "✓ Đã báo lỗi câu này, cảm ơn bạn" : "Báo lỗi câu hỏi"}</summary>
                  {!reported.has(q.id) && <form action={reportQuestionAction.bind(null, attemptId, q.id)} className="mt-2 flex flex-wrap gap-2"><select name="reason" className="input !w-auto !py-1.5 text-sm"><option value="wrong_answer">Đáp án sai</option><option value="unclear">Đề không rõ</option><option value="bad_translation">Dịch sai</option><option value="other">Khác</option></select><input name="note" maxLength={300} placeholder="Ghi chú (không bắt buộc)" className="input !w-auto min-w-[10rem] flex-1 !py-1.5 text-sm" /><button className="btn-outline !px-4 !py-1.5 text-sm">Gửi</button></form>}
                </details>
                <details className="mt-2"><summary className="cursor-pointer text-sm font-bold text-brand">Hỏi Gia sư AI về câu này</summary><div className="mt-2 rounded-xl border border-slate-200 bg-white"><TutorChat compact ctx={{ attemptId, questionId: q.id }} suggestions={["Giải thích chi tiết từng bước", "Vì sao các đáp án còn lại sai?", "Cho mình một câu tương tự"]} /></div></details>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3"><Link href="/lo-trinh" className="btn">Tạo / xem lộ trình học</Link><Link href="/luyen-tap" className="btn-outline">Luyện tập chủ đề yếu</Link><Link href="/gia-su" className="btn-outline">Gia sư AI</Link><Link href="/dashboard" className="btn-outline">Dashboard</Link></div>
    </div>
  );
}
