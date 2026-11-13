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
import { SIM_FORMAT, score100, secondsPerQuestion } from "@/lib/sim";
import { MODULES, type Subject as SylSubject } from "@/lib/syllabus";

export const metadata = { title: "Kết quả bài thi" };

export default async function Page({ params, searchParams }: { params: Promise<{ attemptId: string }>; searchParams: Promise<{ lang?: string; show?: string }> }) {
  const { attemptId } = await params;
  const sp = await searchParams;
  const lang = sp.lang === "en" ? "en" : sp.lang === "zh" ? "zh" : "vi";
  const me = await requireMe(`/ket-qua/${attemptId}`);
  const db = adminDb();
  const { data: att } = await db.from("attempts").select("*").eq("id", attemptId).eq("user_id", me.id).single();
  if (!att) notFound();
  if (!att.submitted_at) redirect(`/thi/${attemptId}`);

  const b = att.breakdown as Breakdown;
  const { data: simTest } = att.test_id ? await db.from("tests").select("sim, subject").eq("id", att.test_id).maybeSingle() : { data: null };
  const spentSec = Object.values((att.time_spent ?? {}) as Record<string, number>).reduce((a, v) => a + (Number(v) || 0), 0);
  const simKey = simTest?.sim && simTest.subject && simTest.subject in SIM_FORMAT ? (simTest.subject as keyof typeof SIM_FORMAT) : null;
  const ai = att.ai_report as AiReport;
  const { data: qs } = await db.from("questions").select("id, body, options, correct_answer, explanation, subject, topic, module, translations").in("id", att.question_ids);
  const byId = new Map((qs ?? []).map((q) => [q.id, q]));
  const review = (att.question_ids as string[]).map((id) => byId.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof byId.get>>[];
  const ans = att.answers as Record<string, string>;
  const { data: myReps } = await db.from("question_reports").select("question_id").eq("user_id", me.id).in("question_id", att.question_ids as string[]);
  const reported = new Set((myReps ?? []).map((r) => r.question_id));
  const isRight = (q: (typeof review)[number]) => ans[q.id] === q.correct_answer;
  const nRight = review.filter(isRight).length, nNeed = review.length - nRight, nBlank = review.filter((q) => !ans[q.id]).length;
  const show = sp.show === "all" || sp.show === "right" || sp.show === "need" ? sp.show : nNeed > 0 ? "need" : "all";
  const shown = review.map((q, i) => ({ q, i })).filter(({ q }) => (show === "all" ? true : show === "right" ? isRight(q) : !isRight(q)));
  const insufficient = !!b.insufficient;
  const nPractice = insufficient ? review.filter((q) => ans[q.id] && !isRight(q)).length : nNeed; // đúng với wrong_ids dùng cho luyện câu sai
  const href = (o: { lang?: string; show?: string }) => `?lang=${o.lang ?? lang}&show=${o.show ?? show}`;
  // kết quả theo mô-đun đề cương (chỉ đề mô phỏng)
  const modRows = simKey ? MODULES[simKey as SylSubject].map((m) => { const items = review.filter((q) => (q as { module?: string | null }).module === m.key); const ok = items.filter((q) => ans[q.id] === q.correct_answer).length; return { m, total: items.length, ok, pct: items.length ? Math.round((ok / items.length) * 100) : 0 }; }).filter((r) => r.total > 0) : [];
  const weakMod = [...modRows].sort((a, b) => a.pct - b.pct)[0];
  const topicLabel = (k: string) => `${SUBJECTS[k.split("|")[0] as Subject]} – ${k.split("|")[1]}`;

  return (
    <div className="space-y-6" id="top">
      <div className="card flex flex-col items-center text-center shadow-soft">
        <p className="text-sm text-muted">{att.title}</p>
        {!simKey && <p className="eyebrow mt-1">CSCA Readiness Score</p>}
        {insufficient ? (
          <div className="mt-3 max-w-md rounded-2xl bg-warning-bg p-4 text-sm text-amber-900"><p className="font-extrabold">Chưa đủ dữ liệu để chấm Readiness</p><p className="mt-1">Bạn mới trả lời {Object.keys(ans).length}/{b.total} câu. Bài này không được tính vào tiến bộ và hồ sơ năng lực của bạn.</p></div>
        ) : (<>
          {simKey ? (
            <div className="mt-3 w-full max-w-md space-y-2"><p className="eyebrow">Điểm quy đổi (thang 100)</p><p className="text-6xl font-black text-navy">{score100(att.score ?? 0, b.total)}<span className="text-2xl font-bold text-muted">/100</span></p>
              <p className="text-sm text-slate-600">Đúng {att.score}/{b.total} câu. Đây là điểm ước tính để tham khảo, không phải điểm chính thức. Readiness: <b>{att.readiness ?? 0}/100</b>.</p>
              <p className="rounded-xl bg-mist p-2.5 text-xs text-slate-600">Thời gian: bạn dùng khoảng {Math.round(spentSec / 60)} phút, trung bình {b.total ? Math.round(spentSec / b.total) : 0} giây/câu (chuẩn thi thật khoảng {secondsPerQuestion(simKey)} giây/câu).</p></div>
          ) : <ScoreRing value={att.readiness ?? 0} size={150} />}
          {!simKey && <p className="mt-2 text-slate-600">Đúng {att.score}/{b.total} câu · Chính xác {b.accuracy}% · Tốc độ {b.speed}%</p>}
        </>)}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {att.test_id && <Link href={`/thi-thu/${att.test_id}`} className={insufficient ? "btn" : "btn-outline"}>Làm lại bài này</Link>}
          {!insufficient && <Link href="/lo-trinh" className="btn">Tạo lộ trình học</Link>}
          {nPractice > 0 && <Link href="/luyen-tap" className="btn-outline">Luyện câu đã sai ({nPractice})</Link>}
          {nNeed > 0 && <a href="#xem-lai" className="btn-outline">Xem lại câu sai ↓</a>}
        </div>
      </div>

      {simKey && modRows.length > 0 && (
        <div className="card">
          <h2 className="mb-1 text-lg font-bold">Kết quả theo mô-đun đề cương</h2>
          <p className="mb-3 text-xs text-muted">Các mô-đun theo đề cương CSCA; tỉ trọng mỗi mô-đun trong đề là ước lượng của chúng tôi.</p>
          <div className="space-y-3">{modRows.map((r) => (
            <div key={r.m.key}><div className="flex justify-between gap-3 text-sm"><span className="font-medium">{r.m.name}</span><span className="shrink-0 text-slate-600">{r.ok}/{r.total} ({r.pct}%)</span></div>
              <div className="mt-1 h-2 rounded bg-slate-100"><div className={`h-2 rounded ${r.pct >= 70 ? "bg-emerald-500" : r.pct >= 40 ? "bg-brand" : "bg-red-500"}`} style={{ width: `${r.pct}%` }} /></div></div>))}</div>
          {weakMod && weakMod.pct < 70 && <Link href={`/luyen-tap?subject=${simKey}&module=${weakMod.m.key}`} className="btn mt-4">Luyện mô-đun yếu nhất: {weakMod.m.name}</Link>}
        </div>
      )}

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
        <h2 className="text-lg font-bold">Phân tích AI {ai.source === "claude" ? "" : <span className="text-xs font-normal text-muted">(tự động)</span>}</h2>
        <p>{ai.summary}</p>
        {ai.strengths.length > 0 && <div><h3 className="font-semibold text-green-700">Điểm mạnh</h3><ul className="list-disc pl-6">{ai.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>}
        {ai.weaknesses.length > 0 && <div><h3 className="font-semibold text-danger">Cần cải thiện</h3><ul className="list-disc pl-6">{ai.weaknesses.map((w) => <li key={w.topic}><b>{w.topic}:</b> {w.advice}</li>)}</ul></div>}
        <div><h3 className="font-semibold">Việc nên làm tiếp</h3><ol className="list-decimal pl-6">{ai.next_steps.map((s) => <li key={s}>{s}</li>)}</ol></div>
        {b.weaknesses.length > 0 && <p className="text-sm text-muted">Chủ đề yếu: {b.weaknesses.map(topicLabel).join(" · ")}</p>}
      </div>

      <div className="card" id="xem-lai">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">Xem lại từng câu</h2><p className="text-xs text-muted">Ngân hàng câu hỏi đang được mở rộng và rà soát liên tục. Nếu thấy câu nào sai hoặc khó hiểu, hãy bấm “Báo lỗi câu hỏi”.</p></div><div className="flex rounded-full border border-slate-200 p-0.5 text-xs font-semibold">{([["vi", "Tiếng Việt"], ["en", "English"], ["zh", "中文"]] as const).map(([k, label]) => <Link key={k} href={href({ lang: k })} scroll={false} className={`inline-flex min-h-[2.25rem] items-center rounded-full px-3 transition ${lang === k ? "bg-brand text-white shadow" : "text-slate-600 hover:text-brand"}`}>{label}</Link>)}</div></div>
        <div className="mb-4 flex flex-wrap gap-2 text-sm" role="tablist" aria-label="Lọc câu hỏi">
          {([["need", `Cần xem lại (${nNeed})`], ["right", `Đúng (${nRight})`], ["all", `Tất cả (${review.length})`]] as const).map(([k, label]) => <Link key={k} href={href({ show: k })} scroll={false} role="tab" aria-selected={show === k} className={`inline-flex min-h-[2.75rem] items-center rounded-full border px-4 font-semibold transition ${show === k ? "border-brand bg-brand-soft text-brand" : "border-slate-200 text-slate-600 hover:border-brand"}`}>{label}</Link>)}
          {nBlank > 0 && <span className="self-center text-xs text-muted">trong đó {nBlank} câu chưa làm</span>}
        </div>
        {!shown.length && <p className="rounded-xl bg-success-bg p-4 text-sm text-emerald-800">{show === "need" ? "Không có câu nào cần xem lại 🎉" : "Không có câu nào trong mục này."}</p>}
        <div className="space-y-3">
          {shown.map(({ q, i }) => {
            const mine = ans[q.id];
            const ok = mine === q.correct_answer;
            const tr = lang !== "vi" ? (q.translations as Record<string, { body: string; options: Record<string, string>; explanation: string }> | null)?.[lang] : null;
            const view = { body: tr?.body ?? q.body, options: (tr?.options ?? q.options) as Record<string, string>, explanation: tr?.explanation ?? q.explanation };
            return (
              <details key={q.id} id={`q-${i + 1}`} open={shown.length <= 3} className={`group rounded-xl border ${ok ? "border-green-200 bg-green-50" : "border-red-200 bg-danger-bg"}`}>
                <summary className="flex min-h-[3rem] cursor-pointer list-none items-start gap-3 p-3 [&::-webkit-details-marker]:hidden">
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white ${ok ? "bg-green-600" : "bg-red-600"}`} aria-hidden="true">{ok ? "✓" : mine ? "✗" : "–"}</span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-muted">Câu {i + 1} · {SUBJECTS[q.subject as Subject]} · {q.topic} · {ok ? "Đúng" : mine ? `Bạn chọn ${mine}, đáp án ${q.correct_answer}` : `Chưa làm, đáp án ${q.correct_answer}`}</span><span className="mt-0.5 line-clamp-2 block font-medium group-open:line-clamp-none"><Rich text={view.body} /></span></span>
                  <span className="mt-1 text-muted transition group-open:rotate-180" aria-hidden="true">▾</span>
                </summary>
                <div className="border-t border-black/5 p-3 pt-2">
                  <ul className="text-sm">
                    {Object.entries(view.options).map(([k, v]) => (
                      <li key={k} className={`py-0.5 ${k === q.correct_answer ? "font-bold text-green-700" : k === mine ? "font-bold text-danger" : ""}`}>{k}. <Rich text={v} />{k === q.correct_answer && " ✓"}{k === mine && k !== q.correct_answer && " ✗ (bạn chọn)"}</li>
                    ))}
                  </ul>
                  {view.explanation && <p className="mt-2 text-sm text-slate-700">💡 <Rich text={view.explanation} /></p>}
                  <details className="mt-2"><summary className="inline-flex min-h-[2.5rem] cursor-pointer items-center text-xs font-semibold text-muted hover:text-red-600">{reported.has(q.id) ? "✓ Đã báo lỗi câu này, cảm ơn bạn" : "Báo lỗi câu hỏi"}</summary>
                    {!reported.has(q.id) && <form action={reportQuestionAction.bind(null, attemptId, q.id)} className="mt-2 flex flex-wrap gap-2"><select name="reason" className="input !w-auto !py-1.5 text-sm"><option value="wrong_answer">Đáp án sai</option><option value="unclear">Đề không rõ</option><option value="bad_translation">Dịch sai</option><option value="other">Khác</option></select><input name="note" maxLength={300} placeholder="Ghi chú (không bắt buộc)" className="input !w-auto min-w-[10rem] flex-1 !py-1.5 text-sm" /><button className="btn-outline btn-sm">Gửi</button></form>}
                  </details>
                  <details className="mt-2"><summary className="cursor-pointer text-sm font-bold text-brand">Hỏi Gia sư AI về câu này</summary><div className="mt-2 rounded-xl border border-slate-200 bg-white"><TutorChat compact ctx={{ attemptId, questionId: q.id }} suggestions={["Giải thích chi tiết từng bước", "Vì sao các đáp án còn lại sai?", "Cho mình một câu tương tự"]} /></div></details>
                </div>
              </details>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3"><Link href="/gia-su" className="btn-outline">Gia sư AI</Link><Link href="/dashboard" className="btn-outline">Dashboard</Link><a href="#top" className="btn-outline">Lên đầu trang ↑</a></div>
    </div>
  );
}
