import { type Template, type Rng, make, P, M, poly, fr, frpi, num, nz, pick3, mistakes } from "./core.ts";

// ---------- các hàm tính (xuất ra để test đối chiếu bằng cách khác) ----------
export const derivCubic = (a: number, b: number, c: number, x0: number) => 3 * a * x0 * x0 + 2 * b * x0 + c;
export const evalCubic = (a: number, b: number, c: number, d: number, x: number) => a * x ** 3 + b * x ** 2 + c * x + d;
export const arithSum = (a: number, d: number, n: number) => (n * (2 * a + (n - 1) * d)) / 2;
export const geoTerm = (a: number, q: number, n: number) => a * q ** (n - 1);
export const choose = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
export const perm = (n: number, k: number) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };

const T: Template[] = [];
const add = (t: Template) => T.push(t);

// 1. Đạo hàm đa thức bậc 3 tại một điểm
add({ key: "math.calc.deriv_cubic", subject: "math", topic: "Giải tích", subtopic: "Đạo hàm của đa thức", difficulty: "medium", build(r) {
  const a = r.int(1, 4), b = nz(r, -5, 5), c = nz(r, -6, 6), d = nz(r, -9, 9), x0 = nz(r, -3, 3);
  const ans = derivCubic(a, b, c, x0), f0 = evalCubic(a, b, c, d, x0);
  const cand = [String(ans + d), String(f0), String(3 * a * x0 * x0 + b * x0 + c), String(ans + 2 * b)];
  const w = pick3(String(ans), cand); if (!w) return null;
  const f = poly([[a, "x^3"], [b, "x^2"], [c, "x"], [d, ""]]);
  return make((l) => ({
    body: P(l, `Cho hàm số ${M(`f(x)=${f}`)}. Giá trị của ${M(`f'(${x0})`)} bằng`, `Let ${M(`f(x)=${f}`)}. The value of ${M(`f'(${x0})`)} is`, `已知函数 ${M(`f(x)=${f}`)}，则 ${M(`f'(${x0})`)} 的值为`),
    steps: P(l, `Ta có ${M(`f'(x)=${poly([[3 * a, "x^2"], [2 * b, "x"], [c, ""]])}`)}. Thay ${M(`x=${x0}`)}: ${M(`f'(${x0})=3\\cdot${a}\\cdot(${x0})^2+2\\cdot(${b})\\cdot(${x0})+(${c})=${ans}`)}. `, `We have ${M(`f'(x)=${poly([[3 * a, "x^2"], [2 * b, "x"], [c, ""]])}`)}. Substituting ${M(`x=${x0}`)}: ${M(`f'(${x0})=${ans}`)}. `, `${M(`f'(x)=${poly([[3 * a, "x^2"], [2 * b, "x"], [c, ""]])}`)}，代入 ${M(`x=${x0}`)} 得 ${M(`f'(${x0})=${ans}`)}。`) +
      mistakes(l, [[String(f0), `tính ${"f(x_0)"} thay vì đạo hàm`, "computed f(x₀) instead of f'(x₀)", "算成了 f(x₀)"], [String(w[0]), "để sót hoặc cộng thêm hằng số", "kept or added the constant", "多算或漏算常数项"]]),
    opts: [String(ans), ...w].map(M),
  }), "Đạo hàm đa thức", 90);
} });

// 2. Tổng n số hạng đầu của cấp số cộng
add({ key: "math.seq.arith_sum", subject: "math", topic: "Dãy số", subtopic: "Cấp số cộng", difficulty: "easy", build(r) {
  const a = nz(r, -6, 12), d = nz(r, -4, 6), n = r.int(5, 20);
  const S = arithSum(a, d, n), un = a + (n - 1) * d;
  const w = pick3(String(S), [String(n * (2 * a + (n - 1) * d)), String((n * (2 * a + n * d)) / 2), String(un), String(n * (a + un))]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho cấp số cộng ${M(`(u_n)`)} có ${M(`u_1=${a}`)} và công sai ${M(`d=${d}`)}. Tổng ${n} số hạng đầu tiên bằng`, `An arithmetic sequence ${M(`(u_n)`)} has ${M(`u_1=${a}`)} and common difference ${M(`d=${d}`)}. The sum of the first ${n} terms is`, `等差数列 ${M(`(u_n)`)} 的首项 ${M(`u_1=${a}`)}，公差 ${M(`d=${d}`)}，则前 ${n} 项和为`),
    steps: P(l, `${M(`S_n=\\dfrac{n[2u_1+(n-1)d]}{2}`)}, với ${M(`n=${n}`)}: ${M(`S_{${n}}=\\dfrac{${n}\\,[2\\cdot(${a})+${n - 1}\\cdot(${d})]}{2}=${S}`)}. `, `${M(`S_n=\\dfrac{n[2u_1+(n-1)d]}{2}`)}; with ${M(`n=${n}`)}: ${M(`S_{${n}}=${S}`)}. `, `${M(`S_n=\\dfrac{n[2u_1+(n-1)d]}{2}`)}，取 ${M(`n=${n}`)} 得 ${M(`S_{${n}}=${S}`)}。`) +
      mistakes(l, [[String(n * (2 * a + (n - 1) * d)), "quên chia 2", "forgot to halve", "忘记除以2"], [String(un), `đây là số hạng thứ ${n}, không phải tổng`, `this is the ${n}th term, not the sum`, `这是第${n}项而不是和`]]),
    opts: [String(S), ...w].map(M),
  }), "Tổng cấp số cộng", 60);
} });

// 3. Số hạng tổng quát của cấp số nhân
add({ key: "math.seq.geo_term", subject: "math", topic: "Dãy số", subtopic: "Cấp số nhân", difficulty: "easy", build(r) {
  const a = r.int(1, 5), q = r.pick([2, 3, -2, -3, 4, 5]), n = r.int(4, q === 5 || q === 4 ? 6 : 7);
  const u = geoTerm(a, q, n);
  const w = pick3(String(u), [String(a * q ** n), String(a * q * (n - 1)), String(a * q ** (n - 2)), String((a * q) ** (n - 1))]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cấp số nhân ${M(`(u_n)`)} có ${M(`u_1=${a}`)}, công bội ${M(`q=${q}`)}. Số hạng thứ ${n} là`, `A geometric sequence ${M(`(u_n)`)} has ${M(`u_1=${a}`)} and ratio ${M(`q=${q}`)}. The ${n}th term is`, `等比数列 ${M(`(u_n)`)} 的首项 ${M(`u_1=${a}`)}，公比 ${M(`q=${q}`)}，则第 ${n} 项为`),
    steps: P(l, `${M(`u_n=u_1\\cdot q^{n-1}`)} nên ${M(`u_{${n}}=${a}\\cdot(${q})^{${n - 1}}=${u}`)}. `, `${M(`u_n=u_1\\cdot q^{n-1}`)}, so ${M(`u_{${n}}=${a}\\cdot(${q})^{${n - 1}}=${u}`)}. `, `${M(`u_n=u_1\\cdot q^{n-1}`)}，所以 ${M(`u_{${n}}=${a}\\cdot(${q})^{${n - 1}}=${u}`)}。`) +
      mistakes(l, [[String(a * q ** n), "dùng mũ n thay vì n−1", "used exponent n instead of n−1", "指数用了 n 而不是 n−1"]]),
    opts: [String(u), ...w].map(M),
  }), "Số hạng tổng quát CSN", 60);
} });

// 4. Hệ thức Vi-ét: x1² + x2²
add({ key: "math.alg.vieta_squares", subject: "math", topic: "Đại số", subtopic: "Hệ thức Vi-ét", difficulty: "medium", build(r) {
  const x1 = nz(r, -7, 7), x2 = nz(r, -7, 7), A = r.pick([1, 1, 2, 3]);
  const S = x1 + x2, Pd = x1 * x2, ans = S * S - 2 * Pd;
  const w = pick3(String(ans), [String(S * S), String(S * S - Pd), String(S * S + 2 * Pd), String(S - 2 * Pd)]); if (!w) return null;
  const eq = poly([[A, "x^2"], [-A * S, "x"], [A * Pd, ""]]);
  return make((l) => ({
    body: P(l, `Gọi ${M("x_1,x_2")} là hai nghiệm của phương trình ${M(`${eq}=0`)}. Giá trị của ${M("x_1^2+x_2^2")} bằng`, `Let ${M("x_1,x_2")} be the roots of ${M(`${eq}=0`)}. The value of ${M("x_1^2+x_2^2")} is`, `设 ${M("x_1,x_2")} 是方程 ${M(`${eq}=0`)} 的两根，则 ${M("x_1^2+x_2^2")} 的值为`),
    steps: P(l, `Theo Vi-ét: ${M(`x_1+x_2=${S}`)}, ${M(`x_1x_2=${Pd}`)}. Do đó ${M(`x_1^2+x_2^2=(x_1+x_2)^2-2x_1x_2=${S * S}-2\\cdot(${Pd})=${ans}`)}. `, `By Vieta: ${M(`x_1+x_2=${S}`)}, ${M(`x_1x_2=${Pd}`)}. Hence ${M(`x_1^2+x_2^2=(x_1+x_2)^2-2x_1x_2=${ans}`)}. `, `由韦达定理：${M(`x_1+x_2=${S}`)}，${M(`x_1x_2=${Pd}`)}，故 ${M(`x_1^2+x_2^2=(x_1+x_2)^2-2x_1x_2=${ans}`)}。`) +
      mistakes(l, [[String(S * S), "quên trừ 2x₁x₂", "forgot to subtract 2x₁x₂", "漏减 2x₁x₂"], [String(S * S - Pd), "trừ x₁x₂ thay vì 2x₁x₂", "subtracted x₁x₂ instead of 2x₁x₂", "减成了 x₁x₂"]]),
    opts: [String(ans), ...w].map(M),
  }), "Hệ thức Vi-ét", 80);
} });

// 5. Phương trình lôgarit cơ bản
add({ key: "math.alg.log_equation", subject: "math", topic: "Đại số", subtopic: "Phương trình lôgarit", difficulty: "medium", build(r) {
  const b = r.pick([2, 3, 5]), k = r.int(2, b === 5 ? 3 : 5), c = r.int(1, 6);
  const x = b ** k + c;
  const w = pick3(String(x), [String(b * k + c), String(b ** k - c), String(b ** (k + 1) + c), String(k ** b + c)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Nghiệm của phương trình ${M(`\\log_{${b}}(x-${c})=${k}`)} là`, `The solution of ${M(`\\log_{${b}}(x-${c})=${k}`)} is`, `方程 ${M(`\\log_{${b}}(x-${c})=${k}`)} 的解为`),
    steps: P(l, `Điều kiện ${M(`x>${c}`)}. ${M(`\\log_{${b}}(x-${c})=${k}\\Leftrightarrow x-${c}=${b}^{${k}}=${b ** k}`)} nên ${M(`x=${x}`)} (thỏa điều kiện). `, `Domain ${M(`x>${c}`)}. ${M(`\\log_{${b}}(x-${c})=${k}\\Leftrightarrow x-${c}=${b}^{${k}}=${b ** k}`)}, so ${M(`x=${x}`)}. `, `定义域 ${M(`x>${c}`)}。${M(`x-${c}=${b}^{${k}}=${b ** k}`)}，所以 ${M(`x=${x}`)}。`) +
      mistakes(l, [[String(b ** k - c), "chuyển vế sai dấu", "moved the constant with the wrong sign", "移项符号错误"], [String(b * k + c), "nhân thay vì lũy thừa", "multiplied instead of exponentiating", "把乘方当成乘法"]]),
    opts: [String(x), ...w].map(M),
  }), "Phương trình lôgarit", 70);
} });

// 6. Khoảng cách từ điểm đến đường thẳng
add({ key: "math.geo.point_line_distance", subject: "math", topic: "Hình học", subtopic: "Khoảng cách điểm–đường thẳng", difficulty: "medium", build(r) {
  const [A0, B0, h] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [12, 5, 13]] as const);
  const A = r.chance(0.5) ? A0 : -A0, B = r.chance(0.5) ? B0 : -B0, C = nz(r, -15, 15), x0 = r.int(-5, 6), y0 = r.int(-5, 6);
  const v = A * x0 + B * y0 + C; if (v === 0) return null;
  const av = Math.abs(v), d = fr(av, h);
  const w = pick3(d, [String(av), fr(av, Math.abs(A) + Math.abs(B)), fr(av, h * h), fr(v, h)]); if (!w) return null;
  const line = `${poly([[A, "x"], [B, "y"], [C, ""]])}=0`;
  return make((l) => ({
    body: P(l, `Khoảng cách từ điểm ${M(`M(${x0};${y0})`)} đến đường thẳng ${M(line)} bằng`, `The distance from ${M(`M(${x0},${y0})`)} to the line ${M(line)} is`, `点 ${M(`M(${x0},${y0})`)} 到直线 ${M(line)} 的距离为`),
    steps: P(l, `${M(`d=\\dfrac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}=\\dfrac{|${A}\\cdot(${x0})+${B}\\cdot(${y0})+(${C})|}{\\sqrt{${A * A + B * B}}}=\\dfrac{${av}}{${h}}`)}. `, `${M(`d=\\dfrac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}=\\dfrac{${av}}{${h}}`)}. `, `${M(`d=\\dfrac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}=\\dfrac{${av}}{${h}}`)}。`) +
      mistakes(l, [[String(av), "quên chia cho căn", "forgot the square-root denominator", "漏除以根号"], [fr(av, h * h), "quên lấy căn mẫu", "forgot to take the root of the denominator", "分母忘记开方"]]),
    opts: [d, ...w].map(M),
  }), "Khoảng cách điểm–đường thẳng", 100);
} });

// 7. Tổ hợp
add({ key: "math.prob.combination", subject: "math", topic: "Xác suất", subtopic: "Tổ hợp", difficulty: "easy", build(r) {
  const n = r.int(6, 12), k = r.int(2, 4), c = choose(n, k);
  const w = pick3(String(c), [String(perm(n, k)), String(choose(n + 1, k)), String(choose(n, k - 1)), String(n * k)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Có ${n} học sinh. Số cách chọn ra ${k} học sinh để lập một nhóm (không phân biệt thứ tự) là`, `There are ${n} students. The number of ways to choose a group of ${k} (order does not matter) is`, `有 ${n} 名学生，从中选出 ${k} 人组成小组（不计顺序），共有多少种选法？`),
    steps: P(l, `Số cách là ${M(`C_{${n}}^{${k}}=\\dfrac{${n}!}{${k}!\\,${n - k}!}=${c}`)}. `, `The number is ${M(`C_{${n}}^{${k}}=\\dfrac{${n}!}{${k}!\\,${n - k}!}=${c}`)}. `, `选法数为 ${M(`C_{${n}}^{${k}}=\\dfrac{${n}!}{${k}!\\,${n - k}!}=${c}`)}。`) +
      mistakes(l, [[String(perm(n, k)), "đây là chỉnh hợp (có thứ tự)", "this is the permutation count (ordered)", "这是排列数（计顺序）"]]),
    opts: [String(c), ...w].map(M),
  }), "Tổ hợp", 60);
} });

// 8. Xác suất lấy 2 bi cùng màu (không hoàn lại)
add({ key: "math.prob.two_balls", subject: "math", topic: "Xác suất", subtopic: "Xác suất cổ điển", difficulty: "medium", build(r) {
  const red = r.int(3, 7), blue = r.int(2, 6), n = red + blue;
  const ans = fr(choose(red, 2), choose(n, 2));
  const w = pick3(ans, [fr(red * red, n * n), fr(red, n), fr(red * (red - 1), 2 * n * (n - 1)), fr(choose(red, 2), n * (n - 1) / 2 + 1)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Một hộp có ${red} bi đỏ và ${blue} bi xanh. Lấy ngẫu nhiên đồng thời 2 bi. Xác suất để cả hai bi đều đỏ là`, `A box has ${red} red and ${blue} blue balls. Two balls are drawn at random at the same time. The probability that both are red is`, `盒中有 ${red} 个红球和 ${blue} 个蓝球，随机同时取出 2 个，两球都是红球的概率为`),
    steps: P(l, `${M(`|\\Omega|=C_{${n}}^{2}=${choose(n, 2)}`)}, số kết quả thuận lợi ${M(`C_{${red}}^{2}=${choose(red, 2)}`)}. Xác suất ${M(`P=${ans}`)}. `, `${M(`|\\Omega|=C_{${n}}^{2}=${choose(n, 2)}`)}, favourable outcomes ${M(`C_{${red}}^{2}=${choose(red, 2)}`)}. So ${M(`P=${ans}`)}. `, `${M(`|\\Omega|=C_{${n}}^{2}=${choose(n, 2)}`)}，有利结果数 ${M(`C_{${red}}^{2}=${choose(red, 2)}`)}，故 ${M(`P=${ans}`)}。`) +
      mistakes(l, [[fr(red * red, n * n), "coi như lấy có hoàn lại", "treated it as drawing with replacement", "当成有放回抽取"], [fr(red, n), "chỉ tính xác suất bi thứ nhất", "only the first ball's probability", "只算了第一个球"]]),
    opts: [ans, ...w].map(M),
  }), "Xác suất cổ điển", 100);
} });

// 9. Diện tích tam giác biết hai cạnh và góc xen giữa
add({ key: "math.trig.triangle_area", subject: "math", topic: "Lượng giác", subtopic: "Diện tích tam giác", difficulty: "medium", build(r) {
  const a = r.int(4, 12), b = r.int(4, 12), C = r.pick([30, 90, 150]);
  const half = C === 90 ? fr(a * b, 2) : fr(a * b, 4);
  const w = pick3(half, [C === 90 ? fr(a * b, 1) : fr(a * b, 2), `\\dfrac{${a * b}\\sqrt{3}}{4}`, C === 90 ? fr(a * b, 4) : fr(a * b, 1), fr(a * b, 3)]); if (!w) return null;
  const sin = C === 90 ? "1" : "\\dfrac{1}{2}";
  return make((l) => ({
    body: P(l, `Tam giác ABC có ${M(`AB=${a}`)}, ${M(`AC=${b}`)} và ${M(`\\widehat{A}=${C}^\\circ`)}. Diện tích tam giác ABC bằng`, `Triangle ABC has ${M(`AB=${a}`)}, ${M(`AC=${b}`)} and ${M(`\\widehat{A}=${C}^\\circ`)}. Its area is`, `三角形 ABC 中 ${M(`AB=${a}`)}，${M(`AC=${b}`)}，${M(`\\widehat{A}=${C}^\\circ`)}，则其面积为`),
    steps: P(l, `${M(`S=\\dfrac12\\,AB\\cdot AC\\sin A=\\dfrac12\\cdot${a}\\cdot${b}\\cdot${sin}=${half}`)}. `, `${M(`S=\\dfrac12\\,AB\\cdot AC\\sin A=\\dfrac12\\cdot${a}\\cdot${b}\\cdot${sin}=${half}`)}. `, `${M(`S=\\dfrac12\\,AB\\cdot AC\\sin A=${half}`)}。`),
    opts: [half, ...w].map(M),
  }), "Diện tích tam giác", 80);
} });

// 10. Giá trị nhỏ nhất/lớn nhất của hàm bậc hai
add({ key: "math.func.parabola_extreme", subject: "math", topic: "Hàm số", subtopic: "Hàm số bậc hai", difficulty: "medium", build(r) {
  const a = r.pick([1, 2, 3, -1, -2, -3]), h = nz(r, -4, 4), k = nz(r, -8, 8);
  const b = -2 * a * h, c = a * h * h + k;
  const w = pick3(String(k), [String(h), String(c), String(-k), String(b)]); if (!w) return null;
  const f = poly([[a, "x^2"], [b, "x"], [c, ""]]), min = a > 0;
  return make((l) => ({
    body: P(l, `Giá trị ${min ? "nhỏ nhất" : "lớn nhất"} của hàm số ${M(`y=${f}`)} bằng`, `The ${min ? "minimum" : "maximum"} value of ${M(`y=${f}`)} is`, `函数 ${M(`y=${f}`)} 的${min ? "最小" : "最大"}值为`),
    steps: P(l, `Đỉnh có hoành độ ${M(`x=-\\dfrac{b}{2a}=${h}`)}, tung độ ${M(`y=${k}`)}. Vì ${M(`a=${a}${a > 0 ? ">" : "<"}0`)} nên hàm số đạt ${min ? "nhỏ nhất" : "lớn nhất"} bằng ${M(k)}. `, `The vertex is at ${M(`x=-\\dfrac{b}{2a}=${h}`)}, ${M(`y=${k}`)}. Since ${M(`a=${a}${a > 0 ? ">" : "<"}0`)}, the ${min ? "minimum" : "maximum"} is ${M(k)}. `, `顶点横坐标 ${M(`x=-\\dfrac{b}{2a}=${h}`)}，纵坐标 ${M(`y=${k}`)}。因 ${M(`a${a > 0 ? ">" : "<"}0`)}，故${min ? "最小" : "最大"}值为 ${M(k)}。`) +
      mistakes(l, [[String(h), "nhầm hoành độ đỉnh với giá trị cực trị", "confused the vertex abscissa with the extreme value", "把顶点横坐标当成极值"], [String(c), "lấy y(0)", "took y(0)", "取了 y(0)"]]),
    opts: [String(k), ...w].map(M),
  }), "Cực trị hàm bậc hai", 80);
} });

// 11. Tung độ giao điểm với trục Oy của đường thẳng qua hai điểm
add({ key: "math.func.line_intercept", subject: "math", topic: "Hàm số", subtopic: "Hàm số bậc nhất", difficulty: "easy", build(r) {
  const m = nz(r, -4, 4), n = nz(r, -9, 9), x1 = r.int(-3, 3), x2 = x1 + r.int(1, 3);
  const y1 = m * x1 + n, y2 = m * x2 + n;
  const w = pick3(String(n), [String(m), String(y1), String(-n), String(y2)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Đường thẳng đi qua ${M(`A(${x1};${y1})`)} và ${M(`B(${x2};${y2})`)} cắt trục tung tại điểm có tung độ`, `The line through ${M(`A(${x1},${y1})`)} and ${M(`B(${x2},${y2})`)} meets the y-axis at the point with y-coordinate`, `过点 ${M(`A(${x1},${y1})`)} 和 ${M(`B(${x2},${y2})`)} 的直线与 y 轴交点的纵坐标为`),
    steps: P(l, `Hệ số góc ${M(`m=\\dfrac{${y2}-(${y1})}{${x2}-(${x1})}=${m}`)}. Từ ${M(`y=${m}x+n`)} qua A: ${M(`n=${y1}-(${m})\\cdot(${x1})=${n}`)}. `, `Slope ${M(`m=\\dfrac{${y2}-(${y1})}{${x2}-(${x1})}=${m}`)}. Using A in ${M(`y=${m}x+n`)}: ${M(`n=${n}`)}. `, `斜率 ${M(`m=${m}`)}，代入 A 点得 ${M(`n=${y1}-(${m})\\cdot(${x1})=${n}`)}。`),
    opts: [String(n), ...w].map(M),
  }), "Đường thẳng", 70);
} });

// 12. Tích phân xác định của đa thức bậc 2
add({ key: "math.calc.definite_integral", subject: "math", topic: "Giải tích", subtopic: "Tích phân xác định", difficulty: "hard", build(r) {
  const a = nz(r, -3, 3), b = nz(r, -4, 4), c = nz(r, -5, 5), k = r.pick([2, 3, 4, 6]);
  const numr = 2 * a * k ** 3 + 3 * b * k * k + 6 * c * k, ans = fr(numr, 6);
  const w = pick3(ans, [fr(a * k ** 3 + b * k * k + c * k, 1), fr(2 * a * k ** 3 + 6 * b * k * k + 6 * c * k, 6), fr(3 * a * k ** 3 + 3 * b * k * k + 6 * c * k, 6), fr(2 * a * k + b, 1)]); if (!w) return null;
  const f = poly([[a, "x^2"], [b, "x"], [c, ""]]);
  return make((l) => ({
    body: P(l, `Giá trị của ${M(`\\displaystyle\\int_0^{${k}}(${f})\\,dx`)} bằng`, `The value of ${M(`\\displaystyle\\int_0^{${k}}(${f})\\,dx`)} is`, `${M(`\\displaystyle\\int_0^{${k}}(${f})\\,dx`)} 的值为`),
    steps: P(l, `Nguyên hàm ${M(`F(x)=\\dfrac{${a}x^3}{3}+\\dfrac{${b}x^2}{2}+${c}x`)}. ${M(`F(${k})-F(0)=\\dfrac{${numr}}{6}=${ans}`)}. `, `Antiderivative ${M(`F(x)=\\dfrac{${a}x^3}{3}+\\dfrac{${b}x^2}{2}+${c}x`)}. ${M(`F(${k})-F(0)=${ans}`)}. `, `原函数 ${M(`F(x)=\\dfrac{${a}x^3}{3}+\\dfrac{${b}x^2}{2}+${c}x`)}，${M(`F(${k})-F(0)=${ans}`)}。`),
    opts: [ans, ...w].map(M),
  }), "Tích phân đa thức", 120);
} });

export const MATH_TEMPLATES = T;
