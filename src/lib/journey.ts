// Lộ trình dạng "đường ống": các CHẶNG ôn thi CSCA và trạng thái từng chặng (đã qua / đang ở / chưa tới) tính từ dữ liệu thật của học sinh.
// File thuần (không import ngoài) để test được bằng node --test.

export type StageStatus = "done" | "current" | "todo";
export type StageKey = "assess" | "goal" | "topics" | "levels" | "sim" | "final";
export type Stage = {
  key: StageKey; no: number; title: string; desc: string; status: StageStatus;
  progress: { done: number; total: number; label: string };
  /** Việc còn phải làm ở chặng này (đã làm = done) */
  items: { text: string; done: boolean }[];
  cta: { href: string; label: string };
};

export type JourneyInput = {
  hasQuick: boolean;                       // đã nộp Quick Test
  hasTarget: boolean; hasExamDate: boolean; hasPlan: boolean;
  examDate: string | null; todayISO: string;
  practiceCount: number;                   // số buổi luyện tập đã nộp
  weak: { subject: string; topic: string; pct: number }[]; // chủ đề yếu (< 60%), yếu nhất trước
  levelAttempts: number; bestLevelReadiness: number | null; // đề theo Mức đã nộp
  recommendedLevel: number; recommendedLevelName: string;
  simCount: number; bestSim: number | null; // đề mô phỏng đã nộp, điểm quy đổi cao nhất (thang 100)
  targetScore: number;                      // điểm mục tiêu (thang 100)
};

export const PRACTICE_GOAL = 6;   // số buổi luyện chuyên đề để coi là "đã vá lỗ hổng"
export const LEVEL_GOAL = 3;      // số đề theo mức cần làm
export const LEVEL_PASS = 60;     // mức sẵn sàng tối thiểu của đề theo mức
export const SIM_GOAL = 2;        // số đề mô phỏng cần làm

export const daysUntil = (iso: string | null, today: string) => (iso ? Math.round((Date.parse(iso + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400000) : null);

export function buildJourney(i: JourneyInput): { stages: Stage[]; currentIndex: number; doneCount: number; allDone: boolean; examDays: number | null } {
  const cap = (n: number, m: number) => Math.min(n, m);
  const goalItems = [{ text: "Đặt mục tiêu điểm", done: i.hasTarget }, { text: "Chọn ngày thi dự kiến", done: i.hasExamDate }, { text: "Tạo lộ trình học bằng AI", done: i.hasPlan }];
  const weakItems = i.weak.slice(0, 3).map((t) => ({ text: `Ôn lại: ${t.topic} (${t.pct}%)`, done: false }));
  const firstWeak = i.weak[0];
  const levelDone = i.levelAttempts >= LEVEL_GOAL && (i.bestLevelReadiness ?? 0) >= LEVEL_PASS;
  const simDone = i.simCount >= SIM_GOAL;
  const finalDone = simDone && (i.bestSim ?? 0) >= i.targetScore;
  const examDays = daysUntil(i.examDate, i.todayISO);

  const raw: Omit<Stage, "status" | "no">[] = [
    { key: "assess", title: "Đo năng lực", desc: "Làm Quick Test 15 phút để biết điểm mạnh, điểm yếu theo môn và chuyên đề.",
      progress: { done: i.hasQuick ? 1 : 0, total: 1, label: i.hasQuick ? "Đã có kết quả" : "Chưa làm Quick Test" },
      items: [{ text: "Làm Quick Test", done: i.hasQuick }], cta: { href: "/quick-test", label: "Làm Quick Test" } },
    { key: "goal", title: "Đặt mục tiêu và lộ trình", desc: "Chọn điểm mục tiêu, ngày thi và để AI dựng kế hoạch theo từng ngày.",
      progress: { done: goalItems.filter((x) => x.done).length, total: 3, label: `${goalItems.filter((x) => x.done).length}/3 việc` },
      items: goalItems, cta: { href: "/lo-trinh#tao-lo-trinh", label: "Thiết lập lộ trình" } },
    { key: "topics", title: "Vá lỗ hổng theo chuyên đề", desc: "Luyện từng chuyên đề của đề cương, ưu tiên chuyên đề bạn đang yếu nhất.",
      progress: { done: cap(i.practiceCount, PRACTICE_GOAL), total: PRACTICE_GOAL, label: `${cap(i.practiceCount, PRACTICE_GOAL)}/${PRACTICE_GOAL} buổi luyện` + (i.weak.length ? ` · còn ${i.weak.length} chuyên đề yếu` : "") },
      items: weakItems.length ? weakItems : [{ text: `Luyện ${PRACTICE_GOAL} buổi chuyên đề`, done: i.practiceCount >= PRACTICE_GOAL }],
      cta: { href: firstWeak ? `/luyen-tap?subject=${firstWeak.subject}#chuyen-de` : "/luyen-tap#chuyen-de", label: firstWeak ? "Ôn chuyên đề yếu" : "Luyện theo chuyên đề" } },
    { key: "levels", title: "Luyện đề theo mức", desc: `Làm đề theo mức độ tăng dần. Mức gợi ý cho bạn: Mức ${i.recommendedLevel} (${i.recommendedLevelName}).`,
      progress: { done: cap(i.levelAttempts, LEVEL_GOAL), total: LEVEL_GOAL, label: `${cap(i.levelAttempts, LEVEL_GOAL)}/${LEVEL_GOAL} đề` + (i.bestLevelReadiness != null ? ` · cao nhất ${i.bestLevelReadiness}/100` : "") },
      items: [{ text: `Làm ${LEVEL_GOAL} đề theo mức`, done: i.levelAttempts >= LEVEL_GOAL }, { text: `Đạt từ ${LEVEL_PASS}/100`, done: (i.bestLevelReadiness ?? 0) >= LEVEL_PASS }],
      cta: { href: "/thi-thu", label: "Làm đề theo mức" } },
    { key: "sim", title: "Đề mô phỏng", desc: "Thi đúng khuôn kỳ thi thật: 48 câu trong 60 phút (Tiếng Trung 80 câu, 90 phút). Điểm quy đổi chỉ là ước tính.",
      progress: { done: cap(i.simCount, SIM_GOAL), total: SIM_GOAL, label: `${cap(i.simCount, SIM_GOAL)}/${SIM_GOAL} đề` + (i.bestSim != null ? ` · cao nhất ${i.bestSim}/100` : "") },
      items: [{ text: `Làm ${SIM_GOAL} đề mô phỏng`, done: simDone }], cta: { href: "/thi-thu#mo-phong", label: "Làm đề mô phỏng" } },
    { key: "final", title: "Tổng duyệt trước ngày thi", desc: examDays != null ? (examDays >= 0 ? `Còn ${examDays} ngày đến kỳ thi. Sửa lỗi cuối và giữ nhịp luyện đề.` : "Ngày thi dự kiến đã qua. Hãy cập nhật ngày thi mới.") : "Chọn ngày thi để có đồng hồ đếm ngược. Sửa lỗi cuối và giữ nhịp luyện đề.",
      progress: { done: cap(i.bestSim ?? 0, i.targetScore), total: i.targetScore, label: (i.bestSim ?? 0) >= i.targetScore ? `Đã đạt ${i.bestSim}/100 (mục tiêu ${i.targetScore})` : `${i.bestSim ?? 0}/${i.targetScore} điểm mục tiêu` },
      items: [{ text: `Đạt ${i.targetScore}/100 ở đề mô phỏng`, done: finalDone }], cta: { href: "/thi-thu#mo-phong", label: "Thi thử tổng duyệt" } },
  ];
  const doneFlags = [i.hasQuick, goalItems.every((x) => x.done), i.practiceCount >= PRACTICE_GOAL && i.weak.length === 0, levelDone, simDone, finalDone];
  const firstOpen = doneFlags.findIndex((d) => !d);
  const allDone = firstOpen === -1;
  const currentIndex = allDone ? raw.length - 1 : firstOpen;
  const stages: Stage[] = raw.map((s, k) => ({ ...s, no: k + 1, status: doneFlags[k] ? "done" : k === currentIndex ? "current" : "todo" }));
  return { stages, currentIndex, doneCount: doneFlags.filter(Boolean).length, allDone, examDays };
}
