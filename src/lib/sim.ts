/** Đề mô phỏng CSCA: số câu và thời gian theo thông tin công bố của kỳ thi (Toán/Lý/Hóa 48 câu 60 phút; Tiếng Trung chuyên ngành 80 câu 90 phút). */
export const SIM_FORMAT = {
  math: { questions: 48, minutes: 60 },
  physics: { questions: 48, minutes: 60 },
  chemistry: { questions: 48, minutes: 60 },
  chinese: { questions: 80, minutes: 90 },
} as const;
/** Cơ cấu độ khó của đề mô phỏng: do chúng tôi ước lượng (chưa có số liệu chính thức), không nêu như thông tin của kỳ thi. */
export const SIM_MIX = { easy: 30, medium: 50, hard: 20 } as const;
/** Chuẩn thời gian mỗi câu (giây). */
export const secondsPerQuestion = (subject: keyof typeof SIM_FORMAT) => Math.round((SIM_FORMAT[subject].minutes * 60) / SIM_FORMAT[subject].questions);
/** Điểm quy đổi thang 100 (ước tính, không phải điểm chính thức). */
export const score100 = (correct: number, total: number) => (total > 0 ? Math.round((correct / total) * 100) : 0);
