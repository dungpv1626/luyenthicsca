import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, type Subject } from "@/lib/constants";
import { Rich } from "@/components/Rich";
import { TEMPLATES, mkRng, seedFor, validateVariant } from "@/lib/templates/index.ts";
import { reviewTemplateAction } from "../actions";

const DIFF: Record<string, string> = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin("questions");
  const { ok, error } = await searchParams;
  const db = adminDb();
  const [{ data: reviews }, { data: counts }] = await Promise.all([
    db.from("template_reviews").select("template_key, status, note, reviewed_at"),
    db.rpc("admin_template_counts"),
  ]);
  const rv = new Map((reviews ?? []).map((r) => [r.template_key, r]));
  const cnt = new Map<string, { live: number; total: number }>(((counts ?? []) as { template_key: string; live: number; total: number }[]).map((c) => [c.template_key, c]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Khuôn câu hỏi tham số</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">Đáp án và các đáp án nhiễu của mỗi khuôn được <b>tính bằng mã</b> nên mọi biến thể luôn đúng với công thức của khuôn. Giáo viên chỉ cần kiểm tra <b>đề bài, công thức, lời giải và các "lỗi thường gặp"</b> của từng khuôn qua các biến thể mẫu. Duyệt một khuôn = xác nhận toàn bộ biến thể; loại một khuôn = gỡ toàn bộ biến thể.</p>
      </div>
      {ok && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Đã ghi nhận quyết định.</p>}
      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}

      {(["math", "physics", "chemistry"] as Subject[]).map((s) => (
        <section key={s} className="space-y-3">
          <h2 className="text-lg font-bold text-navy">{SUBJECTS[s]}</h2>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            {TEMPLATES.filter((t) => t.subject === s).map((t) => {
              const r = rv.get(t.key), c = cnt.get(t.key);
              const samples = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => t.build(mkRng(seedFor(t.key, i)))).filter((v) => v && !validateVariant(v)).slice(0, 2) as NonNullable<ReturnType<typeof t.build>>[];
              const status = r?.status ?? "pending";
              return (
                <article key={t.key} className="card min-w-0 space-y-3">
                  <header className="flex flex-wrap items-center gap-2">
                    <span className="chip">{t.topic}</span><span className="chip !bg-slate-100 !text-slate-600">{DIFF[t.difficulty]}</span>
                    <span className={`chip ${status === "approved" ? "!bg-emerald-50 !text-emerald-700" : status === "rejected" ? "!bg-rose-50 !text-rose-700" : "!bg-amber-50 !text-amber-800"}`}>{status === "approved" ? "Giáo viên đã duyệt" : status === "rejected" ? "Đã loại" : "Chờ giáo viên duyệt"}</span>
                    <span className="ml-auto text-xs text-slate-500">{c?.live ?? 0} biến thể đang công bố</span>
                  </header>
                  <p className="text-xs text-slate-500"><code>{t.key}</code> · {t.subtopic}</p>
                  {samples.map((v, i) => (
                    <div key={i} className="min-w-0 rounded-xl bg-mist p-3 text-sm">
                      <p className="font-medium"><Rich text={v.vi.body} /></p>
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">{v.vi.opts.map((o, k) => <li key={k} className={k === 0 ? "font-semibold text-emerald-700" : "text-slate-600"}>{"ABCD"[k]}. <Rich text={o} />{k === 0 && " ✓"}</li>)}</ul>
                      <p className="mt-2 text-xs text-slate-600"><Rich text={v.vi.steps} /></p>
                    </div>
                  ))}
                  {r?.note && <p className="text-xs text-slate-500">Ghi chú: {r.note}</p>}
                  <form action={reviewTemplateAction.bind(null, t.key)} className="flex flex-wrap items-center gap-2">
                    <input name="note" className="input !w-auto min-w-0 flex-1" placeholder="Ghi chú (bắt buộc khi loại)" />
                    <button name="decision" value="approve" className="btn !py-2">Duyệt khuôn</button>
                    <button name="decision" value="reject" className="btn-outline !border-rose-300 !py-2 !text-rose-700">Loại khuôn</button>
                  </form>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
