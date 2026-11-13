import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { getSkillProfile } from "@/lib/skills";
import { addDays, todayVN, subjectName } from "@/lib/plan";
import { PageHeader } from "@/components/Section";
import { getJourney } from "@/lib/journey-data";
import { JourneyPipeline } from "@/components/JourneyPipeline";
import { Icon } from "@/components/Icon";
import { createPlanAction, endPlanAction, startTaskAction, toggleTaskAction } from "../plan-actions";

const KIND = { practice: "Luyện tập", review: "Câu đã sai", mini_test: "Mini Test", mock: "Mock Test" } as const;
const DOW = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export const metadata = { title: "Lộ trình học cá nhân" };

export default async function Page({ searchParams }: { searchParams: Promise<{ w?: string; error?: string }> }) {
  const me = await requireMe("/lo-trinh");
  const { w, error } = await searchParams;
  const db = adminDb();
  const journey = await getJourney(me.id);
  const [{ data: plan }, { data: prof }] = await Promise.all([
    db.from("study_plans").select("*").eq("user_id", me.id).eq("active", true).maybeSingle(),
    db.from("profiles").select("target, exam_date").eq("id", me.id).single(),
  ]);

  if (!plan) {
    const sk = await getSkillProfile(me.id);
    return (
      <div>
        <PageHeader en="Study Plan" vi="Lộ trình học cá nhân">AI dựng kế hoạch theo ngày dựa trên điểm yếu của bạn. {sk.topics.length ? "" : "Bạn chưa có dữ liệu thi nên lộ trình sẽ bắt đầu từ nền tảng, hãy làm Quick Test để cá nhân hóa hơn."}</PageHeader>
        <div className="mb-6"><JourneyPipeline journey={journey} /></div>
        {error && <p className="mb-4 rounded-xl bg-warning-bg p-3 text-sm text-warning">Không tạo được lộ trình. Hãy thử lại.</p>}
        <form id="tao-lo-trinh" action={createPlanAction} className="card mx-auto max-w-xl scroll-mt-24 space-y-4">
          <div><label className="label" htmlFor="f-goal">Mục tiêu</label><input id="f-goal" name="goal" defaultValue={prof?.target ?? ""} placeholder="vd: Toán ≥ 80, vào Đại học Chiết Giang" className="input" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="f-weeks">Thời gian</label><select id="f-weeks" name="weeks" className="input" defaultValue="4"><option value="4">1 tháng (4 tuần)</option><option value="12">3 tháng (12 tuần)</option><option value="24">6 tháng (24 tuần)</option></select></div>
            <div><label className="label" htmlFor="f-minutes">Phút học mỗi ngày</label><select id="f-minutes" name="minutes" className="input" defaultValue="60"><option>30</option><option>60</option><option>90</option><option>120</option></select></div>
            <div><label className="label" htmlFor="f-target">Readiness mục tiêu</label><input id="f-target" type="number" name="target" min={40} max={100} defaultValue={80} className="input" /></div>
            <div><label className="label" htmlFor="f-exam-date">Ngày thi dự kiến</label><input id="f-exam-date" type="date" name="exam_date" defaultValue={prof?.exam_date ?? ""} className="input" /></div>
          </div>
          {sk.weak.length > 0 && <p className="rounded-xl bg-brand-soft p-3 text-sm"><b className="text-brand-text">Điểm yếu AI sẽ ưu tiên:</b> {sk.weak.slice(0, 4).map((t) => t.topic).join(", ")}</p>}
          <button className="btn w-full"><Icon name="sparkles" className="h-4 w-4" />Tạo lộ trình bằng AI</button>
        </form>
      </div>
    );
  }

  const { data: all } = await db.from("plan_tasks").select("*").eq("plan_id", plan.id).order("due_date");
  const tasks = all ?? [];
  const today = todayVN();
  const done = tasks.filter((t) => t.done_at).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const overdue = tasks.filter((t) => !t.done_at && t.due_date < today).length;

  const dow = (new Date(today + "T00:00:00Z").getUTCDay() + 6) % 7;
  const offset = Math.max(-12, Math.min(plan.weeks + 1, Number(w) || 0));
  const monday = addDays(today, -dow + offset * 7);
  const week = DOW.map((name, i) => ({ name, date: addDays(monday, i) }));

  return (
    <div className="space-y-6">
      <PageHeader en="Study Plan" vi="Lộ trình học cá nhân">{plan.summary}</PageHeader>
      <JourneyPipeline journey={journey} />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card md:col-span-2"><p className="eyebrow">Tiến độ</p><p className="mt-1 text-3xl font-black">{pct}%<span className="ml-2 text-sm font-medium text-muted">{done}/{tasks.length} nhiệm vụ</span></p><div className="mt-3 h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div></div>
        <div className="card"><p className="eyebrow">Mục tiêu</p><p className="mt-1 text-3xl font-black">{plan.target_readiness}<span className="text-sm text-muted">/100</span></p><p className="text-xs text-muted">{plan.goal || "—"}</p></div>
        <div className="card"><p className="eyebrow">Quá hạn</p><p className={`mt-1 text-3xl font-black ${overdue ? "text-danger" : ""}`}>{overdue}</p><p className="text-xs text-muted">{plan.weeks} tuần · {plan.minutes_per_day} phút/ngày</p></div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{offset === 0 ? "Tuần này" : `Tuần ${offset > 0 ? "+" : ""}${offset}`} <span className="text-sm font-normal text-muted">({new Date(week[0].date).toLocaleDateString("vi-VN")} – {new Date(week[6].date).toLocaleDateString("vi-VN")})</span></h2>
        <div className="flex gap-2"><Link href={`/lo-trinh?w=${offset - 1}`} className="btn-outline !px-3">←</Link>{offset !== 0 && <Link href="/lo-trinh" className="btn-outline">Hôm nay</Link>}<Link href={`/lo-trinh?w=${offset + 1}`} className="btn-outline !px-3">→</Link></div>
      </div>

      <section className="card !p-0 overflow-hidden" aria-label="Kế hoạch trong tuần">
        <ul className="divide-y divide-slate-100">
          {week.map((d) => {
            const list = tasks.filter((t) => t.due_date === d.date);
            const isToday = d.date === today;
            return (
              <li key={d.date} className={`grid gap-x-4 gap-y-2 p-4 sm:grid-cols-[7.5rem_1fr] ${isToday ? "bg-brand-soft/60" : ""}`} aria-current={isToday ? "date" : undefined}>
                <div className="flex items-baseline gap-2 sm:block">
                  <p className={`text-sm font-extrabold ${isToday ? "text-brand-text" : "text-navy"}`}>{d.name}</p>
                  <p className="text-sm text-muted">{new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</p>
                  {isToday && <span className="chip !px-2 !py-0.5 !text-xs sm:mt-1">Hôm nay</span>}
                </div>
                <div className="min-w-0 space-y-2">
                  {list.length === 0 && <p className="py-1 text-sm text-muted">Ngày nghỉ, không có nhiệm vụ.</p>}
                  {list.map((t) => {
                    const late = !t.done_at && t.due_date < today;
                    return (
                      <div key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-surface px-3 py-2.5">
                        <form action={toggleTaskAction.bind(null, t.id, !t.done_at)}>
                          <button aria-label={t.done_at ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"} title={t.done_at ? "Bỏ đánh dấu" : "Đánh dấu xong"} className={`grid h-7 w-7 place-items-center rounded-full border-2 ${t.done_at ? "border-success bg-success text-white" : "border-border-strong text-transparent hover:text-muted"}`}><Icon name="check" className="h-4 w-4" /></button>
                        </form>
                        <div className="min-w-0 flex-1 basis-48">
                          <p className={`font-semibold leading-snug ${t.done_at ? "text-muted line-through" : "text-navy"}`}>{t.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                            <span className="chip !px-2 !py-0.5 !text-xs">{KIND[t.kind as keyof typeof KIND]}</span>
                            {t.subject && <span>{subjectName(t.subject)}</span>}
                            {late && <span className="chip !bg-danger-bg !px-2 !py-0.5 !text-xs !text-danger">Quá hạn</span>}
                          </p>
                        </div>
                        {!t.done_at && <form action={startTaskAction.bind(null, t.id)}><SubmitButton className="inline-flex min-h-[2.5rem] items-center whitespace-nowrap rounded-full bg-brand px-5 text-sm font-bold text-white hover:bg-brand-dark" pendingText="Đang mở…">Làm ngay</SubmitButton></form>}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {(() => {
        const upcoming = tasks.filter((t) => !t.done_at && t.due_date > today).slice(0, 5);
        return upcoming.length > 0 && (
          <section className="card"><h2 className="mb-3 font-bold">Sắp tới</h2>
            <ul className="divide-y divide-slate-100">{upcoming.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-24 shrink-0 font-semibold text-brand-text">{new Date(t.due_date).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
                <span className="chip !text-xs">{KIND[t.kind as keyof typeof KIND]}</span><span className="flex-1 font-medium">{t.title}</span><span className="hidden text-xs text-muted sm:block">{subjectName(t.subject)}</span>
              </li>))}</ul></section>
        );
      })()}
      <div className="flex justify-between text-sm text-muted"><span>Lộ trình do {plan.source === "claude" ? "AI (Claude)" : "hệ thống (theo luật)"} tạo.</span>
        <form action={endPlanAction}><button className="font-semibold text-brand-text hover:underline">Kết thúc & tạo lộ trình mới</button></form></div>
    </div>
  );
}
