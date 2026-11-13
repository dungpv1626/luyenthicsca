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

/** Quy tắc mô-đun cũ theo (môn, chủ đề, chủ đề con): chỉ dùng khi không có quy tắc chuyên đề nào khớp. */
function legacyModule({ subject, topic, subtopic }: In): string | null {
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


// ===================== CHUYÊN ĐỀ THEO ĐỀ CƯƠNG CHÍNH THỨC (2025) =====================
// Nguồn cấu trúc: đề cương chính thức tại csca.cn/about/testprep (Toán, Vật lý, Hóa học). Mỗi chuyên đề là một mục nhỏ trong đề cương.
// `sample`: nội dung đó xuất hiện trong ĐỀ MẪU chính thức (đã đối chiếu với file đề mẫu). Tiếng Trung chia theo dạng câu và khối nên chưa có chuyên đề ở đây.
export type Topic = { key: string; module: string; vi: string; en: string; zh: string; desc: string; sample?: boolean };
const T = (key: string, module: string, vi: string, en: string, zh: string, desc: string, sample = false): Topic => ({ key, module, vi, en, zh, desc, sample });

export const TOPICS: Record<"math" | "physics" | "chemistry" | "chinese", Topic[]> = {
  math: [
    T("sets", "set_ineq", "Tập hợp", "Sets", "集合", "Định nghĩa, phép toán và cách biểu diễn tập hợp"),
    T("ineq", "set_ineq", "Bất phương trình", "Inequalities", "不等式", "Tính chất, bất phương trình bậc hai, phân thức", true),
    T("func_general", "function", "Khái niệm và tính chất hàm số", "Functions: concepts and properties", "函数的概念与性质", "Tập xác định, tập giá trị, đơn điệu, chẵn lẻ, hàm ngược", true),
    T("exp_log", "function", "Hàm lũy thừa, mũ, lôgarit", "Power, exponential, logarithmic functions", "幂函数、指数函数、对数函数", "Tính chất và đồ thị của các hàm sơ cấp"),
    T("trig", "function", "Hàm lượng giác", "Trigonometric functions", "三角函数", "Giá trị lượng giác, công thức biến đổi, tập xác định", true),
    T("sequence", "function", "Dãy số", "Sequences", "数列", "Cấp số cộng, cấp số nhân: số hạng tổng quát và tổng", true),
    T("deriv", "function", "Đạo hàm sơ bộ", "Introductory derivatives", "导数初步", "Định nghĩa, ý nghĩa hình học và ứng dụng đơn giản"),
    T("lines_circles", "geo_alg", "Đường thẳng và đường tròn", "Lines and circles", "直线与圆", "Phương trình, khoảng cách, vị trí tương đối", true),
    T("conics", "geo_alg", "Elip, hyperbol, parabol", "Ellipse, hyperbola, parabola", "椭圆、双曲线、抛物线", "Phương trình chính tắc và tính chất", true),
    T("vectors", "geo_alg", "Vectơ", "Vectors", "向量", "Các phép toán vectơ", true),
    T("complex", "geo_alg", "Số phức", "Complex numbers", "复数", "Bốn phép tính với số phức", true),
    T("space", "geo_alg", "Hình học không gian", "Solid geometry", "空间几何", "Hệ tọa độ Oxyz, tính chất các khối đơn giản"),
    T("prob_classical", "prob_stat", "Xác suất cổ điển", "Classical probability", "古典概型", "Quy tắc đếm, tổ hợp, tính xác suất", true),
    T("stats", "prob_stat", "Số đặc trưng của dữ liệu", "Descriptive statistics", "数据的数字特征", "Trung bình, trung vị, phương sai"),
    T("normal", "prob_stat", "Phân phối chuẩn", "Normal distribution", "正态分布", "Khái niệm cơ bản về phân phối chuẩn"),
  ],
  physics: [
    T("kinematics", "mechanics", "Động học", "Kinematics", "运动学", "Độ dời, vận tốc, gia tốc, chuyển động biến đổi đều, rơi tự do"),
    T("dynamics", "mechanics", "Động lực học", "Dynamics", "牛顿运动定律", "Định luật Niu-tơn, lực ma sát", true),
    T("momentum", "mechanics", "Động lượng và xung lượng", "Momentum and impulse", "动量与冲量", "Bảo toàn động lượng, va chạm", true),
    T("energy", "mechanics", "Công và cơ năng", "Work and energy", "功与能", "Công, công suất, bảo toàn cơ năng", true),
    T("circular_gravity", "mechanics", "Chuyển động tròn và hấp dẫn", "Circular motion and gravitation", "圆周运动与万有引力", "Chuyển động tròn đều, lực hấp dẫn", true),
    T("oscillation_waves", "mechanics", "Dao động và sóng cơ", "Oscillations and mechanical waves", "简谐振动与机械波", "Dao động điều hòa, con lắc, sóng cơ, sóng dừng", true),
    T("electrostatics", "electromag", "Tĩnh điện", "Electrostatics", "静电场", "Định luật Cu-lông, điện trường, điện thế", true),
    T("dc_circuits", "electromag", "Mạch điện một chiều", "DC circuits", "直流电路", "Định luật Ôm, mạch nối tiếp và song song, công suất điện"),
    T("magnetic", "electromag", "Từ trường và lực từ", "Magnetic field and forces", "磁场", "Cảm ứng từ, lực Am-pe, lực Lo-ren-xơ", true),
    T("induction", "electromag", "Cảm ứng điện từ", "Electromagnetic induction", "电磁感应", "Định luật Fa-ra-đây, định luật Len-xơ"),
    T("kinetic", "thermal", "Thuyết động học phân tử", "Kinetic theory", "分子动理论", "Mô hình phân tử của chất khí"),
    T("ideal_gas", "thermal", "Khí lí tưởng", "Ideal gas", "理想气体状态方程", "Phương trình trạng thái, các quá trình đẳng"),
    T("first_law", "thermal", "Nguyên lí thứ nhất nhiệt động lực học", "First law of thermodynamics", "热力学第一定律", "Công, nhiệt và biến thiên nội năng"),
    T("optics_geometric", "optics", "Phản xạ và khúc xạ", "Reflection and refraction", "反射定律与折射定律", "Định luật phản xạ, khúc xạ, chiết suất, phản xạ toàn phần"),
    T("optics_wave", "optics", "Giao thoa và nhiễu xạ", "Interference and diffraction", "干涉与衍射", "Giao thoa ánh sáng, khoảng vân, nhiễu xạ"),
    T("photoelectric", "modern", "Hiệu ứng quang điện", "Photoelectric effect", "光电效应", "Photon, công thoát, động năng cực đại"),
    T("atom", "modern", "Cấu tạo nguyên tử", "Atomic structure", "原子结构", "Mẫu nguyên tử, mức năng lượng"),
    T("nuclear", "modern", "Hạt nhân cơ bản", "Nuclear physics basics", "核物理基础", "Phóng xạ, chu kì bán rã, năng lượng liên kết"),
  ],
  chemistry: [
    T("classification", "concept_calc", "Phân loại và trạng thái chất", "Classification and states of matter", "物质分类与状态变化", "Đơn chất, hợp chất, hỗn hợp, đồng vị, thù hình", true),
    T("equations", "concept_calc", "Ký hiệu và phương trình hóa học", "Chemical notation and equations", "化学用语与方程式书写", "Công thức, cân bằng phương trình"),
    T("conc_ph", "concept_calc", "Nồng độ dung dịch và pH", "Solution concentration and pH", "溶液浓度与pH计算", "Nồng độ, pha loãng, pH, trung hòa, chuẩn độ, pha chế", true),
    T("mole", "concept_calc", "Lượng chất (mol)", "Amount of substance (mole)", "物质的量相关计算", "Mol, khối lượng, thể tích khí, hiệu suất", true),
    T("ideal_gas_chem", "concept_calc", "Phương trình khí lí tưởng", "Ideal gas equation", "理想气体状态方程应用", "Áp dụng pV = nRT"),
    T("inorganic", "properties", "Chất vô cơ", "Inorganic substances", "常见无机物性质", "Đơn chất, oxit, axit, bazơ, muối", true),
    T("organic", "properties", "Hữu cơ cơ bản", "Basic organic chemistry", "基础有机化合物", "Hiđrocacbon và dẫn xuất, phản ứng cộng, đồng đẳng", true),
    T("redox", "properties", "Oxi hóa – khử", "Redox reactions", "氧化还原反应", "Số oxi hóa, chất oxi hóa và chất khử, cân bằng electron"),
    T("ionic", "properties", "Phản ứng ion và nhận biết", "Ionic reactions and tests", "离子反应与检验方法", "Ion cùng tồn tại, nhận biết ion", true),
    T("atom_periodic", "theory", "Cấu tạo nguyên tử và bảng tuần hoàn", "Atomic structure and periodic law", "原子结构与元素周期律", "Cấu hình electron, quy luật tuần hoàn", true),
    T("bonding", "theory", "Liên kết hóa học", "Chemical bonding", "化学键与分子间作用力", "Liên kết ion, cộng hóa trị, lực liên phân tử"),
    T("rate_equilibrium", "theory", "Tốc độ phản ứng và cân bằng", "Reaction rate and equilibrium", "化学反应速率与平衡", "Yếu tố ảnh hưởng, chuyển dịch cân bằng", true),
    T("electrolyte", "theory", "Dung dịch điện li", "Electrolyte solutions", "电解质溶液理论", "Chất điện li mạnh – yếu, điện phân", true),
    T("lab_safety", "experiment", "An toàn và dụng cụ phòng thí nghiệm", "Lab safety and apparatus", "实验室安全与仪器使用", "Quy tắc an toàn, cách dùng dụng cụ", true),
    T("gas_prep", "experiment", "Điều chế và nhận biết khí", "Gas preparation and detection", "常见气体制备与检验", "Thu khí, làm khô, kiểm tra khí", true),
    T("separation", "experiment", "Tách và tinh chế chất", "Separation and purification", "物质分离提纯方法", "Lọc, chưng cất, kết tinh, loại tạp chất", true),
    T("industrial", "experiment", "Quy trình công nghiệp", "Industrial processes", "工业化工流程分析", "Ví dụ tổng hợp amoniac"),
  ],
  // Tiếng Trung chuyên ngành: 6 DẠNG câu của đề cương chính thức (dùng chung cho khối khoa học 理科中文 và khối văn 文科中文).
  // Dạng câu và khối được ghi trong chủ đề con: "<dạng Hán> · khối khoa học|khối văn · ...".
  chinese: [
    T("zh_char", "vocab", "Nhận biết chữ Hán", "Character recognition", "识解汉字", "Nhận biết, hiểu nghĩa chữ Hán và từ trong ngữ cảnh"),
    T("zh_cloze", "vocab", "Chọn từ điền chỗ trống", "Word choice cloze", "选词填空", "Chọn từ thích hợp điền vào chỗ trống trong câu"),
    T("zh_diff", "vocab", "Phân biệt từ", "Word discrimination", "辨析词语", "Phân biệt từ gần nghĩa, dùng từ đúng ngữ cảnh"),
    T("zh_passage", "grammar", "Chọn từ thành đoạn", "Passage cloze", "选词成段", "Chọn từ điền vào nhiều chỗ trống trong một đoạn văn"),
    T("zh_sentence", "grammar", "Hoàn thành câu", "Sentence completion", "补全语句", "Chọn câu thích hợp để hoàn thành đoạn văn"),
    T("zh_reading", "reading", "Đọc hiểu", "Reading comprehension", "阅读理解", "Đọc đoạn văn rồi trả lời câu hỏi"),
  ],
};

export const topicList = (subject: string): Topic[] => (TOPICS as Record<string, Topic[]>)[subject] ?? [];
export const topicByKey = (subject: string, key: string | null | undefined): Topic | undefined => topicList(subject).find((t) => t.key === key);

const norm = (s: string | null | undefined) => (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();
/** Khối Tiếng Trung chuyên ngành của một câu: ghi trong chủ đề con ("khối văn" hoặc 文科 → văn; còn lại → khoa học). */
export type ZhTrack = "science" | "humanities";
export const zhTrackOf = (subtopic: string | null | undefined): ZhTrack => (/khoi van|文科/.test(norm(subtopic)) ? "humanities" : "science");
/** [chủ đề, chủ đề con (null = bất kỳ), khóa chuyên đề hoặc OUT]. Quy tắc đầu tiên khớp sẽ thắng. */
type Rule = [RegExp, RegExp | null, string];
const ANY = /./;
const RULES: Record<string, Rule[]> = {
  // Tiếng Trung: dạng câu được ghi bằng tên Hán trong chủ đề con (xem TOPICS.chinese)
  chinese: [
    [ANY, /识解汉字/, "zh_char"], [ANY, /选词填空/, "zh_cloze"], [ANY, /辨析词语/, "zh_diff"],
    [ANY, /选词成段/, "zh_passage"], [ANY, /补全语句/, "zh_sentence"], [ANY, /阅读理解/, "zh_reading"],
  ],
  math: [
    // nội dung KHÔNG được liệt kê trong đề cương: vẫn luyện được, không đưa vào đề mô phỏng
    [ANY, /tich phan|nguyen ham|gioi han|vi-?et|co dieu kien|doc lap|nhi thuc|phep thu lap|dien tich tam giac|he thuc trong tam giac|tam giac-duong tron|hinh hoc phang/, OUT],
    [ANY, /tap hop/, "sets"], [ANY, /bat phuong trinh|bat dang thuc/, "ineq"],
    [ANY, /dao ham|toi uu|cuc tri/, "deriv"], [ANY, /day so|cap so|quy nap|so hang tong quat|tong n so hang/, "sequence"],
    [ANY, /luong giac|\bsin\b|\bcos\b|\btan\b/, "trig"], [ANY, /\bmu\b|logarit|luy thua/, "exp_log"],
    [ANY, /elip|hyperbol|hypebol|parabol|conic/, "conics"], [ANY, /vecto|vector/, "vectors"], [ANY, /so phuc/, "complex"],
    [ANY, /khong gian|the tich|oxyz|khoi/, "space"], [ANY, /duong thang|duong tron|khoang cach|toa do/, "lines_circles"],
    [/ham so/, null, "func_general"], [ANY, /ham so|do thi|tap xac dinh|don dieu|chan le|ham bac|phan thuc|tuong giao/, "func_general"],
    [ANY, /phan phoi chuan/, "normal"], [ANY, /thong ke|trung binh|trung vi|phuong sai|do lech/, "stats"], [/xac suat/, null, "prob_classical"], [ANY, /to hop|hoan vi|chinh hop|quy tac dem/, "prob_classical"],
  ],
  physics: [
    [/nhiet hoc/, /nhiet luong|nhiet dung|can bang nhiet|truyen nhiet/, OUT], [/quang hoc/, /thau kinh|anh qua/, OUT], [/vat ly hien dai/, /tuong doi/, OUT],
    [/vat ly hien dai/, /quang dien|luong tu|photon/, "photoelectric"], [/vat ly hien dai/, /nguyen tu|\bbo\b|bohr/, "atom"], [/vat ly hien dai/, /hat nhan|phong xa|lien ket|khoi luong/, "nuclear"],
    [/quang hoc/, /giao thoa|nhieu xa|khoang van/, "optics_wave"], [/quang hoc/, null, "optics_geometric"],
    [/song/, /anh sang|giao thoa|nhieu xa|khoang van|young|y-?ang/, "optics_wave"], [/song/, null, "oscillation_waves"],
    [/nhiet hoc/, /khi li tuong|dang nhiet|dang tich|dang ap|trang thai|boyle|charles/, "ideal_gas"], [/nhiet hoc/, /nguyen li thu nhat|nhiet dong luc/, "first_law"], [/nhiet hoc/, /phan tu/, "kinetic"],
    [/dien hoc/, /cam ung dien tu|faraday|lenz/, "induction"], [/dien hoc/, /tu truong|lorentz|ampe|luc tu/, "magnetic"],
    [/dien hoc/, /coulomb|dien truong|dien the|tu dien|tinh dien/, "electrostatics"], [/dien hoc/, /\bom\b|ohm|mach|dien tro|cong suat|dien nang|dong dien/, "dc_circuits"],
    [/co hoc/, /dong luong|xung luong|va cham/, "momentum"], [/co hoc/, /co nang|nang luong|dong nang|the nang|\bcong\b/, "energy"],
    [/co hoc/, /chuyen dong tron|hap dan|van vat/, "circular_gravity"], [/co hoc/, /newton|ma sat|dong luc hoc|\bluc\b/, "dynamics"],
    [/co hoc/, /chuyen dong thang|dong hoc|chuyen dong nem|roi tu do|nem/, "kinematics"],
  ],
  chemistry: [
    [/phan ung hoa hoc/, /nhiet hoa hoc/, OUT],
    [ANY, /can bang phuong trinh|phuong trinh hoa hoc|ky hieu hoa hoc/, "equations"],
    [ANY, /dien phan|dien li/, "electrolyte"], [ANY, /an toan phong|dung cu/, "lab_safety"], [ANY, /tach|tinh che|chung cat|ket tinh/, "separation"], [ANY, /cong nghiep|quy trinh|amoniac/, "industrial"],
    [ANY, /thu khi|dieu che|nhan biet khi/, "gas_prep"],
    [/cau tao nguyen tu|bang tuan hoan/, /lien ket|hinh hoc phan tu|luc lien phan tu/, "bonding"], [/cau tao nguyen tu|bang tuan hoan/, null, "atom_periodic"],
    [ANY, /toc do phan ung|can bang hoa hoc|chuyen dich/, "rate_equilibrium"],
    [/thi nghiem/, /chuan do|pha che|pha loang|nong do/, "conc_ph"],
    [/dung dich|axit.?bazo/, /\bph\b|nong do|pha loang|trung hoa|do tan|chuan do|phan tram/, "conc_ph"], [/dung dich/, /tap hop|trang thai/, "classification"], [/dung dich/, null, "conc_ph"],
    [/phan ung hoa hoc/, /mol|khoi luong|hieu suat|tinh toan/, "mole"], [ANY, /khi li tuong|trang thai khi/, "ideal_gas_chem"],
    [/hoa huu co/, null, "organic"], [/oxi hoa/, null, "redox"], [ANY, /phan ung ion|nhan biet/, "ionic"], [/axit.?bazo|phan ung hoa hoc/, null, "inorganic"],
  ],
};

/** Phân loại một câu hỏi: mô-đun + chuyên đề theo đề cương. `module = "out"` = ngoài phần liệt kê; `topic = null` = chưa gán chuyên đề. */
export function classify(q: In): { module: string | null; topic: string | null } {
  const t = norm(q.topic), st = norm(q.subtopic);
  for (const [tr, sr, key] of RULES[q.subject] ?? []) {
    if (!tr.test(t) && !(tr === ANY)) continue;
    if (sr && !sr.test(st) && !(sr.test(t) && tr === ANY)) continue;
    if (key === OUT) return { module: OUT, topic: null };
    const top = topicByKey(q.subject, key);
    if (top) return { module: top.module, topic: top.key };
  }
  return { module: legacyModule(q), topic: null };
}
/** Mô-đun của câu (đã tính quy tắc chuyên đề và phần ngoài đề cương). */
export const moduleOf = (q: In): string | null => classify(q).module;
