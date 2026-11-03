import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULES, moduleOf, moduleQuotas, OUT, type Subject } from "./syllabus.ts";
import { buildModuleSets, type QM } from "./assemble-modules.ts";

test("tỉ trọng mỗi môn cộng đúng 100 và khóa mô-đun không trùng", () => {
  for (const [s, mods] of Object.entries(MODULES)) {
    assert.equal(mods.reduce((a, m) => a + m.weight, 0), 100, s);
    assert.equal(new Set(mods.map((m) => m.key)).size, mods.length);
  }
});

test("moduleQuotas: tổng đúng n (48 và 80) với mọi môn", () => {
  for (const s of Object.keys(MODULES) as Subject[]) for (const n of [48, 80, 30, 7]) assert.equal(Object.values(moduleQuotas(s, n)).reduce((a, b) => a + b, 0), n);
  assert.deepEqual(moduleQuotas("math", 48), { set_ineq: 7, function: 17, geo_alg: 14, prob_stat: 10 });
  assert.deepEqual(moduleQuotas("physics", 48), { mechanics: 19, electromag: 12, thermal: 5, optics: 5, modern: 7 });
});

test("moduleOf: các trường hợp chính", () => {
  assert.equal(moduleOf({ subject: "math", topic: "Hàm số", subtopic: "Hàm số bậc hai" }), "function");
  assert.equal(moduleOf({ subject: "math", topic: "Giải tích", subtopic: "Đạo hàm của đa thức" }), "function");
  assert.equal(moduleOf({ subject: "math", topic: "Giải tích", subtopic: "Tích phân xác định" }), OUT);
  assert.equal(moduleOf({ subject: "math", topic: "Đại số", subtopic: "Hệ thức Vi-ét" }), "set_ineq");
  assert.equal(moduleOf({ subject: "math", topic: "Đại số", subtopic: "Phương trình lôgarit" }), "function");
  assert.equal(moduleOf({ subject: "physics", topic: "Sóng", subtopic: "Sóng dừng" }), "mechanics");
  assert.equal(moduleOf({ subject: "physics", topic: "Sóng", subtopic: "giao thoa ánh sáng" }), "optics");
  assert.equal(moduleOf({ subject: "chemistry", topic: "Axit–bazơ", subtopic: "Tính pH" }), "concept_calc");
  assert.equal(moduleOf({ subject: "chemistry", topic: "Phản ứng hóa học", subtopic: "nhiệt hóa học" }), OUT);
  assert.equal(moduleOf({ subject: "chemistry", topic: "Thí nghiệm và ứng dụng" }), "experiment");
  assert.equal(moduleOf({ subject: "chinese", topic: "Biểu đạt số liệu" }), "reading");
  assert.equal(moduleOf({ subject: "math", topic: "Chủ đề lạ" }), null);
});

// bộ sinh số giả ngẫu nhiên có hạt giống
const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const mkPool = (perModule: Record<string, number>): QM[] => Object.entries(perModule).flatMap(([module, n]) => Array.from({ length: n }, (_, i) => ({ id: `${module}-${i}`, subject: "math", topic: `T${i % 3}`, difficulty: (["easy", "medium", "hard"] as const)[i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : (i % 5 === 2 ? 2 : 1)], module })));

test("buildModuleSets: đúng hạn ngạch, không trùng câu giữa các đề", () => {
  const pool = mkPool({ set_ineq: 60, function: 120, geo_alg: 100, prob_stat: 80 });
  const q = moduleQuotas("math", 48);
  const sets = buildModuleSets(pool, q, 3, { easy: 30, medium: 50, hard: 20 }, seeded(7));
  assert.equal(sets.length, 3);
  const all = sets.flatMap((s) => s.ids); assert.equal(new Set(all).size, all.length);
  for (const s of sets) { assert.equal(s.ids.length, 48); for (const [m, n] of Object.entries(q)) assert.equal(s.perModule[m], n); assert.equal(s.redistributed, 0); }
});

test("buildModuleSets: mô-đun thiếu câu → phần thiếu chuyển cho mô-đun khác, vẫn đủ 48 và ghi nhận thiếu hụt", () => {
  const pool = mkPool({ set_ineq: 60, function: 120, geo_alg: 100, prob_stat: 2 });
  const sets = buildModuleSets(pool, moduleQuotas("math", 48), 1, { easy: 30, medium: 50, hard: 20 }, seeded(3));
  assert.equal(sets.length, 1); assert.equal(sets[0].ids.length, 48);
  assert.ok(sets[0].shortfall.prob_stat > 0); assert.ok(sets[0].redistributed > 0);
});

test("buildModuleSets: maxShift chặn đề lệch quá nhiều so với hạn ngạch", () => {
  const pool = mkPool({ set_ineq: 60, function: 120, geo_alg: 100, prob_stat: 12 }); // prob_stat chỉ đủ cho 1 đề (cần 10/đề)
  const free = buildModuleSets(pool, moduleQuotas("math", 48), 4, { easy: 30, medium: 50, hard: 20 }, seeded(5));
  const strict = buildModuleSets(pool, moduleQuotas("math", 48), 4, { easy: 30, medium: 50, hard: 20 }, seeded(5), 2);
  assert.ok(free.length > strict.length);
  for (const s of strict) assert.ok(s.redistributed <= 2);
});
