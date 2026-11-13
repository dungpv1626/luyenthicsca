import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { reviewFlags, type Post } from "@/lib/blog";
import { savePostAction } from "../../blog-actions";

export const metadata = { title: "Sửa bài viết – Quản trị" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin("content");
  const { id } = await params; const sp = await searchParams;
  const { data } = await adminDb().from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Post;
  const flags = reviewFlags(p.body_md);
  const len = (s: string, lo: number, hi: number) => (s.length > hi ? `text-amber-700 font-semibold` : s.length < lo ? "text-amber-700" : "text-success");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted"><Link href="/admin/blog" className="hover:text-brand">← Blog SEO</Link></p><h1 className="text-2xl font-bold">{p.title}</h1></div><Link href={`/blog/${p.slug}`} target="_blank" className="btn-outline">Xem trước</Link></div>
      {sp.ok && <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-emerald-800">Đã lưu.</p>}
      {sp.error && <p role="alert" className="rounded-xl bg-warning-bg p-3 text-sm text-amber-900">{sp.error}</p>}
      {flags.length > 0 && <div className="rounded-xl bg-warning-bg p-3 text-sm text-amber-900"><p className="font-bold">Cần xử lý trước khi công bố:</p><ul className="mt-1 list-disc pl-5">{flags.map((f) => <li key={f}>{f}</li>)}</ul></div>}
      <form action={savePostAction.bind(null, p.id)} className="card space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label" htmlFor="b-title">Tiêu đề bài (H1)</label><input id="b-title" name="title" defaultValue={p.title} required className="input" /></div>
          <div><label className="label" htmlFor="b-slug">Đường dẫn: /blog/…</label><input id="b-slug" name="slug" defaultValue={p.slug} required className="input" /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="b-seo">Thẻ title <span className={`text-xs ${len(p.seo_title, 30, 60)}`}>({p.seo_title.length} ký tự, nên ≤ 60)</span></label><input id="b-seo" name="seo_title" defaultValue={p.seo_title} required className="input" /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="b-meta">Mô tả meta <span className={`text-xs ${len(p.meta_description, 110, 160)}`}>({p.meta_description.length} ký tự, nên 110–160)</span></label><textarea id="b-meta" name="meta_description" defaultValue={p.meta_description} required rows={3} className="input" /></div>
          <div><label className="label" htmlFor="b-kw">Từ khóa chính</label><input id="b-kw" name="keyword" defaultValue={p.keyword ?? ""} className="input" /></div>
          <div><label className="label" htmlFor="b-cat">Chủ đề</label><input id="b-cat" name="category" defaultValue={p.category} className="input" /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="b-kws">Từ khóa phụ (cách nhau bởi dấu phẩy)</label><input id="b-kws" name="keywords" defaultValue={p.keywords.join(", ")} className="input" /></div>
        </div>
        <div><label className="label" htmlFor="b-body">Nội dung (Markdown: ## tiêu đề, danh sách, bảng, [liên kết](url))</label><textarea id="b-body" name="body_md" defaultValue={p.body_md} required rows={30} spellCheck={false} className="input font-mono !text-[13px] leading-6" /></div>
        <button className="btn">Lưu thay đổi</button>
      </form>
    </div>
  );
}
