import type { MetadataRoute } from "next";
import { livePosts } from "@/lib/blog";
import { adminDb } from "@/lib/supabase/admin";
import { abs } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, { data: schools }] = await Promise.all([livePosts(), adminDb().from("schools").select("id")]);
  const fixed = ["/", "/csca", "/thi-thu", "/quick-test", "/truong", "/hoc-bong", "/academy", "/bang-gia", ...(posts.length ? ["/blog"] : [])];
  return [
    ...fixed.map((p) => ({ url: abs(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updated_at, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...(schools ?? []).map((s) => ({ url: abs(`/truong/${s.id}`), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
