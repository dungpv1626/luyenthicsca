import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { getSkillProfile } from "@/lib/skills";
import { todayVN, subjectName } from "@/lib/plan";
import { ScoreRing } from "@/components/ScoreRing";
import { LineChart } from "@/components/LineChart";
import { SubjectBars } from "@/components/SkillBars";
import { Icon } from "@/components/Icon";
import { toggleTaskAction, startTaskAction } from "../plan-actions";

export const metadata = { title: "Dashboard" };

export default async function Page({ searchParams }: { searchParams: Promise<{ pw?: string }> }) {
  const me = await requireMe("/dashboard");
  const { pw } = await searchParams;
  const db = adminDb();
  const today = todayVN();
  const [{ data: prof }, sk, { data: open }, { data: plan }, { data: recent }] = await Promise.all([
    db.from("profiles").select("target, exam_date").eq("id", me.id).single(),
    getSkillProfile(me.id),
    db.from("attempts").select("id, title, started_at, duration_sec").eq("user_id", me.id).is("submitted_at", null).neq("kind", "practice").order("started_at", { ascending: false }).limit(1),
    db.from("study_plans").select("id, target_readiness").eq("user_id", me.id).eq("active", true).maybeSingle(),
    db.from("attempts").select("id, title, readiness, submitted_at, breakdown").eq("user_id", me.id).not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(5),
  ]);
  const { data: tasks } = plan ? await db.from("plan_tasks").select("*").eq("plan_id", plan.id).lte("due_date", today).order("due_date").limit(40) : { data: [] };
  const todo = (tasks ?? []).filter((t) => !t.done_at && t.due_date <= today);
  const gap = plan && sk.latestReadiness !== null ? plan.target_readiness - sk.latestReadiness : null;
  const onboardSteps = [
    { done: sk.attempts.length > 0, title: "Làm Quick Test 15 phút", desc: "Biết ngay điểm mạnh – điểm yếu của bạn.", href: "/quick-test", cta: "Làm ngay" },
    { done: !!(prof?.target || prof?.exam_date), title: "Đặt mục tiêu và ngày thi", desc: "Để lộ trình bám sát thời gian còn lại.", href: "/lo-trinh", cta: "Đặt mục tiêu" },
    { done: !!plan, title: "Tạo lộ trình học cá nhân", desc: "AI lên kế hoạch theo điểm yếu của bạn.", href: "/lo-trinh", cta: "Tạo lộ trình" },
  ];
  const days = prof?.exam_date ? Math.ceil((new Date(prof.exam_date).getTime() - Date.now()) / 86400000) : null;

  const openAttempt = open?.[0];
  const leftSec = openAttempt ? Math.max(0, Math.floor((new Date(openAttempt.started_at).getTime() + openAttempt.duration_sec * 1000 - Date.now()) / 1000)) : 0;
  const leftText = `${String(Math.floor(leftSec / 60)).padStart(2, "0")}:${String(leftSec % 60).padStart(2, "0")}`;
  // Chỉ một nút chính, đổi theo trạng thái của học viên.
  const primary = openAttempt && leftSec > 0 ? { href: `/thi/${openAttempt.id}`, label: `Tiếp tục bài thi (còn ${leftText})` }
    : !plan ? (sk.attempts.length ? { href: "/lo-trinh", label: "Tạo lộ trình" } : { href: "/quick-test", label: "Quick Test" })
    : todo.length > 0 ? { href: "#nhiem-vu", label: "Làm nhiệm vụ hôm nay" }
    : { href: "/thi-thu", label: "Thi thử" };
  const resume = openAttempt && leftSec > 0 ? (
    <section role="status" className="card !border-amber-300 !bg-warning-bg flex flex-wrap items-center justify-between gap-3">
      <div><p className="font-bold text-amber-900">Bạn có bài thi đang làm dở</p><p className="text-sm text-amber-900">{openAttempt.title}. Đồng hồ vẫn chạy, còn <b className="font-mono">{leftText}</b>; hết giờ bài sẽ tự nộp.</p></div>
      <Link href={`/thi/${openAttempt.id}`} className="btn">Tiếp tục làm bài</Link>
    </section>
  ) : null;

  return (
    <div className="space-y-6">
      {pw === "reset" && <p role="status" className="rounded-xl bg-success-bg p-3 text-sm font-medium text-emerald-800">Đã đặt mật khẩu mới. Các thiết bị khác đã bị đăng xuất.</p>}
      {resume}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Dashboard</p><h1 className="work-title">Xin chào, {me.full_name || me.email}</h1></div>
        <div className="flex flex-wrap gap-2">
          {primary ? <Link href={primary.href} className="btn">{primary.label}</Link> : null}
          {primary?.href !== "/quick-test" && <Link href="/quick-test" className="btn-outline">Quick Test</Link>}
          <Link href="/luyen-tap" className="btn-outline">Luyện tập</Link>
        </div>
      </div>

      {onboardSteps.some((x) => !x.done) && (
        <section className="card !border-brand/30 bg-gradient-to-br from-brand-soft/60 to-white" aria-labelledby="onb">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="onb" className="text-lg font-extrabold text-navy">Bắt đầu hành trình ôn thi</h2><span className="chip">{onboardSteps.filter((x) => x.done).length}/{onboardSteps.length} bước</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><span className="bar-anim block h-full rounded-full bg-brand" style={{ width: `${(onboardSteps.filter((x) => x.done).length / onboardSteps.length) * 100}%` }} /></div>
          <ol className="mt-4 divide-y divide-slate-100">
            {onboardSteps.map((x, i) => {
              const primary = !x.done && onboardSteps.findIndex((y) => !y.done) === i;
              return (
                <li key={x.title} className="flex flex-wrap items-center gap-3 py-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${x.done ? "bg-emerald-500 text-white" : primary ? "bg-brand text-white" : "bg-slate-100 text-muted"}`} aria-hidden="true">{x.done ? "✓" : i + 1}</span>
                  <div className="min-w-0 flex-1"><p className={`font-bold ${x.done ? "text-muted line-through" : ""}`}>{x.title}</p><p className="text-sm text-muted">{x.desc}</p></div>
                  {!x.done && <Link href={x.href} className={primary ? "btn" : "btn-outline"}>{x.cta}</Link>}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section id="nhiem-vu" className="card scroll-mt-20">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Nhiệm vụ hôm nay</h2><Link href="/lo-trinh" className="inline-block py-2 text-sm font-semibold text-brand hover:underline">Lộ trình →</Link></div>
        {!plan ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-soft p-4"><p className="text-sm">Chưa có lộ trình học. Để AI lên kế hoạch theo điểm yếu của bạn.</p><Link href="/lo-trinh" className="btn"><Icon name="sparkles" className="h-4 w-4" />Tạo lộ trình</Link></div>
          : todo.length === 0 ? <p className="text-sm text-slate-600">Bạn đã hoàn thành nhiệm vụ hôm nay.</p>
          : <ul className="divide-y divide-slate-100">{todo.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <form action={toggleTaskAction.bind(null, t.id, true)}><button className="grid h-6 w-6 place-items-center rounded-full border border-slate-300 text-transparent hover:border-brand hover:text-brand" aria-label="Hoàn thành"><Icon name="check" className="h-3.5 w-3.5" /></button></form>
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{t.title}</p><p className="text-xs text-muted">{subjectName(t.subject)}{t.due_date < today && <span className="ml-2 font-semibold text-red-600">Quá hạn</span>}</p></div>
                <form action={startTaskAction.bind(null, t.id)}><SubmitButton className="btn btn-sm" pendingText="Đang mở…">Làm ngay</SubmitButton></form>
              </li>))}</ul>}
      </section>

      {sk.attempts.length > 0 && <div className="grid gap-4 md:grid-cols-3">
        <div className="card flex items-center gap-5"><ScoreRing value={sk.latestReadiness ?? 0} size={110} /><div><p className="eyebrow">Readiness</p><p className="text-sm text-slate-600">{sk.latestReadiness === null ? "Chưa có bài thi" : plan && gap !== null ? (gap > 0 ? `Còn ${gap} điểm tới mục tiêu ${plan.target_readiness}` : "Đã đạt mục tiêu") : "Điểm sẵn sàng gần nhất"}</p></div></div>
        <div className="card"><p className="eyebrow">Mục tiêu & kỳ thi</p><p className="mt-2 font-bold">{prof?.target || "Chưa đặt mục tiêu"}</p><p className="text-sm text-slate-600">{prof?.exam_date ? `${new Date(prof.exam_date).toLocaleDateString("vi-VN")}${days !== null && days >= 0 ? ` · còn ${days} ngày` : ""}` : "Chưa đặt ngày thi"}</p><Link href="/lo-trinh" className="mt-2 inline-block rounded-lg py-2 text-sm font-semibold text-brand hover:underline">{prof?.target || prof?.exam_date ? "Cập nhật mục tiêu →" : "Đặt mục tiêu →"}</Link></div>
        <div className="card"><p className="eyebrow">Điểm yếu hàng đầu</p>{sk.weak.length ? <ol className="mt-2 space-y-1 text-sm">{sk.weak.slice(0, 3).map((t, i) => <li key={t.subject + t.topic} className="flex justify-between"><span><b className="text-brand">{i + 1}.</b> {t.topic}</span><span className="text-muted">{t.pct}%</span></li>)}</ol> : <p className="mt-2 text-sm text-muted">Chưa đủ dữ liệu.</p>}<div className="mt-2 flex flex-wrap gap-x-4"><Link href="/luyen-tap" className="inline-block rounded-lg py-2 text-sm font-semibold text-brand hover:underline">Luyện các chủ đề này →</Link><Link href="/ai" className="inline-block rounded-lg py-2 text-sm font-semibold text-brand hover:underline">Xem hồ sơ năng lực →</Link></div></div>
      </div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card"><h2 className="mb-2 font-bold">Tiến bộ</h2>{sk.attempts.length ? <LineChart points={sk.attempts.slice(-6).map((a, i, arr) => ({ label: `#${sk.attempts.length - arr.length + i + 1}`, value: a.readiness }))} /> : <p className="text-sm text-muted">Làm Quick Test để bắt đầu theo dõi tiến bộ.</p>}</section>
        <section className="card"><h2 className="mb-3 font-bold">Kết quả theo môn</h2><SubjectBars profile={sk} /></section>
      </div>

      {!!recent?.length && <section className="card"><h2 className="mb-2 font-bold">Bài làm gần đây</h2><ul className="divide-y divide-slate-100">{recent.map((a) => <li key={a.id}><Link href={`/ket-qua/${a.id}`} className="flex min-h-[2.75rem] items-center justify-between gap-3 py-2 hover:text-brand"><span>{a.title} <span className="text-xs text-muted">{new Date(a.submitted_at!).toLocaleDateString("vi-VN")}</span></span>{(a.breakdown as { insufficient?: boolean } | null)?.insufficient ? <span className="shrink-0 text-xs font-semibold text-amber-700">Chưa đủ câu để chấm</span> : <b className="shrink-0">{a.readiness}/100</b>}</Link></li>)}</ul></section>}
    </div>
  );
}
