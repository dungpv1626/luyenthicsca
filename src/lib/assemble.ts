// Lắp bộ đề theo mức: hàm thuần (không phụ thuộc DB) để dễ kiểm thử.
export type Diff = "easy" | "medium" | "hard";
export type Q = { id: string; subject: string; topic: string; difficulty: Diff };
export type Mix = Record<Diff, number>;
export type Rand = () => number;

const DIFFS: Diff[] = ["easy", "medium", "hard"];
const NEAR: Record<Diff, Diff[]> = { easy: ["medium", "hard"], medium: ["easy", "hard"], hard: ["medium", "easy"] };

/** Chia n câu theo tỉ lệ (phương pháp phần dư lớn nhất) → tổng luôn đúng bằng n. */
export function quota(n: number, mix: Mix): Mix {
  const tot = DIFFS.reduce((s, k) => s + mix[k], 0) || 1;
  const raw = DIFFS.map((k) => (n * mix[k]) / tot);
  const base = raw.map(Math.floor);
  let rest = n - base.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let i = 0; rest > 0; i++, rest--) base[order[i % 3][1]]++;
  return { easy: base[0], medium: base[1], hard: base[2] };
}

function shuffle<T>(a: T[], rand: Rand): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** Lấy n câu, dàn đều theo chủ đề (vòng tròn giữa các chủ đề). */
export function spread(cands: Q[], n: number, rand: Rand): Q[] {
  const byTopic = new Map<string, Q[]>();
  for (const q of cands) (byTopic.get(q.topic) ?? byTopic.set(q.topic, []).get(q.topic)!).push(q);
  const groups = shuffle([...byTopic.values()], rand).map((g) => shuffle(g, rand));
  const out: Q[] = [];
  while (out.length < n && groups.some((g) => g.length)) for (const g of groups) { const q = g.pop(); if (q && out.length < n) out.push(q); }
  return out;
}

export type PickResult = { ids: string[]; shifted: number; overlapped: number; short: number };

/** Chọn n câu cho một môn trong một đề. `used` = câu đã dùng ở các đề trước (cùng cấp). */
export function pickSet(pool: Q[], used: Set<string>, n: number, mix: Mix, opts: { relaxed: boolean }, rand: Rand): PickResult {
  const need = quota(n, mix);
  const chosen: Q[] = [];
  const taken = new Set<string>();
  const free = (d: Diff) => pool.filter((q) => q.difficulty === d && !used.has(q.id) && !taken.has(q.id));
  const take = (list: Q[]) => { for (const q of list) { chosen.push(q); taken.add(q.id); } };
  const deficit: Record<Diff, number> = { easy: 0, medium: 0, hard: 0 };

  for (const d of DIFFS) { const got = spread(free(d), need[d], rand); take(got); deficit[d] = need[d] - got.length; }
  let shifted = 0, overlapped = 0;
  if (opts.relaxed) {
    for (const d of DIFFS) for (const alt of NEAR[d]) {
      if (deficit[d] <= 0) break;
      const got = spread(free(alt), deficit[d], rand); take(got); deficit[d] -= got.length; shifted += got.length;
    }
    for (const d of DIFFS) for (const alt of [d, ...NEAR[d]]) {
      if (deficit[d] <= 0) break;
      const reuse = pool.filter((q) => q.difficulty === alt && used.has(q.id) && !taken.has(q.id));
      const got = spread(reuse, deficit[d], rand); take(got); deficit[d] -= got.length; overlapped += got.length;
    }
  }
  const short = DIFFS.reduce((s, d) => s + Math.max(0, deficit[d]), 0);
  const rank: Record<Diff, number> = { easy: 0, medium: 1, hard: 2 };
  chosen.sort((a, b) => rank[a.difficulty] - rank[b.difficulty] || a.topic.localeCompare(b.topic));
  return { ids: chosen.map((q) => q.id), shifted, overlapped, short };
}

export type BuiltSet = { ids: string[]; shifted: number; overlapped: number };
export type BuildResult = { sets: BuiltSet[]; shortages: { subject: string; missing: number }[] };

/** Tạo tối đa `count` đề. Chế độ nghiêm ngặt (relaxed=false): dừng khi không đủ câu đúng cơ cấu, không trùng câu. */
export function buildSets(pools: Record<string, Q[]>, subjects: string[], count: number, perSubject: number, mix: Mix, alreadyUsed: Set<string>, opts: { relaxed: boolean }, rand: Rand = Math.random): BuildResult {
  const used = new Set(alreadyUsed);
  const sets: BuiltSet[] = [];
  let shortages: BuildResult["shortages"] = [];
  for (let i = 0; i < count; i++) {
    const parts = subjects.map((s) => ({ s, r: pickSet(pools[s] ?? [], used, perSubject, mix, opts, rand) }));
    const bad = parts.filter((p) => p.r.short > 0);
    if (bad.length) { shortages = bad.map((p) => ({ subject: p.s, missing: p.r.short })); break; }
    const ids = parts.flatMap((p) => p.r.ids);
    ids.forEach((id) => used.add(id));
    sets.push({ ids, shifted: parts.reduce((s, p) => s + p.r.shifted, 0), overlapped: parts.reduce((s, p) => s + p.r.overlapped, 0) });
  }
  return { sets, shortages };
}

/** Số đề tối đa KHÔNG trùng câu và đúng cơ cấu (ước lượng cho trang admin). */
export function maxStrictSets(counts: Mix, n: number, mix: Mix): number {
  const need = quota(n, mix);
  return Math.min(...DIFFS.map((d) => (need[d] === 0 ? Infinity : Math.floor(counts[d] / need[d]))));
}
