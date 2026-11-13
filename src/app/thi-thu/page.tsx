import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { getMe } from "@/lib/auth";
import { getSkillProfile } from "@/lib/skills";
import { QUICK_TEST, SUBJECTS, vnd } from "@/lib/constants";
import { LEVELS, mixText, recommendLevel } from "@/lib/levels";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { SIM_FORMAT, score100 } from "@/lib/sim";

const FILTERS = [["", "Tất cả"], ["full", "Tổng hợp 4 môn"], ...Object.entries(SUBJECTS).map(([k, v]) => [k, v.split(" (")[0]])] as [string, string][];

export const metadata = { title: "Thi thử CSCA: đề mô phỏng và luyện theo mức" };

export default async function Page({ searchParams }: { searchParams: Promise<{ mon?: string }> }) {
  const { mon = "" } = await searchParams;
  const me = await getMe();
  const db = adminDb();
  const { data } = await db.from("tests").select("id, title, description, duration_min, price_vnd, level, scope, subject, set_no, sim, test_questions(count)").eq("is_published", true).order("level", { nullsFirst: false }).order("scope").order("subject").order("set_no").order("price_vnd");
  const tests = (data ?? []).filter((t) => !mon || (mon === "full" ? t.scope === "full" && t.level : t.subject === mon) || (!t.level && !mon));
  const ids = tests.map((t) => t.id);

  const [{ data: att }, sk] = await Promise.all([
    me && ids.length ? db.from("attempts").select("id, test_id, readiness, score, breakdown, submitted_at, started_at, duration_sec").eq("user_id", me.id).in("test_id", ids) : Promise.resolve({ data: [] as { id: string; test_id: string; readiness: number | null; score: number | null; breakdown: { insufficient?: boolean; total?: number } | null; submitted_at: string | null; started_at: string; duration_sec: number }[] }),
    me ? getSkillProfile(me.id) : Promise.resolve(null),
  ]);
  // trạng thái từng đề: đã làm (điểm cao nhất, không tính bài làm quá ít câu) / đang làm dở
  const best = new Map<string, number>();
  const bestSim = new Map<string, number>(); // điểm quy đổi thang 100 của đề mô phỏng
  const open = new Map<string, string>(); // test_id → attempt_id đang làm dở
  for (const a of att ?? []) {
    if (a.submitted_at) { if (!a.breakdown?.insufficient) { best.set(a.test_id, Math.max(best.get(a.test_id) ?? 0, a.readiness ?? 0)); bestSim.set(a.test_id, Math.max(bestSim.get(a.test_id) ?? 0, score100(a.score ?? 0, a.breakdown?.total ?? 0))); } }
    else if (Date.now() < new Date(a.started_at).getTime() + a.duration_sec * 1000) open.set(a.test_id, a.id);
  }
  const rec = recommendLevel(sk?.latestReadiness ?? null);
  const leveled = LEVELS.map((l) => ({ l, list: tests.filter((t) => t.level === l.level && !t.sim) })).filter((x) => x.list.length);
  const others = tests.filter((t) => !t.level && !t.sim);
  const simTests = tests.filter((t) => t.sim);
  const count = (t: (typeof tests)[number]) => (t.test_questions as unknown as { count: number }[])[0]?.count ?? 0;
  const sName = (k: string | null) => (k ? (SUBJECTS[k as keyof typeof SUBJECTS] ?? "").split(" (")[0] : "");

  // "Nên làm tiếp": bài đang dở → đề chưa làm ở cấp phù hợp (ưu tiên môn yếu nhất) → đề chưa làm đầu tiên
  const resume = [...open.entries()][0];
  const resumeTest = resume ? tests.find((t) => t.id === resume[0]) : undefined;
  const target = leveled.find((x) => x.l.level === rec) ?? leveled[0];
  const weakest = sk ? (Object.entries(sk.bySubject).filter(([, v]) => v.total > 0).sort((a, b) => a[1].pct - b[1].pct)[0]?.[0] ?? null) : null;
  const todo = target?.list.filter((t) => !best.has(t.id) && !open.has(t.id) && t.price_vnd === 0) ?? [];
  const next = todo.find((t) => weakest && t.subject === weakest) ?? todo[0];

  /** Nút chọn một đề: hiển thị trạng thái ngay trên nút. */
  const SetPill = ({ t }: { t: (typeof tests)[number] }) => {
    const b = best.get(t.id), o = open.has(t.id);
    return (
      <Link href={`/thi-thu/${t.id}`} aria-label={`${t.title}${o ? ", đang làm dở" : b !== undefined ? `, đã làm, điểm cao nhất ${b}` : t.price_vnd ? `, ${vnd(t.price_vnd)}` : ", chưa làm"}`}
        className={`inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${o ? "border-amber-400 bg-amber-50 text-amber-900" : b !== undefined ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white hover:border-brand hover:text-brand"}`}>
        Đề {t.set_no ?? "·"}
        {o ? <span className="text-xs font-bold">▶ đang làm</span> : b !== undefined ? <span className="text-xs font-bold">✓ {t.sim ? (bestSim.get(t.id) ?? 0) : b}/100</span> : t.price_vnd ? <span className="text-xs text-slate-500">{vnd(t.price_vnd)}</span> : null}
      </Link>
    );
  };
  const groups = (list: typeof tests) => {
    const full = list.filter((t) => t.scope === "full");
    const bySub = Object.keys(SUBJECTS).map((k) => ({ k, items: list.filter((t) => t.scope !== "full" && t.subject === k) })).filter((g) => g.items.length);
    return [...(full.length ? [{ k: "full", label: "Tổng hợp 4 môn", items: full }] : []), ...bySub.map((g) => ({ k: g.k, label: sName(g.k), items: g.items }))];
  };

  return (
    <div className="space-y-8">
      <PageHeader en="Mock Test" vi="Thi thử CSCA">Đề mô phỏng đúng số câu và thời gian của kỳ thi thật, cùng các mức luyện tập từ Nền tảng đến Chinh phục.</PageHeader>

      {me && (resumeTest || next) && (
        <div className="card flex flex-wrap items-center gap-3 !border-brand/30 bg-brand-soft/50">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white"><Icon name="target" /></span>
          <div className="min-w-0 flex-1 text-sm">
            {resumeTest ? <><p className="font-extrabold text-navy">Bạn đang làm dở một bài</p><p className="text-slate-600">{resumeTest.title}</p></>
              : <><p className="font-extrabold text-navy">Nên làm tiếp: {next!.title}</p><p className="text-slate-600">{sk?.latestReadiness == null ? "Làm Quick Test để hệ thống gợi ý chính xác hơn." : `Mức phù hợp: Mức ${rec} · ${LEVELS[rec - 1].name}${weakest ? `, môn nên luyện thêm: ${sName(weakest)}` : ""}.`}</p></>}
          </div>
          <Link href={resumeTest ? `/thi/${resume![1]}` : `/thi-thu/${next!.id}`} className="btn">{resumeTest ? "Tiếp tục làm bài" : "Bắt đầu"}</Link>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-sm">{FILTERS.map(([k, label]) => <Link key={k} href={k ? `?mon=${k}` : "?"} className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 font-semibold ${mon === k ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand"}`}>{label}</Link>)}</div>

      {simTests.length > 0 && (
        <section id="mo-phong" className="card !border-brand/30 !p-4 sm:!p-6">
          <div className="mb-4"><p className="eyebrow">Đề mô phỏng CSCA</p><h2 className="text-xl font-extrabold text-navy">Đúng khuôn đề thi thật</h2>
            <p className="text-sm text-slate-500">Mỗi môn một bài riêng như kỳ thi thật: Toán, Vật lý, Hóa học {SIM_FORMAT.math.questions} câu · {SIM_FORMAT.math.minutes} phút; Professional Chinese {SIM_FORMAT.chinese.questions} câu · {SIM_FORMAT.chinese.minutes} phút. Chấm thang 100 điểm (quy đổi ước tính, không phải điểm chính thức).</p></div>
          <div className="divide-y divide-slate-100">
            {(Object.keys(SIM_FORMAT) as (keyof typeof SIM_FORMAT)[]).map((k) => { const items = simTests.filter((t) => t.subject === k); if (!items.length) return null; return (
              <div key={k} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="sm:w-52 sm:shrink-0"><p className="font-bold">{sName(k)}</p><p className="text-xs text-slate-500">{SIM_FORMAT[k].questions} câu · {SIM_FORMAT[k].minutes}′ · thang 100</p></div>
                <div className="flex flex-wrap gap-2">{items.map((t) => <SetPill key={t.id} t={t} />)}</div>
              </div>); })}
          </div>
        </section>
      )}

      <section>
        <div className="grid gap-4 md:grid-cols-3"><Link href="/quick-test" className="card card-hover !border-brand/30 bg-gradient-to-br from-brand-soft to-white"><span className="chip">MIỄN PHÍ</span><h3 className="mt-2 font-bold">Quick Test</h3><p className="mt-1 text-sm text-slate-600">{QUICK_TEST.questions} câu · {QUICK_TEST.minutes} phút · AI phân tích ngay. Bắt đầu từ đây để biết cấp của bạn.</p></Link></div>
      </section>

      {leveled.map(({ l, list }) => (
        <section key={l.level} id={`cap-${l.level}`} className="card !p-4 sm:!p-6">
          <div className="mb-4">
            <p className="eyebrow">Mức {l.level} {rec === l.level && me ? "· Gợi ý cho bạn" : ""}</p><h2 className="text-xl font-extrabold">{l.name}</h2><p className="text-sm text-slate-500">{l.tagline} · {mixText(l.mix)} · điểm gợi ý: {l.range}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {groups(list).map((g) => (
              <div key={g.k} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="sm:w-52 sm:shrink-0"><p className="font-bold">{g.label}</p><p className="text-xs text-slate-500">{g.items.length} đề · {count(g.items[0])} câu · {g.items[0].duration_min}′</p></div>
                <div className="flex flex-wrap gap-2">{g.items.map((t) => <SetPill key={t.id} t={t} />)}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {others.length > 0 && <section><h2 className="mb-3 text-xl font-extrabold">Đề khác</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map((t) => (
        <Link key={t.id} href={`/thi-thu/${t.id}`} className="card card-hover flex flex-col"><div className="flex flex-wrap gap-1.5"><span className="chip">Đề thi</span>{open.has(t.id) && <span className="chip !bg-amber-50 !text-amber-800">Đang làm dở</span>}{best.has(t.id) && <span className="chip !bg-emerald-50 !text-emerald-700">Đã làm</span>}</div><h3 className="mt-2 font-bold">{t.title}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-600">{t.description}</p><p className="mt-auto flex items-center justify-between pt-4 text-sm"><span className="flex items-center gap-1 text-slate-500"><Icon name="clock" className="h-4 w-4" />{count(t)} câu · {t.duration_min}′</span><b>{t.price_vnd ? vnd(t.price_vnd) : "Miễn phí"}</b></p></Link>
      ))}</div></section>}
      {!tests.length && <p className="text-slate-500">Chưa có đề thi nào được công bố {mon ? "cho lựa chọn này" : ""}.</p>}
    </div>
  );
}
