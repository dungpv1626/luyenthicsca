// Khuôn bổ sung cho các mô-đun còn mỏng: Xác suất–thống kê (Toán), Quang học, Vật lý hiện đại, Thí nghiệm (Hóa).
import { type Template, type Lang, make, P, M, num, fr, nice, rnd, pick3, mistakes } from "./core.ts";

const T: Template[] = [];
const add = (t: Template) => T.push(t);
const pickN = (correct: number, cands: number[]) => { const w = pick3(String(rnd(correct)), cands.map((x) => String(rnd(x)))); return w ? w.map(Number) : null; };
const uu = (x: number, l: Lang, unit: string, d = 3) => M(unit ? `${num(x, l, d)}\\ \\text{${unit}}` : num(x, l, d));
const ops = (l: Lang, vals: number[], unit: string, d = 3) => vals.map((v) => uu(v, l, unit, d));
const shuffle = <A,>(r: { int: (a: number, b: number) => number }, a: A[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = r.int(0, i); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const list = (xs: number[], l: Lang) => xs.map((x) => num(x, l, 2)).join(l === "vi" ? "; " : ", ");

export const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
export const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
export const variance = (xs: number[]) => { const m = mean(xs); return xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length; };

// ===================== TOÁN: XÁC SUẤT – THỐNG KÊ =====================
add({ key: "math.stat.mean", subject: "math", topic: "Xác suất", subtopic: "Thống kê: số trung bình", difficulty: "easy", build(r) {
  const n = r.int(5, 8), xs = Array.from({ length: n }, () => r.int(2, 20)), m = mean(xs);
  if (!nice(m, 2)) return null;
  const w = pickN(m, [median(xs), xs.reduce((s, x) => s + x, 0), Math.max(...xs), m + 1, m - 1, (Math.max(...xs) + Math.min(...xs)) / 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Điểm kiểm tra của một nhóm học sinh: ${list(xs, l)}. Số trung bình của mẫu số liệu là`, `The scores of a group of students are: ${list(xs, l)}. The mean of the data is`, `一组学生的成绩为：${list(xs, l)}。这组数据的平均数是`),
    steps: P(l, `${M(`\\bar x=\\dfrac{${xs.join("+")}}{${n}}=\\dfrac{${xs.reduce((s, x) => s + x, 0)}}{${n}}=${num(m, l, 2)}`)}. `, `${M(`\\bar x=\\dfrac{${xs.reduce((s, x) => s + x, 0)}}{${n}}=${num(m, l, 2)}`)}. `, `${M(`\\bar x=\\dfrac{${xs.reduce((s, x) => s + x, 0)}}{${n}}=${num(m, l, 2)}`)}。`) +
      mistakes(l, [[num(xs.reduce((s, x) => s + x, 0), l, 0), "đây là tổng, chưa chia cho số phần tử", "this is the sum, not divided by n", "这是总和，没有除以个数"]]),
    opts: ops(l, [m, ...w], "", 2),
  }), "Số trung bình", 60);
} });

add({ key: "math.stat.median", subject: "math", topic: "Xác suất", subtopic: "Thống kê: trung vị", difficulty: "easy", build(r) {
  const n = r.int(5, 9), xs = Array.from({ length: n }, () => r.int(1, 30)), md = median(xs), s = [...xs].sort((a, b) => a - b);
  if (!nice(md, 1) || new Set(xs).size < n - 1) return null;
  const w = pickN(md, [mean(xs), s[0], s[n - 1], s[Math.floor(n / 2) + 1] ?? s[n - 1], md + 1, md - 1]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho mẫu số liệu: ${list(xs, l)}. Trung vị của mẫu số liệu là`, `For the data: ${list(xs, l)}, the median is`, `已知数据：${list(xs, l)}，则中位数为`),
    steps: P(l, `Sắp xếp tăng dần: ${list(s, l)}. Với ${n} số liệu, trung vị là ${M(num(md, l, 1))}. `, `Sorted: ${list(s, l)}. With ${n} values, the median is ${M(num(md, l, 1))}. `, `从小到大排列：${list(s, l)}，共 ${n} 个数据，中位数为 ${M(num(md, l, 1))}。`) +
      mistakes(l, [[num(mean(xs), l, 2), "đây là số trung bình, không phải trung vị", "this is the mean, not the median", "这是平均数而不是中位数"]]),
    opts: ops(l, [md, ...w], "", 2),
  }), "Trung vị", 60);
} });

add({ key: "math.stat.variance", subject: "math", topic: "Xác suất", subtopic: "Thống kê: phương sai", difficulty: "medium", build(r) {
  const n = r.pick([4, 5]), xs = Array.from({ length: n }, () => r.int(1, 12)), m = mean(xs), v = variance(xs);
  if (!Number.isInteger(m) || !nice(v, 2) || v === 0) return null;
  const sv = (v * n) / (n - 1), msq = xs.reduce((s, x) => s + x * x, 0) / n;
  const w = pickN(v, [sv, Math.sqrt(v), msq, v * n, v + m]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Phương sai của mẫu số liệu ${list(xs, l)} là`, `The variance of the data ${list(xs, l)} is`, `数据 ${list(xs, l)} 的方差是`),
    steps: P(l, `${M(`\\bar x=${m}`)}; ${M(`s^2=\\dfrac{1}{${n}}\\sum (x_i-\\bar x)^2=${num(v, l, 2)}`)}. `, `${M(`\\bar x=${m}`)}; ${M(`s^2=\\dfrac{1}{${n}}\\sum (x_i-\\bar x)^2=${num(v, l, 2)}`)}. `, `${M(`\\bar x=${m}`)}，${M(`s^2=\\dfrac{1}{${n}}\\sum (x_i-\\bar x)^2=${num(v, l, 2)}`)}。`) +
      mistakes(l, [[num(Math.sqrt(v), l, 3), "đây là độ lệch chuẩn", "this is the standard deviation", "这是标准差"], [num(msq, l, 2), "đây là trung bình của bình phương, chưa trừ bình phương số trung bình", "this is the mean of squares, without subtracting the squared mean", "这是平方的平均数，没有减去平均数的平方"]]),
    opts: ops(l, [v, ...w], "", 2),
  }), "Phương sai", 100);
} });

add({ key: "math.prob.union_independent", subject: "math", topic: "Xác suất", subtopic: "Biến cố độc lập", difficulty: "medium", build(r) {
  const p = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), q = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
  const both = p * q, uni = p + q - both; if (!nice(uni, 3)) return null;
  const w = pickN(uni, [p + q, both, 1 - both, p * (1 - q), (1 - p) * (1 - q)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Hai biến cố độc lập ${M("A")} và ${M("B")} có ${M(`P(A)=${num(p, l, 2)}`)}, ${M(`P(B)=${num(q, l, 2)}`)}. Xác suất để ít nhất một trong hai biến cố xảy ra là`, `Independent events ${M("A")} and ${M("B")} have ${M(`P(A)=${num(p, l, 2)}`)}, ${M(`P(B)=${num(q, l, 2)}`)}. The probability that at least one occurs is`, `独立事件 ${M("A")} 与 ${M("B")} 满足 ${M(`P(A)=${num(p, l, 2)}`)}，${M(`P(B)=${num(q, l, 2)}`)}，则至少有一个发生的概率为`),
    steps: P(l, `${M(`P(A\\cup B)=P(A)+P(B)-P(A)P(B)=${num(p, l, 2)}+${num(q, l, 2)}-${num(both, l, 3)}=${num(uni, l, 3)}`)}. `, `${M(`P(A\\cup B)=P(A)+P(B)-P(A)P(B)=${num(uni, l, 3)}`)}. `, `${M(`P(A\\cup B)=P(A)+P(B)-P(A)P(B)=${num(uni, l, 3)}`)}。`) +
      mistakes(l, [[num(p + q, l, 3), "quên trừ xác suất giao", "forgot to subtract the intersection", "忘记减去交集的概率"], [num(both, l, 3), "đây là xác suất cả hai cùng xảy ra", "this is the probability that both occur", "这是两者同时发生的概率"]]),
    opts: ops(l, [uni, ...w], "", 3),
  }), "P(A∪B) với biến cố độc lập", 80);
} });

add({ key: "math.prob.conditional", subject: "math", topic: "Xác suất", subtopic: "Xác suất có điều kiện", difficulty: "medium", build(r) {
  const pb = r.pick([0.4, 0.5, 0.6, 0.8]), k = r.pick([0.25, 0.4, 0.5, 0.75]), pab = rnd(pb * k, 3), pa = r.pick([0.5, 0.6, 0.7, 0.9]);
  if (pab > pa) return null;
  const ans = rnd(pab / pb, 3); if (!nice(ans, 3)) return null;
  const w = pickN(ans, [pab / pa, pab * pb, pb - pab, 1 - ans, pab]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho ${M(`P(A)=${num(pa, l, 2)}`)}, ${M(`P(B)=${num(pb, l, 2)}`)}, ${M(`P(A\\cap B)=${num(pab, l, 3)}`)}. Xác suất có điều kiện ${M("P(A\\mid B)")} bằng`, `Given ${M(`P(A)=${num(pa, l, 2)}`)}, ${M(`P(B)=${num(pb, l, 2)}`)}, ${M(`P(A\\cap B)=${num(pab, l, 3)}`)}. The conditional probability ${M("P(A\\mid B)")} is`, `已知 ${M(`P(A)=${num(pa, l, 2)}`)}，${M(`P(B)=${num(pb, l, 2)}`)}，${M(`P(A\\cap B)=${num(pab, l, 3)}`)}，则条件概率 ${M("P(A\\mid B)")} 等于`),
    steps: P(l, `${M(`P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${num(pab, l, 3)}}{${num(pb, l, 2)}}=${num(ans, l, 3)}`)}. `, `${M(`P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}=${num(ans, l, 3)}`)}. `, `${M(`P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}=${num(ans, l, 3)}`)}。`) +
      mistakes(l, [[num(pab / pa, l, 3), "đây là P(B | A): chia nhầm cho P(A)", "this is P(B | A): divided by P(A)", "这是 P(B|A)：除以了 P(A)"]]),
    opts: ops(l, [ans, ...w], "", 3),
  }), "Xác suất có điều kiện", 80);
} });

add({ key: "math.prob.coin_binomial", subject: "math", topic: "Xác suất", subtopic: "Phép thử lặp (nhị thức)", difficulty: "medium", build(r) {
  const n = r.int(4, 8), k = r.int(1, n - 1), c = (() => { let x = 1; for (let i = 1; i <= k; i++) x = (x * (n - k + i)) / i; return Math.round(x); })();
  const ans = fr(c, 2 ** n);
  const cands = [fr(c, 2 ** k), fr(k, n), fr(c, 2 ** (n - 1)), fr(1, 2 ** n), fr(c + 1, 2 ** n)];
  const w = pick3(ans, cands); if (!w) return null;
  return make((l) => ({
    body: P(l, `Tung một đồng xu cân đối ${n} lần. Xác suất để có đúng ${k} lần xuất hiện mặt sấp là`, `A fair coin is tossed ${n} times. The probability of exactly ${k} tails is`, `将一枚均匀硬币抛掷 ${n} 次，恰好出现 ${k} 次反面的概率为`),
    steps: P(l, `${M(`P=\\dbinom{${n}}{${k}}\\left(\\dfrac12\\right)^{${n}}=\\dfrac{${c}}{${2 ** n}}=${ans}`)}. `, `${M(`P=\\dbinom{${n}}{${k}}\\left(\\dfrac12\\right)^{${n}}=${ans}`)}. `, `${M(`P=\\dbinom{${n}}{${k}}\\left(\\dfrac12\\right)^{${n}}=${ans}`)}。`),
    opts: [ans, ...w].map(M),
  }), "Xác suất nhị thức", 90);
} });

// ===================== VẬT LÝ: QUANG HỌC =====================
add({ key: "phy.optics.snell", subject: "physics", topic: "Quang học", subtopic: "Khúc xạ ánh sáng", difficulty: "medium", build(r) {
  const si = r.pick([0.5, 0.6, 0.8]), n2 = r.pick([1.2, 1.25, 1.5, 1.6, 2]), sr = si / n2;
  if (!nice(sr, 3)) return null;
  const w = pickN(sr, [si * n2, n2 / si, si - n2 + 1, si / (n2 + 1), n2 * sr]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Tia sáng truyền từ không khí (${M("n_1=1")}) vào môi trường có chiết suất ${M(`n_2=${num(n2, l, 2)}`)} với ${M(`\\sin i=${num(si, l, 2)}`)}. Giá trị ${M("\\sin r")} của góc khúc xạ là`, `A ray goes from air (${M("n_1=1")}) into a medium of index ${M(`n_2=${num(n2, l, 2)}`)} with ${M(`\\sin i=${num(si, l, 2)}`)}. The value of ${M("\\sin r")} is`, `光线从空气（${M("n_1=1")}）射入折射率 ${M(`n_2=${num(n2, l, 2)}`)} 的介质，${M(`\\sin i=${num(si, l, 2)}`)}，则折射角的 ${M("\\sin r")} 为`),
    steps: P(l, `${M(`n_1\\sin i=n_2\\sin r\\Rightarrow \\sin r=\\dfrac{${num(si, l, 2)}}{${num(n2, l, 2)}}=${num(sr, l, 3)}`)}. `, `${M(`n_1\\sin i=n_2\\sin r\\Rightarrow \\sin r=${num(sr, l, 3)}`)}. `, `${M(`n_1\\sin i=n_2\\sin r\\Rightarrow \\sin r=${num(sr, l, 3)}`)}。`),
    opts: ops(l, [sr, ...w], "", 3),
  }), "Định luật khúc xạ", 70);
} });

add({ key: "phy.optics.critical", subject: "physics", topic: "Quang học", subtopic: "Phản xạ toàn phần", difficulty: "medium", build(r) {
  const n1 = r.pick([1.25, 1.6, 2, 2.5, 4 / 3 * 1.5]), n2 = r.pick([1, 1, 1.25]);
  if (n1 <= n2) return null;
  const s = n2 / n1; if (!nice(s, 3)) return null;
  const w = pickN(s, [n1 / n2, n1 * n2, 1 - s, n1 - n2, s * s]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Ánh sáng đi từ môi trường chiết suất ${M(`n_1=${num(n1, l, 2)}`)} sang môi trường chiết suất ${M(`n_2=${num(n2, l, 2)}`)}. Giá trị ${M("\\sin i_{gh}")} của góc giới hạn phản xạ toàn phần là`, `Light passes from a medium of index ${M(`n_1=${num(n1, l, 2)}`)} to one of index ${M(`n_2=${num(n2, l, 2)}`)}. The value of ${M("\\sin i_{c}")} for the critical angle of total internal reflection is`, `光从折射率 ${M(`n_1=${num(n1, l, 2)}`)} 的介质射向折射率 ${M(`n_2=${num(n2, l, 2)}`)} 的介质，全反射临界角的 ${M("\\sin i_{c}")} 为`),
    steps: P(l, `${M(`\\sin i_{gh}=\\dfrac{n_2}{n_1}=\\dfrac{${num(n2, l, 2)}}{${num(n1, l, 2)}}=${num(s, l, 3)}`)}. `, `${M(`\\sin i_c=\\dfrac{n_2}{n_1}=${num(s, l, 3)}`)}. `, `${M(`\\sin i_c=\\dfrac{n_2}{n_1}=${num(s, l, 3)}`)}。`),
    opts: ops(l, [s, ...w], "", 3),
  }), "Góc giới hạn", 70);
} });

add({ key: "phy.optics.magnification", subject: "physics", topic: "Quang học", subtopic: "Ảnh qua thấu kính (độ phóng đại)", difficulty: "medium", build(r) {
  const [f, d] = r.pick([[10, 15], [10, 20], [20, 30], [15, 30], [12, 18], [10, 30], [20, 40], [15, 20]] as [number, number][]), h = r.pick([2, 3, 4, 5, 6]);
  const dp = (f * d) / (d - f), hp = (h * dp) / d; if (!nice(hp, 2)) return null;
  const w = pickN(hp, [h * d / dp, h * (d - f) / f, h * dp, h + dp / d, h * f / d]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Vật cao ${uu(h, l, "cm")} đặt cách thấu kính hội tụ tiêu cự ${uu(f, l, "cm")} một khoảng ${uu(d, l, "cm")}. Chiều cao của ảnh là`, `An object ${uu(h, l, "cm")} tall is ${uu(d, l, "cm")} from a converging lens of focal length ${uu(f, l, "cm")}. The height of the image is`, `高 ${uu(h, l, "cm")} 的物体放在焦距 ${uu(f, l, "cm")} 的凸透镜前 ${uu(d, l, "cm")} 处，像的高度为`),
    steps: P(l, `${M(`d'=\\dfrac{df}{d-f}=${num(dp, l, 2)}\\ \\text{cm}`)}; ${M(`h'=h\\dfrac{d'}{d}=${h}\\cdot\\dfrac{${num(dp, l, 2)}}{${d}}=${num(hp, l, 2)}\\ \\text{cm}`)}. `, `${M(`d'=${num(dp, l, 2)}\\ \\text{cm}`)}; ${M(`h'=h\\,d'/d=${num(hp, l, 2)}\\ \\text{cm}`)}. `, `${M(`d'=${num(dp, l, 2)}\\ \\text{cm}`)}，${M(`h'=h\\,d'/d=${num(hp, l, 2)}\\ \\text{cm}`)}。`),
    opts: ops(l, [hp, ...w], "cm", 2),
  }), "Độ phóng đại ảnh", 100);
} });

add({ key: "phy.optics.young", subject: "physics", topic: "Sóng", subtopic: "Giao thoa ánh sáng (khoảng vân)", difficulty: "medium", build(r) {
  const lam = r.pick([400, 480, 500, 600, 750]), D = r.pick([1, 1.2, 1.5, 2, 2.5]), a = r.pick([0.5, 1, 1.5, 2]);
  const i = (lam * D) / a / 1000; if (!nice(i, 3)) return null;
  const w = pickN(i, [i * 10, i / 10, (lam * a) / D / 1000, (D * a) / lam * 1000, i * 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Trong thí nghiệm Y-âng, ánh sáng đơn sắc bước sóng ${uu(lam, l, "nm")}, khoảng cách hai khe ${uu(a, l, "mm")}, khoảng cách từ hai khe đến màn ${uu(D, l, "m")}. Khoảng vân là`, `In Young's experiment, monochromatic light of wavelength ${uu(lam, l, "nm")} is used, slit separation ${uu(a, l, "mm")}, screen distance ${uu(D, l, "m")}. The fringe spacing is`, `杨氏双缝实验中，单色光波长 ${uu(lam, l, "nm")}，双缝间距 ${uu(a, l, "mm")}，双缝到屏的距离 ${uu(D, l, "m")}，则条纹间距为`),
    steps: P(l, `${M(`i=\\dfrac{\\lambda D}{a}=\\dfrac{${lam}\\cdot10^{-9}\\cdot${num(D, l, 2)}}{${num(a, l, 2)}\\cdot10^{-3}}=${num(i, l, 3)}\\ \\text{mm}`)}. `, `${M(`i=\\dfrac{\\lambda D}{a}=${num(i, l, 3)}\\ \\text{mm}`)}. `, `${M(`i=\\dfrac{\\lambda D}{a}=${num(i, l, 3)}\\ \\text{mm}`)}。`),
    opts: ops(l, [i, ...w], "mm", 3),
  }), "Khoảng vân i = λD/a", 100);
} });

// ===================== VẬT LÝ: HIỆN ĐẠI =====================
add({ key: "phy.modern.half_life", subject: "physics", topic: "Vật lý hiện đại", subtopic: "Phóng xạ: chu kì bán rã", difficulty: "medium", build(r) {
  const m0 = r.pick([80, 160, 200, 320, 400, 640, 1000]), k = r.int(2, 5), T0 = r.pick([2, 3, 5, 8, 10, 15, 20]), t = k * T0, left = m0 / 2 ** k;
  if (!nice(left, 2)) return null;
  const w = pickN(left, [m0 / k, m0 / 2 ** (k + 1), m0 - left, m0 / (2 * k), m0 / 2 ** (k - 1)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Một chất phóng xạ có chu kì bán rã ${uu(T0, l, "ngày")} và khối lượng ban đầu ${uu(m0, l, "g")}. Sau ${uu(t, l, "ngày")}, khối lượng chất phóng xạ còn lại là`, `A radioactive substance has half-life ${uu(T0, l, "days")} and initial mass ${uu(m0, l, "g")}. After ${uu(t, l, "days")}, the remaining mass is`, `某放射性物质半衰期为 ${uu(T0, l, "天")}，初始质量 ${uu(m0, l, "g")}，经过 ${uu(t, l, "天")} 后剩余质量为`),
    steps: P(l, `${M(`m=\\dfrac{m_0}{2^{t/T}}=\\dfrac{${m0}}{2^{${k}}}=${num(left, l, 2)}\\ \\text{g}`)}. `, `${M(`m=\\dfrac{m_0}{2^{t/T}}=\\dfrac{${m0}}{2^{${k}}}=${num(left, l, 2)}\\ \\text{g}`)}. `, `${M(`m=\\dfrac{m_0}{2^{t/T}}=\\dfrac{${m0}}{2^{${k}}}=${num(left, l, 2)}\\ \\text{g}`)}。`) +
      mistakes(l, [[num(m0 - left, l, 2), "đây là khối lượng đã phân rã", "this is the mass that has decayed", "这是已衰变的质量"]]),
    opts: ops(l, [left, ...w], "g", 2),
  }), "Định luật phóng xạ", 80);
} });

add({ key: "phy.modern.mass_energy", subject: "physics", topic: "Vật lý hiện đại", subtopic: "Hệ thức khối lượng – năng lượng", difficulty: "medium", build(r) {
  const dm = r.pick([0.01, 0.02, 0.04, 0.05, 0.08, 0.1, 0.2]), E = dm * 931.5;
  if (!nice(E, 3)) return null;
  const w = pickN(E, [dm * 931.5 * 2, dm / 931.5, dm * 931.5 / 1000, dm * 9315, dm + 931.5]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Độ hụt khối của một hạt nhân là ${uu(dm, l, "u")}. Cho ${M("1\\,u=931{,}5\\ \\text{MeV}/c^2")}. Năng lượng liên kết của hạt nhân là`, `The mass defect of a nucleus is ${uu(dm, l, "u")}. Given ${M("1\\,u=931.5\\ \\text{MeV}/c^2")}, the binding energy of the nucleus is`, `某原子核的质量亏损为 ${uu(dm, l, "u")}，已知 ${M("1\\,u=931.5\\ \\text{MeV}/c^2")}，则其结合能为`),
    steps: P(l, `${M(`E=\\Delta m\\,c^2=${num(dm, l, 2)}\\cdot931{,}5=${num(E, l, 3)}\\ \\text{MeV}`)}. `, `${M(`E=\\Delta m\\,c^2=${num(E, l, 3)}\\ \\text{MeV}`)}. `, `${M(`E=\\Delta m\\,c^2=${num(E, l, 3)}\\ \\text{MeV}`)}。`),
    opts: ops(l, [E, ...w], "MeV", 3),
  }), "E = Δm·c²", 70);
} });

add({ key: "phy.modern.bohr_photon", subject: "physics", topic: "Vật lý hiện đại", subtopic: "Mẫu nguyên tử Bo", difficulty: "hard", build(r) {
  const [n, m] = r.pick([[2, 1], [4, 2], [4, 1], [5, 2], [5, 1], [3, 1]] as [number, number][]);
  const E = 13.6 * (1 / (m * m) - 1 / (n * n)); if (!nice(E, 3)) return null;
  const w = pickN(E, [13.6 * (1 / (n * n)), 13.6 / (n - m), 13.6 * (1 / m - 1 / n), 13.6 * (n * n - m * m) / 10, 13.6 + E]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Nguyên tử hiđrô có mức năng lượng ${M("E_n=-\\dfrac{13{,}6}{n^2}\\ \\text{eV}")}. Khi electron chuyển từ quỹ đạo ${M(`n=${n}`)} về ${M(`n=${m}`)}, nguyên tử phát ra photon có năng lượng`, `A hydrogen atom has energy levels ${M("E_n=-\\dfrac{13.6}{n^2}\\ \\text{eV}")}. When the electron drops from ${M(`n=${n}`)} to ${M(`n=${m}`)}, the emitted photon has energy`, `氢原子能级 ${M("E_n=-\\dfrac{13.6}{n^2}\\ \\text{eV}")}，电子从 ${M(`n=${n}`)} 跃迁到 ${M(`n=${m}`)} 时，发出的光子能量为`),
    steps: P(l, `${M(`\\varepsilon=E_${n}-E_${m}=13{,}6\\left(\\dfrac1{${m * m}}-\\dfrac1{${n * n}}\\right)=${num(E, l, 3)}\\ \\text{eV}`)}. `, `${M(`\\varepsilon=E_${n}-E_${m}=${num(E, l, 3)}\\ \\text{eV}`)}. `, `${M(`\\varepsilon=E_${n}-E_${m}=${num(E, l, 3)}\\ \\text{eV}`)}。`),
    opts: ops(l, [E, ...w], "eV", 3),
  }), "Tiên đề Bo", 100);
} });

// ===================== HÓA: THÍ NGHIỆM VÀ ỨNG DỤNG =====================
add({ key: "chem.exp.titration", subject: "chemistry", topic: "Thí nghiệm và ứng dụng", subtopic: "Chuẩn độ axit–bazơ", difficulty: "medium", build(r) {
  const Ca = r.pick([0.1, 0.2, 0.25, 0.5]), Va = r.pick([10, 20, 25]), Vb = r.pick([8, 10, 12.5, 16, 20, 25]), Cb = (Ca * Va) / Vb;
  if (!nice(Cb, 3)) return null;
  const w = pickN(Cb, [(Ca * Vb) / Va, Ca * Va * Vb, Ca * Va, Ca + Va / Vb, (Ca * Va) / (Va + Vb)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Chuẩn độ ${uu(Va, l, "mL")} dung dịch HCl ${uu(Ca, l, "M")} bằng dung dịch NaOH chưa biết nồng độ, chỉ thị phenolphtalein. Điểm tương đương khi dùng hết ${uu(Vb, l, "mL")} NaOH. Nồng độ dung dịch NaOH là`, `${uu(Va, l, "mL")} of ${uu(Ca, l, "M")} HCl is titrated with NaOH of unknown concentration (phenolphthalein indicator). The equivalence point needs ${uu(Vb, l, "mL")} of NaOH. The NaOH concentration is`, `用浓度未知的 NaOH 溶液滴定 ${uu(Va, l, "mL")} ${uu(Ca, l, "M")} 的 HCl（酚酞作指示剂），达到等当点时消耗 NaOH ${uu(Vb, l, "mL")}，则 NaOH 溶液的浓度为`),
    steps: P(l, `${M(`C_aV_a=C_bV_b\\Rightarrow C_b=\\dfrac{${num(Ca, l, 2)}\\cdot${Va}}{${num(Vb, l, 2)}}=${num(Cb, l, 3)}\\ \\text{M}`)}. `, `${M(`C_aV_a=C_bV_b\\Rightarrow C_b=${num(Cb, l, 3)}\\ \\text{M}`)}. `, `${M(`C_aV_a=C_bV_b\\Rightarrow C_b=${num(Cb, l, 3)}\\ \\text{M}`)}。`),
    opts: ops(l, [Cb, ...w], "M", 3),
  }), "Chuẩn độ", 100);
} });

add({ key: "chem.exp.prepare", subject: "chemistry", topic: "Thí nghiệm và ứng dụng", subtopic: "Pha chế dung dịch", difficulty: "easy", build(r) {
  const [name, tex, Mm] = r.pick([["NaOH", "\\text{NaOH}", 40], ["KOH", "\\text{KOH}", 56], ["Na₂CO₃", "\\text{Na}_2\\text{CO}_3", 106], ["NaCl", "\\text{NaCl}", 58.5], ["CuSO₄", "\\text{CuSO}_4", 160]] as [string, string, number][]);
  const C = r.pick([0.1, 0.2, 0.5, 1]), V = r.pick([100, 200, 250, 500]), m = (C * V * Mm) / 1000;
  if (!nice(m, 3)) return null;
  const w = pickN(m, [m * 1000, m / 1000, C * V, (C * Mm) / 1000, m * 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cần pha ${uu(V, l, "mL")} dung dịch ${M(tex)} ${uu(C, l, "M")} (cho khối lượng mol ${M(`${num(Mm, l, 1)}\\ \\text{g/mol}`)}). Khối lượng chất rắn cần cân là`, `To prepare ${uu(V, l, "mL")} of ${M(tex)} ${uu(C, l, "M")} solution (molar mass ${M(`${num(Mm, l, 1)}\\ \\text{g/mol}`)}), the mass of solid to weigh is`, `配制 ${uu(V, l, "mL")} ${uu(C, l, "M")} 的 ${M(tex)} 溶液（摩尔质量 ${M(`${num(Mm, l, 1)}\\ \\text{g/mol}`)}），需称取固体的质量为`),
    steps: P(l, `${M(`n=C\\cdot V=${num(C, l, 2)}\\cdot${num(V / 1000, l, 3)}=${num(C * V / 1000, l, 4)}\\ \\text{mol}`)}; ${M(`m=n\\cdot M=${num(m, l, 3)}\\ \\text{g}`)}. `, `${M(`n=C\\cdot V=${num(C * V / 1000, l, 4)}\\ \\text{mol}`)}; ${M(`m=n\\cdot M=${num(m, l, 3)}\\ \\text{g}`)}. `, `${M(`n=C\\cdot V=${num(C * V / 1000, l, 4)}\\ \\text{mol}`)}，${M(`m=n\\cdot M=${num(m, l, 3)}\\ \\text{g}`)}。`) +
      mistakes(l, [[num(m * 1000, l, 3), "quên đổi mL sang L", "forgot to convert mL to L", "忘记把 mL 换算成 L"]]),
    opts: ops(l, [m, ...w], "g", 3),
  }), "Pha chế dung dịch", 70);
} });

add({ key: "chem.exp.collect_h2", subject: "chemistry", topic: "Thí nghiệm và ứng dụng", subtopic: "Điều chế và thu khí hiđro", difficulty: "medium", build(r) {
  const [name, Mm] = r.pick([["Zn", 65], ["Mg", 24], ["Fe", 56]] as [string, number][]), n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3]), m = n * Mm, V = 22.4 * n;
  if (!nice(m, 2) || !nice(V, 3)) return null;
  const w = pickN(V, [22.4 * m, V * 2, V / 2, n, 24.79 * n]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho ${uu(m, l, "g")} ${name} tác dụng hết với dung dịch HCl dư, khí hiđro thu được bằng phương pháp đẩy nước. Thể tích khí ${M("\\text{H}_2")} (đktc) là (${name} = ${Mm})`, `${uu(m, l, "g")} of ${name} reacts completely with excess HCl; hydrogen is collected over water. The volume of ${M("\\text{H}_2")} at STP is (${name} = ${Mm})`, `${uu(m, l, "g")} ${name} 与过量盐酸完全反应，用排水法收集氢气。标准状况下 ${M("\\text{H}_2")} 的体积为（${name} = ${Mm}）`),
    steps: P(l, `${M(`n_{${name}}=\\dfrac{${num(m, l, 2)}}{${Mm}}=${num(n, l, 2)}\\ \\text{mol}=n_{\\text{H}_2}`)}; ${M(`V=22{,}4\\cdot${num(n, l, 2)}=${num(V, l, 3)}\\ \\text{L}`)}. `, `${M(`n_{${name}}=${num(n, l, 2)}\\ \\text{mol}=n_{\\text{H}_2}`)}; ${M(`V=22.4\\cdot${num(n, l, 2)}=${num(V, l, 3)}\\ \\text{L}`)}. `, `${M(`n_{${name}}=${num(n, l, 2)}\\ \\text{mol}=n_{\\text{H}_2}`)}，${M(`V=22.4\\cdot${num(n, l, 2)}=${num(V, l, 3)}\\ \\text{L}`)}。`),
    opts: ops(l, [V, ...w], "L", 3),
  }), "Thể tích khí đktc", 80);
} });

export const EXTRA_TEMPLATES = T;
void shuffle;
