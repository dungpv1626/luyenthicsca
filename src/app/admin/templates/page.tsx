import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, type Subject } from "@/lib/constants";
import { Rich } from "@/components/Rich";
import { TEMPLATES, mkRng, seedFor, validateVariant } from "@/lib/templates/index.ts";
import { reviewTemplateAction } from "../actions";
import { inScope, subjectScope } from "@/lib/reviewer";
import { TemplateDecision } from "@/components/admin/TemplateDecision";

const DIFF: Record<string, string> = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const STATUS: Record<string, [string, string]> = {
  approved: ["Giáo viên đã duyệt", "!bg-success-bg !text-success"],
  rejected: ["Đã loại", "!bg-danger-bg !text-danger"],
  pending: ["Chờ duyệt", "!bg-warning-bg !text-warning"],
};

export const metadata = { title: "Khuôn câu hỏi – Quản trị" };

type SP = { ok?: string; error?: string; s?: string; st?: string; t?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requireAdmin("questions");
  const { ok, error, s: sp, st = "", t: tp } = await searchParams;
  const scope = await subjectScope(me);
  const subjects = (["math", "physics", "chemistry"] as Subject[]).filter((x) => inScope(scope, x));
  if (!subjects.length) return <div className="space-y-3"><h1 className="text-2xl font-bold">Khuôn câu hỏi tham số</h1><p className="card text-sm text-slate-600">Môn bạn phụ trách không có khuôn câu hỏi tham số. Hãy vào <a href="/admin/review" className="font-semibold text-brand-text">Duyệt câu hỏi</a>.</p></div>;
  const cur = (subjects as string[]).includes(sp ?? "") ? (sp as Subject) : subjects[0];

  const db = adminDb();
  const [{ data: reviews }, { data: counts }] = await Promise.all([
    db.from("template_reviews").select("template_key, status, note, reviewed_at"),
    db.rpc("admin_template_counts"),
  ]);
  const rv = new Map((reviews ?? []).map((r) => [r.template_key, r]));
  const cnt = new Map<string, { live: number; total: number }>(((counts ?? []) as { template_key: string; live: number; total: number }[]).map((c) => [c.template_key, c]));
  const statusOf = (k: string) => rv.get(k)?.status ?? "pending";
  const pendingIn = (sub: Subject) => TEMPLATES.filter((t) => t.subject === sub && statusOf(t.key) === "pending").length;

  // Chuyên đề của môn đang chọn, theo thứ tự xuất hiện; mặc định mở chuyên đề đầu tiên còn khuôn chờ duyệt.
  const inSubject = TEMPLATES.filter((t) => t.subject === cur);
  const topics = [...new Set(inSubject.map((t) => t.topic))].map((name) => {
    const list = inSubject.filter((t) => t.topic === name);
    return {
      name, total: list.length,
      approved: list.filter((t) => statusOf(t.key) === "approved").length,
      rejected: list.filter((t) => statusOf(t.key) === "rejected").length,
      variants: list.reduce((s, t) => s + (cnt.get(t.key)?.live ?? 0), 0),
    };
  });
  const topic = topics.find((x) => x.name === tp)?.name ?? topics.find((x) => x.approved + x.rejected < x.total)?.name ?? topics[0]?.name;
  const list = inSubject
    .filter((t) => t.topic === topic && (!st || statusOf(t.key) === st))
    .sort((a, b) => a.subtopic.localeCompare(b.subtopic, "vi") || DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);
  const subtopics = [...new Set(list.map((t) => t.subtopic))];

  const q = (o: Partial<Record<"s" | "st" | "t", string>>) => "?" + new URLSearchParams(Object.entries({ s: cur, t: topic, st, ...o }).filter(([, v]) => v) as [string, string][]).toString();
  const back = `/admin/templates${q({})}`;
  const tab = (href: string, on: boolean, label: React.ReactNode) => <Link key={href} href={href} className={`inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ${on ? "bg-brand text-white" : "border border-slate-200 bg-surface hover:border-brand hover:text-brand-text"}`}>{label}</Link>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Khuôn câu hỏi tham số</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">Đáp án của mỗi khuôn được <b>tính bằng mã</b> nên công thức luôn đúng; lỗi thường nằm ở <b>đề bài, lời giải và các tham số rơi vào giá trị lạ</b>. Chọn một chuyên đề, xem mẫu của từng khuôn, mở <b>“Xem tất cả biến thể”</b> để soi các câu đáng ngờ. Duyệt khuôn = xác nhận toàn bộ biến thể; loại khuôn = gỡ toàn bộ biến thể.</p>
      </div>
      {ok && <p className="rounded-xl bg-success-bg p-3 text-sm text-emerald-800">Đã ghi nhận quyết định.</p>}
      {error && <p className="rounded-xl bg-warning-bg p-3 text-sm text-amber-900">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {subjects.length > 1 && subjects.map((x) => tab(`?s=${x}`, cur === x, <>{SUBJECTS[x].split(" (")[0]}{pendingIn(x) > 0 && <span className={`rounded-full px-1.5 text-xs font-bold ${cur === x ? "bg-white/25" : "bg-amber-100 text-warning"}`}>{pendingIn(x)} chờ duyệt</span>}</>))}
        {subjects.length > 1 && <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />}
        {([["", "Tất cả"], ["pending", "Chờ duyệt"], ["approved", "Đã duyệt"], ["rejected", "Đã loại"]] as const).map(([v, l]) => tab(q({ st: v }), st === v, l))}
      </div>

      <section aria-label="Chuyên đề" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {topics.map((x) => {
          const on = x.name === topic, done = x.approved + x.rejected;
          return (
            <Link key={x.name} href={q({ t: x.name })} aria-current={on ? "true" : undefined} className={`card block !p-3 transition ${on ? "!border-brand ring-2 ring-brand/30" : "card-hover"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-bold text-ink">{x.name}</p>
                <p className="shrink-0 text-xs font-semibold text-muted">{done}/{x.total} khuôn</p>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${x.approved} đã duyệt, ${x.rejected} đã loại, ${x.total - done} chờ duyệt`}>
                <span className="bg-emerald-500" style={{ width: `${(x.approved / x.total) * 100}%` }} />
                <span className="bg-red-400" style={{ width: `${(x.rejected / x.total) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted">{x.total - done > 0 ? <b className="text-warning">{x.total - done} chờ duyệt</b> : <b className="text-success">Đã xong</b>} · {x.variants.toLocaleString("vi-VN")} biến thể</p>
            </Link>
          );
        })}
      </section>

      {!list.length && <p className="card text-sm text-slate-600">Chuyên đề này không có khuôn nào khớp bộ lọc.</p>}
      {subtopics.map((sub) => (
        <section key={sub} className="space-y-3" aria-label={sub}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{topic} › {sub}</h2>
          {list.filter((t) => t.subtopic === sub).map((t) => {
            const r = rv.get(t.key), c = cnt.get(t.key);
            const samples = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => t.build(mkRng(seedFor(t.key, i)))).filter((v) => v && !validateVariant(v)).slice(0, 2) as NonNullable<ReturnType<typeof t.build>>[];
            const [label, cls] = STATUS[statusOf(t.key)] ?? STATUS.pending;
            return (
              <article key={t.key} className="card min-w-0 space-y-3">
                <header className="flex flex-wrap items-center gap-2">
                  <span className="chip !bg-slate-100 !text-slate-600">{DIFF[t.difficulty]}</span>
                  <span className={`chip ${cls}`}>{label}</span>
                  <code className="text-xs text-muted">{t.key}</code>
                  <Link href={`/admin/templates/${encodeURIComponent(t.key)}`} className="ml-auto text-sm font-semibold text-brand-text hover:underline">Xem tất cả {(c?.total ?? 0).toLocaleString("vi-VN")} biến thể →</Link>
                </header>
                <div className="grid gap-3 lg:grid-cols-2">
                  {samples.map((v, i) => (
                    <div key={i} className="min-w-0 rounded-xl bg-mist p-3 text-sm">
                      <p className="font-medium"><Rich text={v.vi.body} /></p>
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">{v.vi.opts.map((o, k) => <li key={k} className={k === 0 ? "font-semibold text-success" : "text-slate-600"}>{"ABCD"[k]}. <Rich text={o} />{k === 0 && " ✓"}</li>)}</ul>
                      <p className="mt-2 text-xs text-slate-600"><Rich text={v.vi.steps} /></p>
                    </div>
                  ))}
                </div>
                {r?.note && <p className="text-xs text-muted">Ghi chú: {r.note}</p>}
                <TemplateDecision action={reviewTemplateAction.bind(null, t.key)} back={back} />
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
