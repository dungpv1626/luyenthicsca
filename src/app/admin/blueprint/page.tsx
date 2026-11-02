import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, SUBJECTS, type Subject } from "@/lib/constants";

type Row = { subject: string; topic: string; difficulty: string; target: number; approved: number; in_review: number; rejected: number; drafted: number };

export default async function Page() {
  await requireAdmin("questions");
  const { data } = await adminDb().rpc("admin_blueprint_progress");
  const rows = (data ?? []) as Row[];
  const subjects = Object.keys(SUBJECTS) as Subject[];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Blueprint & tiến độ ngân hàng câu hỏi</h1>
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
