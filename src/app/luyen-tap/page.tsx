import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { wrongQuestionIds } from "@/lib/exam";
import { DIFFICULTY, SUBJECTS } from "@/lib/constants";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { startPracticeAction } from "../exam-actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await requireMe("/luyen-tap");
  const { error } = await searchParams;
  const [{ data: topics }, wrong] = await Promise.all([adminDb().from("questions").select("subject, topic").eq("status", "approved"), wrongQuestionIds(me.id)]);
  const topicList = [...new Set((topics ?? []).map((t) => t.topic))].sort();
  return (
    <div>
      <PageHeader en="Practice" vi="Ngân hàng câu hỏi">Chọn môn, chủ đề, độ khó và số câu. Mỗi câu có giải thích; câu sai được lưu để luyện lại.</PageHeader>
      {error && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Chưa có câu hỏi phù hợp với lựa chọn này. Hãy thử bộ lọc khác.</p>}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form action={startPracticeAction} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Môn</label><select name="subject" className="input"><option value="">Tất cả các môn</option>{Object.entries(SUBJECTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="label">Chủ đề</label><input name="topic" list="topics" className="input" placeholder="Tất cả" /><datalist id="topics">{topicList.map((t) => <option key={t} value={t} />)}</datalist></div>
            <div><label className="label">Độ khó</label><select name="difficulty" className="input"><option value="">Tất cả</option>{Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="label">Số câu</label><select name="count" className="input" defaultValue="10"><option>10</option><option>20</option><option>50</option></select></div>
          </div>
          <button className="btn w-full">Bắt đầu luyện tập</button>
        </form>
        <form action={startPracticeAction} className="card flex flex-col justify-between gap-4 bg-gradient-to-br from-brand-soft to-white">
          <input type="hidden" name="mode" value="wrong" /><input type="hidden" name="count" value="20" />
          <div><span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white"><Icon name="pencil" /></span><h2 className="mt-3 text-lg font-bold">Câu đã sai</h2><p className="mt-1 text-sm text-slate-600">{wrong.length ? `Bạn có ${wrong.length} câu từng làm sai. Làm lại để biến chỗ hổng thành điểm mạnh.` : "Chưa có câu sai nào. Hãy làm một bài thi để bắt đầu."}</p></div>
          <button disabled={!wrong.length} className="btn w-full">Luyện lại tối đa 20 câu</button>
        </form>
      </div>
    </div>
  );
}
