export type Post = {
  id: string; slug: string; title: string; seo_title: string; meta_description: string; keyword: string | null; keywords: string[]; category: string;
  body_md: string; status: "draft" | "scheduled" | "published"; publish_at: string | null; planned_no: number | null; planned_for: string | null;
  replaces_path: string | null; source_file: string | null; read_minutes: number; updated_at: string; created_at: string;
};
export type PostCard = Omit<Post, "body_md">;
export const CARD_COLS = "id, slug, title, seo_title, meta_description, keyword, keywords, category, status, publish_at, planned_no, planned_for, replaces_path, source_file, read_minutes, updated_at, created_at";

/** Bỏ dấu tiếng Việt để làm id/slug. */
export const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const stripMd = (s: string) => s.replace(/\*\*|__|`|\[([^\]]*)\]\([^)]*\)/g, "$1").trim();

/** Những chỗ trong bài cần người phụ trách xử lý trước khi công bố. */
const REVIEW_PATTERNS: [RegExp, string][] = [
  [/\[CẦN XÁC MINH[^\]]*\]/i, "Còn dòng “[CẦN XÁC MINH …]” chưa xử lý"],
  [/\[CHÈN[^\]]*\]/i, "Còn chỗ giữ chỗ “[CHÈN …]” chưa xử lý"],
  [/đội ngũ giáo viên/i, "Nhắc tới “đội ngũ giáo viên biên soạn”: chỉ giữ nếu đề đã thật sự do giáo viên soạn/duyệt"],
  [/do bạn cung cấp/i, "Có dòng nguồn nội bộ (“tài liệu do bạn cung cấp”), không nên công bố"],
];
export const reviewFlags = (body: string) => REVIEW_PATTERNS.filter(([re]) => re.test(body)).map(([, msg]) => msg);

/** Bài đang hiển thị công khai: đã công bố, hoặc đã lên lịch và tới ngày. */
export const isLive = (p: Pick<Post, "status" | "publish_at">) => p.status === "published" || (p.status === "scheduled" && !!p.publish_at && new Date(p.publish_at).getTime() <= Date.now());
export const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "");
export const tocOf = (md: string) => [...md.matchAll(/^## (.+)$/gm)].map((m) => ({ text: stripMd(m[1]), id: slugify(stripMd(m[1])) }));
