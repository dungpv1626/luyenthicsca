import { adminDb } from "@/lib/supabase/admin";
import { classify } from "@/lib/syllabus";

export type TopicStats = {
  /** môn → khóa chuyên đề → số câu đang công bố */
  byTopic: Record<string, Record<string, number>>;
  /** môn → khóa mô-đun → số câu đang công bố (trong phạm vi đề cương) */
  byModule: Record<string, Record<string, number>>;
  /** môn → số câu thuộc mô-đun nhưng chưa gán chuyên đề */
  unassigned: Record<string, number>;
  /** môn → số câu ngoài phần liệt kê của đề cương (chỉ luyện thêm) */
  out: Record<string, number>;
};

/** Đếm câu đang công bố theo chuyên đề. Đọc theo từng trang 1000 dòng (giới hạn của API) song song. */
export async function topicStats(): Promise<TopicStats> {
  const db = adminDb();
  const { count } = await db.from("questions").select("*", { count: "exact", head: true }).eq("status", "approved");
  const pages = Math.max(1, Math.ceil((count ?? 0) / 1000));
  const parts = await Promise.all(Array.from({ length: pages }, (_, i) => db.from("questions").select("subject, topic, subtopic").eq("status", "approved").order("id").range(i * 1000, i * 1000 + 999)));
  const s: TopicStats = { byTopic: {}, byModule: {}, unassigned: {}, out: {} };
  for (const { data } of parts) for (const r of data ?? []) {
    const c = classify(r);
    if (c.module === "out") { s.out[r.subject] = (s.out[r.subject] ?? 0) + 1; continue; }
    if (c.module) (s.byModule[r.subject] ??= {})[c.module] = ((s.byModule[r.subject] ??= {})[c.module] ?? 0) + 1;
    if (c.topic) (s.byTopic[r.subject] ??= {})[c.topic] = ((s.byTopic[r.subject] ??= {})[c.topic] ?? 0) + 1;
    else if (c.module) s.unassigned[r.subject] = (s.unassigned[r.subject] ?? 0) + 1;
  }
  return s;
}
