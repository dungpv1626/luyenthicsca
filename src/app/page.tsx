import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { AUDIENCES, QUICK_TEST, vnd } from "@/lib/constants";
import { Icon } from "@/components/Icon";
import { ScoreRing } from "@/components/ScoreRing";
import { SectionTitle } from "@/components/Section";

const STEPS = [
  ["test", "Thi thử", "Quick Test 15 phút"],
  ["check", "Chấm điểm", "Tự động, tức thì"],
  ["sparkles", "AI phân tích", "Điểm mạnh – điểm yếu"],
  ["route", "Lộ trình", "Nhiệm vụ mỗi ngày"],
  ["chart", "Thi lại", "So sánh tiến bộ"],
] as const;

const FEATURES = [
  ["book", "Ngân hàng câu hỏi", "Câu hỏi được giáo viên duyệt, có giải thích chi tiết theo môn, chủ đề, độ khó.", "/luyen-tap"],
  ["sparkles", "AI phân tích & Gia sư", "Báo cáo cá nhân hóa sau mỗi bài thi và gia sư AI giải đáp từng câu.", "/ai"],
  ["route", "Lộ trình cá nhân", "Kế hoạch học theo ngày, tự điều chỉnh theo điểm yếu của bạn.", "/lo-trinh"],
  ["school", "Trường & Học bổng", "Đối chiếu năng lực với yêu cầu của trường, đăng ký tư vấn.", "/truong"],
] as const;

export default async function Home() {
  const db = adminDb();
  const [{ data: tests }, { data: schools }, { data: scholarships }] = await Promise.all([
    db.from("tests").select("id, title, description, duration_min, price_vnd").eq("is_published", true).order("price_vnd").limit(3),
    db.from("schools").select("id, name, name_zh, city, kind").order("created_at").limit(6),
    db.from("scholarships").select("id, name, coverage").eq("is_active", true).limit(1),
  ]);

  return (
    <div className="space-y-20">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-mist shadow-sm">
        <div className="grid md:grid-cols-[1.15fr_1fr]">
          <div className="hero-diagonal relative bg-gradient-to-br from-navy via-navy to-brand p-8 text-white md:p-12 md:pr-28">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <p className="eyebrow rise !text-white/75">CSCA Readiness Platform</p>
            <h1 className="rise mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">Bạn đã sẵn sàng thi&nbsp;CSCA?</h1>
            <span className="my-5 block h-1 w-14 rounded bg-white/70" />
            <p className="rise rise-2 max-w-md text-white/90">Kiểm tra năng lực miễn phí – biết điểm mạnh, điểm yếu – nhận lộ trình ôn thi cá nhân hóa từ AI.</p>
            <div className="rise rise-3 mt-7 flex flex-wrap gap-3">
              <Link href="/quick-test" className="btn-light">Thi thử miễn phí <Icon name="arrow" className="h-4 w-4" /></Link>
              <Link href="/csca" className="btn-ghost-light">Tìm hiểu CSCA</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80">
              {[`${QUICK_TEST.questions} câu`, `${QUICK_TEST.minutes} phút`, "Báo cáo AI ngay"].map((t) => <li key={t} className="flex items-center gap-1.5"><Icon name="check" className="h-4 w-4" />{t}</li>)}
            </ul>
          </div>
          <div className="dots relative grid place-items-center p-6 md:p-10">
            <div className="rise rise-2 w-full max-w-sm rounded-3xl border border-white bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between"><span className="eyebrow">CSCA Readiness</span><span className="chip">Ví dụ</span></div>
              <div className="mt-4 flex items-center gap-5">
                <ScoreRing value={72} size={116} />
                <div className="flex-1 space-y-2 text-xs font-semibold">
                  {[["Toán", 78], ["Vật lý", 65], ["Hóa học", 72], ["Tốc độ", 81]].map(([n, v]) => (
                    <div key={n}><div className="flex justify-between"><span>{n}</span><span className="text-slate-400">{v}%</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${v}%` }} /></div></div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-brand-soft p-3 text-xs"><b className="text-brand">AI nhận xét:</b> mạnh về Đại số, Tính toán. Cần cải thiện Xác suất, Cơ học.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ĐỐI TƯỢNG */}
      <section>
        <p className="mb-4 text-center text-sm font-semibold text-slate-500">Bạn là ai? Chọn để chúng tôi gợi ý phù hợp</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {Object.entries(AUDIENCES).map(([k, v]) => <Link key={k} href={`/dang-ky?audience=${k}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-brand hover:bg-brand-soft hover:text-brand">{v}</Link>)}
        </div>
      </section>

      {/* QUY TRÌNH */}
      <section>
        <SectionTitle en="How it works" vi="Quy trình học thông minh" center />
        <ol className="mt-10 grid gap-6 md:grid-cols-5">
          {STEPS.map(([icon, t, d], i) => (
            <li key={t} className="relative text-center">
              {i < STEPS.length - 1 && <span className="absolute left-[calc(50%+2.5rem)] top-8 hidden h-px w-[calc(100%-5rem)] border-t-2 border-dashed border-brand/30 md:block" />}
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-brand bg-white text-brand shadow-soft"><Icon name={icon} className="h-7 w-7" /><span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span></span>
              <h3 className="mt-3 font-bold">{t}</h3><p className="text-sm text-slate-500">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* TÍNH NĂNG */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-soft to-white px-6 py-12 md:px-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div><SectionTitle en="Welcome CSCA" vi="Nền tảng toàn diện" /><p className="mt-5 max-w-sm text-slate-600">Không chỉ là nơi luyện đề. Mỗi bài thi trở thành dữ liệu để AI hiểu bạn và dẫn bạn đi đúng hướng.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(([icon, t, d, href]) => (
              <Link key={t} href={href} className="card card-hover group flex flex-col gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-soft transition group-hover:scale-110"><Icon name={icon} className="h-6 w-6" /></span>
                <h3 className="font-bold">{t}</h3><p className="text-sm text-slate-600">{d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* THI THỬ */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle en="Mock Test" vi="Thi thử mô phỏng" /><Link href="/thi-thu" className="btn-outline">Xem tất cả <Icon name="arrow" className="h-4 w-4" /></Link></div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Link href="/quick-test" className="card card-hover relative overflow-hidden !border-brand/30 bg-gradient-to-br from-brand-soft to-white">
            <span className="chip">MIỄN PHÍ</span><h3 className="mt-3 text-lg font-bold">Quick Test CSCA</h3><p className="mt-1 text-sm text-slate-600">{QUICK_TEST.questions} câu · {QUICK_TEST.minutes} phút · AI phân tích ngay.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand">Làm ngay <Icon name="arrow" className="h-4 w-4" /></span>
          </Link>
          {(tests ?? []).map((t) => (
            <Link key={t.id} href={`/thi-thu/${t.id}`} className="card card-hover">
              <span className="chip">{t.price_vnd ? "HOT" : "MIỄN PHÍ"}</span><h3 className="mt-3 text-lg font-bold">{t.title}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-600">{t.description}</p>
              <p className="mt-5 flex items-center justify-between text-sm"><span className="flex items-center gap-1 text-slate-500"><Icon name="clock" className="h-4 w-4" />{t.duration_min} phút</span><b>{vnd(t.price_vnd)}</b></p>
            </Link>
          ))}
        </div>
      </section>

      {/* TRƯỜNG */}
      <section className="rounded-3xl bg-gradient-to-br from-navy to-brand px-6 py-12 text-white md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle en="Universities" vi="Trường & học bổng" light /><Link href="/truong" className="btn-light">Khám phá trường <Icon name="arrow" className="h-4 w-4" /></Link></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(schools ?? []).map((s) => (
            <Link key={s.id} href={`/truong/${s.id}`} className="rounded-2xl bg-white/10 p-5 backdrop-blur transition hover:bg-white/20">
              <p className="text-2xl font-black text-white/40">{s.name_zh}</p><h3 className="mt-1 font-bold">{s.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/75"><Icon name="map" className="h-4 w-4" />{s.city} · {s.kind}</p>
            </Link>
          ))}
        </div>
        {scholarships?.[0] && <Link href="/hoc-bong" className="mt-6 flex items-center gap-3 rounded-2xl bg-white p-4 text-ink transition hover:-translate-y-0.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white"><Icon name="award" /></span><span className="text-sm"><b>{scholarships[0].name}</b><br /><span className="text-slate-500">Xem các học bổng đang mở</span></span></Link>}
      </section>

      {/* LIÊN KẾT */}
      <section>
        <SectionTitle en="Explore" vi="Khám phá thêm" center />
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {[["/luyen-tap", "Luyện tập", "pencil"], ["/ai", "AI CSCA", "sparkles"], ["/lo-trinh", "Lộ trình", "route"], ["/gia-su", "Gia sư AI", "chat"], ["/academy", "Academy", "play"], ["/truong", "Trường", "school"]].map(([h, l, i]) => (
            <Link key={h} href={h} className="group grid h-32 w-32 place-items-center rounded-full border border-slate-200 bg-white text-center shadow-sm transition hover:-translate-y-1 hover:border-brand hover:bg-brand hover:text-white hover:shadow-soft">
              <span className="flex flex-col items-center gap-2 text-sm font-bold"><Icon name={i} className="h-7 w-7 text-brand group-hover:text-white" />{l}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
