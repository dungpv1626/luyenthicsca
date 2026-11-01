import { adminDb } from "./supabase/admin";

/** Học viên được học khóa: miễn phí, hoặc đã có đơn paid. */
export async function canAccessCourse(userId: string | undefined, course: { id: string; price_vnd: number }) {
  if (course.price_vnd === 0) return true;
  if (!userId) return false;
  const { data } = await adminDb().from("orders").select("id").eq("user_id", userId).eq("course_id", course.id).eq("status", "paid").limit(1);
  return !!data?.length;
}

/** Chỉ cho nhúng video từ YouTube/Vimeo qua https. */
export function embedUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    const h = u.hostname.replace(/^www\./, "");
    if (h === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (h === "youtube.com" || h === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (h === "vimeo.com") { const id = u.pathname.match(/\/(\d+)/)?.[1]; return id ? `https://player.vimeo.com/video/${id}` : null; }
  } catch { /* url không hợp lệ */ }
  return null;
}
