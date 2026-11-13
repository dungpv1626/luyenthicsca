import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { SUBJECTS, vnd, type Subject } from "@/lib/constants";
import { LEVELS, SCOPE_LABEL, SET_DEFAULTS, mixText } from "@/lib/levels";
import { maxStrictSets, quota } from "@/lib/assemble";
import { createLevelSets, togglePublish } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const metadata = { title: "Bộ đề theo mức – Quản trị" };

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; partial?: string; warn?: string }> }) {
  await requireAdmin("tests");
  const { ok, error, partial, warn } = await searchParams;
  const db = adminDb();
  const [{ data: qs }, { data: sets }] = await Promise.all([
    db.from("questions").select("subject, difficulty").eq("status", "approved"),
    db.from("tests").select("id, title, level, scope, subject, set_no, duration_min, price_vnd, is_published, test_questions(count)").not("level", "is", null).order("level").order("scope").order("subject").order("set_no"),
  ]);
  const cnt: Record<string, { easy: number; medium: number; hard: number }> = {};
  for (const s of Object.keys(SUBJECTS)) cnt[s] = { easy: 0, medium: 0, hard: 0 };
  for (const q of qs ?? []) cnt[q.subject][q.difficulty as "easy"]++;
  const total = Object.values(cnt).reduce((a, c) => a + c.easy + c.medium + c.hard, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bộ đề theo mức</h1>
      {ok && <p className="rounded-xl bg-success-bg p-3 text-sm text-emerald-800">Đã tạo {ok}{partial ? ` đề (yêu cầu ${partial.split("of")[1]}, không đủ câu cho các đề còn lại)` : " đề"}. {warn ? `Có ${warn} câu được bù độ khó/trùng lại.` : "Đúng cơ cấu, không trùng câu."} Đề được tạo ở trạng thái ${"ẩn"} nếu chưa chọn công bố, hãy kiểm tra rồi bấm Công bố bên dưới.</p>}
      {error && <p className="rounded-xl bg-warning-bg p-3 text-sm text-amber-900">{error}</p>}

      <section className="card">
        <h2 className="mb-1 font-bold">Nguyên liệu: câu hỏi đã duyệt ({total})</h2>
        <p className="mb-3 text-sm text-muted">Chỉ câu <b>Đã duyệt</b> mới được đưa vào đề. Số đề tối đa không trùng câu (đề theo môn, {SET_DEFAULTS.subject.perSubject} câu):</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-sm"><thead><tr className="text-left text-muted"><th className="py-2">Môn</th><th>Dễ</th><th>TB</th><th>Khó</th>{LEVELS.map((l) => <th key={l.level}>Mức {l.level}</th>)}</tr></thead>
          <tbody>{(Object.keys(SUBJECTS) as Subject[]).map((s) => <tr key={s} className="border-t border-slate-100"><td className="py-2 font-medium">{SUBJECTS[s]}</td><td>{cnt[s].easy}</td><td>{cnt[s].medium}</td><td>{cnt[s].hard}</td>{LEVELS.map((l) => { const n = maxStrictSets(cnt[s], SET_DEFAULTS.subject.perSubject, l.mix); return <td key={l.level} className={n === 0 ? "text-slate-300" : "font-bold"}>{n}</td>; })}</tr>)}</tbody></table></div>
        <ul className="mt-3 space-y-1 text-xs text-muted">{LEVELS.map((l) => <li key={l.level}><b>Mức {l.level} · {l.name}</b> — {mixText(l.mix)} (đề {SET_DEFAULTS.subject.perSubject} câu: {(() => { const q = quota(SET_DEFAULTS.subject.perSubject, l.mix); return `${q.easy}/${q.medium}/${q.hard} câu dễ/TB/khó`; })()}) · mặc định {vnd(l.price)}</li>)}</ul>
      </section>

      <form action={createLevelSets} className="card max-w-2xl space-y-4">
        <h2 className="font-bold">Tạo đề</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="a-level">Mức</label><select id="a-level" name="level" className="input">{LEVELS.map((l) => <option key={l.level} value={l.level}>Mức {l.level} · {l.name}</option>)}</select></div>
          <div><label className="label" htmlFor="a-scope">Phạm vi</label><select id="a-scope" name="scope" className="input"><option value="subject">{SCOPE_LABEL.subject}</option><option value="full">{SCOPE_LABEL.full}</option></select></div>
          <div><label className="label" htmlFor="a-subject">Môn (nếu theo môn)</label><select id="a-subject" name="subject" className="input">{Object.entries(SUBJECTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="label" htmlFor="a-count">Số đề cần tạo (1–10)</label><input id="a-count" type="number" name="count" min={1} max={10} defaultValue={3} className="input" /></div>
          <div><label className="label" htmlFor="a-per-subject">Số câu mỗi môn</label><input id="a-per-subject" type="number" name="per_subject" min={3} max={60} defaultValue={SET_DEFAULTS.subject.perSubject} className="input" /><p className="mt-1 text-xs text-muted">Gợi ý: {SET_DEFAULTS.subject.perSubject} cho đề theo môn, {SET_DEFAULTS.full.perSubject} cho đề tổng hợp (theo đặc tả chính thức nếu có).</p></div>
          <div><label className="label" htmlFor="a-minutes">Thời gian (phút)</label><input id="a-minutes" type="number" name="minutes" min={5} max={300} defaultValue={SET_DEFAULTS.subject.minutes} className="input" /><p className="mt-1 text-xs text-muted">Gợi ý: {SET_DEFAULTS.subject.minutes} phút (theo môn), {SET_DEFAULTS.full.minutes} phút (tổng hợp).</p></div>
          <div><label className="label" htmlFor="a-price">Giá (VNĐ, 0 = miễn phí)</label><input id="a-price" type="number" name="price" min={0} step={1000} defaultValue={0} className="input" /><p className="mt-1 text-xs text-muted">Gợi ý: {LEVELS.map((l) => `Mức ${l.level}: ${vnd(l.price)}`).join(" · ")}</p></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="publish" />Công bố ngay (mặc định tạo ở trạng thái ẩn để kiểm tra trước)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="relaxed" />Cho phép bù độ khó / dùng lại câu khi thiếu <span className="text-muted">(chất lượng thấp hơn, chỉ dùng khi ngân hàng còn nhỏ)</span></label>
        <button className="btn">Tạo đề theo mức</button>
      </form>

      <section className="card overflow-x-auto !p-0"><h2 className="border-b border-slate-100 p-4 font-bold">Các đề theo mức ({sets?.length ?? 0})</h2>
        <table className="w-full min-w-[36rem] text-sm"><tbody>{(sets ?? []).map((t) => <tr key={t.id} className="border-t border-slate-100"><td className="p-3 font-medium">{t.title}</td><td className="text-muted">{(t.test_questions as unknown as { count: number }[])[0]?.count ?? 0} câu · {t.duration_min}′</td><td>{vnd(t.price_vnd)}</td><td><span className={`chip ${t.is_published ? "!bg-success-bg !text-success" : "!bg-slate-100 !text-muted"}`}>{t.is_published ? "Đang công bố" : "Ẩn"}</span></td><td className="pr-3 text-right"><form action={togglePublish.bind(null, t.id, !t.is_published)}><ConfirmButton className={`inline-flex min-h-[2.5rem] items-center rounded-lg px-3 font-semibold ${t.is_published ? "text-amber-700 hover:bg-warning-bg" : "text-brand hover:bg-brand-soft"}`} title={t.is_published ? "Gỡ đề khỏi học viên?" : "Công bố đề cho học viên?"} message={t.is_published ? `“${t.title}” sẽ biến mất khỏi trang Thi thử. Các bài học viên đã làm vẫn được giữ.` : `“${t.title}” (${vnd(t.price_vnd)}) sẽ hiện cho mọi học viên. Hãy chắc chắn nội dung đã được kiểm tra.`} confirmText={t.is_published ? "Gỡ đề" : "Công bố"}>{t.is_published ? "Gỡ" : "Công bố"}</ConfirmButton></form></td></tr>)}</tbody></table>
        {!sets?.length && <p className="p-5 text-sm text-muted">Chưa có đề theo mức.</p>}
      </section>
    </div>
  );
}
