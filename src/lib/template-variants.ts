// Nhận diện biến thể "đáng soi" của khuôn câu hỏi tham số: đáp án do mã tính nên công thức luôn đúng,
// lỗi thật thường nằm ở tham số rơi vào giá trị biên (bằng 0, số âm, đáp án trùng nhau, số lẻ dài).
// Thuần logic, không phụ thuộc DB, để kiểm thử được.

export type VariantFlag = { key: "dup" | "zero" | "neg" | "long"; label: string; weight: number };

const FLAGS: Record<VariantFlag["key"], VariantFlag> = {
  dup: { key: "dup", label: "Đáp án trùng nhau", weight: 4 },
  zero: { key: "zero", label: "Có giá trị 0", weight: 2 },
  neg: { key: "neg", label: "Có số âm", weight: 1 },
  long: { key: "long", label: "Số lẻ dài", weight: 1 },
};

/** Bỏ phần chữ trong LaTeX (đơn vị, số mũ) để số mũ như m/s^2 không bị đọc thành số. */
function strip(s: string) {
  return s
    .replace(/\\(?:text|mathrm|operatorname)\{[^}]*\}/g, " ")
    .replace(/\^\{[^}]*\}|\^\d/g, " ")
    .replace(/_\{[^}]*\}|_\d/g, " ")
    .replace(/\{,\}/g, ",");
}

// Kiểu Việt Nam: dấu chấm ngăn hàng nghìn (90.000.000), dấu phẩy thập phân (0,5 / 0{,}5).
const THOUSANDS = /^\d{1,3}(?:\.\d{3})+$/;
const NUM = /(^|[^\d,.])(-|−)?\s*(\d{1,3}(?:\.\d{3})+(?![\d.,])|\d+(?:[.,]\d+)?)/g;

/** Các số xuất hiện trong chuỗi (dấu phẩy thập phân và dấu chấm hàng nghìn kiểu Việt Nam được hiểu đúng). */
export function numbersIn(s: string): { value: number; raw: string; negative: boolean }[] {
  const out: { value: number; raw: string; negative: boolean }[] = [];
  for (const m of strip(s).matchAll(NUM)) {
    const raw = m[3], negative = !!m[2];
    const v = Number(THOUSANDS.test(raw) ? raw.replace(/\./g, "") : raw.replace(",", "."));
    if (Number.isFinite(v)) out.push({ value: negative ? -v : v, raw, negative });
  }
  return out;
}

/** Giá trị số của một phương án khi phương án chỉ gồm đúng một số (kèm đơn vị); ngược lại null. */
export function optionValue(opt: string): number | null {
  const n = numbersIn(opt);
  return n.length === 1 ? n[0].value : null;
}

const norm = (s: string) => s.replace(/\s+|\\ |\\,|\$/g, "");

/** Toán: số âm và số 0 trong đề là chuyện thường, chỉ đánh dấu khi một đáp án bằng 0.
 *  Lý/Hóa: số âm hoặc số 0 thường là đại lượng vô nghĩa (sin âm, năng lượng 0, vận tốc đầu 0 làm đáp án nhiễu suy biến). */
export function variantFlags(v: { body: string; options: Record<string, string> }, subject = ""): VariantFlag[] {
  const science = subject !== "math";
  const opts = Object.values(v.options ?? {});
  const flags = new Set<VariantFlag["key"]>();
  const texts = opts.map(norm);
  const vals = opts.map(optionValue);
  if (new Set(texts).size < texts.length) flags.add("dup");
  const nums = vals.filter((x): x is number => x !== null);
  if (new Set(nums.map((x) => Math.round(x * 1e9))).size < nums.length) flags.add("dup");
  const all = [...numbersIn(v.body), ...opts.flatMap(numbersIn)];
  if (vals.some((x) => x === 0) || (science && numbersIn(v.body).some((n) => n.value === 0))) flags.add("zero");
  if (science && all.some((n) => n.negative)) flags.add("neg");
  if (all.some((n) => /[.,]\d{4,}$/.test(n.raw))) flags.add("long");
  return [...flags].map((k) => FLAGS[k]);
}

/** Điểm ưu tiên để xếp biến thể: bị học viên báo lỗi lên đầu, rồi đến giá trị biên. */
export const variantScore = (flags: VariantFlag[], reports: number) => reports * 10 + flags.reduce((s, f) => s + f.weight, 0);
