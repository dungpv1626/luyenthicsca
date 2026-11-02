import { requireMe } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { adminDb } from "@/lib/supabase/admin";
import { wrongQuestionIds } from "@/lib/exam";
import { getSkillProfile } from "@/lib/skills";
import { PracticeFilters } from "@/components/PracticeFilters";
import { DIFFICULTY, SUBJECTS } from "@/lib/constants";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { startPracticeAction } from "../exam-actions";

export const metadata = { title: "Luyện tập theo chủ đề" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await requireMe("/luyen-tap");
  const { error } = await searchParams;
  const [{ data: topics }, wrong, sk] = await Promise.all([adminDb().from("questions").select("subject, topic").eq("status", "approved").limit(20000), wrongQuestionIds(me.id), getSkillProfile(me.id)]);
  const bySubject: Record<string, string[]> = {};
  for (const t of topics ?? []) { const a = (bySubject[t.subject] ??= []); if (!a.includes(t.topic)) a.push(t.topic); }
  for (const k of Object.keys(bySubject)) bySubject[k].sort((a, b) => a.localeCompare(b, "vi"));
  return (
    <div>
      <PageHeader en="Practice" vi="Ngân hàng câu hỏi">Chọn môn, chủ đề, độ khó và số câu. Mỗi câu có giải thích; câu sai được lưu để luyện lại.</PageHeader>
      {error && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Chưa có câu hỏi phù hợp với lựa chọn này. Hãy thử bộ lọc khác.</p>}
      {sk.weak.length > 0 && (
        <section className="card mb-6 !p-4" aria-label="Chủ đề nên ôn">
          <p className="text-sm font-extrabold text-navy">Chủ đề nên ôn <span className="font-normal text-slate-500">· dựa trên các bài bạn đã làm, bấm để luyện 10 câu</span></p>
          <div className="mt-2 flex flex-wrap gap-2">{sk.weak.map((t) => (
            <form key={t.subject + t.topic} action={startPracticeAction}><input type="hidden" name="subject" value={t.subject} /><input type="hidden" name="topic" value={t.topic} /><input type="hidden" name="count" value="10" />
              <button className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-800 transition hover:-translate-y-0.5 hover:border-rose-400">{t.topic}<span className="text-xs font-bold text-rose-600">{t.pct}%</span></button></form>))}
          </div>
        </section>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form action={startPracticeAction} className="card space-y-4">
          <PracticeFilters bySubject={bySubject} subjects={SUBJECTS} difficulties={DIFFICULTY} />
          <SubmitButton className="btn w-full" pendingText="Đang chọn câu hỏi…">Bắt đầu luyện tập</SubmitButton>
        </form>
        <form action={startPracticeAction} className="card flex flex-col justify-between gap-4 bg-gradient-to-br from-brand-soft to-white">
          <input type="hidden" name="mode" value="wrong" /><input type="hidden" name="count" value="20" />
          <div><span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white"><Icon name="pencil" /></span><h2 className="mt-3 text-lg font-bold">Câu đã sai</h2><p className="mt-1 text-sm text-slate-600">{wrong.length ? `Bạn có ${wrong.length} câu từng làm sai. Làm lại để biến chỗ hổng thành điểm mạnh.` : "Chưa có câu sai nào. Hãy làm một bài thi để bắt đầu."}</p></div>
          <SubmitButton disabled={!wrong.length} className="btn w-full" pendingText="Đang chọn câu hỏi…">Luyện lại tối đa 20 câu</SubmitButton>
        </form>
      </div>
    </div>
  );
}
