import Link from "next/link";
import type { Metadata } from "next";
import { livePosts, fmtDate } from "@/lib/blog";
import { abs } from "@/lib/seo";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const n = (await livePosts()).length;
  return {
    title: "Blog CSCA: lịch thi, môn thi, đề cương và cách ôn",
    description: "Kiến thức về kỳ thi CSCA cho học sinh Việt Nam: lịch thi, môn thi theo ngành, đăng ký, lệ phí, đề cương Toán Lý Hóa và chiến thuật làm bài.",
    alternates: { canonical: abs("/blog") },
    robots: n ? undefined : { index: false, follow: true }, // chưa có bài nào thì chưa cho lập chỉ mục
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c = "" } = await searchParams;
  const all = await livePosts();
  const cats = [...new Set(all.map((p) => p.category))];
  const list = c ? all.filter((p) => p.category === c) : all;
  return (
    <div className="space-y-8">
      <PageHeader en="Blog" vi="Kiến thức CSCA">Lịch thi, môn thi theo ngành, đăng ký, lệ phí, đề cương và chiến thuật ôn thi CSCA dành cho học sinh Việt Nam.</PageHeader>
      {!all.length ? (
        <p className="card text-slate-600">Bài viết đang được chuẩn bị. Trong lúc chờ, bạn có thể <Link href="/quick-test" className="font-semibold text-brand hover:underline">làm Quick Test miễn phí</Link> để biết mình đang ở mức nào.</p>
      ) : (
        <>
          <nav aria-label="Chủ đề" className="flex flex-wrap gap-2 text-sm">
            <Link href="/blog" className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 font-semibold ${!c ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand"}`}>Tất cả ({all.length})</Link>
            {cats.map((k) => <Link key={k} href={`/blog?c=${encodeURIComponent(k)}`} className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 font-semibold ${c === k ? "bg-brand text-white" : "border border-slate-200 hover:border-brand hover:text-brand"}`}>{k}</Link>)}
          </nav>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card card-hover group flex flex-col">
                <span className="chip w-fit">{p.category}</span>
                <h2 className="mt-3 text-lg font-extrabold leading-snug text-navy group-hover:text-brand">{p.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{p.meta_description}</p>
                <p className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{fmtDate(p.publish_at)} · {p.read_minutes} phút đọc</span><Icon name="arrow" className="h-4 w-4 text-brand transition group-hover:translate-x-1" /></p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
