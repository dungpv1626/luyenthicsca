import { test } from "node:test";
import assert from "node:assert/strict";
import { formulaIssues, insertSnippet, SNIPPETS } from "./formula.ts";

test("công thức đúng: không báo lỗi", () => {
  assert.deepEqual(formulaIssues("Vận tốc $v_0=3\\ \\text{m/s}$ và $$\\dfrac{1}{2}at^2$$."), []);
  assert.deepEqual(formulaIssues("Không có công thức nào."), []);
  assert.deepEqual(formulaIssues("Giá \\$5"), []);
});

test("thiếu dấu $ đóng", () => {
  assert.equal(formulaIssues("Tần số $f=6{,}0\\times10^{14}").length, 1);
  assert.match(formulaIssues("a $x$ b $y")[0], /Thiếu dấu \$/);
});

test("công thức sai cú pháp: báo kèm công thức", () => {
  const r = formulaIssues("Ta có $\\dfrac{1}{2$ nhé");
  assert.equal(r.length, 1);
  assert.match(r[0], /chưa đúng/);
});

test("chèn mẫu: con trỏ nằm trong ngoặc; bọc phần đang chọn", () => {
  const frac = SNIPPETS.find((s) => s.title === "Phân số")!;
  const r = insertSnippet("a b", 2, 2, frac);
  assert.equal(r.value, "a \\dfrac{}{}b");
  assert.equal(r.value[r.caret - 1], "{");
  const wrap = SNIPPETS.find((s) => s.wrap)!;
  assert.deepEqual(insertSnippet("v0 = 3", 0, 2, wrap), { value: "$v0$ = 3", caret: 4 });
  for (const s of SNIPPETS.filter((x) => !x.wrap)) assert.ok(s.at <= s.text.length, s.title);
});
