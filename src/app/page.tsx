import Link from "next/link";
import { AUDIENCES, QUICK_TEST } from "@/lib/constants";

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-6 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold md:text-5xl">Bạn đã sẵn sàng thi CSCA?</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          Kiểm tra năng lực miễn phí – biết điểm mạnh, điểm yếu – nhận phân tích cá nhân hóa từ AI.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/quick-test" className="rounded-lg bg-white px-6 py-3 font-bold text-brand hover:bg-stone-100">THI THỬ MIỄN PHÍ</Link>
          <Link href="/csca" className="rounded-lg border border-white/70 px-6 py-3 font-bold hover:bg-white/10">TÌM HIỂU CSCA</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-center text-2xl font-bold">Bạn là ai?</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(AUDIENCES).map(([k, v]) => (
            <Link key={k} href={`/dang-ky?audience=${k}`} className="card text-center font-medium hover:border-brand hover:text-brand">{v}</Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold">Quick Test – {QUICK_TEST.minutes} phút để biết trình độ CSCA</h2>
        <ol className="mt-4 grid gap-3 text-center text-sm font-medium md:grid-cols-5">
          {[`${QUICK_TEST.questions} câu hỏi`, `${QUICK_TEST.minutes} phút`, "Chấm điểm tự động", "AI phân tích", "Nhận báo cáo"].map((s, i) => (
            <li key={s} className="rounded-lg bg-stone-100 p-3"><span className="mr-1 text-brand">{i + 1}.</span>{s}</li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Thi thử", "Mock Test mô phỏng kỳ thi thật theo từng môn: Toán, Vật lý, Hóa học, Professional Chinese.", "/thi-thu"],
          ["Luyện tập", "Ngân hàng câu hỏi theo môn, chủ đề, độ khó, kèm giải thích chi tiết.", "/luyen-tap"],
          ["AI CSCA", "Readiness Score, điểm mạnh/yếu và gợi ý ôn tập sau mỗi bài thi.", "/quick-test"],
        ].map(([t, d, h]) => (
          <Link key={t} href={h} className="card hover:border-brand">
            <h3 className="text-lg font-bold text-brand">{t}</h3>
            <p className="mt-2 text-sm text-stone-600">{d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
