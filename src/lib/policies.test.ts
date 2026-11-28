import { test } from "node:test";
import assert from "node:assert/strict";
import { POLICIES } from "../content/policies.ts";
import { PLANS } from "./plans.ts";

const num = (s: string) => (/miễn phí/i.test(s) ? 0 : Number(s.replace(/\D/g, "")));

test("đủ 9 văn bản chính sách, mỗi văn bản một đường dẫn riêng", () => {
  assert.equal(POLICIES.length, 9);
  assert.equal(new Set(POLICIES.map((p) => p.slug)).size, 9);
  for (const p of POLICIES) assert.ok(p.blocks.length > 0, p.slug);
});

test("Chính sách giá trên website khớp đúng giá và thời hạn đang bán", () => {
  const table = POLICIES.find((p) => p.slug === "chinh-sach-gia")!.blocks.find((b) => b.t === "table");
  assert.ok(table && table.t === "table");
  const rows = table.rows.slice(1); // bỏ dòng tiêu đề
  assert.equal(rows.length, PLANS.length);
  rows.forEach(([name, price, duration], i) => {
    const p = PLANS[i];
    assert.ok(name.startsWith(`Mức ${p.level}`), `${name} ↔ Mức ${p.level}`);
    assert.equal(num(price), p.priceVnd, name);
    assert.equal(duration.replace(/^0/, ""), p.durationLabel.replace(/^0/, ""), name);
  });
});

test("chính sách thanh toán ghi đúng tài khoản nhận tiền dùng cho mã QR", async () => {
  const { BANK } = await import("./company.ts");
  const text = JSON.stringify(POLICIES.find((p) => p.slug === "chinh-sach-thanh-toan"));
  assert.ok(text.includes(BANK.accountNo), "số tài khoản");
  assert.ok(text.includes("MBBANK"), "ngân hàng");
  assert.ok(text.includes(BANK.accountName), "chủ tài khoản");
});
