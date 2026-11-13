import { test } from "node:test";
import assert from "node:assert/strict";
import { buildJourney, daysUntil, type JourneyInput } from "./journey.ts";

const base: JourneyInput = {
  hasQuick: false, hasTarget: false, hasExamDate: false, hasPlan: false, examDate: null, todayISO: "2026-11-13",
  practiceCount: 0, weak: [], levelAttempts: 0, bestLevelReadiness: null, recommendedLevel: 1, recommendedLevelName: "Nền tảng",
  simCount: 0, bestSim: null, targetScore: 80,
};
const st = (j: ReturnType<typeof buildJourney>) => j.stages.map((s) => s.status[0]).join("");

test("học sinh mới: chặng 1 đang ở, các chặng sau chưa tới", () => {
  const j = buildJourney(base);
  assert.equal(st(j), "ctttt" + "t"); assert.equal(j.currentIndex, 0); assert.equal(j.doneCount, 0); assert.equal(j.allDone, false);
  assert.equal(j.stages[0].cta.href, "/quick-test");
});

test("đã qua Quick Test, chưa đặt mục tiêu: chặng 2 đang ở và liệt kê việc còn thiếu", () => {
  const j = buildJourney({ ...base, hasQuick: true, hasTarget: true });
  assert.equal(st(j), "dcttt" + "t"); assert.equal(j.stages[1].progress.done, 1); assert.deepEqual(j.stages[1].items.filter((x) => !x.done).map((x) => x.text), ["Chọn ngày thi dự kiến", "Tạo lộ trình học bằng AI"]);
});

test("chặng chuyên đề chỉ xong khi đủ buổi luyện VÀ hết chủ đề yếu", () => {
  const ready = { ...base, hasQuick: true, hasTarget: true, hasExamDate: true, hasPlan: true };
  const a = buildJourney({ ...ready, practiceCount: 8, weak: [{ subject: "math", topic: "Dãy số", pct: 20 }] });
  assert.equal(a.currentIndex, 2); assert.match(a.stages[2].progress.label, /6\/6 buổi luyện · còn 1 chuyên đề yếu/); assert.match(a.stages[2].cta.href, /subject=math/); assert.equal(a.stages[2].items[0].text, "Ôn lại: Dãy số (20%)");
  const b = buildJourney({ ...ready, practiceCount: 8, weak: [] });
  assert.equal(b.stages[2].status, "done"); assert.equal(b.currentIndex, 3);
});

test("đi hết lộ trình: mọi chặng xong, máy bay dừng ở chặng cuối", () => {
  const j = buildJourney({ ...base, hasQuick: true, hasTarget: true, hasExamDate: true, hasPlan: true, practiceCount: 6, levelAttempts: 3, bestLevelReadiness: 72, simCount: 2, bestSim: 85, examDate: "2026-12-01" });
  assert.equal(st(j), "dddddd"); assert.equal(j.allDone, true); assert.equal(j.currentIndex, 5); assert.equal(j.doneCount, 6);
  assert.match(j.stages[5].desc, /Còn 18 ngày/);
  assert.equal(j.stages[5].progress.label, "Đã đạt 85/100 (mục tiêu 80)");
});

test("điểm mô phỏng chưa đạt mục tiêu thì chặng tổng duyệt chưa xong", () => {
  const j = buildJourney({ ...base, hasQuick: true, hasTarget: true, hasExamDate: true, hasPlan: true, practiceCount: 6, levelAttempts: 3, bestLevelReadiness: 70, simCount: 2, bestSim: 64 });
  assert.equal(j.stages[4].status, "done"); assert.equal(j.stages[5].status, "current"); assert.equal(j.stages[5].progress.label, "64/80 điểm mục tiêu");
});

test("daysUntil và ngày thi đã qua", () => {
  assert.equal(daysUntil("2026-11-20", "2026-11-13"), 7); assert.equal(daysUntil(null, "2026-11-13"), null); assert.equal(daysUntil("2026-11-10", "2026-11-13"), -3);
  const j = buildJourney({ ...base, examDate: "2026-11-01" }); assert.match(j.stages[5].desc, /đã qua/);
});
