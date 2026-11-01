import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreAttempt, type ScoredQuestion } from "./scoring.ts";

const q = (id: string, topic: string, difficulty: ScoredQuestion["difficulty"]): ScoredQuestion => ({
  id, subject: "math", topic, difficulty, correct_answer: "A", est_time_sec: 60,
});

test("tất cả đúng, đúng tốc độ → 100", () => {
  const qs = [q("1", "Đại số", "easy"), q("2", "Hàm số", "hard")];
  const r = scoreAttempt(qs, { 1: "A", 2: "A" }, { 1: 60, 2: 60 });
  assert.equal(r.correct, 2);
  assert.equal(r.readiness, 100);
});

test("tất cả sai hoặc bỏ trống → 0 và chủ đề yếu được liệt kê", () => {
  const qs = [q("1", "Đại số", "easy"), q("2", "Hàm số", "hard")];
  const r = scoreAttempt(qs, { 1: "B" }, { 1: 30 });
  assert.equal(r.readiness, 0);
  assert.deepEqual(r.breakdown.weaknesses.sort(), ["math|Hàm số", "math|Đại số"]);
});

test("câu khó có trọng số lớn hơn", () => {
  const qs = [q("1", "a", "easy"), q("2", "b", "hard")];
  const hardRight = scoreAttempt(qs, { 2: "A" }, { 2: 60 }).breakdown.accuracy;
  const easyRight = scoreAttempt(qs, { 1: "A" }, { 1: 60 }).breakdown.accuracy;
  assert.ok(hardRight > easyRight);
});
