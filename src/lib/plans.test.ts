import { test } from "node:test";
import assert from "node:assert/strict";
import { accessFrom, canOpenPaidTest, daysLeft, hasPaidAccess, isPaidPlan, PLANS, planDef, planEnd, planLabel, type PaidTest } from "./plans.ts";

const now = new Date("2026-11-26T00:00:00Z");
const paid = (plan: string, at: string, extra: { status?: string; plan_subject?: string } = {}) => ({ plan, status: extra.status ?? "paid", paid_at: at, plan_subject: extra.plan_subject ?? null });

// Các loại đề trả phí có trên website (cấp theo lib/levels.ts; đề mô phỏng không gắn cấp)
const L2_LY: PaidTest = { scope: "subject", subject: "physics", level: 2, sim: false };
const L4_LY: PaidTest = { scope: "subject", subject: "physics", level: 4, sim: false };
const SIM_LY: PaidTest = { scope: "subject", subject: "physics", level: null, sim: true };
const L2_TOAN: PaidTest = { scope: "subject", subject: "math", level: 2, sim: false };
const L3_TOAN: PaidTest = { scope: "subject", subject: "math", level: 3, sim: false };
const L2_TONGHOP: PaidTest = { scope: "full", subject: null, level: 2, sim: false };
const L4_TONGHOP: PaidTest = { scope: "full", subject: null, level: 4, sim: false };
const ALL = [L2_LY, L4_LY, SIM_LY, L2_TOAN, L3_TOAN, L2_TONGHOP, L4_TONGHOP];
const opens = (a: ReturnType<typeof accessFrom>) => ALL.map((t) => canOpenPaidTest(a, t));

test("bảng giá khớp Chính sách giá đã công bố", () => {
  assert.deepEqual(PLANS.map((p) => [p.level, p.priceVnd, p.durationLabel]), [
    [1, 0, "Không giới hạn"], [2, 39000, "30 ngày"], [3, 290000, "3 tháng"], [4, 690000, "3 tháng"], [5, 1990000, "12 tháng"],
  ]);
  assert.ok(PLANS.filter((p) => p.key !== "free").every((p) => p.forSale), "mọi gói trả phí đều mua được");
  assert.equal(planLabel("theo_mon", "physics", () => "Vật lý"), "Mức 3 – Gói theo môn (Vật lý)");
});

test("thời hạn: 30 ngày; 3 và 12 tháng theo lịch, cuối tháng lùi về ngày cuối", () => {
  assert.equal(planEnd("co_ban", "2026-11-01T10:00:00Z").toISOString(), "2026-12-01T10:00:00.000Z");
  assert.equal(planEnd("tron_bo", "2026-11-26T10:00:00Z").toISOString(), "2027-02-26T10:00:00.000Z");
  assert.equal(planEnd("theo_mon", "2026-11-30T00:00:00Z").toISOString(), "2027-02-28T00:00:00.000Z");
  assert.equal(planEnd("dong_hanh", "2026-02-28T00:00:00Z").toISOString(), "2027-02-28T00:00:00.000Z");
});

test("không có đơn, đơn chưa trả, đã hoàn, hết hạn, mã gói lạ: chỉ có gói miễn phí", () => {
  for (const orders of [[], [paid("tron_bo", "2026-11-01T00:00:00Z", { status: "pending" })], [paid("tron_bo", "2026-11-01T00:00:00Z", { status: "refunded" })],
    [paid("co_ban", "2026-10-01T00:00:00Z")], [paid("starter", "2026-11-01T00:00:00Z")]]) {
    const a = accessFrom(orders, now);
    assert.equal(a.plan, "free"); assert.equal(hasPaidAccess(a), false); assert.equal(a.tutorPerDay, 5);
    assert.deepEqual(opens(a), ALL.map(() => false));
  }
  assert.equal(isPaidPlan("free"), false); assert.equal(isPaidPlan("dong_hanh"), true);
});

test("mỗi gói mở đúng tầng đề", () => {
  //                      L2 Lý  L4 Lý  MP Lý  L2 Toán L3 Toán L2 TH  L4 TH
  const expect: Record<string, boolean[]> = {
    co_ban:    [true,  false, false, true,  false,  true,  false],
    theo_mon:  [true,  true,  true,  false, false,  false, false],
    tron_bo:   [true,  true,  true,  true,  true,   true,  true],
    dong_hanh: [true,  true,  true,  true,  true,   true,  true],
  };
  for (const [plan, want] of Object.entries(expect)) {
    const a = accessFrom([paid(plan, "2026-11-20T00:00:00Z", plan === "theo_mon" ? { plan_subject: "physics" } : {})], now);
    assert.deepEqual(opens(a), want, plan);
  }
  assert.equal(accessFrom([paid("theo_mon", "2026-11-20T00:00:00Z")], now).plan, "free", "Gói theo môn thiếu môn thì không tính");
});

test("Cơ bản không mở đề mô phỏng và đề không gắn cấp", () => {
  const a = accessFrom([paid("co_ban", "2026-11-20T00:00:00Z")], now);
  assert.equal(canOpenPaidTest(a, { scope: "full", level: null, sim: false }), false);
  assert.equal(canOpenPaidTest(a, { scope: "subject", subject: "math", level: null, sim: true }), false);
});

test("nhiều gói: quyền cộng dồn, hiển thị gói cao nhất, lượt AI lấy mức cao nhất", () => {
  const a = accessFrom([paid("co_ban", "2026-11-20T00:00:00Z"), paid("theo_mon", "2026-11-10T00:00:00Z", { plan_subject: "chemistry" })], now);
  assert.equal(a.plan, "theo_mon"); assert.equal(a.tutorPerDay, 150);
  assert.ok(canOpenPaidTest(a, L2_TONGHOP), "Cơ bản mở đề tổng hợp cấp 2");
  assert.ok(canOpenPaidTest(a, { scope: "subject", subject: "chemistry", level: 4, sim: false }), "Theo môn Hóa mở cấp 4 Hóa");
  assert.ok(!canOpenPaidTest(a, L3_TOAN));
  assert.equal(daysLeft(a.basicUntil, now), 24);
  const b = accessFrom([paid("dong_hanh", "2026-01-01T00:00:00Z"), paid("tron_bo", "2026-11-01T00:00:00Z")], now);
  assert.equal(b.plan, "dong_hanh"); assert.equal(b.endsAt, "2027-01-01T00:00:00.000Z");
});

test("lượt Gia sư AI tăng dần theo gói", () => {
  assert.deepEqual(PLANS.map((p) => planDef(p.key).tutorPerDay), [5, 20, 150, 150, 150]);
});

test("gợi ý gói mở đề đang khóa", async () => {
  const { plansThatOpen } = await import("./plans.ts");
  assert.deepEqual(plansThatOpen(L2_LY), ["co_ban", "theo_mon", "tron_bo", "dong_hanh"]);
  assert.deepEqual(plansThatOpen(L4_LY), ["theo_mon", "tron_bo", "dong_hanh"]);
  assert.deepEqual(plansThatOpen(SIM_LY), ["theo_mon", "tron_bo", "dong_hanh"]);
  assert.deepEqual(plansThatOpen(L2_TONGHOP), ["co_ban", "tron_bo", "dong_hanh"]);
  assert.deepEqual(plansThatOpen(L4_TONGHOP), ["tron_bo", "dong_hanh"]);
});
