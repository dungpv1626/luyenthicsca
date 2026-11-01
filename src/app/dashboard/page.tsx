import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, type Subject } from "@/lib/constants";
import type { Breakdown } from "@/lib/scoring";

export default async function Page() {
  const me = await requireMe("/dashboard");
  const db = adminDb();
  const [{ data: prof }, { data: atts }] = await Promise.all([
    db.from("profiles").select("target, exam_date").eq("id", me.id).single(),
    db.from("attempts").select("id, title, kind, readiness, score, breakdown, submitted_at, started_at").eq("user_id", me.id).order("started_at", { ascending: true }),
  ]);
  const done = (atts ?? []).filter((a) => a.submitted_at);
  const last = done.at(-1);
  const lb = last?.breakdown as Breakdown | undefined;
  const open = (atts ?? []).filter((a) => !a.submitted_at && a.kind !== "practice").at(-1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Xin chào, {me.full_name || me.email}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card text-center">
          <p className="text-sm font-semibold uppercase text-brand">CSCA Readiness</p>
          <p className="text-5xl font-extrabold">{last?.readiness ?? "–"}<span className="text-xl text-stone-400">/100</span></p>
        </div>
        <div className="card text-sm">
          <p>Mục tiêu: <b>{prof?.target || "Chưa đặt"}</b></p>
          <p>Kỳ thi: <b>{prof?.exam_date ? new Date(prof.exam_date).toLocaleDateString("vi-VN") : "Chưa đặt"}</b></p>
          <p className="mt-2"><Link href="/don-hang" className="text-brand">Đơn hàng của tôi →</Link></p>
        </div>
        <div className="card flex flex-col justify-center gap-2">
          <Link href="/quick-test" className="btn">Quick Test</Link>
          <Link href="/luyen-tap" className="btn-outline">Luyện tập</Link>
          {open && <Link href={`/thi/${open.id}`} className="btn-outline">Tiếp tục bài đang làm</Link>}
        </div>
      </div>

      {lb && (
        <div className="card">
          <h2 className="mb-2 font-bold">Kết quả gần nhất theo môn</h2>
          <p className="text-sm">{Object.entries(lb.bySubject).map(([s, v]) => `${SUBJECTS[s as Subject]} ${v.pct}%`).join(" · ")}</p>
          {lb.weaknesses.length > 0 && (
            <p className="mt-2 text-sm"><b>Điểm yếu:</b> {lb.weaknesses.map((k) => k.split("|")[1]).join(", ")}</p>
          )}
        </div>
      )}

      {done.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-bold">Tiến bộ</h2>
          <p className="mb-3 text-sm text-stone-600">{done.filter((a) => a.kind !== "practice").map((a, i) => `Test #${i + 1}: ${a.readiness}`).join(" → ") || "Chưa có bài thi."}</p>
          <ul className="divide-y">
            {[...done].reverse().map((a) => (
              <li key={a.id}>
                <Link href={`/ket-qua/${a.id}`} className="flex justify-between py-2 hover:text-brand">
                  <span>{a.title} <span className="text-xs text-stone-400">{new Date(a.submitted_at!).toLocaleDateString("vi-VN")}</span></span>
                  <b>{a.readiness}/100</b>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!done.length && <p className="text-stone-500">Bạn chưa làm bài nào. Hãy bắt đầu với Quick Test để nhận phân tích AI.</p>}
    </div>
  );
}
