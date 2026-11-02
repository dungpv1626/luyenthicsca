import type { Difficulty } from "./constants";

/** 4 cấp độ: cơ cấu độ khó (%) tăng dần. Cấp 4 theo tỉ lệ blueprint (35/45/20). */
export const LEVELS = [
  { level: 1, name: "Nền tảng", tagline: "Làm quen dạng đề, củng cố kiến thức cơ bản", mix: { easy: 70, medium: 30, hard: 0 }, price: 0, range: "dưới 40 điểm" },
  { level: 2, name: "Cơ bản", tagline: "Vận dụng kiến thức, tăng tốc độ làm bài", mix: { easy: 40, medium: 50, hard: 10 }, price: 49000, range: "40–59 điểm" },
  { level: 3, name: "Nâng cao", tagline: "Bài nhiều bước, tránh bẫy thường gặp", mix: { easy: 15, medium: 50, hard: 35 }, price: 59000, range: "60–79 điểm" },
  { level: 4, name: "Mô phỏng thi", tagline: "Đề sát cấu trúc thi thật, tính giờ nghiêm ngặt", mix: { easy: 35, medium: 45, hard: 20 }, price: 59000, range: "từ 80 điểm" },
] as const;

export type LevelNo = (typeof LEVELS)[number]["level"];
export const levelInfo = (n: number | null | undefined) => LEVELS.find((l) => l.level === n);

export const SCOPE_LABEL = { full: "Tổng hợp 4 môn", subject: "Theo môn" } as const;
/** Kích thước đề mặc định (admin chỉnh được theo đặc tả chính thức). */
export const SET_DEFAULTS = { subject: { perSubject: 30, minutes: 45 }, full: { perSubject: 15, minutes: 90 } } as const;

/** Gợi ý cấp theo Readiness gần nhất (chưa có điểm → cấp 1). */
export function recommendLevel(readiness: number | null): LevelNo {
  if (readiness === null) return 1;
  return readiness >= 80 ? 4 : readiness >= 60 ? 3 : readiness >= 40 ? 2 : 1;
}

export const mixText = (m: Record<Difficulty, number>) => `Dễ ${m.easy}% · TB ${m.medium}% · Khó ${m.hard}%`;
