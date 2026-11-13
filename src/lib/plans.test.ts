import { test } from "node:test";
import assert from "node:assert/strict";
import { activePlan, daysLeft, PLANS, planDef } from "./plans.ts";

const now = new Date("2026-11-13T00:00:00Z");
const paid = (plan: string, at: string, status = "paid") => ({ plan, status, paid_at: at });

test("không có đơn gói: Free", () => { assert.equal(activePlan([], now).plan, "free"); assert.equal(activePlan([{ plan: null, status: "paid", paid_at: "2026-11-01T00:00:00Z" }], now).plan, "free"); });
test("đơn chưa thanh toán, đã hoàn, hết hạn: không tính", () => {
  assert.equal(activePlan([paid("pro", "2026-11-01T00:00:00Z", "pending")], now).plan, "free");
  assert.equal(activePlan([paid("pro", "2026-11-01T00:00:00Z", "refunded")], now).plan, "free");
  assert.equal(activePlan([paid("pro", "2025-11-12T00:00:00Z")], now).plan, "free");
  assert.equal(activePlan([paid("pro", "2025-11-14T00:00:00Z")], now).plan, "pro");
});
test("nhiều gói: lấy gói cao nhất còn hạn", () => {
  const r = activePlan([paid("starter", "2026-10-01T00:00:00Z"), paid("pro", "2026-11-01T00:00:00Z")], now);
  assert.equal(r.plan, "pro"); assert.equal(daysLeft(r.endsAt, now), 353);
});
test("hạn mức Gia sư AI tăng dần theo gói", () => {
  const l = PLANS.map((p) => p.tutorPerDay); assert.deepEqual(l, [5, 20, 150, 150]); assert.ok(l[1] < l[2]);
  assert.equal(planDef("max").forSale, false);
});
