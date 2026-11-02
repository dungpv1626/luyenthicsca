import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { getMe } from "@/lib/auth";
import { getSkillProfile } from "@/lib/skills";
import { QUICK_TEST, SUBJECTS, vnd } from "@/lib/constants";
import { LEVELS, mixText, recommendLevel } from "@/lib/levels";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";

const FILTERS = [["", "Tất cả"], ["full", "Tổng hợp 4 môn"], ...Object.entries(SUBJECTS).map(([k, v]) => [k, v.split(" (")[0]])] as [string, string][];

export default async function Page({ searchParams }: { searchParams: Promise<{ mon?: string }> }) {
  const { mon = "" } = await searchParams;
  const me = await getMe();
  const db = adminDb();
  const { data } = await db.from("tests").select("id, title, description, duration_min, price_vnd, level, scope, subject, set_no, test_questions(count)").eq("is_published", true).order("level", { nullsFirst: false }).order("scope").order("subject").order("set_no").order("price_vnd");
  const tests = (data ?? []).filter((t) => !mon || (mon === "full" ? t.scope === "full" && t.level : t.subject === mon) || (!t.level && !mon));
  const ids = tests.map((t) => t.id);

  const [{ data: att }, sk] = await Promise.all([
    me && ids.length ? db.from("attempts").select("test_id, readiness").eq("user_id", me.id).in("test_id", ids).not("submitted_at", "is", null) : Promise.resolve({ data: [] as { test_id: string; readiness: number }[] }),
    me ? getSkillProfile(me.id) : Promise.resolve(null),
  ]);
  const best = new Map<string, number>();
  for (const a of att ?? []) best.set(a.test_id, Math.max(best.get(a.test_id) ?? 0, a.readiness ?? 0));
  const rec = recommendLevel(sk?.latestReadiness ?? null);
  const leveled = LEVELS.map((l) => ({ l, list: tests.filter((t) => t.level === l.level) })).filter((x) => x.list.length);
  const others = tests.filter((t) => !t.level);
  const count = (t: (typeof tests)[number]) => (t.test_questions as unknown as { count: number }[])[0]?.count ?? 0;

  const Card = ({ t }: { t: (typeof tests)[number] }) => {
    const b = best.get(t.id);
    return (
      <Link href={`/thi-thu/${t.id}`} className="card card-hover flex flex-col">
        <div className="flex flex-wrap gap-1.5"><span className="chip">{t.scope === "full" ? "Tổng hợp" : (SUBJECTS[t.subject as keyof typeof SUBJECTS] ?? "").split(" (")[0] || "Đề thi"}</span>{t.price_vnd === 0 && <span className="chip !bg-emerald-50 !text-emerald-700">Miễn phí</span>}{b !== undefined && <span className="chip !bg-slate-100 !text-slate-600">Đã làm</span>}</div>
        <h3 className="mt-2 font-bold">{t.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{t.description}</p>
        <p className="mt-auto flex items-center justify-between pt-4 text-sm"><span className="flex items-center gap-1 text-slate-500"><Icon name="clock" className="h-4 w-4" />{count(t)} câu · {t.duration_min}′</span><b>{t.price_vnd ? vnd(t.price_vnd) : b !== undefined ? `Cao nhất ${b}/100` : "Miễn phí"}</b></p>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader en="Mock Test" vi="Thi thử theo cấp độ">Đi từ Nền tảng đến Mô phỏng thi. Mỗi cấp có cơ cấu độ khó riêng; làm theo từng môn hoặc tổng hợp 4 môn.</PageHeader>

      {me && (
        <div className="card flex flex-wrap items-center gap-3 !border-brand/30 bg-brand-soft/50">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white"><Icon name="target" /></span>
          <p className="flex-1 text-sm"><b>Cấp phù hợp với bạn: Cấp {rec} · {LEVELS[rec - 1].name}.</b> {sk?.latestReadiness == null ? "Làm Quick Test để hệ thống gợi ý chính xác hơn." : `Dựa trên Readiness ${sk.latestReadiness}/100 gần nhất.`}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-sm">{FILTERS.map(([k, label]) => <Link key={k} href={k ? `?mon=${k}` : "?"} className={`rounded-full px-4 py-1.5 font-semibold ${mon === k ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand"}`}>{label}</Link>)}</div>

      <section>
        <div className="grid gap-4 md:grid-cols-3"><Link href="/quick-test" className="card card-hover !border-brand/30 bg-gradient-to-br from-brand-soft to-white"><span className="chip">MIỄN PHÍ</span><h3 className="mt-2 font-bold">Quick Test</h3><p className="mt-1 text-sm text-slate-600">{QUICK_TEST.questions} câu · {QUICK_TEST.minutes} phút · AI phân tích ngay. Bắt đầu từ đây để biết cấp của bạn.</p></Link></div>
      </section>

      {leveled.map(({ l, list }) => (
        <section key={l.level} id={`cap-${l.level}`}>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div><p className="eyebrow">Cấp {l.level} {rec === l.level && me ? "· Gợi ý cho bạn" : ""}</p><h2 className="text-xl font-extrabold">{l.name}</h2><p className="text-sm text-slate-500">{l.tagline} · {mixText(l.mix)} · điểm gợi ý: {l.range}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((t) => <Card key={t.id} t={t} />)}</div>
        </section>
      ))}

      {others.length > 0 && <section><h2 className="mb-3 text-xl font-extrabold">Đề khác</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map((t) => <Card key={t.id} t={t} />)}</div></section>}
      {!tests.length && <p className="text-slate-500">Chưa có đề thi nào được công bố {mon ? "cho lựa chọn này" : ""}.</p>}
    </div>
  );
}
