import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, SUBJECTS, type Subject } from "@/lib/constants";
import { MODULES, moduleQuotas, type Subject as SylSubject } from "@/lib/syllabus";
import { SIM_FORMAT } from "@/lib/sim";

type Row = { subject: string; topic: string; difficulty: string; target: number; approved: number; in_review: number; rejected: number; drafted: number };

export const metadata = { title: "Phủ đề cương – Quản trị" };

export default async function Page() {
  await requireAdmin("questions");
  const [{ data }, { data: cov }] = await Promise.all([adminDb().rpc("admin_blueprint_progress"), adminDb().rpc("admin_module_coverage")]);
  const covRows = (cov ?? []) as { subject: string; module: string; approved: number; in_review: number }[];
  const rows = (data ?? []) as Row[];
  const subjects = Object.keys(SUBJECTS) as Subject[];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Phủ đề cương & tiến độ ngân hàng câu hỏi</h1>
      <section className="card space-y-4">
        <div><h2 className="font-bold">Phủ đề cương CSCA (theo mô-đun)</h2><p className="text-sm text-slate-500">Mô-đun theo đề cương; <b>tỉ trọng là ước lượng</b> vì đề cương không công bố số câu theo mô-đun (chỉnh trong <code>src/lib/syllabus.ts</code>). “Đủ cho” = số đề mô phỏng không trùng câu dựng được từ câu đang công bố (cần số câu mô-đun/đề).</p></div>
        {(Object.keys(MODULES) as SylSubject[]).map((s) => { const q = moduleQuotas(s, SIM_FORMAT[s].questions); const total = covRows.filter((r) => r.subject === s && r.approved).reduce((a, r) => a + Number(r.approved), 0); return (
          <div key={s} className="overflow-x-auto"><p className="mb-1 text-sm font-semibold">{SUBJECTS[s]} · {SIM_FORMAT[s].questions} câu/đề</p>
            <table className="w-full min-w-[34rem] text-sm"><thead><tr className="text-left text-slate-500"><th className="py-1.5">Mô-đun</th><th>Tỉ trọng</th><th>Câu/đề</th><th>Đang công bố</th><th>Tỉ lệ</th><th>Đủ cho</th></tr></thead>
              <tbody>{MODULES[s].map((m) => { const c = Number(covRows.find((r) => r.subject === s && r.module === m.key)?.approved ?? 0); const sets = Math.floor(c / q[m.key]); return (
                <tr key={m.key} className="border-t border-slate-100"><td className="py-1.5 font-medium">{m.name}</td><td>{m.weight}%</td><td>{q[m.key]}</td><td>{c}</td><td>{total ? Math.round((c / total) * 100) : 0}%</td><td className={sets < 4 ? "font-bold text-rose-600" : "text-emerald-700"}>{sets} đề</td></tr>); })}
                {(() => { const out = Number(covRows.find((r) => r.subject === s && r.module === "out")?.approved ?? 0); return out ? <tr className="border-t border-slate-100 text-slate-500"><td className="py-1.5">Ngoài phần liệt kê của đề cương</td><td colSpan={3}>chỉ dùng để luyện tập</td><td>{out}</td><td /><td /></tr> : null; })()}</tbody></table></div>); })}
      </section>
      <p className="text-sm text-slate-500">Mục tiêu theo blueprint (độ khó 35/45/20). Câu “công bố tự động” được tính vào cột Đã duyệt cho tới khi giáo viên xác nhận (xem Admin → Duyệt câu hỏi → tab “Đã công bố”). Blueprint là bản nháp, cần đối chiếu đặc tả chính thức của CSCA.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {subjects.map((s) => { const r = rows.filter((x) => x.subject === s); const t = r.reduce((a, x) => a + x.target, 0), ap = r.reduce((a, x) => a + x.approved, 0), rv = r.reduce((a, x) => a + x.in_review, 0);
          return <div key={s} className="card"><p className="text-sm font-semibold">{SUBJECTS[s]}</p><p className="mt-1 text-3xl font-black">{ap}<span className="text-sm font-medium text-slate-400">/{t}</span></p><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${t ? (ap / t) * 100 : 0}%` }} /></div><p className="mt-1 text-xs text-slate-500">{rv} đang chờ duyệt</p></div>; })}
      </div>
      {subjects.map((s) => (
        <section key={s} className="card overflow-x-auto !p-0"><h2 className="border-b border-slate-100 p-4 font-bold">{SUBJECTS[s]}</h2>
          <table className="w-full min-w-[34rem] text-sm"><thead><tr className="text-left text-slate-500"><th className="p-3">Chủ đề</th><th>Độ khó</th><th>Mục tiêu</th><th>Đã duyệt</th><th>Chờ duyệt</th><th>Bị loại</th></tr></thead>
            <tbody>{rows.filter((x) => x.subject === s).map((x) => <tr key={x.topic + x.difficulty} className="border-t border-slate-100"><td className="p-3 font-medium">{x.topic}</td><td>{DIFFICULTY[x.difficulty as keyof typeof DIFFICULTY]}</td><td>{x.target}</td><td className={x.approved >= x.target ? "font-bold text-emerald-600" : ""}>{x.approved}</td><td>{x.in_review}</td><td className="text-slate-400">{x.rejected}</td></tr>)}</tbody></table></section>
      ))}
    </div>
  );
}
