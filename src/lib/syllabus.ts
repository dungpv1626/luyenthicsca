// Mô-đun theo ĐỀ CƯƠNG CSCA (cấu trúc mô-đun lấy từ các bài hướng dẫn đề cương 2025; chưa đối chiếu trực tiếp với file PDF chính thức).
// LƯU Ý: đề cương KHÔNG công bố số câu theo từng mô-đun, nên `weight` là tỉ trọng ƯỚC LƯỢNG của chúng tôi (chỉnh được tại đây).
export type Subject = "math" | "physics" | "chemistry" | "chinese";
export type Mod = { key: string; name: string; weight: number; scope: string };

export const MODULES: Record<Subject, Mod[]> = {
  math: [
    { key: "set_ineq", name: "Tập hợp và bất phương trình", weight: 15, scope: "Phép toán tập hợp; phương trình, bất phương trình bậc hai và phân thức" },
    { key: "function", name: "Hàm số", weight: 35, scope: "Tập xác định, đơn điệu, chẵn lẻ; hàm lũy thừa, mũ, logarit, lượng giác; cấp số cộng, cấp số nhân; đạo hàm cơ bản" },
    { key: "geo_alg", name: "Hình học và đại số", weight: 30, scope: "Đường thẳng, đường tròn, elip, hypebol, parabol; vectơ; số phức; hình học không gian" },
    { key: "prob_stat", name: "Xác suất và thống kê", weight: 20, scope: "Xác suất cổ điển, tổ hợp; số trung bình, phương sai; phân phối chuẩn" },
  ],
  physics: [
    { key: "mechanics", name: "Cơ học", weight: 40, scope: "Động học, định luật Newton, động lượng, công – năng lượng, chuyển động tròn, dao động, sóng cơ" },
    { key: "electromag", name: "Điện từ học", weight: 25, scope: "Điện trường, định luật Ohm, mạch điện, từ trường, cảm ứng điện từ" },
    { key: "thermal", name: "Nhiệt học", weight: 10, scope: "Thuyết động học phân tử, khí lý tưởng, nguyên lý I nhiệt động lực học" },
    { key: "optics", name: "Quang học", weight: 10, scope: "Phản xạ, khúc xạ; giao thoa, nhiễu xạ" },
    { key: "modern", name: "Vật lý hiện đại", weight: 15, scope: "Hiện tượng quang điện, cấu tạo nguyên tử, vật lý hạt nhân cơ bản" },
  ],
  chemistry: [
    { key: "concept_calc", name: "Khái niệm cơ bản và tính toán", weight: 30, scope: "Ký hiệu, phương trình hóa học; nồng độ, pH; tính theo mol; khí lý tưởng" },
    { key: "properties", name: "Tính chất và phản ứng của chất", weight: 30, scope: "Đơn chất, oxide, acid, base, muối; hydrocarbon và dẫn xuất; oxi hóa – khử; phản ứng ion" },
    { key: "theory", name: "Lý thuyết và định luật hóa học", weight: 25, scope: "Cấu tạo nguyên tử, bảng tuần hoàn, liên kết; tốc độ phản ứng, cân bằng; dung dịch điện li" },
    { key: "experiment", name: "Thí nghiệm và ứng dụng", weight: 15, scope: "An toàn, dụng cụ; điều chế và nhận biết khí, ion; tách – tinh chế; quy trình công nghiệp" },
  ],
  // Đề cương Tiếng Trung chuyên ngành chia theo 7 DẠNG câu (không công bố số câu mỗi dạng); đây là 3 nhóm theo cách ngân hàng của chúng tôi phân loại.
  chinese: [
    { key: "reading", name: "Đọc hiểu và đọc dữ liệu", weight: 40, scope: "Đọc hiểu đoạn văn, văn bản hướng dẫn; đọc biểu đồ, bảng số liệu" },
    { key: "vocab", name: "Từ vựng và thuật ngữ chuyên ngành", weight: 35, scope: "Giải nghĩa chữ Hán, chọn từ, phân biệt từ gần nghĩa; thuật ngữ Toán, Lý, Hóa, thí nghiệm" },
    { key: "grammar", name: "Ngữ pháp và hoàn thành câu", weight: 25, scope: "Cấu trúc câu, liên từ, trợ từ, hoàn thành câu" },
  ],
};

/** Câu hỏi thuộc nội dung chưa nằm trong phần liệt kê của đề cương (vẫn dùng được để luyện tập, nhưng không đưa vào đề mô phỏng). */
export const OUT = "out";
export const moduleName = (subject: string, key: string | null | undefined) => (key === OUT ? "Ngoài phần liệt kê của đề cương" : MODULES[subject as Subject]?.find((m) => m.key === key)?.name ?? "Chưa phân loại");

type In = { subject: string; topic: string; subtopic?: string | null };
const has = (s: string, re: RegExp) => re.test(s.toLowerCase());

/** Gán mô-đun đề cương cho một câu theo (môn, chủ đề, chủ đề con). Trả về null nếu chưa biết. */
export function moduleOf({ subject, topic, subtopic }: In): string | null {
  const t = topic, st = (subtopic ?? "").toLowerCase();
  switch (subject) {
    case "math":
      if (t === "Hàm số" || t === "Dãy số") return "function";
      if (t === "Lượng giác") return has(st, /diện tích tam giác|hệ thức trong tam giác/) ? "geo_alg" : "function";
      if (t === "Giải tích") return has(st, /tích phân|nguyên hàm|giới hạn/) ? OUT : "function";
      if (t === "Hình học") return "geo_alg";
      if (t === "Xác suất") return "prob_stat";
      if (t === "Đại số") return has(st, /số phức/) ? "geo_alg" : has(st, /lôgarit|logarit|lũy thừa|mũ/) ? "function" : "set_ineq";
      return null;
    case "physics":
      if (t === "Cơ học") return "mechanics";
      if (t === "Sóng") return has(st, /ánh sáng|giao thoa|nhiễu xạ/) ? "optics" : "mechanics";
      if (t === "Điện học") return "electromag";
      if (t === "Nhiệt học") return "thermal";
      if (t === "Quang học") return "optics";
      if (t === "Vật lý hiện đại") return "modern";
      return null;
    case "chemistry":
      if (t === "Thí nghiệm và ứng dụng") return "experiment";
      if (has(st, /dụng cụ|thu khí|điều chế|nhận biết|tách|tinh chế|an toàn phòng/)) return "experiment";
      if (t === "Dung dịch") return has(st, /điện li/) ? "theory" : "concept_calc";
      if (t === "Axit–bazơ") return has(st, /điện li/) ? "theory" : has(st, /ph|trung hòa|chuẩn độ/) ? "concept_calc" : "properties";
      if (t === "Phản ứng hóa học") return has(st, /tốc độ|cân bằng/) ? "theory" : has(st, /nhiệt hóa học/) ? OUT : has(st, /tính toán|mol|hiệu suất/) ? "concept_calc" : "properties";
      if (t === "Cấu tạo nguyên tử" || t === "Bảng tuần hoàn") return "theory";
      if (t === "Oxi hóa–khử") return has(st, /điện phân/) ? OUT : "properties";
      if (t === "Hóa hữu cơ") return "properties";
      return null;
    case "chinese":
      if (t === "Đọc hiểu" || t === "Biểu đạt số liệu") return "reading";
      if (t === "Từ vựng chuyên ngành" || t === "Thuật ngữ thí nghiệm") return "vocab";
      if (t === "Ngữ pháp") return "grammar";
      return null;
  }
  return null;
}

/** Chia n câu cho các mô-đun theo tỉ trọng (phương pháp phần dư lớn nhất): tổng luôn bằng n. */
export function moduleQuotas(subject: Subject, n: number): Record<string, number> {
  const mods = MODULES[subject]; const total = mods.reduce((s, m) => s + m.weight, 0);
  const raw = mods.map((m) => ({ key: m.key, x: (m.weight / total) * n }));
  const out: Record<string, number> = Object.fromEntries(raw.map((r) => [r.key, Math.floor(r.x)]));
  let left = n - Object.values(out).reduce((a, b) => a + b, 0);
  for (const r of [...raw].sort((a, b) => (b.x - Math.floor(b.x)) - (a.x - Math.floor(a.x)))) { if (left <= 0) break; out[r.key]++; left--; }
  return out;
}
