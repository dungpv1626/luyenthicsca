"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { reviewFlags, slugify } from "@/lib/blog";

const back = (q: string) => redirect(`/admin/blog?${q}`);
const trim = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export async function savePostAction(id: string, fd: FormData) {
  await requireAdmin("content");
  const slug = slugify(trim(fd.get("slug"), 120));
  const title = trim(fd.get("title"), 200), seo = trim(fd.get("seo_title"), 200), meta = trim(fd.get("meta_description"), 400), body = String(fd.get("body_md") ?? "");
  if (!slug || !title || !seo || !meta || !body.trim()) redirect(`/admin/blog/${id}?error=${encodeURIComponent("Cần điền đủ tiêu đề, thẻ title, mô tả meta, đường dẫn và nội dung.")}`);
  const keywords = trim(fd.get("keywords"), 600).split(",").map((k) => k.trim()).filter(Boolean);
  const { error } = await adminDb().from("posts").update({ slug, title, seo_title: seo, meta_description: meta, keyword: trim(fd.get("keyword"), 120) || null, keywords, category: trim(fd.get("category"), 60) || "Thông tin kỳ thi", body_md: body.replace(/\r\n/g, "\n"), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) redirect(`/admin/blog/${id}?error=${encodeURIComponent(error.code === "23505" ? "Đường dẫn này đã được dùng cho bài khác." : "Không lưu được: " + error.message)}`);
  revalidatePath("/blog"); revalidatePath(`/blog/${slug}`);
  redirect(`/admin/blog/${id}?ok=1`);
}

/** Đổi trạng thái: gỡ về nháp, công bố ngay, hoặc lên lịch theo ngày dự kiến. Bài còn cờ cần xác minh thì không được công bố. */
export async function setPostStatusAction(id: string, to: "draft" | "published" | "scheduled") {
  await requireAdmin("content");
  const db = adminDb();
  const { data: p } = await db.from("posts").select("id, slug, title, body_md, planned_for").eq("id", id).single();
  if (!p) back("error=" + encodeURIComponent("Không tìm thấy bài."));
  const flags = reviewFlags(p!.body_md);
  if (to !== "draft" && flags.length) back("error=" + encodeURIComponent(`“${p!.title}” còn ${flags.length} chỗ cần xử lý: ${flags.join("; ")}.`));
  const patch = to === "draft" ? { status: "draft" }
    : to === "published" ? { status: "published", publish_at: new Date().toISOString() }
    : { status: "scheduled", publish_at: new Date(`${p!.planned_for ?? new Date().toISOString().slice(0, 10)}T09:00:00+07:00`).toISOString() };
  await db.from("posts").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/blog"); revalidatePath(`/blog/${p!.slug}`);
  back("ok=1");
}

/** Lên lịch hàng loạt: mọi bài nháp không còn cờ cần xác minh, theo ngày dự kiến trong kế hoạch. */
export async function scheduleAllAction() {
  await requireAdmin("content");
  const db = adminDb();
  const { data } = await db.from("posts").select("id, body_md, planned_for").eq("status", "draft");
  const ok = (data ?? []).filter((p) => !reviewFlags(p.body_md).length);
  for (const p of ok) await db.from("posts").update({ status: "scheduled", publish_at: new Date(`${p.planned_for ?? new Date().toISOString().slice(0, 10)}T09:00:00+07:00`).toISOString(), updated_at: new Date().toISOString() }).eq("id", p.id);
  revalidatePath("/blog");
  back(`scheduled=${ok.length}&skipped=${(data ?? []).length - ok.length}`);
}
