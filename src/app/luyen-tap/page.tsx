import { requireMe } from "@/lib/auth";
import { DIFFICULTY, SUBJECTS } from "@/lib/constants";
import { startPracticeAction } from "../exam-actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireMe("/luyen-tap");
  const { error } = await searchParams;
  return (
    <form action={startPracticeAction} className="card mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Luyện tập theo chủ đề</h1>
      {error && <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">Chưa có câu hỏi phù hợp với lựa chọn này. Hãy thử bộ lọc khác.</p>}
      <div>
        <label className="label">Môn</label>
        <select name="subject" className="input"><option value="">Tất cả các môn</option>{Object.entries(SUBJECTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <div><label className="label">Chủ đề (để trống = tất cả)</label><input name="topic" className="input" placeholder="vd: Hàm số" /></div>
      <div>
        <label className="label">Độ khó</label>
        <select name="difficulty" className="input"><option value="">Tất cả</option>{Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <div>
        <label className="label">Số câu</label>
        <select name="count" className="input" defaultValue="10"><option>10</option><option>20</option><option>50</option></select>
      </div>
      <button className="btn w-full">Bắt đầu luyện tập</button>
    </form>
  );
}
