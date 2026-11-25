import katex from "katex";

/** Tách văn bản thành đoạn chữ và đoạn công thức $...$ / $$...$$ (cùng quy tắc với components/Rich.tsx). */
export const FORMULA_SPLIT = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;

/**
 * Lỗi công thức trong một ô nhập, viết cho giáo viên đọc: thiếu dấu $ đóng, hoặc KaTeX không hiểu công thức.
 * Trả về mảng rỗng khi không có lỗi.
 */
export function formulaIssues(text: string): string[] {
  const out: string[] = [];
  const parts = text.split(FORMULA_SPLIT);
  // Phần chữ còn sót dấu $ lẻ (không phải \$) = công thức chưa đóng.
  if (parts.some((p, i) => i % 2 === 0 && /(^|[^\\])\$/.test(p))) out.push("Thiếu dấu $ mở hoặc đóng công thức.");
  for (const p of parts.filter((_, i) => i % 2 === 1)) {
    const block = p.startsWith("$$");
    const src = p.slice(block ? 2 : 1, block ? -2 : -1);
    try {
      katex.renderToString(src, { displayMode: block, throwOnError: true, trust: false, strict: "ignore" });
    } catch (e) {
      const msg = String((e as Error).message ?? e).replace(/^KaTeX parse error:\s*/, "").split(" at position")[0];
      out.push(`Công thức “${src.length > 40 ? src.slice(0, 40) + "…" : src}” chưa đúng: ${msg}`);
    }
  }
  return out;
}

/** Các mẫu chèn nhanh cho giáo viên không quen LaTeX. `wrap` = bọc phần đang chọn; `at` = vị trí con trỏ sau khi chèn (tính từ đầu mẫu). */
export const SNIPPETS: { label: string; title: string; text: string; at: number; wrap?: boolean }[] = [
  { label: "$ $", title: "Bọc thành công thức (chọn chữ rồi bấm)", text: "$$", at: 1, wrap: true },
  { label: "a⁄b", title: "Phân số", text: "\\dfrac{}{}", at: 7 },
  { label: "x²", title: "Lũy thừa / số mũ", text: "^{}", at: 2 },
  { label: "x₀", title: "Chỉ số dưới", text: "_{}", at: 2 },
  { label: "√", title: "Căn bậc hai", text: "\\sqrt{}", at: 6 },
  { label: "×10ⁿ", title: "Nhân lũy thừa 10", text: "\\times10^{}", at: 10 },
  { label: "·", title: "Dấu nhân chấm", text: "\\cdot ", at: 6 },
  { label: "đơn vị", title: "Đơn vị (chữ đứng), ví dụ m/s", text: "\\ \\text{}", at: 8 },
  { label: "°", title: "Độ", text: "^\\circ", at: 6 },
  { label: "Δ", title: "Delta", text: "\\Delta ", at: 7 },
  { label: "π", title: "Pi", text: "\\pi ", at: 4 },
  { label: "→", title: "Mũi tên phản ứng", text: "\\rightarrow ", at: 12 },
  { label: "≤", title: "Nhỏ hơn hoặc bằng", text: "\\le ", at: 4 },
  { label: "≥", title: "Lớn hơn hoặc bằng", text: "\\ge ", at: 4 },
];

/** Chèn mẫu vào văn bản tại vùng chọn [start, end). Trả về văn bản mới và vị trí con trỏ. */
export function insertSnippet(value: string, start: number, end: number, s: (typeof SNIPPETS)[number]): { value: string; caret: number } {
  const sel = value.slice(start, end);
  if (s.wrap && sel) return { value: value.slice(0, start) + `$${sel}$` + value.slice(end), caret: start + sel.length + 2 };
  return { value: value.slice(0, start) + s.text + value.slice(end), caret: start + s.at };
}
