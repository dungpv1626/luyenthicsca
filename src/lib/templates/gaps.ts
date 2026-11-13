// Khuôn lấp các CHUYÊN ĐỀ còn trống theo đề cương CSCA chính thức (xem src/lib/syllabus.ts và docs/DOI-CHIEU-DE-CUONG-CHINH-THUC.md).
// Chủ đề (topic) và chủ đề con (subtopic) phải khớp quy tắc phân loại để câu rơi vào đúng chuyên đề; test kiểm tra điều này.
import { type Template, type Lang, make, P, M, num, fr, nice, rnd, pick3, mistakes } from "./core.ts";

const T: Template[] = [];
const add = (t: Template) => T.push(t);
const pickN = (correct: number, cands: number[]) => { const w = pick3(String(rnd(correct)), cands.map((x) => String(rnd(x)))); return w ? w.map(Number) : null; };
const pickS = (correct: string, cands: string[]) => pick3(correct, cands);
/** Số kèm đơn vị LaTeX (tex đã là LaTeX, vd "\\text{N}" hoặc "\\mu\\text{N}"). */
const U = (x: number, l: Lang, tex: string, d = 3) => M(tex ? `${num(x, l, d)}\\ ${tex}` : num(x, l, d));
const ops = (l: Lang, vals: number[], tex: string, d = 3) => vals.map((v) => U(v, l, tex, d));
const NUM = (n: number) => String(n);
/** Thừa số (x − v) viết đẹp: v < 0 → x + |v|. */
const fac = (v: number) => (v < 0 ? `x+${-v}` : v === 0 ? "x" : `x-${v}`);

// ===================== TOÁN =====================
add({ key: "math.sets.inclusion", subject: "math", topic: "Đại số", subtopic: "Tập hợp: phép hợp và giao", difficulty: "easy", build(r) {
  const c = r.int(2, 9), a = c + r.int(2, 15), b = c + r.int(2, 15), ans = a + b - c;
  const w = pickN(ans, [a + b, a + b + c, a - c + b - c, Math.max(a, b), a + b - 2 * c]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho hai tập hợp hữu hạn ${M("A")}, ${M("B")} có ${M(`|A|=${a}`)}, ${M(`|B|=${b}`)} và ${M(`|A\\cap B|=${c}`)}. Số phần tử của ${M("A\\cup B")} là`, `Finite sets ${M("A")} and ${M("B")} satisfy ${M(`|A|=${a}`)}, ${M(`|B|=${b}`)} and ${M(`|A\\cap B|=${c}`)}. The number of elements of ${M("A\\cup B")} is`, `有限集合 ${M("A")}、${M("B")} 满足 ${M(`|A|=${a}`)}，${M(`|B|=${b}`)}，${M(`|A\\cap B|=${c}`)}，则 ${M("A\\cup B")} 的元素个数为`),
    steps: P(l, `${M(`|A\\cup B|=|A|+|B|-|A\\cap B|=${a}+${b}-${c}=${ans}`)}. `, `${M(`|A\\cup B|=|A|+|B|-|A\\cap B|=${ans}`)}. `, `${M(`|A\\cup B|=|A|+|B|-|A\\cap B|=${ans}`)}。`) + mistakes(l, [[NUM(a + b), "quên trừ phần giao", "forgot to subtract the intersection", "忘记减去交集"]]),
    opts: ops(l, [ans, ...w], "", 0),
  }), "|A∪B| = |A|+|B|−|A∩B|", 50);
} });

add({ key: "math.sets.count_elements", subject: "math", topic: "Đại số", subtopic: "Tập hợp: số phần tử", difficulty: "easy", build(r) {
  const m = r.int(1, 9), n = r.int(1, 12), ans = m + n;
  const w = pickN(ans, [ans + 1, ans - 1, n, m * n, ans + 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho tập hợp ${M(`A=\\{x\\in\\mathbb{Z}\\mid -${m}<x\\le ${n}\\}`)}. Số phần tử của ${M("A")} là`, `Let ${M(`A=\\{x\\in\\mathbb{Z}\\mid -${m}<x\\le ${n}\\}`)}. The number of elements of ${M("A")} is`, `设集合 ${M(`A=\\{x\\in\\mathbb{Z}\\mid -${m}<x\\le ${n}\\}`)}，则 ${M("A")} 的元素个数为`),
    steps: P(l, `Các số nguyên thỏa mãn là ${M(`${-m + 1},\\dots,${n}`)}, gồm ${M(`${n}-(${-m + 1})+1=${ans}`)} số. `, `The integers are ${M(`${-m + 1},\\dots,${n}`)}, which is ${M(`${n}-(${-m + 1})+1=${ans}`)} numbers. `, `满足条件的整数为 ${M(`${-m + 1},\\dots,${n}`)}，共 ${M(`${n}-(${-m + 1})+1=${ans}`)} 个。`) + mistakes(l, [[NUM(ans + 1), `tính cả đầu mút ${-m} (khoảng mở)`, `counted the open endpoint ${-m}`, `把开端点 ${-m} 也算了进去`]]),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Đếm số nguyên trong khoảng", 50);
} });

add({ key: "math.ineq.quadratic_integers", subject: "math", topic: "Đại số", subtopic: "Bất phương trình bậc hai", difficulty: "medium", build(r) {
  const p = r.int(-6, 4), q = p + r.int(2, 9), ans = q - p + 1, b = -(p + q), c = p * q;
  const w = pickN(ans, [ans - 1, ans + 1, q - p, q + p, ans + 2]); if (!w) return null;
  const poly = `x^2${b >= 0 ? "+" : "-"}${Math.abs(b) === 1 ? "" : Math.abs(b)}${b === 0 ? "" : "x"}${c >= 0 ? "+" : "-"}${Math.abs(c)}`.replace("x^2+0x", "x^2");
  if (b === 0) return null;
  return make((l) => ({
    body: P(l, `Số nghiệm nguyên của bất phương trình ${M(`${poly}\\le 0`)} là`, `The number of integer solutions of ${M(`${poly}\\le 0`)} is`, `不等式 ${M(`${poly}\\le 0`)} 的整数解的个数为`),
    steps: P(l, `${M(`${poly}=(${fac(p)})(${fac(q)})`)}, nên ${M(`${p}\\le x\\le ${q}`)}: có ${M(`${q}-(${p})+1=${ans}`)} số nguyên. `, `${M(`${poly}=(${fac(p)})(${fac(q)})`)}, so ${M(`${p}\\le x\\le ${q}`)}: ${M(`${q}-(${p})+1=${ans}`)} integers. `, `${M(`${poly}=(${fac(p)})(${fac(q)})`)}，故 ${M(`${p}\\le x\\le ${q}`)}，共 ${M(`${q}-(${p})+1=${ans}`)} 个整数。`) + mistakes(l, [[NUM(q - p), "bỏ sót một đầu mút (dấu ≤ lấy cả hai nghiệm)", "missed one endpoint (≤ includes both roots)", "漏掉一个端点（≤ 取两个根）"]]),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Giải bất phương trình bậc hai", 80);
} });

add({ key: "math.ineq.fraction", subject: "math", topic: "Đại số", subtopic: "Bất phương trình phân thức", difficulty: "medium", build(r) {
  const a = r.int(-6, 4), b = a + r.int(2, 9), ans = b - a;
  const w = pickN(ans, [ans + 1, ans - 1, b + a, ans + 2, b]); if (!w) return null;
  const fx = (v: number) => (v < 0 ? `x+${-v}` : v === 0 ? "x" : `x-${v}`);
  return make((l) => ({
    body: P(l, `Số nghiệm nguyên của bất phương trình ${M(`\\dfrac{${fx(a)}}{${fx(b)}}\\le 0`)} là`, `The number of integer solutions of ${M(`\\dfrac{${fx(a)}}{${fx(b)}}\\le 0`)} is`, `不等式 ${M(`\\dfrac{${fx(a)}}{${fx(b)}}\\le 0`)} 的整数解的个数为`),
    steps: P(l, `Tập nghiệm ${M(`${a}\\le x<${b}`)} (không lấy ${M(`x=${b}`)} vì mẫu bằng 0), gồm ${M(`${b}-(${a})=${ans}`)} số nguyên. `, `Solution set ${M(`${a}\\le x<${b}`)} (excluding ${M(`x=${b}`)}, where the denominator is 0): ${M(`${b}-(${a})=${ans}`)} integers. `, `解集为 ${M(`${a}\\le x<${b}`)}（分母为 0 时 ${M(`x=${b}`)} 不取），共 ${M(`${b}-(${a})=${ans}`)} 个整数。`) + mistakes(l, [[NUM(ans + 1), "lấy cả nghiệm làm mẫu bằng 0", "included the root that makes the denominator 0", "把使分母为 0 的值也算进去"]]),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Bất phương trình phân thức", 90);
} });

const ELLIPSE: [number, number][] = [[5, 4], [5, 3], [13, 12], [10, 8], [17, 15], [13, 5], [10, 6], [25, 24], [15, 12]];
add({ key: "math.conics.ellipse_focal", subject: "math", topic: "Hình học", subtopic: "Elip: tiêu cự", difficulty: "medium", build(r) {
  const [a, b] = r.pick(ELLIPSE), c = Math.round(Math.sqrt(a * a - b * b)), ans = 2 * c;
  const w = pickN(ans, [c, a + b, 2 * a, Math.round(Math.sqrt(a * a + b * b)), 2 * b, a - b]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Elip ${M(`\\dfrac{x^2}{${a * a}}+\\dfrac{y^2}{${b * b}}=1`)} có tiêu cự bằng`, `The ellipse ${M(`\\dfrac{x^2}{${a * a}}+\\dfrac{y^2}{${b * b}}=1`)} has focal length`, `椭圆 ${M(`\\dfrac{x^2}{${a * a}}+\\dfrac{y^2}{${b * b}}=1`)} 的焦距为`),
    steps: P(l, `${M(`a^2=${a * a}`)}, ${M(`b^2=${b * b}`)}, ${M(`c=\\sqrt{a^2-b^2}=${c}`)}, tiêu cự ${M(`2c=${ans}`)}. `, `${M(`a^2=${a * a}`)}, ${M(`b^2=${b * b}`)}, ${M(`c=\\sqrt{a^2-b^2}=${c}`)}, focal length ${M(`2c=${ans}`)}. `, `${M(`a^2=${a * a}`)}，${M(`b^2=${b * b}`)}，${M(`c=\\sqrt{a^2-b^2}=${c}`)}，焦距 ${M(`2c=${ans}`)}。`) + mistakes(l, [[NUM(c), "đây là c, tiêu cự là 2c", "this is c; focal length is 2c", "这是 c，焦距是 2c"]]),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Elip: c² = a² − b²", 80);
} });

const HYP: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];
add({ key: "math.conics.hyperbola_focal", subject: "math", topic: "Hình học", subtopic: "Hyperbol: tiêu cự", difficulty: "medium", build(r) {
  const [a, b, c] = r.pick(HYP), ans = 2 * c;
  const w = pickN(ans, [c, a + b, 2 * (a + b), Math.abs(a * a - b * b), 2 * a]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Hyperbol ${M(`\\dfrac{x^2}{${a * a}}-\\dfrac{y^2}{${b * b}}=1`)} có tiêu cự bằng`, `The hyperbola ${M(`\\dfrac{x^2}{${a * a}}-\\dfrac{y^2}{${b * b}}=1`)} has focal length`, `双曲线 ${M(`\\dfrac{x^2}{${a * a}}-\\dfrac{y^2}{${b * b}}=1`)} 的焦距为`),
    steps: P(l, `${M(`c=\\sqrt{a^2+b^2}=\\sqrt{${a * a}+${b * b}}=${c}`)}, tiêu cự ${M(`2c=${ans}`)}. `, `${M(`c=\\sqrt{a^2+b^2}=${c}`)}, focal length ${M(`2c=${ans}`)}. `, `${M(`c=\\sqrt{a^2+b^2}=${c}`)}，焦距 ${M(`2c=${ans}`)}。`) + mistakes(l, [[NUM(Math.abs(a * a - b * b)), "dùng a² − b² của elip thay vì a² + b²", "used the ellipse relation a² − b²", "套用了椭圆的 a²−b²"]]),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Hyperbol: c² = a² + b²", 80);
} });

add({ key: "math.conics.parabola_param", subject: "math", topic: "Hình học", subtopic: "Parabol: tiêu điểm và đường chuẩn", difficulty: "easy", build(r) {
  const p = r.int(1, 12), ans = p;
  const w = pickN(ans, [p / 2, 2 * p, 4 * p, p + 1, p * p]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Khoảng cách từ tiêu điểm đến đường chuẩn của parabol ${M(`y^2=${2 * p}x`)} bằng`, `The distance from the focus to the directrix of the parabola ${M(`y^2=${2 * p}x`)} is`, `抛物线 ${M(`y^2=${2 * p}x`)} 的焦点到准线的距离为`),
    steps: P(l, `Dạng ${M("y^2=2px")} có tham số tiêu ${M(`p=${p}`)}; khoảng cách từ tiêu điểm tới đường chuẩn bằng ${M(`p=${ans}`)}. `, `The form ${M("y^2=2px")} has parameter ${M(`p=${p}`)}; the focus-directrix distance is ${M(`p=${ans}`)}. `, `形如 ${M("y^2=2px")} 中 ${M(`p=${p}`)}，焦点到准线的距离为 ${M(`p=${ans}`)}。`),
    opts: ops(l, [ans, ...w], "", 1),
  }), "Parabol y² = 2px", 50);
} });

add({ key: "math.conics.circle_radius", subject: "math", topic: "Hình học", subtopic: "Đường tròn: phương trình tổng quát", difficulty: "medium", build(r) {
  const a = r.int(-5, 5), b = r.int(-5, 5), R = r.int(2, 9), c = a * a + b * b - R * R; if (a === 0 || b === 0) return null;
  const w = pickN(R, [R * R, Math.round(Math.sqrt(Math.abs(a * a + b * b + c))), a * a + b * b, Math.abs(a) + Math.abs(b), R + 1]); if (!w) return null;
  const sg = (v: number, s: string) => `${v < 0 ? "+" : "-"}${Math.abs(2 * v) === 1 ? "" : Math.abs(2 * v)}${s}`;
  const eq = `x^2+y^2${sg(a, "x")}${sg(b, "y")}${c >= 0 ? "+" : "-"}${Math.abs(c)}=0`;
  return make((l) => ({
    body: P(l, `Bán kính của đường tròn ${M(eq)} bằng`, `The radius of the circle ${M(eq)} is`, `圆 ${M(eq)} 的半径为`),
    steps: P(l, `Tâm ${M(`I(${a},${b})`)}, ${M(`R=\\sqrt{${a}^2+${b}^2-(${c})}=\\sqrt{${R * R}}=${R}`)}. `, `Centre ${M(`I(${a},${b})`)}, ${M(`R=\\sqrt{${a}^2+${b}^2-(${c})}=${R}`)}. `, `圆心 ${M(`I(${a},${b})`)}，${M(`R=\\sqrt{${a}^2+${b}^2-(${c})}=${R}`)}。`) + mistakes(l, [[NUM(R * R), "đây là R², cần lấy căn", "this is R²; take the square root", "这是 R²，还需开方"]]),
    opts: ops(l, [R, ...w], "", 0),
  }), "Tâm và bán kính từ phương trình", 90);
} });

add({ key: "math.complex.real_part", subject: "math", topic: "Đại số", subtopic: "Số phức: phép nhân", difficulty: "medium", build(r) {
  const a = r.int(-5, 6), b = r.int(1, 6), c = r.int(-5, 6), d = r.int(1, 6), re = a * c - b * d, im = a * d + b * c, askRe = r.chance(0.5), ans = askRe ? re : im;
  const w = pickN(ans, askRe ? [a * c + b * d, im, a * c, b * d, re + 2] : [a * d - b * c, re, a * d, b * c, im + 2]); if (!w) return null;
  const z = (x: number, y: number) => `${x}${y >= 0 ? "+" : "-"}${Math.abs(y) === 1 ? "" : Math.abs(y)}i`;
  return make((l) => ({
    body: P(l, `Cho ${M(`z_1=${z(a, b)}`)} và ${M(`z_2=${z(c, d)}`)}. Phần ${askRe ? "thực" : "ảo"} của ${M("z_1z_2")} bằng`, `Let ${M(`z_1=${z(a, b)}`)} and ${M(`z_2=${z(c, d)}`)}. The ${askRe ? "real" : "imaginary"} part of ${M("z_1z_2")} is`, `设 ${M(`z_1=${z(a, b)}`)}，${M(`z_2=${z(c, d)}`)}，则 ${M("z_1z_2")} 的${askRe ? "实" : "虚"}部为`),
    steps: P(l, `${M(`z_1z_2=(${a}\\cdot${c}-${b}\\cdot${d})+(${a}\\cdot${d}+${b}\\cdot${c})i=${re}${im >= 0 ? "+" : "-"}${Math.abs(im)}i`)}, phần ${askRe ? "thực" : "ảo"} là ${M(NUM(ans))}. `, `${M(`z_1z_2=${re}${im >= 0 ? "+" : "-"}${Math.abs(im)}i`)}, the ${askRe ? "real" : "imaginary"} part is ${M(NUM(ans))}. `, `${M(`z_1z_2=${re}${im >= 0 ? "+" : "-"}${Math.abs(im)}i`)}，${askRe ? "实" : "虚"}部为 ${M(NUM(ans))}。`),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Nhân hai số phức", 80);
} });

const PYTH: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29], [15, 20, 25]];
add({ key: "math.complex.modulus", subject: "math", topic: "Đại số", subtopic: "Số phức: môđun", difficulty: "easy", build(r) {
  const [a0, b0, m] = r.pick(PYTH), a = r.chance(0.5) ? -a0 : a0, b = r.chance(0.5) ? -b0 : b0;
  const w = pickN(m, [m * m, a0 + b0, Math.abs(a0 - b0), m + 1, m - 1]); if (!w) return null;
  const z = `${a}${b >= 0 ? "+" : "-"}${Math.abs(b)}i`;
  return make((l) => ({
    body: P(l, `Môđun của số phức ${M(`z=${z}`)} bằng`, `The modulus of the complex number ${M(`z=${z}`)} is`, `复数 ${M(`z=${z}`)} 的模为`),
    steps: P(l, `${M(`|z|=\\sqrt{(${a})^2+(${b})^2}=\\sqrt{${m * m}}=${m}`)}. `, `${M(`|z|=\\sqrt{(${a})^2+(${b})^2}=${m}`)}. `, `${M(`|z|=\\sqrt{(${a})^2+(${b})^2}=${m}`)}。`) + mistakes(l, [[NUM(m * m), "quên lấy căn", "forgot the square root", "忘记开方"]]),
    opts: ops(l, [m, ...w], "", 0),
  }), "Môđun số phức", 50);
} });

add({ key: "math.normal.empirical_rule", subject: "math", topic: "Xác suất", subtopic: "Phân phối chuẩn: quy tắc 68–95–99,7", difficulty: "easy", build(r) {
  const mu = r.int(20, 100), sg = r.int(2, 10), k = r.pick([1, 2, 3]), pct = ({ 1: "68", 2: "95", 3: "99.7" } as Record<number, string>)[k];
  const all = ["68", "95", "99.7", "50", "34", "47.5", "99"], w = pickS(pct, all.filter((x) => x !== pct)); if (!w) return null;
  const f = (x: string, l: Lang) => M(`${l === "vi" ? x.replace(".", "{,}") : x}\\%`);
  return make((l) => ({
    body: P(l, `Biến ngẫu nhiên ${M("X")} có phân phối chuẩn với trung bình ${M(`\\mu=${mu}`)} và độ lệch chuẩn ${M(`\\sigma=${sg}`)}. Xấp xỉ bao nhiêu phần trăm giá trị của ${M("X")} nằm trong khoảng ${M(`(${mu - k * sg};\\ ${mu + k * sg})`)}?`, `A random variable ${M("X")} is normally distributed with mean ${M(`\\mu=${mu}`)} and standard deviation ${M(`\\sigma=${sg}`)}. Approximately what percentage of the values of ${M("X")} lie in ${M(`(${mu - k * sg},\\ ${mu + k * sg})`)}?`, `随机变量 ${M("X")} 服从正态分布，均值 ${M(`\\mu=${mu}`)}，标准差 ${M(`\\sigma=${sg}`)}。${M("X")} 的取值大约有百分之几落在 ${M(`(${mu - k * sg},\\ ${mu + k * sg})`)} 内？`),
    steps: P(l, `Khoảng này là ${M(`\\mu\\pm${k}\\sigma`)}, theo quy tắc 68–95–99,7 xấp xỉ ${f(pct, l)}. `, `The interval is ${M(`\\mu\\pm${k}\\sigma`)}; by the 68–95–99.7 rule it holds about ${f(pct, l)}. `, `该区间为 ${M(`\\mu\\pm${k}\\sigma`)}，由 68–95–99.7 法则约占 ${f(pct, l)}。`),
    opts: [pct, ...w].map((x) => f(x, l)),
  }), "Quy tắc 68–95–99,7", 60);
} });

add({ key: "math.normal.zscore", subject: "math", topic: "Xác suất", subtopic: "Phân phối chuẩn: chuẩn hóa", difficulty: "easy", build(r) {
  const mu = r.int(40, 100), sg = r.int(2, 12), z = r.pick([-3, -2, -1, 1, 2, 3]), x = mu + z * sg;
  const w = pickN(z, [-z, x - mu, sg / (x - mu || 1), (x - mu) * sg, z + 1]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Giả sử ${M(`X\\sim N(${mu};\\ ${sg}^2)`)}. Giá trị chuẩn hóa ${M("z")} của ${M(`x=${x}`)} là`, `Suppose ${M(`X\\sim N(${mu},\\ ${sg}^2)`)}. The standardized value ${M("z")} of ${M(`x=${x}`)} is`, `设 ${M(`X\\sim N(${mu},\\ ${sg}^2)`)}，则 ${M(`x=${x}`)} 的标准化值 ${M("z")} 为`),
    steps: P(l, `${M(`z=\\dfrac{x-\\mu}{\\sigma}=\\dfrac{${x}-${mu}}{${sg}}=${z}`)}. `, `${M(`z=\\dfrac{x-\\mu}{\\sigma}=\\dfrac{${x}-${mu}}{${sg}}=${z}`)}. `, `${M(`z=\\dfrac{x-\\mu}{\\sigma}=\\dfrac{${x}-${mu}}{${sg}}=${z}`)}。`),
    opts: ops(l, [z, ...w], "", 2),
  }), "z = (x − μ)/σ", 60);
} });

const CS: [number, number][] = [[1, 3], [1, 4], [2, 3], [3, 5], [4, 5], [1, 2], [3, 4], [5, 13], [12, 13], [2, 5], [1, 5]];
add({ key: "math.trig.cos_double", subject: "math", topic: "Lượng giác", subtopic: "Công thức nhân đôi", difficulty: "medium", build(r) {
  const [p0, q] = r.pick(CS), p = r.chance(0.5) ? -p0 : p0, ans = fr(2 * p * p - q * q, q * q);
  const w = pickS(ans, [fr(q * q - 2 * p * p, q * q), fr(2 * p, q), fr(p * p, q * q), fr(2 * p * p + q * q, q * q), fr(-2 * p, q)]); if (!w) return null;
  const cs = p < 0 ? `-\\dfrac{${-p}}{${q}}` : `\\dfrac{${p}}{${q}}`;
  return make((l) => ({
    body: P(l, `Nếu ${M(`\\cos\\alpha=${cs}`)} thì ${M("\\cos2\\alpha")} bằng`, `If ${M(`\\cos\\alpha=${cs}`)}, then ${M("\\cos2\\alpha")} equals`, `若 ${M(`\\cos\\alpha=${cs}`)}，则 ${M("\\cos2\\alpha")} 等于`),
    steps: P(l, `${M(`\\cos2\\alpha=2\\cos^2\\alpha-1=2\\cdot\\dfrac{${p * p}}{${q * q}}-1=${ans}`)}. `, `${M(`\\cos2\\alpha=2\\cos^2\\alpha-1=${ans}`)}. `, `${M(`\\cos2\\alpha=2\\cos^2\\alpha-1=${ans}`)}。`) + mistakes(l, [[w[0], "sai dấu hoặc nhầm công thức nhân đôi", "sign error or wrong double-angle formula", "符号错误或公式用错"]]),
    opts: [ans, ...w].map(M),
  }), "cos2α = 2cos²α − 1", 70);
} });

add({ key: "math.trig.sin_from_cos", subject: "math", topic: "Lượng giác", subtopic: "Giá trị lượng giác", difficulty: "medium", build(r) {
  const [adj, opp, hyp] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]] as [number, number, number][]), quad = r.int(1, 4);
  const cosSign = quad === 1 || quad === 4 ? 1 : -1, sinSign = quad <= 2 ? 1 : -1;
  const ans = fr(sinSign * opp, hyp), w = pickS(ans, [fr(-sinSign * opp, hyp), fr(cosSign * adj, hyp), fr(opp, adj), fr(sinSign * adj, hyp)]); if (!w) return null;
  const range = ["", "0<\\alpha<\\dfrac{\\pi}{2}", "\\dfrac{\\pi}{2}<\\alpha<\\pi", "\\pi<\\alpha<\\dfrac{3\\pi}{2}", "\\dfrac{3\\pi}{2}<\\alpha<2\\pi"][quad];
  const cs = cosSign < 0 ? `-\\dfrac{${adj}}{${hyp}}` : `\\dfrac{${adj}}{${hyp}}`;
  return make((l) => ({
    body: P(l, `Cho ${M(`\\cos\\alpha=${cs}`)} với ${M(range)}. Giá trị của ${M("\\sin\\alpha")} là`, `Given ${M(`\\cos\\alpha=${cs}`)} with ${M(range)}. The value of ${M("\\sin\\alpha")} is`, `已知 ${M(`\\cos\\alpha=${cs}`)}，${M(range)}，则 ${M("\\sin\\alpha")} 的值为`),
    steps: P(l, `${M(`\\sin^2\\alpha=1-\\dfrac{${adj * adj}}{${hyp * hyp}}=\\dfrac{${opp * opp}}{${hyp * hyp}}`)}, góc ở góc phần tư ${["", "I", "II", "III", "IV"][quad]} nên ${M(`\\sin\\alpha=${ans}`)}. `, `${M(`\\sin^2\\alpha=\\dfrac{${opp * opp}}{${hyp * hyp}}`)}; the angle is in quadrant ${["", "I", "II", "III", "IV"][quad]}, so ${M(`\\sin\\alpha=${ans}`)}. `, `${M(`\\sin^2\\alpha=\\dfrac{${opp * opp}}{${hyp * hyp}}`)}，角在第${["", "一", "二", "三", "四"][quad]}象限，故 ${M(`\\sin\\alpha=${ans}`)}。`) + mistakes(l, [[w[0], "sai dấu theo góc phần tư", "wrong sign for the quadrant", "象限符号判断错误"]]),
    opts: [ans, ...w].map(M),
  }), "sin từ cos và góc phần tư", 90);
} });

add({ key: "math.explog.log_chain", subject: "math", topic: "Đại số", subtopic: "Lôgarit: đổi cơ số", difficulty: "medium", build(r) {
  const a = r.pick([2, 3, 5]), k = r.int(2, 6), b = r.pick([3, 5, 7, 9, 10, 11].filter((x) => x !== a)), c = a ** k;
  const w = pickN(k, [k + 1, k - 1, c, b, k * 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Giá trị của ${M(`\\log_{${a}}${b}\\cdot\\log_{${b}}${c}`)} bằng`, `The value of ${M(`\\log_{${a}}${b}\\cdot\\log_{${b}}${c}`)} is`, `${M(`\\log_{${a}}${b}\\cdot\\log_{${b}}${c}`)} 的值为`),
    steps: P(l, `Đổi cơ số: ${M(`\\log_{${a}}${b}\\cdot\\log_{${b}}${c}=\\log_{${a}}${c}=\\log_{${a}}${a}^{${k}}=${k}`)}. `, `Change of base: ${M(`\\log_{${a}}${b}\\cdot\\log_{${b}}${c}=\\log_{${a}}${c}=${k}`)}. `, `换底公式：${M(`\\log_{${a}}${b}\\cdot\\log_{${b}}${c}=\\log_{${a}}${c}=${k}`)}。`),
    opts: ops(l, [k, ...w], "", 0),
  }), "Công thức đổi cơ số", 80);
} });

add({ key: "math.vectors.dot", subject: "math", topic: "Hình học", subtopic: "Vectơ: tích vô hướng", difficulty: "easy", build(r) {
  const x1 = r.int(-6, 6), y1 = r.int(-6, 6), x2 = r.int(-6, 6), y2 = r.int(-6, 6), ans = x1 * x2 + y1 * y2;
  const w = pickN(ans, [x1 * y2 - x2 * y1, x1 + x2 + y1 + y2, x1 * y2 + x2 * y1, x1 * x2 - y1 * y2, ans + 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho ${M(`\\vec a=(${x1};\\ ${y1})`)} và ${M(`\\vec b=(${x2};\\ ${y2})`)}. Tích vô hướng ${M("\\vec a\\cdot\\vec b")} bằng`, `Let ${M(`\\vec a=(${x1},\\ ${y1})`)} and ${M(`\\vec b=(${x2},\\ ${y2})`)}. The dot product ${M("\\vec a\\cdot\\vec b")} is`, `已知 ${M(`\\vec a=(${x1},\\ ${y1})`)}，${M(`\\vec b=(${x2},\\ ${y2})`)}，则 ${M("\\vec a\\cdot\\vec b")} 等于`),
    steps: P(l, `${M(`\\vec a\\cdot\\vec b=${x1}\\cdot(${x2})+(${y1})\\cdot(${y2})=${ans}`)}. `, `${M(`\\vec a\\cdot\\vec b=${x1}\\cdot(${x2})+(${y1})\\cdot(${y2})=${ans}`)}. `, `${M(`\\vec a\\cdot\\vec b=${x1}\\cdot(${x2})+(${y1})\\cdot(${y2})=${ans}`)}。`),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Tích vô hướng tọa độ", 50);
} });

add({ key: "math.vectors.perpendicular", subject: "math", topic: "Hình học", subtopic: "Vectơ: điều kiện vuông góc", difficulty: "medium", build(r) {
  const q = r.pick([1, 2, 3, 4, 5]), m = r.int(-6, 6), p = r.int(1, 6), rr = (-m * q) / p; if (m === 0 || !Number.isInteger(rr)) return null;
  // a = (m, p), b = (q, rr) ⇒ m·q + p·rr = 0 ⇒ với m chưa biết: chọn a=(t, p), b=(q, rr) ⇒ t = −p·rr/q
  const t = (-p * rr) / q; if (!Number.isInteger(t) || t === 0 || rr === 0) return null;
  const w = pickN(t, [-t, p * rr, (p * q) / (rr || 1), t + 1, t - 1]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho ${M(`\\vec a=(m;\\ ${p})`)} và ${M(`\\vec b=(${q};\\ ${rr})`)}. Tìm ${M("m")} để ${M("\\vec a\\perp\\vec b")}`, `Let ${M(`\\vec a=(m,\\ ${p})`)} and ${M(`\\vec b=(${q},\\ ${rr})`)}. Find ${M("m")} such that ${M("\\vec a\\perp\\vec b")}`, `已知 ${M(`\\vec a=(m,\\ ${p})`)}，${M(`\\vec b=(${q},\\ ${rr})`)}，若 ${M("\\vec a\\perp\\vec b")}，则 ${M("m")} 的值为`),
    steps: P(l, `${M(`\\vec a\\cdot\\vec b=${q}m+${p}\\cdot(${rr})=0\\Rightarrow m=${t}`)}. `, `${M(`\\vec a\\cdot\\vec b=${q}m+${p}\\cdot(${rr})=0\\Rightarrow m=${t}`)}. `, `${M(`\\vec a\\cdot\\vec b=${q}m+${p}\\cdot(${rr})=0\\Rightarrow m=${t}`)}。`),
    opts: ops(l, [t, ...w], "", 2),
  }), "Điều kiện vuông góc", 70);
} });

const QUAD: [number, number, number, number][] = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15], [4, 8, 8, 12]];
add({ key: "math.space.distance", subject: "math", topic: "Hình học", subtopic: "Hình học không gian: khoảng cách hai điểm", difficulty: "medium", build(r) {
  const [dx, dy, dz, d] = r.pick(QUAD), x1 = r.int(-4, 4), y1 = r.int(-4, 4), z1 = r.int(-4, 4), s = () => (r.chance(0.5) ? 1 : -1);
  const x2 = x1 + s() * dx, y2 = y1 + s() * dy, z2 = z1 + s() * dz;
  const w = pickN(d, [dx + dy + dz, d * d, Math.abs(dx - dy) + dz, d + 1, d - 1]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Trong không gian ${M("Oxyz")}, khoảng cách giữa ${M(`A(${x1};${y1};${z1})`)} và ${M(`B(${x2};${y2};${z2})`)} bằng`, `In ${M("Oxyz")}, the distance between ${M(`A(${x1},${y1},${z1})`)} and ${M(`B(${x2},${y2},${z2})`)} is`, `在空间直角坐标系 ${M("Oxyz")} 中，${M(`A(${x1},${y1},${z1})`)} 与 ${M(`B(${x2},${y2},${z2})`)} 的距离为`),
    steps: P(l, `${M(`AB=\\sqrt{${dx}^2+${dy}^2+${dz}^2}=\\sqrt{${d * d}}=${d}`)}. `, `${M(`AB=\\sqrt{${dx}^2+${dy}^2+${dz}^2}=${d}`)}. `, `${M(`AB=\\sqrt{${dx}^2+${dy}^2+${dz}^2}=${d}`)}。`) + mistakes(l, [[NUM(d * d), "chưa lấy căn", "forgot the square root", "忘记开方"]]),
    opts: ops(l, [d, ...w], "", 0),
  }), "Khoảng cách trong Oxyz", 70);
} });

add({ key: "math.space.midpoint", subject: "math", topic: "Hình học", subtopic: "Hình học không gian: trung điểm", difficulty: "easy", build(r) {
  const c = () => 2 * r.int(-5, 5), x1 = c(), y1 = c(), z1 = c(), x2 = r.int(-5, 5) * 2, y2 = r.int(-5, 5) * 2, z2 = r.int(-5, 5) * 2, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, mz = (z1 + z2) / 2, ans = mx + my + mz;
  const w = pickN(ans, [x1 + y1 + z1 + x2 + y2 + z2, mx * my * mz, mx + my, ans + 1, ans - 1]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Trong ${M("Oxyz")}, ${M("M")} là trung điểm của ${M(`A(${x1};${y1};${z1})`)} và ${M(`B(${x2};${y2};${z2})`)}. Tổng các tọa độ của ${M("M")} bằng`, `In ${M("Oxyz")}, ${M("M")} is the midpoint of ${M(`A(${x1},${y1},${z1})`)} and ${M(`B(${x2},${y2},${z2})`)}. The sum of the coordinates of ${M("M")} is`, `在 ${M("Oxyz")} 中，${M("M")} 为 ${M(`A(${x1},${y1},${z1})`)} 与 ${M(`B(${x2},${y2},${z2})`)} 的中点，则 ${M("M")} 的坐标之和为`),
    steps: P(l, `${M(`M(${mx};${my};${mz})`)}, tổng tọa độ ${M(`${mx}+(${my})+(${mz})=${ans}`)}. `, `${M(`M(${mx},${my},${mz})`)}, sum ${M(`${mx}+(${my})+(${mz})=${ans}`)}. `, `${M(`M(${mx},${my},${mz})`)}，坐标之和 ${M(`${mx}+(${my})+(${mz})=${ans}`)}。`),
    opts: ops(l, [ans, ...w], "", 0),
  }), "Tọa độ trung điểm", 60);
} });

// ===================== VẬT LÝ =====================
add({ key: "phy.momentum.inelastic", subject: "physics", topic: "Cơ học", subtopic: "Động lượng: va chạm mềm", difficulty: "medium", build(r) {
  const m1 = r.pick([1, 2, 3, 4, 5, 6]), m2 = r.pick([1, 2, 3, 4, 6]), v1 = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), v = (m1 * v1) / (m1 + m2); if (!nice(v, 2)) return null;
  const w = pickN(v, [v1, (m1 * v1) / m2, (m1 + m2) * v1 / m1, v1 / 2, m1 * v1]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Vật ${M(`m_1=${m1}`)} kg chuyển động với ${M(`${v1}`)} m/s đến va chạm mềm vào vật ${M(`m_2=${m2}`)} kg đang đứng yên; sau va chạm hai vật dính vào nhau. Vận tốc của hệ sau va chạm là`, `A ${m1} kg object moving at ${v1} m/s collides inelastically with a ${m2} kg object at rest, and they stick together. The velocity of the system after the collision is`, `质量 ${m1} kg 的物体以 ${v1} m/s 的速度与静止的 ${m2} kg 物体发生完全非弹性碰撞，碰后粘在一起。碰后系统的速度为`),
    steps: P(l, `${M(`m_1v_1=(m_1+m_2)v\\Rightarrow v=\\dfrac{${m1}\\cdot${v1}}{${m1 + m2}}=${num(v, l, 2)}\\ \\text{m/s}`)}. `, `${M(`m_1v_1=(m_1+m_2)v\\Rightarrow v=${num(v, l, 2)}\\ \\text{m/s}`)}. `, `${M(`m_1v_1=(m_1+m_2)v\\Rightarrow v=${num(v, l, 2)}\\ \\text{m/s}`)}。`) + mistakes(l, [[num(v1, l, 2), "quên khối lượng m₂ trong hệ sau va chạm", "forgot m₂ after the collision", "忘记碰后系统包含 m₂"]]),
    opts: ops(l, [v, ...w], "\\text{m/s}", 2),
  }), "Bảo toàn động lượng", 80);
} });

add({ key: "phy.momentum.impulse", subject: "physics", topic: "Cơ học", subtopic: "Xung lượng của lực", difficulty: "easy", build(r) {
  const m = r.pick([1, 2, 4, 5, 10]), t = r.pick([2, 3, 4, 5, 10]), dv = r.pick([2, 3, 4, 5, 6, 8]), F = m * dv / t; if (!nice(F, 2)) return null;
  const w = pickN(dv, [F * t * m, F * t / (m + 1), F / m, dv * m, dv + t]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Lực ${M(`F=${num(F, l, 2)}`)} N tác dụng lên vật khối lượng ${M(`${m}`)} kg trong ${M(`${t}`)} s (vật ban đầu đứng yên). Vận tốc của vật sau đó là`, `A force ${M(`F=${num(F, l, 2)}`)} N acts on a ${m} kg object for ${t} s (initially at rest). The final speed is`, `${M(`F=${num(F, l, 2)}`)} N 的力作用在质量 ${m} kg 的静止物体上 ${t} s，则物体最终速度为`),
    steps: P(l, `${M(`F\\Delta t=m\\Delta v\\Rightarrow v=\\dfrac{${num(F, l, 2)}\\cdot${t}}{${m}}=${dv}\\ \\text{m/s}`)}. `, `${M(`F\\Delta t=m\\Delta v\\Rightarrow v=${dv}\\ \\text{m/s}`)}. `, `${M(`F\\Delta t=m\\Delta v\\Rightarrow v=${dv}\\ \\text{m/s}`)}。`),
    opts: ops(l, [dv, ...w], "\\text{m/s}", 2),
  }), "Xung lượng = độ biến thiên động lượng", 60);
} });

add({ key: "phy.energy.free_fall", subject: "physics", topic: "Cơ học", subtopic: "Bảo toàn cơ năng", difficulty: "easy", build(r) {
  const [h, v] = r.pick([[5, 10], [20, 20], [45, 30], [80, 40], [125, 50], [180, 60]] as [number, number][]);
  const w = pickN(v, [v * v, h, 2 * h, v / 2, Math.sqrt(h)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Thả rơi tự do một vật từ độ cao ${M(`${h}`)} m (bỏ qua sức cản, ${M("g=10\\ \\text{m/s}^2")}). Vận tốc khi chạm đất là`, `An object is dropped from ${h} m (no air resistance, ${M("g=10\\ \\text{m/s}^2")}). Its speed on reaching the ground is`, `物体从 ${h} m 高处自由下落（不计空气阻力，${M("g=10\\ \\text{m/s}^2")}），落地速度为`),
    steps: P(l, `${M(`mgh=\\tfrac12mv^2\\Rightarrow v=\\sqrt{2gh}=\\sqrt{2\\cdot10\\cdot${h}}=${v}\\ \\text{m/s}`)}. `, `${M(`mgh=\\tfrac12mv^2\\Rightarrow v=\\sqrt{2gh}=${v}\\ \\text{m/s}`)}. `, `${M(`mgh=\\tfrac12mv^2\\Rightarrow v=\\sqrt{2gh}=${v}\\ \\text{m/s}`)}。`) + mistakes(l, [[NUM(v * v), "quên lấy căn", "forgot the square root", "忘记开方"]]),
    opts: ops(l, [v, ...w], "\\text{m/s}", 0),
  }), "Bảo toàn cơ năng", 60);
} });

add({ key: "phy.energy.work", subject: "physics", topic: "Cơ học", subtopic: "Công của lực", difficulty: "easy", build(r) {
  const F = r.int(2, 30), s = r.int(2, 20), ang = r.pick([0, 60, 90]), cosv = ({ 0: 1, 60: 0.5, 90: 0 } as Record<number, number>)[ang], A = F * s * cosv; if (ang === 90) return null; if (!nice(A, 2)) return null;
  const w = pickN(A, [F * s, F * s * (ang === 60 ? 0.866 : 1) + 1, F + s, F * s / 2 + F, A * 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Lực ${M(`F=${F}`)} N làm vật dịch chuyển ${M(`s=${s}`)} m, góc giữa lực và hướng dịch chuyển là ${M(`${ang}^\\circ`)}. Công của lực bằng`, `A force ${M(`F=${F}`)} N moves an object ${M(`s=${s}`)} m; the angle between the force and the displacement is ${M(`${ang}^\\circ`)}. The work done is`, `${M(`F=${F}`)} N 的力使物体位移 ${M(`s=${s}`)} m，力与位移夹角为 ${M(`${ang}^\\circ`)}，该力做的功为`),
    steps: P(l, `${M(`A=Fs\\cos\\alpha=${F}\\cdot${s}\\cdot\\cos${ang}^\\circ=${num(A, l, 2)}\\ \\text{J}`)}. `, `${M(`A=Fs\\cos\\alpha=${num(A, l, 2)}\\ \\text{J}`)}. `, `${M(`A=Fs\\cos\\alpha=${num(A, l, 2)}\\ \\text{J}`)}。`),
    opts: ops(l, [A, ...w], "\\text{J}", 2),
  }), "A = Fs·cosα", 50);
} });

add({ key: "phy.circular.centripetal", subject: "physics", topic: "Cơ học", subtopic: "Chuyển động tròn: gia tốc hướng tâm", difficulty: "easy", build(r) {
  const v = r.pick([4, 5, 6, 8, 10, 12, 15, 20]), R = r.pick([2, 4, 5, 8, 10, 20, 25, 40]), a = (v * v) / R; if (!nice(a, 2)) return null;
  const w = pickN(a, [v * v * R, v / R, (v * v) / (2 * R), 2 * v * v / R, v * R]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Vật chuyển động tròn đều với tốc độ ${M(`${v}`)} m/s trên quỹ đạo bán kính ${M(`${R}`)} m. Gia tốc hướng tâm của vật là`, `An object moves uniformly on a circle of radius ${R} m at ${v} m/s. Its centripetal acceleration is`, `物体在半径 ${R} m 的圆周上以 ${v} m/s 做匀速圆周运动，其向心加速度为`),
    steps: P(l, `${M(`a=\\dfrac{v^2}{R}=\\dfrac{${v}^2}{${R}}=${num(a, l, 2)}\\ \\text{m/s}^2`)}. `, `${M(`a=\\dfrac{v^2}{R}=${num(a, l, 2)}\\ \\text{m/s}^2`)}. `, `${M(`a=\\dfrac{v^2}{R}=${num(a, l, 2)}\\ \\text{m/s}^2`)}。`),
    opts: ops(l, [a, ...w], "\\text{m/s}^2", 2),
  }), "a = v²/R", 50);
} });

add({ key: "phy.gravity.inverse_square", subject: "physics", topic: "Cơ học", subtopic: "Lực hấp dẫn: quy luật nghịch đảo bình phương", difficulty: "medium", build(r) {
  const k = r.pick([2, 3, 4, 5]), F0 = r.pick([36, 72, 90, 100, 144, 180, 200, 360, 400]), F = F0 / (k * k); if (!nice(F, 2)) return null;
  const w = pickN(F, [F0 / k, F0 * k, F0 * k * k, F0 / (k + 1), F0 / (2 * k)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Lực hấp dẫn giữa hai vật là ${M(`${F0}`)} N. Nếu khoảng cách giữa chúng tăng lên ${M(`${k}`)} lần (khối lượng không đổi) thì lực hấp dẫn là`, `The gravitational force between two bodies is ${F0} N. If their separation becomes ${k} times larger (masses unchanged), the force becomes`, `两物体间的万有引力为 ${F0} N。若距离变为原来的 ${k} 倍（质量不变），则引力变为`),
    steps: P(l, `${M("F\\propto\\dfrac{1}{r^2}")}, nên ${M(`F'=\\dfrac{${F0}}{${k}^2}=${num(F, l, 2)}\\ \\text{N}`)}. `, `${M("F\\propto\\dfrac{1}{r^2}")}, so ${M(`F'=\\dfrac{${F0}}{${k}^2}=${num(F, l, 2)}\\ \\text{N}`)}. `, `${M("F\\propto\\dfrac{1}{r^2}")}，故 ${M(`F'=\\dfrac{${F0}}{${k}^2}=${num(F, l, 2)}\\ \\text{N}`)}。`) + mistakes(l, [[num(F0 / k, l, 2), "chia cho k thay vì k²", "divided by k instead of k²", "除以了 k 而不是 k²"]]),
    opts: ops(l, [F, ...w], "\\text{N}", 2),
  }), "Lực hấp dẫn ∝ 1/r²", 70);
} });

add({ key: "phy.magnetic.lorentz", subject: "physics", topic: "Điện học", subtopic: "Từ trường: lực Lo-ren-xơ", difficulty: "medium", build(r) {
  const q = r.int(2, 9), v = r.pick([10, 20, 50, 100, 200, 500]), B = r.pick([0.1, 0.2, 0.5, 1, 2]), F = q * v * B; if (!nice(F, 2)) return null;
  const w = pickN(F, [q * v, q * B, F / 10, F * 10, v * B]); if (!w) return null;
  const tex = "\\mu\\text{N}";
  return make((l) => ({
    body: P(l, `Hạt mang điện ${M(`q=${q}\\ \\mu\\text{C}`)} chuyển động với tốc độ ${M(`${v}\\ \\text{m/s}`)} vuông góc với từ trường đều ${M(`B=${num(B, l, 2)}\\ \\text{T}`)}. Độ lớn lực Lo-ren-xơ là`, `A particle of charge ${M(`q=${q}\\ \\mu\\text{C}`)} moves at ${M(`${v}\\ \\text{m/s}`)} perpendicular to a uniform magnetic field ${M(`B=${num(B, l, 2)}\\ \\text{T}`)}. The magnitude of the Lorentz force is`, `电荷量 ${M(`q=${q}\\ \\mu\\text{C}`)} 的粒子以 ${M(`${v}\\ \\text{m/s}`)} 的速度垂直射入匀强磁场 ${M(`B=${num(B, l, 2)}\\ \\text{T}`)}，洛伦兹力大小为`),
    steps: P(l, `${M(`F=qvB=${q}\\cdot${v}\\cdot${num(B, l, 2)}=${num(F, l, 2)}\\ ${tex}`)}. `, `${M(`F=qvB=${num(F, l, 2)}\\ ${tex}`)}. `, `${M(`F=qvB=${num(F, l, 2)}\\ ${tex}`)}。`),
    opts: ops(l, [F, ...w], tex, 2),
  }), "F = qvB", 60);
} });

add({ key: "phy.magnetic.ampere", subject: "physics", topic: "Điện học", subtopic: "Từ trường: lực Am-pe", difficulty: "medium", build(r) {
  const B = r.pick([0.1, 0.2, 0.5, 0.4, 0.25]), I = r.int(2, 12), L = r.pick([0.2, 0.5, 1, 1.5, 2, 4]), F = B * I * L; if (!nice(F, 3)) return null;
  const w = pickN(F, [B * I, I * L, B * L, F * 10, F / 10]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Đoạn dây dài ${M(`${num(L, l, 2)}\\ \\text{m}`)} mang dòng điện ${M(`${I}\\ \\text{A}`)} đặt vuông góc với từ trường đều ${M(`B=${num(B, l, 2)}\\ \\text{T}`)}. Lực từ tác dụng lên dây là`, `A ${num(L, "en", 2)} m wire carrying ${I} A is perpendicular to a uniform field ${M(`B=${num(B, l, 2)}\\ \\text{T}`)}. The magnetic force on the wire is`, `长 ${num(L, "en", 2)} m 的导线通有 ${I} A 电流，垂直于磁感应强度 ${M(`B=${num(B, l, 2)}\\ \\text{T}`)} 的匀强磁场，所受安培力为`),
    steps: P(l, `${M(`F=BIL=${num(B, l, 2)}\\cdot${I}\\cdot${num(L, l, 2)}=${num(F, l, 3)}\\ \\text{N}`)}. `, `${M(`F=BIL=${num(F, l, 3)}\\ \\text{N}`)}. `, `${M(`F=BIL=${num(F, l, 3)}\\ \\text{N}`)}。`),
    opts: ops(l, [F, ...w], "\\text{N}", 3),
  }), "F = BIL", 60);
} });

add({ key: "phy.induction.faraday", subject: "physics", topic: "Điện học", subtopic: "Cảm ứng điện từ: định luật Fa-ra-đây", difficulty: "medium", build(r) {
  const N = r.pick([1, 10, 20, 50, 100]), dPhi = r.pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.5]), dt = r.pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.5]), e = N * dPhi / dt; if (!nice(e, 2)) return null;
  const w = pickN(e, [dPhi / dt, N * dPhi * dt, e / N, e * 10, N * dt / dPhi]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cuộn dây ${M(`${N}`)} vòng có từ thông qua mỗi vòng biến thiên ${M(`${num(dPhi, l, 2)}\\ \\text{Wb}`)} trong ${M(`${num(dt, l, 2)}\\ \\text{s}`)}. Độ lớn suất điện động cảm ứng là`, `A ${N}-turn coil has the flux through each turn change by ${M(`${num(dPhi, l, 2)}\\ \\text{Wb}`)} in ${M(`${num(dt, l, 2)}\\ \\text{s}`)}. The magnitude of the induced emf is`, `${N} 匝线圈中每匝的磁通量在 ${M(`${num(dt, l, 2)}\\ \\text{s}`)} 内变化 ${M(`${num(dPhi, l, 2)}\\ \\text{Wb}`)}，感应电动势大小为`),
    steps: P(l, `${M(`\\varepsilon=N\\dfrac{\\Delta\\Phi}{\\Delta t}=${N}\\cdot\\dfrac{${num(dPhi, l, 2)}}{${num(dt, l, 2)}}=${num(e, l, 2)}\\ \\text{V}`)}. `, `${M(`\\varepsilon=N\\dfrac{\\Delta\\Phi}{\\Delta t}=${num(e, l, 2)}\\ \\text{V}`)}. `, `${M(`\\varepsilon=N\\dfrac{\\Delta\\Phi}{\\Delta t}=${num(e, l, 2)}\\ \\text{V}`)}。`) + mistakes(l, [[num(dPhi / dt, l, 2), "quên nhân với số vòng N", "forgot to multiply by N", "忘记乘以匝数 N"]]),
    opts: ops(l, [e, ...w], "\\text{V}", 2),
  }), "Định luật Fa-ra-đây", 70);
} });

add({ key: "phy.induction.motional", subject: "physics", topic: "Điện học", subtopic: "Cảm ứng điện từ: suất điện động trong thanh chuyển động", difficulty: "medium", build(r) {
  const B = r.pick([0.1, 0.2, 0.5, 1, 2]), L = r.pick([0.2, 0.5, 1, 2]), v = r.pick([2, 4, 5, 10, 20]), e = B * L * v; if (!nice(e, 2)) return null;
  const w = pickN(e, [B * v, B * L, L * v, e * 10, e / 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Thanh dẫn dài ${M(`${num(L, l, 2)}\\ \\text{m}`)} chuyển động với tốc độ ${M(`${v}\\ \\text{m/s}`)} vuông góc với đường sức của từ trường đều ${M(`B=${num(B, l, 2)}\\ \\text{T}`)}. Suất điện động cảm ứng trong thanh là`, `A ${num(L, "en", 2)} m conducting rod moves at ${v} m/s perpendicular to the field lines of ${M(`B=${num(B, l, 2)}\\ \\text{T}`)}. The induced emf in the rod is`, `长 ${num(L, "en", 2)} m 的导体棒以 ${v} m/s 的速度垂直切割 ${M(`B=${num(B, l, 2)}\\ \\text{T}`)} 的匀强磁场的磁感线，棒中感应电动势为`),
    steps: P(l, `${M(`\\varepsilon=BLv=${num(B, l, 2)}\\cdot${num(L, l, 2)}\\cdot${v}=${num(e, l, 2)}\\ \\text{V}`)}. `, `${M(`\\varepsilon=BLv=${num(e, l, 2)}\\ \\text{V}`)}. `, `${M(`\\varepsilon=BLv=${num(e, l, 2)}\\ \\text{V}`)}。`),
    opts: ops(l, [e, ...w], "\\text{V}", 2),
  }), "ε = BLv", 60);
} });

add({ key: "phy.electro.coulomb_force", subject: "physics", topic: "Điện học", subtopic: "Định luật Coulomb: lực giữa hai điện tích điểm", difficulty: "medium", build(r) {
  const q1 = r.int(1, 9), q2 = r.int(1, 9), rr = r.pick([0.1, 0.2, 0.3, 0.5, 1]), F = (0.009 * q1 * q2) / (rr * rr); if (!nice(F, 3)) return null;
  const w = pickN(F, [F * rr, F * rr * rr, F / 10, F * 10, (0.009 * q1 * q2) / rr]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Hai điện tích điểm ${M(`q_1=${q1}\\ \\mu\\text{C}`)} và ${M(`q_2=${q2}\\ \\mu\\text{C}`)} đặt trong chân không cách nhau ${M(`${num(rr, l, 2)}\\ \\text{m}`)} (${M("k=9\\cdot10^9\\ \\text{N·m}^2/\\text{C}^2")}). Độ lớn lực tương tác là`, `Two point charges ${M(`q_1=${q1}\\ \\mu\\text{C}`)} and ${M(`q_2=${q2}\\ \\mu\\text{C}`)} are ${M(`${num(rr, l, 2)}\\ \\text{m}`)} apart in vacuum (${M("k=9\\cdot10^9\\ \\text{N·m}^2/\\text{C}^2")}). The magnitude of the force is`, `真空中两点电荷 ${M(`q_1=${q1}\\ \\mu\\text{C}`)}、${M(`q_2=${q2}\\ \\mu\\text{C}`)} 相距 ${M(`${num(rr, l, 2)}\\ \\text{m}`)}（${M("k=9\\cdot10^9\\ \\text{N·m}^2/\\text{C}^2")}），相互作用力大小为`),
    steps: P(l, `${M(`F=k\\dfrac{|q_1q_2|}{r^2}=9\\cdot10^9\\cdot\\dfrac{${q1}\\cdot10^{-6}\\cdot${q2}\\cdot10^{-6}}{${num(rr, l, 2)}^2}=${num(F, l, 3)}\\ \\text{N}`)}. `, `${M(`F=k\\dfrac{|q_1q_2|}{r^2}=${num(F, l, 3)}\\ \\text{N}`)}. `, `${M(`F=k\\dfrac{|q_1q_2|}{r^2}=${num(F, l, 3)}\\ \\text{N}`)}。`),
    opts: ops(l, [F, ...w], "\\text{N}", 3),
  }), "Định luật Cu-lông", 80);
} });

add({ key: "phy.electro.field_point", subject: "physics", topic: "Điện học", subtopic: "Điện trường của điện tích điểm", difficulty: "medium", build(r) {
  const q = r.int(1, 9), rr = r.pick([0.3, 0.5, 1, 3]), E = (9 * q) / (rr * rr); if (!nice(E, 2)) return null;
  const w = pickN(E, [E * rr, E * rr * rr, E / 10, E * 10, 9 * q / rr]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Điện tích điểm ${M(`q=${q}\\ \\text{nC}`)} đặt trong chân không. Cường độ điện trường tại điểm cách nó ${M(`${num(rr, l, 2)}\\ \\text{m}`)} là (${M("k=9\\cdot10^9\\ \\text{N·m}^2/\\text{C}^2")})`, `A point charge ${M(`q=${q}\\ \\text{nC}`)} sits in vacuum. The electric field strength at ${M(`${num(rr, l, 2)}\\ \\text{m}`)} from it is (${M("k=9\\cdot10^9\\ \\text{N·m}^2/\\text{C}^2")})`, `真空中点电荷 ${M(`q=${q}\\ \\text{nC}`)}，距其 ${M(`${num(rr, l, 2)}\\ \\text{m}`)} 处的电场强度为（${M("k=9\\cdot10^9\\ \\text{N·m}^2/\\text{C}^2")}）`),
    steps: P(l, `${M(`E=\\dfrac{kq}{r^2}=\\dfrac{9\\cdot10^9\\cdot${q}\\cdot10^{-9}}{${num(rr, l, 2)}^2}=${num(E, l, 2)}\\ \\text{V/m}`)}. `, `${M(`E=\\dfrac{kq}{r^2}=${num(E, l, 2)}\\ \\text{V/m}`)}. `, `${M(`E=\\dfrac{kq}{r^2}=${num(E, l, 2)}\\ \\text{V/m}`)}。`),
    opts: ops(l, [E, ...w], "\\text{V/m}", 2),
  }), "E = kq/r²", 70);
} });

add({ key: "phy.thermal.first_law", subject: "physics", topic: "Nhiệt học", subtopic: "Nguyên lí thứ nhất nhiệt động lực học", difficulty: "easy", build(r) {
  const Q = r.int(50, 500), A = r.int(10, 400), dU = Q - A; if (dU <= 0 || dU === Q) return null;
  const w = pickN(dU, [Q + A, A - Q, Q, A, dU + 10]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Chất khí nhận nhiệt lượng ${M(`${Q}\\ \\text{J}`)} và sinh công ${M(`${A}\\ \\text{J}`)} đẩy pit-tông. Độ biến thiên nội năng của khí là`, `A gas absorbs ${M(`${Q}\\ \\text{J}`)} of heat and does ${M(`${A}\\ \\text{J}`)} of work on the piston. The change in internal energy is`, `气体吸收热量 ${M(`${Q}\\ \\text{J}`)}，同时对活塞做功 ${M(`${A}\\ \\text{J}`)}，则内能的变化量为`),
    steps: P(l, `${M(`\\Delta U=Q-A=${Q}-${A}=${dU}\\ \\text{J}`)}. `, `${M(`\\Delta U=Q-A=${dU}\\ \\text{J}`)}. `, `${M(`\\Delta U=Q-A=${dU}\\ \\text{J}`)}。`) + mistakes(l, [[NUM(Q + A), "cộng công thay vì trừ (khí sinh công thì mất năng lượng)", "added the work (gas doing work loses energy)", "把功加上了（气体对外做功内能减少）"]]),
    opts: ops(l, [dU, ...w], "\\text{J}", 0),
  }), "ΔU = Q − A", 50);
} });

add({ key: "phy.thermal.kinetic_ratio", subject: "physics", topic: "Nhiệt học", subtopic: "Thuyết động học phân tử: động năng trung bình", difficulty: "medium", build(r) {
  const t1 = r.pick([27, 127, -73, 327]), t2 = r.pick([27, 177, 327, 927, 627, 1227]), ratio = (t2 + 273) / (t1 + 273); if (t1 === t2 || ratio < 1 || !nice(ratio, 2)) return null;
  const w = pickN(ratio, [t2 / t1, t2 - t1, (t2 + 273) / t1, ratio * 2, 1 / ratio]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Khi nhiệt độ khí lí tưởng tăng từ ${M(`${t1}^\\circ\\text{C}`)} lên ${M(`${t2}^\\circ\\text{C}`)}, động năng tịnh tiến trung bình của phân tử tăng lên bao nhiêu lần?`, `When an ideal gas is heated from ${M(`${t1}^\\circ\\text{C}`)} to ${M(`${t2}^\\circ\\text{C}`)}, by what factor does the average translational kinetic energy per molecule increase?`, `理想气体温度由 ${M(`${t1}^\\circ\\text{C}`)} 升高到 ${M(`${t2}^\\circ\\text{C}`)}，分子平均平动动能变为原来的多少倍？`),
    steps: P(l, `Động năng trung bình tỉ lệ với nhiệt độ tuyệt đối: ${M(`\\dfrac{T_2}{T_1}=\\dfrac{${t2 + 273}}{${t1 + 273}}=${num(ratio, l, 2)}`)}. `, `Average kinetic energy is proportional to absolute temperature: ${M(`\\dfrac{T_2}{T_1}=\\dfrac{${t2 + 273}}{${t1 + 273}}=${num(ratio, l, 2)}`)}. `, `平均动能与热力学温度成正比：${M(`\\dfrac{T_2}{T_1}=\\dfrac{${t2 + 273}}{${t1 + 273}}=${num(ratio, l, 2)}`)}。`) + mistakes(l, [[num(t2 / t1, l, 2), "dùng nhiệt độ Celsius thay vì kenvin", "used Celsius instead of kelvin", "用了摄氏温度而不是开尔文"]]),
    opts: ops(l, [ratio, ...w], "", 2),
  }), "Eđ ∝ T (kenvin)", 70);
} });

// ===================== HÓA HỌC =====================
add({ key: "chem.gas.ideal_volume", subject: "chemistry", topic: "Phản ứng hóa học", subtopic: "Phương trình khí lí tưởng", difficulty: "medium", build(r) {
  const p = r.pick([1, 2, 3]), n = r.pick([0.25, 0.5, 1, 1.5, 2, 3]), T = r.pick([300, 400]), V = (n * 0.082 * T) / p; if (!nice(V, 2)) return null;
  const w = pickN(V, [(n * 0.082 * (T - 273)) / p, V * p, V / p, n * 22.4, (p * 0.082 * T) / n]); if (!w) return null;
  return make((l) => ({
    body: P(l, `${M(`${num(n, l, 2)}\\ \\text{mol}`)} khí lí tưởng ở ${M(`${T}\\ \\text{K}`)}, áp suất ${M(`${p}\\ \\text{atm}`)}. Thể tích khí là (${M("R=0{,}082\\ \\text{atm·L/(mol·K)}")})`, `${M(`${num(n, l, 2)}\\ \\text{mol}`)} of an ideal gas at ${M(`${T}\\ \\text{K}`)} and ${M(`${p}\\ \\text{atm}`)} occupies (${M("R=0.082\\ \\text{atm·L/(mol·K)}")})`, `${M(`${num(n, l, 2)}\\ \\text{mol}`)} 理想气体，温度 ${M(`${T}\\ \\text{K}`)}，压强 ${M(`${p}\\ \\text{atm}`)}，体积为（${M("R=0.082\\ \\text{atm·L/(mol·K)}")}）`),
    steps: P(l, `${M(`pV=nRT\\Rightarrow V=\\dfrac{nRT}{p}=\\dfrac{${num(n, l, 2)}\\cdot0{,}082\\cdot${T}}{${p}}=${num(V, l, 2)}\\ \\text{L}`)}. `, `${M(`pV=nRT\\Rightarrow V=\\dfrac{nRT}{p}=${num(V, l, 2)}\\ \\text{L}`)}. `, `${M(`pV=nRT\\Rightarrow V=\\dfrac{nRT}{p}=${num(V, l, 2)}\\ \\text{L}`)}。`),
    opts: ops(l, [V, ...w], "\\text{L}", 2),
  }), "pV = nRT", 80);
} });

const BAL: [string, string, number[]][] = [
  ["Al + O_2 \\to Al_2O_3", "Al + O₂ → Al₂O₃", [4, 3, 2]], ["Fe + O_2 \\to Fe_3O_4", "Fe + O₂ → Fe₃O₄", [3, 2, 1]],
  ["C_2H_6 + O_2 \\to CO_2 + H_2O", "C₂H₆ + O₂ → CO₂ + H₂O", [2, 7, 4, 6]], ["C_3H_8 + O_2 \\to CO_2 + H_2O", "C₃H₈ + O₂ → CO₂ + H₂O", [1, 5, 3, 4]],
  ["Fe_2O_3 + CO \\to Fe + CO_2", "Fe₂O₃ + CO → Fe + CO₂", [1, 3, 2, 3]], ["NH_3 + O_2 \\to NO + H_2O", "NH₃ + O₂ → NO + H₂O", [4, 5, 4, 6]],
  ["KClO_3 \\to KCl + O_2", "KClO₃ → KCl + O₂", [2, 2, 3]], ["Al + HCl \\to AlCl_3 + H_2", "Al + HCl → AlCl₃ + H₂", [2, 6, 2, 3]],
  ["N_2 + H_2 \\to NH_3", "N₂ + H₂ → NH₃", [1, 3, 2]], ["Ca(OH)_2 + H_3PO_4 \\to Ca_3(PO_4)_2 + H_2O", "Ca(OH)₂ + H₃PO₄ → Ca₃(PO₄)₂ + H₂O", [3, 2, 1, 6]],
];
add({ key: "chem.equations.balance_sum", subject: "chemistry", topic: "Phản ứng hóa học", subtopic: "Cân bằng phương trình hóa học", difficulty: "easy", build(r) {
  const [tex, , co] = r.pick(BAL), s = co.reduce((a, b) => a + b, 0);
  const w = pickN(s, [s + 1, s - 1, s + 2, s - 2, co.length]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Sau khi cân bằng (hệ số nguyên tối giản), tổng các hệ số của phương trình ${M(tex)} là`, `After balancing (smallest whole-number coefficients), the sum of the coefficients of ${M(tex)} is`, `配平（最简整数系数）后，方程式 ${M(tex)} 的系数之和为`),
    steps: P(l, `Các hệ số là ${M(co.join(",\\ "))}; tổng bằng ${M(`${co.join("+")}=${s}`)}. `, `The coefficients are ${M(co.join(",\\ "))}; the sum is ${M(`${co.join("+")}=${s}`)}. `, `系数依次为 ${M(co.join(",\\ "))}，和为 ${M(`${co.join("+")}=${s}`)}。`),
    opts: ops(l, [s, ...w], "", 0),
  }), "Cân bằng phương trình", 60);
} });

export const GAP_TEMPLATES = T;
