import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { getSkillProfile } from "@/lib/skills";
import { todayVN, subjectName } from "@/lib/plan";
import { ScoreRing } from "@/components/ScoreRing";
import { LineChart } from "@/components/LineChart";
import { SubjectBars } from "@/components/SkillBars";
import { Icon } from "@/components/Icon";
import { toggleTaskAction, startTaskAction } from "../plan-actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ pw?: string }> }) {
  const me = await requireMe("/dashboard");
  const { pw } = await searchParams;
  const db = adminDb();
  const today = todayVN();
  const [{ data: prof }, sk, { data: open }, { data: plan }, { data: recent }] = await Promise.all([
    db.from("profiles").select("target, exam_date").eq("id", me.id).single(),
    getSkillProfile(me.id),
    db.from("attempts").select("id").eq("user_id", me.id).is("submitted_at", null).neq("kind", "practice").order("started_at", { ascending: false }).limit(1),
    db.from("study_plans").select("id, target_readiness").eq("user_id", me.id).eq("active", true).maybeSingle(),
    db.from("attempts").select("id, title, readiness, submitted_at").eq("user_id", me.id).not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(5),
  ]);
  const { data: tasks } = plan ? await db.from("plan_tasks").select("*").eq("plan_id", plan.id).lte("due_date", today).order("due_date").limit(40) : { data: [] };
  const todo = (tasks ?? []).filter((t) => !t.done_at && t.due_date <= today);
  const gap = plan && sk.latestReadiness !== null ? plan.target_readiness - sk.latestReadiness : null;
  const days = prof?.exam_date ? Math.ceil((new Date(prof.exam_date).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="space-y-6">
      {pw === "reset" && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Đã đặt mật khẩu mới. Các thiết bị khác đã bị đăng xuất.</p>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Dashboard</p><h1 className="text-2xl font-extrabold md:text-3xl">Xin chào, {me.full_name || me.email}</h1></div>
        <div className="flex gap-2"><Link href="/quick-test" className="btn">Quick Test</Link><Link href="/luyen-tap" className="btn-outline">Luyện tập</Link>{open?.[0] && <Link href={`/thi/${open[0].id}`} className="btn-outline">Tiếp tục bài đang làm</Link>}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card flex items-center gap-5"><ScoreRing value={sk.latestReadiness ?? 0} size={110} /><div><p className="eyebrow">Readiness</p><p className="text-sm text-stone-600">{sk.latestReadiness === null ? "Chưa có bài thi" : plan && gap !== null ? (gap > 0 ? `Còn ${gap} điểm tới mục tiêu ${plan.target_readiness}` : "Đã đạt mục tiêu 🎉") : "Điểm sẵn sàng gần nhất"}</p></div></div>
        <div className="card"><p className="eyebrow">Mục tiêu & kỳ thi</p><p className="mt-2 font-bold">{prof?.target || "Chưa đặt mục tiêu"}</p><p className="text-sm text-stone-600">{prof?.exam_date ? `${new Date(prof.exam_date).toLocaleDateString("vi-VN")}${days !== null && days >= 0 ? ` · còn ${days} ngày` : ""}` : "Chưa đặt ngày thi"}</p><Link href="/don-hang" className="mt-3 inline-block text-sm font-semibold text-brand">Đơn hàng của tôi →</Link></div>
        <div className="card"><p className="eyebrow">Điểm yếu hàng đầu</p>{sk.weak.length ? <ol className="mt-2 space-y-1 text-sm">{sk.weak.slice(0, 3).map((t, i) => <li key={t.subject + t.topic} className="flex justify-between"><span><b className="text-brand">{i + 1}.</b> {t.topic}</span><span className="text-stone-500">{t.pct}%</span></li>)}</ol> : <p className="mt-2 text-sm text-stone-500">Chưa đủ dữ liệu.</p>}<Link href="/ai" className="mt-3 inline-block text-sm font-semibold text-brand">Xem hồ sơ AI →</Link></div>
      </div>

      <section className="card">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Nhiệm vụ hôm nay</h2><Link href="/lo-trinh" className="text-sm font-semibold text-brand">Lộ trình →</Link></div>
        {!plan ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-soft p-4"><p className="text-sm">Chưa có lộ trình học. Để AI lên kế hoạch theo điểm yếu của bạn.</p><Link href="/lo-trinh" className="btn"><Icon name="sparkles" className="h-4 w-4" />Tạo lộ trình</Link></div>
          : todo.length === 0 ? <p className="text-sm text-stone-600">Bạn đã hoàn thành nhiệm vụ hôm nay. 🎉</p>
          : <ul className="divide-y divide-stone-100">{todo.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <form action={toggleTaskAction.bind(null, t.id, true)}><button className="grid h-6 w-6 place-items-center rounded-full border border-stone-300 text-transparent hover:border-brand hover:text-brand" aria-label="Hoàn thành"><Icon name="check" className="h-3.5 w-3.5" /></button></form>
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{t.title}</p><p className="text-xs text-stone-500">{subjectName(t.subject)}{t.due_date < today && <span className="ml-2 font-semibold text-brand">Quá hạn</span>}</p></div>
                <form action={startTaskAction.bind(null, t.id)}><button className="btn !px-4 !py-1.5">Làm ngay</button></form>
              </li>))}</ul>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card"><h2 className="mb-2 font-bold">Tiến bộ</h2>{sk.attempts.length ? <LineChart points={sk.attempts.slice(-6).map((a, i, arr) => ({ label: `#${sk.attempts.length - arr.length + i + 1}`, value: a.readiness }))} /> : <p className="text-sm text-stone-500">Làm Quick Test để bắt đầu theo dõi tiến bộ.</p>}</section>
        <section className="card"><h2 className="mb-3 font-bold">Kết quả theo môn</h2><SubjectBars profile={sk} /></section>
      </div>

      {!!recent?.length && <section className="card"><h2 className="mb-2 font-bold">Bài làm gần đây</h2><ul className="divide-y divide-stone-100">{recent.map((a) => <li key={a.id}><Link href={`/ket-qua/${a.id}`} className="flex justify-between py-2.5 hover:text-brand"><span>{a.title} <span className="text-xs text-stone-400">{new Date(a.submitted_at!).toLocaleDateString("vi-VN")}</span></span><b>{a.readiness}/100</b></Link></li>)}</ul></section>}
    </div>
  );
}
