export const SUBJECTS = {
  math: "Toán (Mathematics)",
  physics: "Vật lý (Physics)",
  chemistry: "Hóa học (Chemistry)",
  chinese: "Professional Chinese",
} as const;
export type Subject = keyof typeof SUBJECTS;
export const SUBJECT_KEYS = Object.keys(SUBJECTS) as Subject[];

export const DIFFICULTY = { easy: "Dễ", medium: "Trung bình", hard: "Khó" } as const;
export type Difficulty = keyof typeof DIFFICULTY;

export const LANGUAGES = { vi: "Tiếng Việt", en: "English", zh: "中文" } as const;
export const STATUS_LABEL = { draft: "Nháp", review: "Chờ duyệt", approved: "Đã duyệt", rejected: "Đã loại" } as const;

export const AUDIENCES = {
  lop11: "Học sinh lớp 11",
  lop12: "Học sinh lớp 12",
  tot_nghiep: "Đã tốt nghiệp THPT",
  sinh_vien: "Sinh viên",
  hoc_tieng_trung: "Đang học tiếng Trung",
  chua_biet: "Chưa biết CSCA",
} as const;

export const ROLES = {
  super_admin: "Quản trị cấp cao",
  content_manager: "Quản lý nội dung",
  academic_reviewer: "Giáo viên duyệt chuyên môn",
  sales: "Tư vấn / Kinh doanh",
  student: "Học viên",
} as const;
export type Role = keyof typeof ROLES;

export const QUICK_TEST = { questions: 20, minutes: 15 };

export const vnd = (n: number) => (n === 0 ? "Miễn phí" : n.toLocaleString("vi-VN") + "đ");
/** Số tiền thuần (0 → "0đ"), dùng cho doanh thu/tổng tiền; `vnd` chỉ dùng cho GIÁ BÁN (0 = miễn phí). */
export const money = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

export const TUTOR_DAILY_LIMIT = 30;
