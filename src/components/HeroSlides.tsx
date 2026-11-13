/* eslint-disable @next/next/no-img-element */
const SLIDES = ["thanh-hoa", "giao-thong-thuong-hai", "nam-kinh", "phuc-dan", "chiet-giang", "bac-kinh"];

/** Nền hero: ảnh các trường chuyển dần, phủ lớp xanh navy để chữ luôn đọc rõ (trái đậm, phải nhạt hơn). */
export function HeroSlides() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {SLIDES.map((s, i) => (
        <img key={s} src={`/schools/${s}.jpg`} alt="" decoding="async" loading={i === 0 ? "eager" : "lazy"} className="hero-slide absolute inset-0 h-full w-full object-cover object-top" style={{ animationDelay: `${i * 5}s` }} />
      ))}
      <div className="absolute inset-0 bg-navy-deep/60 lg:bg-gradient-to-r lg:from-navy-deep/95 lg:via-navy-deep/55 lg:to-navy-deep/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 via-transparent to-transparent" />
    </div>
  );
}
