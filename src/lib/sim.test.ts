import { test } from "node:test";
import assert from "node:assert/strict";
import { SIM_FORMAT, SIM_MIX, score100, secondsPerQuestion } from "./sim.ts";

test("khuôn đề mô phỏng đúng thông tin công bố: Toán/Lý/Hóa 48 câu 60 phút, Chinese 80 câu 90 phút", () => {
  for (const k of ["math", "physics", "chemistry"] as const) assert.deepEqual(SIM_FORMAT[k], { questions: 48, minutes: 60 });
  assert.deepEqual(SIM_FORMAT.chinese, { questions: 80, minutes: 90 });
  assert.equal(SIM_MIX.easy + SIM_MIX.medium + SIM_MIX.hard, 100);
});
test("giây mỗi câu và điểm quy đổi", () => {
  assert.equal(secondsPerQuestion("math"), 75);
  assert.equal(secondsPerQuestion("chinese"), 68);
  assert.equal(score100(48, 48), 100); assert.equal(score100(24, 48), 50); assert.equal(score100(6, 48), 13); assert.equal(score100(0, 0), 0);
});
