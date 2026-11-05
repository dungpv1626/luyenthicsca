import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, DIFFICULTY, money, type Subject } from "@/lib/constants";
import { sourceLabel, type Attribution } from "@/lib/attribution";

type Daily = { day: string; signups: number; attempts: number; revenue: number };
type QStat = { id: string; subject: string; topic: string; difficulty: string; shown: number; correct: number };

function Bars({ data, pick, color = "bg-brand" }: { data: Daily[]; pick: (d: Daily) => number; color?: string }) {
  const max = Math.max(1, ...data.map(pick));
  return <div className="flex h-24 items-end gap-0.5">{data.map((d) => <div key={d.day} title={`${d.day}: ${pick(d)}`} className={`flex-1 rounded-t ${color}`} style={{ height: `${Math.max(2, (pick(d) / max) * 100)}%`, opacity: pick(d) ? 1 : 0.2 }} />)}</div>;
}

export const metadata = { title: "Phân tích – Quản trị" };

export default async function Page() {
  await requireAdmin("analytics");
  const db = adminDb();
  const [{ data: daily }, { data: f }, { data: qs }] = await Promise.all([db.rpc("admin_daily_stats", { days: 30 }), db.rpc("admin_funnel"), db.rpc("admin_question_stats")]);
  // nguồn đăng ký 30 ngày: theo nguồn (utm/giới thiệu) và theo trang đích; chịu được việc cột chưa có
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: prof } = await db.from("profiles").select("id, signup_source").gte("created_at", since).limit(5000);
  const uids = (prof ?? []).map((p) => p.id as string);
  const [{ data: att }, { data: ord }] = uids.length ? await Promise.all([db.from("attempts").select("user_id").in("user_id", uids).not("submitted_at", "is", null).limit(20000), db.from("orders").select("user_id").in("user_id", uids).eq("status", "paid").limit(5000)]) : [{ data: [] }, { data: [] }];
  const tookSet = new Set((att ?? []).map((a) => a.user_id as string)), paidSet = new Set((ord ?? []).map((o) => o.user_id as string));
  const group = (key: (a: Attribution | null) => string) => { const m = new Map<string, { n: number; took: number; paid: number }>(); for (const p of prof ?? []) { const k = key((p.signup_source as Attribution | null) ?? null); const r = m.get(k) ?? { n: 0, took: 0, paid: 0 }; r.n++; if (tookSet.has(p.id as string)) r.took++; if (paidSet.has(p.id as string)) r.paid++; m.set(k, r); } return [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 10); };
  const bySource = group(sourceLabel), byLanding = group((a) => (a?.lp ? a.lp.split("?")[0] : "Không rõ"));
  const d = ((daily ?? []) as Daily[]).map((x) => ({ ...x, revenue: Number(x.revenue) }));
  const funnel = (f as { signups: number; took_test: number; paid: number; returned: number }[] | null)?.[0] ?? { signups: 0, took_test: 0, paid: 0, returned: 0 };
  const sum = (k: keyof Daily) => d.reduce((s, x) => s + Number(x[k]), 0);
  const steps = [["Đăng ký", funnel.signups], ["Đã thi", funnel.took_test], ["Đã mua", funnel.paid], ["Quay lại (≥2 ngày)", funnel.returned]] as const;
  const stats = ((qs ?? []) as QStat[]).filter((q) => q.shown >= 3).map((q) => ({ ...q, acc: Math.round((q.correct / q.shown) * 100) }));
  // gợi ý rà soát: câu "Dễ" mà đa số sai, hoặc câu "Khó" mà gần như ai cũng đúng
  const flagged = stats.filter((q) => (q.difficulty === "easy" && q.acc < 40) || (q.difficulty === "hard" && q.acc > 85) || q.acc < 15);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Phân tích <span className="text-sm font-normal text-slate-500">30 ngày gần nhất</span></h1>
      <div className="grid gap-4 md:grid-cols-3">
        {([["Đăng ký mới", sum("signups"), (x: Daily) => x.signups, "bg-brand"], ["Bài thi đã nộp", sum("attempts"), (x: Daily) => x.attempts, "bg-amber-500"], ["Doanh thu", money(sum("revenue")), (x: Daily) => x.revenue, "bg-emerald-500"]] as const).map(([l, v, p, c]) => (
          <div key={l} className="card"><p className="text-sm text-slate-500">{l}</p><p className="text-2xl font-black">{v}</p><div className="mt-3"><Bars data={d} pick={p} color={c} /></div></div>
        ))}
      </div>
      <section className="card"><h2 className="mb-1 font-bold">Nguồn đăng ký <span className="text-sm font-normal text-slate-500">30 ngày, nguồn truy cập đầu tiên của người đăng ký</span></h2>
        <p className="mb-3 text-sm text-slate-500">Ghi nhận từ khi bật theo dõi; tài khoản cũ hiện là “Không rõ”. Thêm <code>?utm_source=…&amp;utm_medium=…</code> vào liên kết quảng cáo hoặc bài đăng để phân biệt kênh.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {([["Theo nguồn", bySource], ["Theo trang đích đầu tiên (bài blog nào mang khách về)", byLanding]] as const).map(([title, rows]) => (
            <div key={title} className="overflow-x-auto"><p className="mb-1 text-sm font-semibold text-navy">{title}</p>
              <table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-1 pr-2 font-semibold">Nguồn</th><th className="px-2 font-semibold">Đăng ký</th><th className="px-2 font-semibold">Đã thi</th><th className="px-2 font-semibold">Đã mua</th></tr></thead>
                <tbody>{rows.map(([k, v]) => <tr key={k} className="border-t border-slate-100"><td className="max-w-[14rem] break-words py-1.5 pr-2">{k}</td><td className="px-2 font-bold">{v.n}</td><td className="px-2">{v.took}</td><td className="px-2">{v.paid}</td></tr>)}</tbody></table>
              {!rows.length && <p className="py-2 text-sm text-slate-500">Chưa có đăng ký trong 30 ngày.</p>}</div>
          ))}
        </div></section>
      <section className="card"><h2 className="mb-3 font-bold">Phễu chuyển đổi & giữ chân</h2>
        <div className="space-y-2">{steps.map(([l, v], i) => <div key={l}><div className="flex justify-between text-sm"><span>{l}</span><span><b>{v}</b>{i > 0 && funnel.signups > 0 && <span className="ml-2 text-slate-500">{Math.round((v / funnel.signups) * 100)}% người đăng ký</span>}</span></div><div className="mt-1 h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${funnel.signups ? (v / funnel.signups) * 100 : 0}%` }} /></div></div>)}</div></section>
      <section className="card"><h2 className="mb-1 font-bold">Chất lượng câu hỏi</h2><p className="mb-3 text-sm text-slate-500">Chỉ tính câu đã có ≥ 3 lượt làm. Câu bị gắn cờ nên được giáo viên rà soát độ khó/đáp án.</p>
        {flagged.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th className="py-2">Câu hỏi</th><th>Môn · Chủ đề</th><th>Độ khó gắn</th><th>Lượt</th><th>% đúng</th></tr></thead><tbody>{flagged.map((q) => <tr key={q.id} className="border-t border-slate-100"><td className="py-2"><a href={`/admin/questions/${q.id}`} className="font-semibold text-brand hover:underline">Mở câu</a></td><td>{SUBJECTS[q.subject as Subject]} · {q.topic}</td><td>{DIFFICULTY[q.difficulty as keyof typeof DIFFICULTY]}</td><td>{q.shown}</td><td className="font-bold">{q.acc}%</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-500">Chưa có câu nào cần rà soát.</p>}</section>
      <section className="card"><h2 className="mb-3 font-bold">Độ chính xác theo chủ đề</h2>
        {(() => { const m = new Map<string, { s: string; shown: number; correct: number }>(); for (const q of (qs ?? []) as QStat[]) { const k = `${q.subject}|${q.topic}`; const e = m.get(k) ?? { s: q.subject, shown: 0, correct: 0 }; e.shown += q.shown; e.correct += q.correct; m.set(k, e); }
          const rows = [...m.entries()].filter(([, v]) => v.shown > 0).map(([k, v]) => ({ k, ...v, acc: Math.round((v.correct / v.shown) * 100) })).sort((a, b) => a.acc - b.acc);
          return rows.length ? <div className="grid gap-2 sm:grid-cols-2">{rows.map((r) => <div key={r.k} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><span>{r.k.split("|")[1]} <span className="text-xs text-slate-400">{SUBJECTS[r.s as Subject]}</span></span><b className={r.acc < 50 ? "text-red-600" : ""}>{r.acc}% <span className="text-xs font-normal text-slate-400">({r.shown})</span></b></div>)}</div> : <p className="text-sm text-slate-500">Chưa có dữ liệu bài làm.</p>; })()}</section>
    </div>
  );
}
