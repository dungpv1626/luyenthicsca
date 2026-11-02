import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { getSkillProfile } from "@/lib/skills";
import { PageHeader } from "@/components/Section";
import { ScoreRing } from "@/components/ScoreRing";
import { LineChart } from "@/components/LineChart";
import { SubjectBars, TopicHeat } from "@/components/SkillBars";
import { Icon } from "@/components/Icon";

export const metadata = { title: "AI CSCA – Hồ sơ năng lực" };

export default async function Page() {
  const me = await requireMe("/ai");
  const p = await getSkillProfile(me.id);
  const last = p.attempts.at(-1);
  const delta = p.attempts.length > 1 ? p.attempts.at(-1)!.readiness - p.attempts.at(-2)!.readiness : null;

  return (
    <div>
      <PageHeader en="AI CSCA" vi="Hồ sơ năng lực cá nhân">Mỗi bài thi cập nhật hồ sơ kỹ năng của bạn: điểm mạnh, điểm yếu, tốc độ và tiến bộ theo thời gian.</PageHeader>

      {!p.attempts.length && p.topics.length === 0 ? (
        <div className="card mx-auto max-w-xl text-center"><Icon name="sparkles" className="mx-auto h-10 w-10 text-brand" /><h2 className="mt-3 text-xl font-bold">Chưa có dữ liệu để phân tích</h2><p className="mt-1 text-slate-600">Làm Quick Test 15 phút để AI đánh giá năng lực và dựng hồ sơ cho bạn.</p><Link href="/quick-test" className="btn mt-5">Làm Quick Test</Link></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">Readiness Score</p>
            <ScoreRing value={p.latestReadiness ?? 0} size={170} />
            {delta !== null && <span className={`chip ${delta < 0 ? "!bg-slate-100 !text-slate-600" : "!bg-emerald-50 !text-emerald-700"}`}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} điểm so với lần trước</span>}
            {last && <Link href={`/ket-qua/${last.id}`} className="inline-flex min-h-[2.75rem] items-center text-sm font-semibold text-brand hover:underline">Xem báo cáo gần nhất →</Link>}
          </section>

          <section className="card lg:col-span-2">
            <h2 className="mb-2 font-bold">Tiến bộ qua các bài thi</h2>
            {p.attempts.length ? <LineChart points={p.attempts.slice(-8).map((a, i, arr) => ({ label: `#${p.attempts.length - arr.length + i + 1}`, value: a.readiness }))} /> : <p className="text-sm text-slate-500">Chưa có bài Quick/Mock Test.</p>}
          </section>

          <section className="card"><h2 className="mb-4 font-bold">Kỹ năng theo môn</h2><SubjectBars profile={p} /></section>

          <section className="card lg:col-span-2">
            <h2 className="mb-1 font-bold">Nhận xét gần nhất của AI</h2>
            {p.lastReport ? <p className="text-slate-700">{p.lastReport.summary}</p> : <p className="text-sm text-slate-500">Chưa có nhận xét.</p>}
            {p.weak.length > 0 && <div className="mt-4"><h3 className="text-sm font-bold text-brand">Điểm yếu cần ưu tiên</h3><ul className="mt-2 flex flex-wrap gap-2">{p.weak.map((t) => <li key={t.subject + t.topic} className="chip">{t.topic} · {t.pct}%</li>)}</ul></div>}
            <div className="mt-5 flex flex-wrap gap-3"><Link href="/lo-trinh" className="btn"><Icon name="route" className="h-4 w-4" />Tạo lộ trình học</Link><Link href="/gia-su" className="btn-outline"><Icon name="chat" className="h-4 w-4" />Hỏi Gia sư AI</Link><Link href="/luyen-tap" className="btn-outline">Luyện tập</Link></div>
          </section>

          <section className="card lg:col-span-3"><h2 className="mb-3 font-bold">Bản đồ kỹ năng theo chủ đề <span className="text-sm font-normal text-slate-500">(yếu nhất trước)</span></h2><TopicHeat topics={p.topics} /></section>
        </div>
      )}
    </div>
  );
}
