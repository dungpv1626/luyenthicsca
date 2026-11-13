import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ADMIN_AREAS, getMe } from "@/lib/auth";
import { fmtDate, isLive, livePosts, postBySlug, tocOf } from "@/lib/blog";
import { SITE_NAME, abs } from "@/lib/seo";
import { Markdown } from "@/components/Markdown";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

/** Bài chưa công bố chỉ nhân viên nội dung xem được (xem trước). */
async function load(slug: string) {
  const post = await postBySlug(slug);
  if (!post) return { post: null, preview: false };
  if (isLive(post)) return { post, preview: false };
  const me = await getMe();
  const staff = !!me && (ADMIN_AREAS.content as readonly string[]).includes(me.role);
  return { post: staff ? post : null, preview: staff };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { post, preview } = await load(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };
  const url = abs(`/blog/${post.slug}`);
  return {
    title: { absolute: post.seo_title }, description: post.meta_description, keywords: [post.keyword ?? "", ...post.keywords].filter(Boolean),
    alternates: { canonical: url }, robots: preview ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", url, title: post.seo_title, description: post.meta_description, siteName: SITE_NAME, locale: "vi_VN", publishedTime: post.publish_at ?? undefined, modifiedTime: post.updated_at, images: [{ url: abs("/og.png"), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: post.seo_title, description: post.meta_description, images: [abs("/og.png")] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, preview } = await load(slug);
  if (!post) notFound();
  const toc = tocOf(post.body_md);
  const related = (await livePosts()).filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const url = abs(`/blog/${post.slug}`);
  const published = post.publish_at ?? post.created_at;
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.meta_description, inLanguage: "vi", mainEntityOfPage: url, datePublished: published, dateModified: post.updated_at,
      author: { "@type": "Organization", name: SITE_NAME, url: abs("/") }, publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: abs("/brand/mark.png") } }, image: abs("/og.png"), keywords: [post.keyword, ...post.keywords].filter(Boolean).join(", ") },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: abs("/") }, { "@type": "ListItem", position: 2, name: "Blog", item: abs("/blog") }, { "@type": "ListItem", position: 3, name: post.title, item: url }] },
  ];

  return (
    <article className="mx-auto max-w-6xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      {preview && <p role="status" className="mb-4 rounded-xl bg-warning-bg p-3 text-sm font-semibold text-amber-900">Bản xem trước: bài chưa công bố, chỉ nhân viên nội dung nhìn thấy và công cụ tìm kiếm không lập chỉ mục.</p>}
      <nav aria-label="Đường dẫn" className="mb-4 text-sm text-muted"><Link href="/" className="hover:text-brand-text">Trang chủ</Link> › <Link href="/blog" className="hover:text-brand-text">Blog</Link> › <Link href={`/blog?c=${encodeURIComponent(post.category)}`} className="hover:text-brand-text">{post.category}</Link></nav>
      <header className="max-w-3xl">
        <span className="chip">{post.category}</span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-lg text-slate-600">{post.meta_description}</p>
        <p className="mt-3 text-sm text-muted">{published && <>Đăng {fmtDate(published)} · </>}Cập nhật {fmtDate(post.updated_at)} · {post.read_minutes} phút đọc</p>
      </header>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 max-w-3xl">
          {toc.length > 2 && <details className="card mb-6 lg:hidden"><summary className="cursor-pointer font-bold text-navy">Mục lục</summary><ol className="mt-2 space-y-1 text-sm">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="inline-block py-1.5 text-slate-600 hover:text-brand-text">{t.text}</a></li>)}</ol></details>}
          <Markdown>{post.body_md}</Markdown>
          <aside className="mesh-navy relative mt-12 overflow-hidden rounded-3xl p-6 text-white sm:p-8" aria-label="Bắt đầu luyện thi">
            <h2 className="text-2xl font-extrabold">Biết mình đang ở đâu chỉ sau 15 phút</h2>
            <p className="mt-2 max-w-xl text-white/85">Làm bài kiểm tra nhanh miễn phí để nhận chỉ số sẵn sàng CSCA, phân tích điểm mạnh – điểm yếu và lộ trình ôn cá nhân hóa.</p>
            <div className="mt-5 flex flex-wrap gap-3"><Link href="/quick-test" className="btn-light">Làm Quick Test miễn phí <Icon name="arrow" className="h-4 w-4" /></Link><Link href="/thi-thu" className="btn-ghost-light">Xem các đề thi thử</Link></div>
          </aside>
        </div>
        {toc.length > 2 && <aside className="hidden lg:block" aria-label="Mục lục"><div className="sticky top-24 rounded-2xl border border-slate-200 bg-surface p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted">Trong bài này</p><ol className="mt-2 space-y-0.5 text-sm">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="block rounded-lg px-2 py-1.5 text-slate-600 hover:bg-brand-soft hover:text-brand-text">{t.text}</a></li>)}</ol></div></aside>}
      </div>
      {related.length > 0 && <section className="mt-14" aria-label="Bài liên quan"><h2 className="mb-4 text-xl font-extrabold text-navy">Bài liên quan</h2><div className="grid gap-4 sm:grid-cols-3">{related.map((p) => <Link key={p.id} href={`/blog/${p.slug}`} className="card card-hover"><h3 className="font-bold leading-snug text-navy">{p.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.meta_description}</p></Link>)}</div></section>}
    </article>
  );
}
