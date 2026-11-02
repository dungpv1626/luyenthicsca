import { test } from "node:test";
import assert from "node:assert/strict";
import { TEMPLATES, mkRng, seedFor, validateVariant } from "./index.ts";
import { choose, perm, arithSum, derivCubic, evalCubic, geoTerm } from "./math.ts";
import { parallelR, lensImage, mixTemp, vFinal, distance } from "./physics.ts";
import { valenceOf, periodOf } from "./chemistry.ts";

const SAMPLES = 400;

test("mọi khuôn: sinh được biến thể hợp lệ, 4 đáp án khác nhau, 3 ngôn ngữ", () => {
  assert.ok(TEMPLATES.length >= 35);
  const keys = new Set<string>();
  for (const t of TEMPLATES) {
    assert.ok(!keys.has(t.key), "trùng key " + t.key); keys.add(t.key);
    let ok = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const v = t.build(mkRng(seedFor(t.key, i)));
      if (!v) continue;
      const err = validateVariant(v);
      assert.equal(err, null, `${t.key} #${i}: ${err}`);
      // 4 đáp án tương ứng giữa các ngôn ngữ: cùng số lượng chữ số (chỉ khác dấu thập phân/ký hiệu)
      for (let k = 0; k < 4; k++) assert.equal(v.vi.opts[k].replace(/[^0-9]/g, ""), v.en.opts[k].replace(/[^0-9]/g, ""), `${t.key} #${i}: đáp án ${k} lệch giữa vi/en`);
      ok++;
    }
    assert.ok(ok >= 60, `${t.key}: chỉ sinh được ${ok}/${SAMPLES} biến thể hợp lệ`);
  }
});

test("cùng seed → cùng biến thể (tái lập được)", () => {
  for (const t of TEMPLATES) { const a = t.build(mkRng(123)), b = t.build(mkRng(123)); assert.deepEqual(a, b); }
});

test("đối chiếu các hàm tính với cách tính khác", () => {
  for (let n = 4; n <= 14; n++) for (let k = 0; k <= n; k++) { let f = 1, g = 1, h = 1; for (let i = 2; i <= n; i++) f *= i; for (let i = 2; i <= k; i++) g *= i; for (let i = 2; i <= n - k; i++) h *= i; assert.equal(choose(n, k), f / (g * h)); }
  assert.equal(perm(7, 3), 210);
  for (const [a, d, n] of [[3, 2, 10], [-5, 4, 17], [7, -3, 8]]) { let s = 0; for (let i = 0; i < n; i++) s += a + i * d; assert.equal(arithSum(a, d, n), s); }
  for (const [a, q, n] of [[2, 3, 5], [4, -2, 6], [1, 5, 4]]) { let u = a; for (let i = 1; i < n; i++) u *= q; assert.equal(geoTerm(a, q, n), u); }
  for (const [a, b, c, d, x] of [[2, -3, 5, 1, 2], [1, 4, -6, 7, -3]]) { const h = 1e-5; const num = (evalCubic(a, b, c, d, x + h) - evalCubic(a, b, c, d, x - h)) / (2 * h); assert.ok(Math.abs(num - derivCubic(a, b, c, x)) < 1e-4); }
  assert.equal(parallelR(6, 3), 2); assert.equal(1 / (1 / 12 + 1 / 4), parallelR(12, 4));
  assert.equal(lensImage(10, 15), 30); assert.ok(Math.abs(1 / 10 - (1 / 15 + 1 / 30)) < 1e-12);
  assert.equal(mixTemp(1, 20, 1, 80), 50); assert.equal(vFinal(2, 3, 4), 14); assert.equal(distance(2, 4, 3), 24);
  // lớp electron / chu kì
  assert.equal(valenceOf(11), 1); assert.equal(valenceOf(17), 7); assert.equal(valenceOf(20), 2); assert.equal(periodOf(8), 2); assert.equal(periodOf(19), 4);
});

test("đáp án đúng luôn là opts[0] và không bị trùng với đáp án nhiễu trong lời giải mẫu", () => {
  // mỗi khuôn ít nhất 1 biến thể: đáp án đúng xuất hiện trong lời giải (số/biểu thức) — kiểm tra thô
  for (const t of TEMPLATES) {
    const v = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => t.build(mkRng(seedFor(t.key, i)))).find(Boolean)!;
    const correct = v.vi.opts[0].replace(/^\$|\$$/g, "").replace(/\\ \\text\{[^}]*\}/g, "").replace(/\^2$/, "").replace(/\\ \\Omega/g, "").replace(/\{,\}/g, ",").replace(/\{\}\^\\circ\\text\{C\}/g, "").trim();
    const hay = v.vi.steps.replace(/\{,\}/g, ",").replace(/\\,\^\\circ\\text\{C\}/g, "").replace(/\s/g, "");
    assert.ok(hay.includes(correct.replace(/\s/g, "").replace(/^\+/, "")) || hay.includes(correct.replace(/\\cdot10\^8/, "").trim()), `${t.key}: lời giải không chứa đáp án "${correct}"`);
  }
});
