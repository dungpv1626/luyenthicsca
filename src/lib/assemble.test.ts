import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSets, maxStrictSets, pickSet, quota, spread, type Q } from "./assemble.ts";

// bộ sinh số giả ngẫu nhiên có hạt giống để test lặp lại được
const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pool = (subject: string, n: Record<"easy" | "medium" | "hard", number>, topics = 4): Q[] =>
  (["easy", "medium", "hard"] as const).flatMap((d) => Array.from({ length: n[d] }, (_, i) => ({ id: `${subject}-${d}-${i}`, subject, topic: `T${i % topics}`, difficulty: d })));

test("quota: tổng luôn đúng bằng n và theo tỉ lệ", () => {
  for (const n of [1, 7, 15, 30, 33, 60]) for (const mix of [{ easy: 70, medium: 30, hard: 0 }, { easy: 35, medium: 45, hard: 20 }, { easy: 15, medium: 50, hard: 35 }]) {
    const q = quota(n, mix); assert.equal(q.easy + q.medium + q.hard, n);
  }
  assert.deepEqual(quota(30, { easy: 70, medium: 30, hard: 0 }), { easy: 21, medium: 9, hard: 0 });
  assert.deepEqual(quota(20, { easy: 35, medium: 45, hard: 20 }), { easy: 7, medium: 9, hard: 4 });
});

test("spread: dàn đều giữa các chủ đề", () => {
  const got = spread(pool("m", { easy: 12, medium: 0, hard: 0 }, 4), 8, seeded(1));
  const per = new Map<string, number>(); got.forEach((q) => per.set(q.topic, (per.get(q.topic) ?? 0) + 1));
  assert.equal(got.length, 8); assert.ok([...per.values()].every((v) => v === 2));
});

test("buildSets (nghiêm ngặt): đúng cơ cấu, không trùng câu giữa các đề", () => {
  const pools = { math: pool("math", { easy: 60, medium: 60, hard: 30 }) };
  const r = buildSets(pools, ["math"], 3, 30, { easy: 40, medium: 50, hard: 10 }, new Set(), { relaxed: false }, seeded(7));
  assert.equal(r.sets.length, 3);
  const all = r.sets.flatMap((s) => s.ids); assert.equal(new Set(all).size, all.length);
  const diffOf = (id: string) => id.split("-")[1];
  const c = r.sets[0].ids.reduce<Record<string, number>>((a, id) => ({ ...a, [diffOf(id)]: (a[diffOf(id)] ?? 0) + 1 }), {});
  assert.deepEqual(c, { easy: 12, medium: 15, hard: 3 });
});

test("buildSets (nghiêm ngặt): dừng và báo thiếu khi không đủ câu", () => {
  const pools = { math: pool("math", { easy: 25, medium: 20, hard: 2 }) };
  const r = buildSets(pools, ["math"], 5, 30, { easy: 40, medium: 50, hard: 10 }, new Set(), { relaxed: false }, seeded(3));
  assert.ok(r.sets.length < 5); assert.ok(r.shortages.length > 0 && r.shortages[0].missing > 0);
});

test("đề tổng hợp: mỗi môn đủ số câu; câu đã dùng ở đề cũ không bị lấy lại", () => {
  const pools = { math: pool("math", { easy: 20, medium: 20, hard: 10 }), physics: pool("physics", { easy: 20, medium: 20, hard: 10 }) };
  const used = new Set(pools.math.slice(0, 5).map((q) => q.id));
  const r = buildSets(pools, ["math", "physics"], 1, 10, { easy: 35, medium: 45, hard: 20 }, used, { relaxed: false }, seeded(9));
  assert.equal(r.sets[0].ids.length, 20); assert.ok(r.sets[0].ids.every((id) => !used.has(id)));
});

test("chế độ nới lỏng: bù độ khó rồi mới dùng lại câu, và đếm lại", () => {
  const p = pool("m", { easy: 10, medium: 10, hard: 0 });
  const strict = pickSet(p, new Set(), 10, { easy: 35, medium: 45, hard: 20 }, { relaxed: false }, seeded(2));
  assert.ok(strict.short > 0);
  const relaxed = pickSet(p, new Set(), 10, { easy: 35, medium: 45, hard: 20 }, { relaxed: true }, seeded(2));
  assert.equal(relaxed.short, 0); assert.ok(relaxed.shifted > 0);
});

test("maxStrictSets: ước lượng số đề không trùng", () => {
  assert.equal(maxStrictSets({ easy: 105, medium: 135, hard: 60 }, 30, { easy: 70, medium: 30, hard: 0 }), 5); // 105/21 = 5
  assert.equal(maxStrictSets({ easy: 105, medium: 135, hard: 60 }, 30, { easy: 15, medium: 50, hard: 35 }), 6); // hard 60/10 = 6
});
