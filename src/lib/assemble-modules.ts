import { pickSet, type Q } from "./assemble.ts";

type Rand = () => number;
type Mix = { easy: number; medium: number; hard: number };
export type QM = Q & { module: string };
export type ModuleSet = { ids: string[]; perModule: Record<string, number>; shortfall: Record<string, number>; redistributed: number };

/**
 * Lắp MỘT đề theo hạn ngạch mô-đun: mỗi mô-đun chọn đúng số câu theo cơ cấu độ khó; mô-đun thiếu câu thì phần thiếu
 * được chuyển cho các mô-đun còn câu (ưu tiên mô-đun còn nhiều câu nhất). Không trùng câu với `used`.
 */
export function pickModuleSet(pool: QM[], quotas: Record<string, number>, mix: Mix, used: Set<string>, rand: Rand, maxShift = Infinity): ModuleSet | null {
  const total = Object.values(quotas).reduce((a, b) => a + b, 0);
  const chosen: string[] = []; const perModule: Record<string, number> = {}; const shortfall: Record<string, number> = {};
  const local = new Set(used);
  for (const [m, n] of Object.entries(quotas)) {
    const r = pickSet(pool.filter((q) => q.module === m), local, n, mix, { relaxed: true }, rand);
    // bản "relaxed" có thể dùng lại câu đã dùng: loại những câu đó, chỉ lấy câu chưa dùng
    const ids = r.ids.filter((id) => !local.has(id));
    ids.forEach((id) => local.add(id)); chosen.push(...ids);
    perModule[m] = ids.length; if (ids.length < n) shortfall[m] = n - ids.length;
  }
  let need = total - chosen.length, redistributed = 0;
  if (need > 0) {
    const order = Object.keys(quotas).filter((m) => !shortfall[m]).sort((a, b) => pool.filter((q) => q.module === b && !local.has(q.id)).length - pool.filter((q) => q.module === a && !local.has(q.id)).length);
    for (const m of order) {
      if (need <= 0) break;
      const extra = pickSet(pool.filter((q) => q.module === m), local, need, mix, { relaxed: true }, rand).ids.filter((id) => !local.has(id));
      extra.forEach((id) => local.add(id)); chosen.push(...extra); perModule[m] += extra.length; need -= extra.length; redistributed += extra.length;
    }
  }
  if (chosen.length < total || redistributed > maxShift) return null; // quá lệch so với hạn ngạch: không dựng đề này
  return { ids: chosen, perModule, shortfall, redistributed };
}

/** Lắp tối đa `count` đề, không trùng câu giữa các đề. */
/** `maxShift`: số câu tối đa được phép lệch khỏi hạn ngạch mô-đun trong một đề (vượt thì dừng, không dựng thêm). */
export function buildModuleSets(pool: QM[], quotas: Record<string, number>, count: number, mix: Mix, rand: Rand = Math.random, maxShift = Infinity) {
  const used = new Set<string>(); const sets: ModuleSet[] = [];
  for (let i = 0; i < count; i++) { const s = pickModuleSet(pool, quotas, mix, used, rand, maxShift); if (!s) break; s.ids.forEach((id) => used.add(id)); sets.push(s); }
  return sets;
}
