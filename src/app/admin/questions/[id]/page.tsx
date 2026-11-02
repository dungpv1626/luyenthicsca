import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, LANGUAGES, STATUS_LABEL, SUBJECTS } from "@/lib/constants";
import { saveQuestion } from "../../actions";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const me = await requireAdmin("questions");
  const { id } = await params;
  const { error } = await searchParams;
  const isNew = id === "new";
  const { data: q } = isNew ? { data: null } : await adminDb().from("questions").select("*").eq("id", id).single();
  if (!isNew && !q) notFound();
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  const opts = (q?.options ?? {}) as Record<string, string>;
  const sel = (name: string, map: Record<string, string>, cur?: string) => (
    <select name={name} defaultValue={cur} className="input">{Object.entries(map).filter(([k]) => canApprove || k !== "approved" || name !== "status").map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
  );

  return (
    <form action={saveQuestion.bind(null, isNew ? null : id)} className="card max-w-2xl space-y-3">
      <h1 className="text-xl font-bold">{isNew ? "Câu hỏi mới" : "Sửa câu hỏi"}</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">Vui lòng điền đủ chủ đề, nội dung và 4 đáp án.</p>}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Môn</label>{sel("subject", SUBJECTS, q?.subject)}</div>
        <div><label className="label">Chủ đề</label><input name="topic" defaultValue={q?.topic} className="input" required /></div>
        <div><label className="label">Độ khó</label>{sel("difficulty", DIFFICULTY, q?.difficulty ?? "medium")}</div>
        <div><label className="label">Ngôn ngữ</label>{sel("language", LANGUAGES, q?.language)}</div>
      </div>
      <div><label className="label">Nội dung câu hỏi</label><textarea name="body" defaultValue={q?.body} rows={3} className="input" required /></div>
      {(["A", "B", "C", "D"] as const).map((k) => <div key={k}><label className="label">Đáp án {k}</label><input name={`opt_${k}`} defaultValue={opts[k]} className="input" required /></div>)}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Đáp án đúng</label><select name="correct_answer" defaultValue={q?.correct_answer ?? "A"} className="input">{["A", "B", "C", "D"].map((k) => <option key={k}>{k}</option>)}</select></div>
        <div><label className="label">Thời gian dự kiến (giây)</label><input type="number" name="est_time_sec" defaultValue={q?.est_time_sec ?? 60} className="input" /></div>
        <div><label className="label">Kỹ năng</label><input name="skill" defaultValue={q?.skill ?? ""} className="input" /></div>
        <div><label className="label">Nguồn tham khảo</label><input name="source" defaultValue={q?.source ?? ""} className="input" /></div>
      </div>
      <div><label className="label">Giải thích</label><textarea name="explanation" defaultValue={q?.explanation} rows={3} className="input" /></div>
      {(["en", "zh"] as const).map((lg) => {
        const t = (q?.translations?.[lg] ?? {}) as { body?: string; options?: Record<string, string>; explanation?: string };
        return (
          <details key={lg} className="rounded-xl border border-slate-200 p-3" open={!!t.body}>
            <summary className="cursor-pointer font-semibold">{lg === "en" ? "Bản tiếng Anh (English)" : "Bản tiếng Trung (中文)"}</summary>
            <div className="mt-3 space-y-3">
              <textarea name={`tr_${lg}_body`} rows={3} defaultValue={t.body ?? ""} placeholder="Nội dung câu hỏi" className="input" />
              {(["A", "B", "C", "D"] as const).map((k) => <input key={k} name={`tr_${lg}_opt_${k}`} defaultValue={t.options?.[k] ?? ""} placeholder={`Đáp án ${k}`} className="input" />)}
              <textarea name={`tr_${lg}_explanation`} rows={3} defaultValue={t.explanation ?? ""} placeholder="Giải thích" className="input" />
              <p className="text-xs text-slate-500">Thứ tự A–D phải tương đương bản tiếng Việt. Để trống phần nội dung để bỏ bản dịch này.</p>
            </div>
          </details>
        );
      })}
      <div><label className="label">Trạng thái</label>{sel("status", STATUS_LABEL, q?.status ?? "draft")}</div>
      <button className="btn">Lưu</button>
    </form>
  );
}
