import { adminDb } from "./supabase/admin";
import { CARD_COLS, isLive, type Post, type PostCard } from "./blog-utils";
export * from "./blog-utils";

const liveFilter = () => `status.eq.published,and(status.eq.scheduled,publish_at.lte.${new Date().toISOString()})`;


export async function livePosts(): Promise<PostCard[]> {
  const { data } = await adminDb().from("posts").select(CARD_COLS).or(liveFilter()).order("publish_at", { ascending: false, nullsFirst: false }).order("planned_no", { ascending: true });
  return (data ?? []) as PostCard[];
}
export async function postBySlug(slug: string): Promise<Post | null> {
  const { data } = await adminDb().from("posts").select("*").eq("slug", slug).maybeSingle();
  return (data as Post | null) ?? null;
}
