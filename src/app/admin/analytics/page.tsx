import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, DIFFICULTY, vnd, type Subject } from "@/lib/constants";

type Daily = { day: string; signups: number; attempts: number; revenue: number };
type QStat = { id: string; subject: string; topic: string; difficulty: string; shown: number; correct: number };

function Bars({ data, pick, color = "bg-brand" }: { data: Daily[]; pick: (d: Daily) => number; color?: string }) {
  const max = Math.max(1, ...data.map(pick));
  return <div className="flex h-24 items-end gap-0.5">{data.map((d) => <div key={d.day} title={`${d.day}: ${pick(d)}`} className={`flex-1 rounded-t ${color}`} style={{ height: `${Math.max(2, (pick(d) / max) * 100)}%`, opacity: pick(d) ? 1 : 0.2 }} />)}</div>;
}

export default async function Page() {
  await requireAdmin("analytics");
  const db = adminDb();
  const [{ data: daily }, { data: f }, { data: qs }] = await Promise.all([db.rpc("admin_daily_stats", { days: 30 }), db.rpc("admin_funnel"), db.rpc("admin_question_stats")]);
  const d = ((daily ?? []) as Daily[]).map((x) => ({ ...x, revenue: Number(x.revenue) }));
  const funnel = (f as { signups: number; took_test: number; paid: number; returned: number }[] | null)?.[0] ?? { signups: 0, took_test: 0, paid: 0, returned: 0 };
  const sum = (k: keyof Daily) => d.reduce((s, x) => s + Number(x[k]), 0);
  const steps = [["Đăng ký", funnel.signups], ["Đã thi", funnel.took_test], ["Đã mua", funnel.paid], ["Quay lại (≥2 ngày)", funnel.returned]] as const;
  const stats = ((qs ?? []) as QStat[]).filter((q) => q.shown >= 3).map((q) => ({ ...q, acc: Math.round((q.correct / q.shown) * 100) }));
  // gợi ý rà soát: câu "Dễ" mà đa số sai, hoặc câu "Khó" mà gần như ai cũng đúng
  const flagged = stats.filter((q) => (q.difficulty === "easy" && q.acc < 40) || (q.difficulty === "hard" && q.acc > 85) || q.acc < 15);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics <span className="text-sm font-normal text-stone-500">30 ngày gần nhất</span></h1>
      <div className="grid gap-4 md:grid-cols-3">
        {([["Đăng ký mới", sum("signups"), (x: Daily) => x.signups, "bg-brand"], ["Bài thi đã nộp", sum("attempts"), (x: Daily) => x.attempts, "bg-amber-500"], ["Doanh thu", vnd(sum("revenue")), (x: Daily) => x.revenue, "bg-emerald-500"]] as const).map(([l, v, p, c]) => (
          <div key={l} className="card"><p className="text-sm text-stone-500">{l}</p><p className="text-2xl font-black">{v}</p><div className="mt-3"><Bars data={d} pick={p} color={c} /></div></div>
        ))}
      </div>
      <section className="card"><h2 className="mb-3 font-bold">Phễu chuyển đổi & giữ chân</h2>
        <div className="space-y-2">{steps.map(([l, v], i) => <div key={l}><div className="flex justify-between text-sm"><span>{l}</span><span><b>{v}</b>{i > 0 && funnel.signups > 0 && <span className="ml-2 text-stone-500">{Math.round((v / funnel.signups) * 100)}% người đăng ký</span>}</span></div><div className="mt-1 h-3 rounded-full bg-stone-100"><div className="h-full rounded-full bg-brand" style={{ width: `${funnel.signups ? (v / funnel.signups) * 100 : 0}%` }} /></div></div>)}</div></section>
      <section className="card"><h2 className="mb-1 font-bold">Chất lượng câu hỏi</h2><p className="mb-3 text-sm text-stone-500">Chỉ tính câu đã có ≥ 3 lượt làm. Câu bị gắn cờ nên được giáo viên rà soát độ khó/đáp án.</p>
        {flagged.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-stone-500"><th className="py-2">Câu hỏi</th><th>Môn · Chủ đề</th><th>Độ khó gắn</th><th>Lượt</th><th>% đúng</th></tr></thead><tbody>{flagged.map((q) => <tr key={q.id} className="border-t border-stone-100"><td className="py-2"><a href={`/admin/questions/${q.id}`} className="font-semibold text-brand hover:underline">Mở câu</a></td><td>{SUBJECTS[q.subject as Subject]} · {q.topic}</td><td>{DIFFICULTY[q.difficulty as keyof typeof DIFFICULTY]}</td><td>{q.shown}</td><td className="font-bold">{q.acc}%</td></tr>)}</tbody></table></div> : <p className="text-sm text-stone-500">Chưa có câu nào cần rà soát.</p>}</section>
      <section className="card"><h2 className="mb-3 font-bold">Độ chính xác theo chủ đề</h2>
        {(() => { const m = new Map<string, { s: string; shown: number; correct: number }>(); for (const q of (qs ?? []) as QStat[]) { const k = `${q.subject}|${q.topic}`; const e = m.get(k) ?? { s: q.subject, shown: 0, correct: 0 }; e.shown += q.shown; e.correct += q.correct; m.set(k, e); }
          const rows = [...m.entries()].filter(([, v]) => v.shown > 0).map(([k, v]) => ({ k, ...v, acc: Math.round((v.correct / v.shown) * 100) })).sort((a, b) => a.acc - b.acc);
          return rows.length ? <div className="grid gap-2 sm:grid-cols-2">{rows.map((r) => <div key={r.k} className="flex items-center justify-between rounded-xl border border-stone-200 p-3 text-sm"><span>{r.k.split("|")[1]} <span className="text-xs text-stone-400">{SUBJECTS[r.s as Subject]}</span></span><b className={r.acc < 50 ? "text-brand" : ""}>{r.acc}% <span className="text-xs font-normal text-stone-400">({r.shown})</span></b></div>)}</div> : <p className="text-sm text-stone-500">Chưa có dữ liệu bài làm.</p>; })()}</section>
    </div>
  );
}
