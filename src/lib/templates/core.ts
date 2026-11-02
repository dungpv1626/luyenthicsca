// Nền tảng cho khuôn câu hỏi có tham số. File THUẦN (không import ngoài) để chạy được cả trong Next và Node.
export type Lang = "vi" | "en" | "zh";
export const LANGS: Lang[] = ["vi", "en", "zh"];
export type Rng = { int: (a: number, b: number) => number; pick: <T>(a: readonly T[]) => T; chance: (p: number) => boolean };
export type Texts = { body: string; steps: string; opts: string[] }; // opts[0] = đáp án đúng, opts[1..3] = đáp án nhiễu
export type Variant = { vi: Texts; en: Texts; zh: Texts; skill: string; est: number };
export type Template = {
  key: string; subject: "math" | "physics" | "chemistry"; topic: string; subtopic: string; difficulty: "easy" | "medium" | "hard";
  build: (r: Rng) => Variant | null;
};

/** Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32): cùng seed → cùng biến thể. */
export function mkRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { int: (a, b) => a + Math.floor(next() * (b - a + 1)), pick: (arr) => arr[Math.floor(next() * arr.length)], chance: (p) => next() < p };
}

export const P = (l: Lang, vi: string, en: string, zh: string) => (l === "vi" ? vi : l === "en" ? en : zh);
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const clean = (x: number, d: number) => { const v = Math.round(x * 10 ** d) / 10 ** d; return Object.is(v, -0) ? 0 : v; };
/** Số thập phân gọn, dùng trong $...$ (vi dùng dấu phẩy). */
export const num = (x: number, l: Lang, d = 3) => { const s = String(clean(x, d)); return l === "vi" ? s.replace(".", "{,}") : s; };
/** Phân số tối giản dạng LaTeX (hoặc số nguyên). */
export const fr = (p: number, q: number) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; p /= g; q /= g; return q === 1 ? String(p) : `${p < 0 ? "-" : ""}\\dfrac{${Math.abs(p)}}{${q}}`; };
/** Bội của π: p/q · π */
export const frpi = (p: number, q: number) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; p /= g; q /= g; const a = Math.abs(p), sg = p < 0 ? "-" : ""; return q === 1 ? `${sg}${a === 1 ? "" : a}\\pi` : `${sg}\\dfrac{${a === 1 ? "" : a}\\pi}{${q}}`; };
export const sgn = (n: number) => (n >= 0 ? `+ ${n}` : `- ${-n}`);
const term = (c: number, v: string, first: boolean) => { if (c === 0) return ""; const a = Math.abs(c); const body = v ? (a === 1 ? v : `${a}${v}`) : `${a}`; return first ? `${c < 0 ? "-" : ""}${body}` : ` ${c < 0 ? "-" : "+"} ${body}`; };
/** Đa thức dạng LaTeX: poly([[2,"x^2"],[-3,"x"],[5,""]]) → "2x^2 - 3x + 5" */
export const poly = (cs: [number, string][]) => { let s = "", first = true; for (const [c, v] of cs) { const t = term(c, v, first); if (t) { s += t; first = false; } } return s || "0"; };
export const M = (s: string | number) => `$${s}$`;
/** Chuỗi "lỗi thường gặp" cho lời giải: mỗi mục = [giá trị LaTeX, lý do vi, en, zh]. */
export const mistakes = (l: Lang, items: [string, string, string, string][]) =>
  `${P(l, "Các kết quả sai thường gặp", "Common mistakes", "常见错误")}: ` + items.map(([v, vi, en, zh]) => `$${v}$ (${P(l, vi, en, zh)})`).join("; ") + ".";

export const make = (f: (l: Lang) => Texts, skill: string, est: number): Variant => ({ vi: f("vi"), en: f("en"), zh: f("zh"), skill, est });

/** Kiểm tra một biến thể hợp lệ: 4 đáp án khác nhau, không có NaN/undefined, có đề và lời giải ở cả 3 ngôn ngữ. */
export function validateVariant(v: Variant): string | null {
  for (const l of LANGS) {
    const t = v[l];
    if (!t.body.trim() || !t.steps.trim()) return `thiếu nội dung (${l})`;
    if (t.opts.length !== 4) return `không đủ 4 đáp án (${l})`;
    if (new Set(t.opts.map((o) => o.trim())).size !== 4) return `đáp án trùng nhau (${l})`;
    for (const s of [t.body, t.steps, ...t.opts]) if (/NaN|undefined|Infinity|null|\{,\}\{|--/.test(s)) return `giá trị lỗi (${l}): ${s.slice(0, 60)}`;
  }
  // 4 đáp án phải tương ứng nhau giữa các ngôn ngữ (chỉ khác dấu thập phân/chữ)
  return null;
}

/** Chọn 3 đáp án nhiễu khác nhau và khác đáp án đúng, theo thứ tự ưu tiên; null nếu không đủ. */
export function pick3(correct: string, cands: string[]): string[] | null {
  const seen = new Set([correct.trim()]); const out: string[] = [];
  for (const c of cands) { const k = c.trim(); if (!seen.has(k)) { seen.add(k); out.push(c); if (out.length === 3) return out; } }
  return null;
}
/** Số nguyên khác 0 trong [a, b]. */
export const nz = (r: Rng, a: number, b: number) => { for (;;) { const x = r.int(a, b); if (x !== 0) return x; } };
/** x có tối đa d chữ số thập phân (tránh số xấu kiểu 3,3333). */
export const nice = (x: number, d = 2) => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-9;
export const rnd = (x: number, d = 6) => Math.round(x * 10 ** d) / 10 ** d;
