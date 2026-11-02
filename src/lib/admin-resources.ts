import type { ADMIN_AREAS } from "./auth";

export type Field = {
  name: string; label: string;
  type: "text" | "textarea" | "number" | "select" | "date" | "checkbox" | "tags" | "ref";
  options?: Record<string, string>;
  ref?: { table: string; label: string };
  required?: boolean;
  nullable?: boolean; // rỗng → null (ngược lại → '' hoặc 0)
  min?: number; max?: number;
  help?: string;
};
export type Resource = { table: string; title: string; area: keyof typeof ADMIN_AREAS; columns: string[]; fields: Field[] };

const SUBJ = { "": "—", math: "Toán", physics: "Vật lý", chemistry: "Hóa học", chinese: "Professional Chinese" };
const pct = (name: string, label: string): Field => ({ name, label: `${label} – mức chuẩn (% đúng)`, type: "number", nullable: true, min: 0, max: 100, help: "Để trống nếu chưa có dữ liệu chính thức" });

export const RESOURCES: Record<string, Resource> = {
  schools: {
    table: "schools", title: "Trường", area: "schools", columns: ["name", "city", "kind", "verified"],
    fields: [
      { name: "name", label: "Tên trường", type: "text", required: true }, { name: "name_zh", label: "Tên tiếng Trung", type: "text", nullable: true },
      { name: "city", label: "Thành phố", type: "text", nullable: true }, { name: "province", label: "Tỉnh", type: "text", nullable: true },
      { name: "kind", label: "Loại hình", type: "text", nullable: true }, { name: "website", label: "Website", type: "text", nullable: true },
      { name: "image_url", label: "Ảnh trường (đường dẫn /schools/ten.jpg hoặc https://…)", type: "text", nullable: true }, { name: "image_credit", label: "Nguồn / giấy phép ảnh (hiện dưới ảnh)", type: "text", nullable: true },
      { name: "description", label: "Mô tả", type: "textarea" }, { name: "majors", label: "Ngành (cách nhau bởi dấu phẩy)", type: "tags" },
      { name: "csca_required", label: "Yêu cầu CSCA", type: "checkbox" },
      pct("req_math", "Toán"), pct("req_physics", "Vật lý"), pct("req_chemistry", "Hóa học"), pct("req_chinese", "Professional Chinese"),
      { name: "requirement_note", label: "Ghi chú yêu cầu / nguồn", type: "textarea" },
      { name: "verified", label: "Đã đối chiếu thông báo chính thức", type: "checkbox" },
    ],
  },
  scholarships: {
    table: "scholarships", title: "Học bổng", area: "schools", columns: ["name", "provider", "deadline", "is_active"],
    fields: [
      { name: "name", label: "Tên học bổng", type: "text", required: true }, { name: "provider", label: "Đơn vị cấp", type: "text", nullable: true },
      { name: "school_id", label: "Trường liên quan", type: "ref", ref: { table: "schools", label: "name" } },
      { name: "coverage", label: "Quyền lợi", type: "textarea" }, { name: "requirements", label: "Điều kiện", type: "textarea" },
      { name: "deadline", label: "Hạn nộp", type: "date" }, { name: "link", label: "Link chính thức", type: "text", nullable: true },
      { name: "is_active", label: "Đang mở", type: "checkbox" },
    ],
  },
  teachers: {
    table: "teachers", title: "Giáo viên", area: "academy", columns: ["name", "title"],
    fields: [{ name: "name", label: "Họ tên", type: "text", required: true }, { name: "title", label: "Chức danh", type: "text", nullable: true }, { name: "bio", label: "Giới thiệu", type: "textarea" }],
  },
  courses: {
    table: "courses", title: "Khóa học", area: "academy", columns: ["title", "level", "price_vnd", "is_published"],
    fields: [
      { name: "title", label: "Tên khóa học", type: "text", required: true }, { name: "description", label: "Mô tả", type: "textarea" },
      { name: "teacher_id", label: "Giáo viên", type: "ref", ref: { table: "teachers", label: "name" } }, { name: "level", label: "Trình độ", type: "text", nullable: true },
      { name: "price_vnd", label: "Giá (VNĐ, 0 = miễn phí)", type: "number", min: 0 }, { name: "is_published", label: "Công bố", type: "checkbox" },
    ],
  },
  lessons: {
    table: "lessons", title: "Bài giảng", area: "academy", columns: ["title", "position", "is_free_preview"],
    fields: [
      { name: "course_id", label: "Khóa học", type: "ref", ref: { table: "courses", label: "title" }, required: true },
      { name: "position", label: "Thứ tự", type: "number", min: 0 }, { name: "title", label: "Tên bài", type: "text", required: true },
      { name: "video_url", label: "Link video (YouTube/Vimeo)", type: "text", nullable: true }, { name: "content", label: "Nội dung bài", type: "textarea" },
      { name: "is_free_preview", label: "Cho học thử miễn phí", type: "checkbox" },
      { name: "practice_subject", label: "Quiz cuối bài – môn", type: "select", options: SUBJ, nullable: true }, { name: "practice_topic", label: "Quiz cuối bài – chủ đề", type: "text", nullable: true },
    ],
  },
};
