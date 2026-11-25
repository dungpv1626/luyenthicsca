import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, type Subject } from "@/lib/constants";
import { Rich } from "@/components/Rich";
import { TEMPLATES } from "@/lib/templates/index.ts";
import { inScope, subjectScope } from "@/lib/reviewer";
import { variantFlags, variantScore } from "@/lib/template-variants";
import { removeVariantAction, restoreVariantAction, reviewTemplateAction } from "../../actions";
import { TemplateDecision } from "@/components/admin/TemplateDecision";
import { ConfirmButton } from "@/components/ConfirmButton";

const DIFF: Record<string, string> = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
const STATUS: Record<string, [string, string]> = {
  approved: ["Giáo viên đã duyệt", "!bg-success-bg !text-success"],
  rejected: ["Đã loại", "!bg-danger-bg !text-danger"],
  pending: ["Chờ duyệt", "!bg-warning-bg !text-warning"],
};
const PER = 30;

export const metadata = { title: "Biến thể của khuôn – Quản trị" };

type V = { id: string; body: string; options: Record<string, string>; correct_answer: string; explanation: string | null; status: string; auto_published: boolean; review_note: string | null };

export default async function Page({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ v?: string; page?: string; ok?: string; error?: string }> }) {
  const me = await requireAdmin("questions");
  const key = decodeURIComponent((await params).key);
  const { v: view = "flag", page: pg, ok, error } = await searchParams;
  const tpl = TEMPLATES.find((t) => t.key === key);
  if (!tpl || !inScope(await subjectScope(me), tpl.subject)) notFound();

  const db = adminDb();
  const [{ data: rows }, { data: review }] = await Promise.all([
    db.from("questions").select("id, body, options, correct_answer, explanation, status, auto_published, review_note").eq("template_key", key).limit(1000),
    db.from("template_reviews").select("status, note").eq("template_key", key).maybeSingle(),
  ]);
  const all = (rows ?? []) as V[];
  const { data: reps } = all.length ? await db.from("question_reports").select("question_id").in("question_id", all.map((x) => x.id)) : { data: [] };
  const reports = new Map<string, number>();
  for (const r of reps ?? []) reports.set(r.question_id, (reports.get(r.question_id) ?? 0) + 1);

  // Bị học viên báo lỗi và có giá trị biên lên đầu.
  const scored = all.map((x) => {
    const flags = variantFlags(x, tpl.subject), n = reports.get(x.id) ?? 0;
    return { ...x, flags, reports: n, score: variantScore(flags, n) };
  }).sort((a, b) => b.score - a.score);
  const live = scored.filter((x) => x.status !== "rejected");
  const removed = scored.filter((x) => x.status === "rejected");
  const flagged = live.filter((x) => x.score > 0);
  const views = { flag: flagged, all: live, removed } as const;
  const cur = (view in views ? view : "flag") as keyof typeof views;
  const shown = views[cur];
  const pages = Math.max(1, Math.ceil(shown.length / PER));
  const page = Math.min(pages, Math.max(1, Number(pg) || 1));
  const slice = shown.slice((page - 1) * PER, page * PER);

  const base = `/admin/templates/${encodeURIComponent(key)}`;
  const href = (o: { v?: string; page?: number }) => `${base}?v=${o.v ?? cur}${(o.page ?? 1) > 1 ? `&page=${o.page}` : ""}`;
  const back = href({ page });
  const [label, cls] = STATUS[review?.status ?? "pending"] ?? STATUS.pending;
  const listUrl = `/admin/templates?s=${tpl.subject}&t=${encodeURIComponent(tpl.topic)}`;
  const tab = (v: keyof typeof views, text: string, n: number) => (
    <Link href={href({ v })} aria-current={cur === v ? "page" : undefined} className={`inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ${cur === v ? "bg-brand text-white" : "border border-slate-200 bg-surface hover:border-brand hover:text-brand-text"}`}>
      {text}<span className={`rounded-full px-1.5 text-xs font-bold ${cur === v ? "bg-white/25" : "bg-slate-100 text-slate-600"}`}>{n}</span>
    </Link>
  );

  return (
    <div className="space-y-5">
      <nav className="text-sm text-muted" aria-label="Vị trí"><Link href={listUrl} className="font-semibold text-brand-text hover:underline">← {SUBJECTS[tpl.subject as Subject]?.split(" (")[0]} › {tpl.topic}</Link></nav>
      <div className="card space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">{tpl.subtopic}</h1>
          <span className="chip !bg-slate-100 !text-slate-600">{DIFF[tpl.difficulty]}</span>
          <span className={`chip ${cls}`}>{label}</span>
          <code className="text-xs text-muted">{tpl.key}</code>
        </div>
        <p className="text-sm text-slate-600">
          <b>{live.length.toLocaleString("vi-VN")}</b> biến thể đang hiển thị cho học viên
          {removed.length > 0 && <> · <b>{removed.length}</b> đã gỡ</>}
          {" · "}<b className={flagged.length ? "text-warning" : "text-success"}>{flagged.length}</b> câu đáng soi (giá trị biên hoặc bị báo lỗi).
          Đáp án hiển thị đúng thứ tự học viên thấy.
        </p>
        {review?.note && <p className="text-xs text-muted">Ghi chú khuôn: {review.note}</p>}
        <TemplateDecision action={reviewTemplateAction.bind(null, key)} back={back} />
      </div>

      {ok && <p className="rounded-xl bg-success-bg p-3 text-sm text-emerald-800">{ok === "removed" ? "Đã gỡ biến thể khỏi học viên." : ok === "restored" ? "Đã đưa biến thể trở lại." : "Đã ghi nhận quyết định."}</p>}
      {error && <p className="rounded-xl bg-warning-bg p-3 text-sm text-amber-900">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {tab("flag", "Cần soi", flagged.length)}
        {tab("all", "Tất cả đang hiển thị", live.length)}
        {tab("removed", "Đã gỡ", removed.length)}
      </div>

      {!slice.length && <p className="card text-sm text-slate-600">{cur === "flag" ? "Không có biến thể nào có giá trị biên hoặc bị báo lỗi. Bạn có thể xem tab “Tất cả đang hiển thị” để lướt thêm." : cur === "removed" ? "Chưa gỡ biến thể nào." : "Khuôn này chưa có biến thể."}</p>}

      <ol className="space-y-3">
        {slice.map((x, i) => (
          <li key={x.id} className="card min-w-0 space-y-2 !p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-muted">#{(page - 1) * PER + i + 1}</span>
              {x.reports > 0 && <span className="chip !bg-danger-bg !text-danger">{x.reports} báo lỗi từ học viên</span>}
              {x.flags.map((f) => <span key={f.key} className="chip !bg-warning-bg !text-warning">{f.label}</span>)}
              {x.status === "rejected" && x.review_note && <span className="text-muted">{x.review_note}</span>}
            </div>
            <p className="text-sm font-medium"><Rich text={x.body} /></p>
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {Object.entries(x.options).map(([k, o]) => <li key={k} className={k === x.correct_answer ? "font-semibold text-success" : "text-slate-600"}>{k}. <Rich text={o} />{k === x.correct_answer && " ✓"}</li>)}
            </ul>
            {x.explanation && <details className="text-xs text-slate-600"><summary className="cursor-pointer font-semibold text-brand-text">Lời giải</summary><div className="mt-1"><Rich text={x.explanation} /></div></details>}
            {x.status === "rejected" ? (
              <form action={restoreVariantAction.bind(null, key, x.id)}>
                <input type="hidden" name="back" value={back} />
                <button className="btn-outline !py-1.5 text-sm">Đưa trở lại</button>
              </form>
            ) : (
              <form action={removeVariantAction.bind(null, key, x.id)} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="back" value={back} />
                <input name="note" className="input !w-auto min-w-0 flex-1 !py-1.5 text-sm" placeholder="Lý do gỡ (vd: đáp án nhiễu bằng 0 vô lý)" />
                <ConfirmButton danger className="btn-outline !border-red-300 !py-1.5 text-sm !text-danger" title="Gỡ biến thể này?" message="Chỉ câu này bị gỡ khỏi học viên; các biến thể khác của khuôn giữ nguyên. Có thể đưa trở lại ở tab “Đã gỡ”." confirmText="Gỡ biến thể">Gỡ biến thể này</ConfirmButton>
              </form>
            )}
          </li>
        ))}
      </ol>

      {pages > 1 && (
        <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Trang">
          {page > 1 && <Link href={href({ page: page - 1 })} className="btn-outline !py-1.5">← Trước</Link>}
          <span className="text-muted">Trang {page}/{pages}</span>
          {page < pages && <Link href={href({ page: page + 1 })} className="btn-outline !py-1.5">Sau →</Link>}
        </nav>
      )}
    </div>
  );
}
