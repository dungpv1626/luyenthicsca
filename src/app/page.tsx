import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { AUDIENCES, QUICK_TEST, vnd } from "@/lib/constants";
import { LEVELS, mixText } from "@/lib/levels";
import { Icon } from "@/components/Icon";
import { SchoolPhoto } from "@/components/SchoolPhoto";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { SectionTitle } from "@/components/Section";
import { HeroArt } from "@/components/art/HeroArt";
import { SubjectArt } from "@/components/art/SubjectArt";
import { CampusArt } from "@/components/art/CampusArt";

const STEPS = [
  ["test", "Thi thử", "Quick Test 15 phút"],
  ["check", "Chấm điểm", "Tự động, tức thì"],
  ["sparkles", "AI phân tích", "Điểm mạnh – điểm yếu"],
  ["route", "Lộ trình", "Nhiệm vụ mỗi ngày"],
  ["chart", "Thi lại", "So sánh tiến bộ"],
] as const;

const SUBJECT_CARDS = [
  ["math", "Toán", "Đại số, hàm số, xác suất, hình học, giải tích…"],
  ["physics", "Vật lý", "Cơ học, điện, sóng, quang, vật lý hiện đại…"],
  ["chemistry", "Hóa học", "Phản ứng, dung dịch, axit–bazơ, hữu cơ…"],
  ["chinese", "Professional Chinese", "Từ vựng chuyên ngành, đọc hiểu, ngữ pháp…"],
] as const;

const FEATURES = [
  ["book", "Ngân hàng câu hỏi", "Câu hỏi có giải thích chi tiết theo môn, chủ đề, độ khó; công thức hiển thị chuẩn.", "/luyen-tap"],
  ["sparkles", "AI phân tích & Gia sư", "Báo cáo cá nhân hóa sau mỗi bài thi và gia sư AI giải đáp từng câu.", "/ai"],
  ["route", "Lộ trình cá nhân", "Kế hoạch học theo ngày, bám sát điểm yếu của chính bạn.", "/lo-trinh"],
  ["school", "Trường & Học bổng", "Đối chiếu năng lực với yêu cầu của trường, đăng ký tư vấn.", "/truong"],
] as const;

export default async function Home() {
  const db = adminDb();
  const head = (t: string, f?: (q: any) => any) => { const q = db.from(t).select("*", { count: "exact", head: true }); return f ? f(q) : q; }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const [{ count: nQ }, { count: nSchools }, { data: schools }, { data: scholarships }] = await Promise.all([
    head("questions", (q) => q.eq("status", "approved")),
    head("schools"),
    db.from("schools").select("id, name, name_zh, city, kind, image_url, image_credit").order("created_at").limit(6),
    db.from("scholarships").select("id, name").eq("is_active", true).limit(1),
  ]);
  const stats = [
    [nQ ?? 0, "+", "Câu hỏi đang công bố"], [4, "", "Môn thi CSCA"], [3, "", "Ngôn ngữ: Việt · Anh · 中文"], [nSchools ?? 0, "", "Trường trong cơ sở dữ liệu"],
  ] as const;

  return (
    <div className="space-y-20 sm:space-y-24">
      {/* ===== HERO ===== */}
      <section className="mesh-navy relative isolate overflow-hidden rounded-[1.75rem] text-white shadow-[0_30px_80px_-30px_rgb(30_58_138/0.7)] sm:rounded-[2.25rem]">
        <div className="grid-lines pointer-events-none absolute inset-0 -z-10" />
        <div className="drift pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="grid items-center gap-8 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-14 lg:py-16">
          <div>
            <span className="rise inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur sm:text-xs"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>Ôn thi CSCA · Việt – Anh – 中文</span>
            <h1 className="hero-title rise rise-2 mt-5">Bạn đã sẵn sàng thi <span className="text-gradient">CSCA</span>?</h1>
            <p className="rise rise-3 mt-5 max-w-lg text-base text-white/85 sm:text-lg">Kiểm tra năng lực miễn phí, biết ngay điểm mạnh – điểm yếu, nhận lộ trình ôn thi cá nhân hóa và gia sư AI bên cạnh bạn.</p>
            <div className="rise rise-4 mt-7 flex flex-wrap gap-3">
              <Link href="/quick-test" className="btn-light !px-6 !py-3 text-base">Thi thử miễn phí <Icon name="arrow" className="h-4 w-4" /></Link>
              <Link href="/csca" className="btn-ghost-light !px-6 !py-3 text-base">Tìm hiểu CSCA</Link>
            </div>
            <ul className="rise rise-4 mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              {[`${QUICK_TEST.questions} câu`, `${QUICK_TEST.minutes} phút`, "Báo cáo AI ngay"].map((t) => <li key={t} className="flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-full bg-white/20"><Icon name="check" className="h-3 w-3" /></span>{t}</li>)}
            </ul>
          </div>
          <div className="rise rise-3"><HeroArt /></div>
        </div>
      </section>

      {/* ===== SỐ LIỆU THẬT ===== */}
      <section className="-mt-14 px-1 sm:-mt-16 sm:px-6">
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {stats.map(([v, suf, label], i) => (
            <Reveal key={label} delay={i * 90}><div className="glass rounded-2xl p-4 text-center sm:p-5"><p className="text-3xl font-black text-navy sm:text-4xl"><CountUp value={v} suffix={suf} /></p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">{label}</p></div></Reveal>
          ))}
        </div>
      </section>

      {/* ===== ĐỐI TƯỢNG ===== */}
      <section>
        <Reveal><p className="mb-4 text-center text-sm font-semibold text-slate-500">Bạn là ai? Chọn để chúng tôi gợi ý phù hợp</p></Reveal>
        <div className="flex flex-wrap justify-center gap-2.5">
          {Object.entries(AUDIENCES).map(([k, v], i) => <Reveal key={k} delay={i * 60}><Link href={`/dang-ky?audience=${k}`} className="inline-flex min-h-[2.5rem] items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand hover:shadow-md">{v}</Link></Reveal>)}
        </div>
      </section>

      {/* ===== BỐN MÔN ===== */}
      <section>
        <Reveal><SectionTitle en="4 subjects" vi="Bốn môn thi, một nền tảng" center /></Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {SUBJECT_CARDS.map(([k, name, desc], i) => (
            <Reveal key={k} delay={i * 100}>
              <Link href="/luyen-tap" className="card card-hover group block h-full overflow-hidden !p-0">
                <div className="overflow-hidden"><SubjectArt subject={k} className="aspect-[10/7] w-full transition duration-500 group-hover:scale-105" /></div>
                <div className="p-3.5 sm:p-5"><h3 className="text-sm font-extrabold text-navy sm:text-lg">{name}</h3><p className="mt-1 hidden text-sm text-slate-600 sm:block">{desc}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand sm:mt-3 sm:text-sm">Luyện ngay <Icon name="arrow" className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== QUY TRÌNH ===== */}
      <section>
        <Reveal><SectionTitle en="How it works" vi="Quy trình học thông minh" center /></Reveal>
        <ol className="relative mt-10 grid gap-3 sm:gap-6 md:grid-cols-5">
          {STEPS.map(([icon, t, d], i) => (
            <Reveal key={t} as="li" delay={i * 110} className="relative">
              {i < STEPS.length - 1 && <span className="absolute left-[calc(50%+2.75rem)] top-8 hidden h-px w-[calc(100%-5.5rem)] border-t-2 border-dashed border-brand/30 md:block" />}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-3.5 shadow-sm md:flex-col md:border-0 md:bg-transparent md:p-0 md:text-center md:shadow-none">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-indigo text-white shadow-[var(--shadow-glow)] md:mx-auto md:h-16 md:w-16 md:rounded-full"><Icon name={icon} className="h-6 w-6 md:h-7 md:w-7" /><span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold text-xs font-extrabold text-white shadow">{i + 1}</span></span>
                <div className="md:mt-1"><h3 className="font-bold">{t}</h3><p className="text-sm text-slate-500">{d}</p></div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ===== TÍNH NĂNG ===== */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-brand-soft via-white to-white px-5 py-10 sm:rounded-[2.25rem] sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="grid gap-10 md:grid-cols-[1fr_1.5fr]">
          <Reveal><SectionTitle en="Welcome CSCA" vi="Nền tảng toàn diện" /><p className="mt-5 max-w-sm text-slate-600">Không chỉ là nơi luyện đề. Mỗi bài thi trở thành dữ liệu để AI hiểu bạn và dẫn bạn đi đúng hướng.</p></Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(([icon, t, d, href], i) => (
              <Reveal key={t} delay={i * 100}><Link href={href} className="card card-hover group flex h-full flex-col gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-indigo text-white shadow-[var(--shadow-glow)] transition duration-300 group-hover:rotate-6 group-hover:scale-110"><Icon name={icon} className="h-6 w-6" /></span>
                <h3 className="font-bold">{t}</h3><p className="text-sm text-slate-600">{d}</p>
              </Link></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4 CẤP ĐỘ ===== */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3"><Reveal><SectionTitle en="Mock Test" vi="Thi thử theo 4 cấp độ" /></Reveal><Reveal><Link href="/thi-thu" className="btn-outline">Xem tất cả đề <Icon name="arrow" className="h-4 w-4" /></Link></Reveal></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((l, i) => (
            <Reveal key={l.level} delay={i * 100}>
              <Link href={`/thi-thu#cap-${l.level}`} className="card card-hover group relative block h-full overflow-hidden">
                <span className="absolute -right-3 -top-5 select-none text-[6.5rem] font-black leading-none text-brand/[0.07] transition group-hover:text-brand/15">{l.level}</span>
                <span className="chip">Cấp {l.level}</span>
                <h3 className="mt-3 text-lg font-extrabold text-navy">{l.name}</h3><p className="mt-1 min-h-[2.5rem] text-sm text-slate-600">{l.tagline}</p>
                <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100" title={mixText(l.mix)}><span className="bg-sky-300" style={{ width: `${l.mix.easy}%` }} /><span className="bg-brand" style={{ width: `${l.mix.medium}%` }} /><span className="bg-navy" style={{ width: `${l.mix.hard}%` }} /></div>
                <p className="mt-1.5 text-[11px] font-medium text-slate-500">{mixText(l.mix)}</p>
                <p className="mt-3 flex items-center justify-between text-sm"><span className="text-slate-500">{l.range}</span><b className={l.price ? "text-ink" : "text-emerald-600"}>{l.price ? vnd(l.price) : "Miễn phí"}</b></p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== GIA SƯ AI ===== */}
      <section className="mesh-navy relative isolate overflow-hidden rounded-[1.75rem] px-5 py-10 text-white sm:rounded-[2.25rem] sm:px-12 sm:py-14">
        <div className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow !text-sky-200">AI Tutor</p><h2 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">Gia sư AI giải thích đến khi bạn hiểu</h2>
            <ul className="mt-5 space-y-3 text-white/85">{["Hỏi từng câu ngay trong trang kết quả", "Trả lời bằng ngôn ngữ bạn dùng: Việt, Anh hoặc Trung", "Giải từng bước, nêu rõ vì sao các đáp án còn lại sai"].map((t) => <li key={t} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20"><Icon name="check" className="h-3 w-3" /></span>{t}</li>)}</ul>
            <Link href="/gia-su" className="btn-light mt-7">Hỏi gia sư ngay <Icon name="arrow" className="h-4 w-4" /></Link>
          </Reveal>
          <Reveal delay={150}>
            <div className="glass-dark mx-auto max-w-md space-y-3 rounded-3xl p-4 sm:p-5">
              <div className="flex items-center gap-2 border-b border-white/15 pb-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand"><Icon name="sparkles" className="h-4 w-4" /></span><b className="text-sm">Gia sư AI</b><span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">Ví dụ</span></div>
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-3.5 py-2 text-sm">Vì sao x² − 5x + 6 = 0 có tổng hai nghiệm bằng 5?</p>
              <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink">Theo định lý Vi-ét, tổng hai nghiệm là x₁ + x₂ = −b/a. Ở đây a = 1, b = −5 nên tổng = 5. Bạn thử tính tích hai nghiệm xem?</p>
              <p className="caret w-fit rounded-2xl rounded-bl-sm bg-white/15 px-3.5 py-2 text-sm text-white/80">Nhập câu hỏi của bạn</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== TRƯỜNG ===== */}
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-navy to-brand px-5 pb-28 pt-10 text-white sm:rounded-[2.25rem] sm:px-12 sm:pb-36 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 text-white"><Reveal><SectionTitle en="Universities" vi="Trường & học bổng" light /></Reveal><Reveal><Link href="/truong" className="btn-light">Khám phá trường <Icon name="arrow" className="h-4 w-4" /></Link></Reveal></div>
        <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {(schools ?? []).map((s, i) => (
            <Reveal key={s.id} delay={i * 80}><Link href={`/truong/${s.id}`} className="glass-dark group block overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/20">
              <SchoolPhoto url={s.image_url} credit={s.image_credit} alt={s.name} className="h-36 sm:h-40" />
              <div className="p-4 sm:p-5">
              <p className="text-2xl font-black text-white/40 transition group-hover:text-white/70">{s.name_zh}</p><h3 className="mt-1 font-bold">{s.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/75"><Icon name="map" className="h-4 w-4" />{s.city} · {s.kind}</p>
              </div>
            </Link></Reveal>
          ))}
        </div>
        {scholarships?.[0] && <Reveal><Link href="/hoc-bong" className="relative z-10 mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 text-ink shadow-xl transition hover:-translate-y-0.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-white"><Icon name="award" /></span><span className="min-w-0 text-sm"><b className="block truncate">{scholarships[0].name}</b><span className="text-slate-500">Xem các học bổng đang mở</span></span><Icon name="arrow" className="ml-auto h-4 w-4 shrink-0 text-brand" /></Link></Reveal>}
        <CampusArt className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 w-full sm:h-40" />
      </section>

      {/* ===== KÊU GỌI ===== */}
      <Reveal>
        <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-brand via-indigo to-navy px-5 py-12 text-center text-white sm:rounded-[2.25rem] sm:py-16">
          <div className="drift pointer-events-none absolute -left-10 -top-10 -z-10 h-56 w-56 rounded-full bg-white/15 blur-2xl" /><div className="drift pointer-events-none absolute -bottom-16 right-0 -z-10 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" style={{ animationDelay: "-6s" }} />
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">Biết mình đang ở đâu chỉ sau 15 phút</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Làm Quick Test miễn phí, nhận Readiness Score và lộ trình cá nhân hóa ngay hôm nay.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/quick-test" className="btn-light !px-7 !py-3 text-base">Bắt đầu miễn phí <Icon name="arrow" className="h-4 w-4" /></Link><Link href="/thi-thu" className="btn-ghost-light !px-7 !py-3 text-base">Xem các đề thi</Link></div>
        </section>
      </Reveal>
    </div>
  );
}
