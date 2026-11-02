import { type Template, make, P, M, num, nz, nice, rnd, pick3, mistakes } from "./core.ts";

// ---------- các hàm tính (xuất ra để test đối chiếu) ----------
export const vFinal = (v0: number, a: number, t: number) => v0 + a * t;
export const distance = (v0: number, a: number, t: number) => v0 * t + 0.5 * a * t * t;
export const parallelR = (r1: number, r2: number) => (r1 * r2) / (r1 + r2);
export const lensImage = (f: number, d: number) => (f * d) / (d - f);
export const heat = (m: number, c: number, dT: number) => m * c * dT;
export const mixTemp = (m1: number, t1: number, m2: number, t2: number) => (m1 * t1 + m2 * t2) / (m1 + m2);

const T: Template[] = [];
const add = (t: Template) => T.push(t);
const u = (x: number, l: "vi" | "en" | "zh", unit: string, d = 3) => M(unit === "^\\circ C" ? `${num(x, l, d)}{}^\\circ\\text{C}` : `${num(x, l, d)}\\ \\text{${unit}}`);
// các đáp án phải giống nhau ở 3 ngôn ngữ về mặt số; chỉ dấu thập phân đổi theo ngôn ngữ
const opts = (l: "vi" | "en" | "zh", vals: number[], unit: string, d = 3) => vals.map((v) => u(v, l, unit, d));
const pickN = (correct: number, cands: number[]) => { const w = pick3(String(rnd(correct)), cands.map((x) => String(rnd(x)))); return w ? w.map(Number) : null; };

// 1. v = v0 + at
add({ key: "phy.mech.velocity", subject: "physics", topic: "Cơ học", subtopic: "Chuyển động thẳng biến đổi đều", difficulty: "easy", build(r) {
  const v0 = r.int(0, 20), a = r.int(1, 5), t = r.int(2, 10), v = vFinal(v0, a, t);
  const w = pickN(v, [v0 + a * t * t, a * t, v0 + (a * t) / 2, v0 - a * t, v0 * t + a * t]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Một vật chuyển động thẳng nhanh dần đều với vận tốc đầu ${M(`${v0}\\ \\text{m/s}`)} và gia tốc ${M(`${a}\\ \\text{m/s}^2`)}. Vận tốc của vật sau ${t} s là`, `An object moves with uniform acceleration, initial speed ${M(`${v0}\\ \\text{m/s}`)} and acceleration ${M(`${a}\\ \\text{m/s}^2`)}. Its speed after ${t} s is`, `物体做匀加速直线运动，初速度 ${M(`${v0}\\ \\text{m/s}`)}，加速度 ${M(`${a}\\ \\text{m/s}^2`)}，${t} s 后的速度为`),
    steps: P(l, `${M(`v=v_0+at=${v0}+${a}\\cdot${t}=${v}\\ \\text{m/s}`)}. `, `${M(`v=v_0+at=${v}\\ \\text{m/s}`)}. `, `${M(`v=v_0+at=${v}\\ \\text{m/s}`)}。`),
    opts: opts(l, [v, ...w], "m/s"),
  }), "v = v₀ + at", 45);
} });

// 2. s = v0 t + at²/2
add({ key: "phy.mech.distance", subject: "physics", topic: "Cơ học", subtopic: "Chuyển động thẳng biến đổi đều", difficulty: "medium", build(r) {
  const v0 = r.int(0, 15), a = r.pick([1, 2, 3, 4, 0.5, 1.5]), t = r.int(2, 8), s = distance(v0, a, t);
  const w = pickN(s, [v0 * t + a * t * t, 0.5 * a * t * t, v0 * t + (a * t) / 2, v0 * t, vFinal(v0, a, t) * t]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Vật chuyển động thẳng nhanh dần đều, vận tốc đầu ${u(v0, l, "m/s")}, gia tốc ${u(a, l, "m/s^2")}. Quãng đường vật đi được trong ${t} s đầu là`, `A uniformly accelerating object has initial speed ${u(v0, l, "m/s")} and acceleration ${u(a, l, "m/s^2")}. The distance covered in the first ${t} s is`, `物体做匀加速直线运动，初速度 ${u(v0, l, "m/s")}，加速度 ${u(a, l, "m/s^2")}，前 ${t} s 内通过的位移为`),
    steps: P(l, `${M(`s=v_0t+\\dfrac12at^2=${num(v0 * t, l)}+${num(0.5 * a * t * t, l)}=${num(s, l)}\\ \\text{m}`)}. `, `${M(`s=v_0t+\\dfrac12at^2=${num(s, l)}\\ \\text{m}`)}. `, `${M(`s=v_0t+\\dfrac12at^2=${num(s, l)}\\ \\text{m}`)}。`) +
      mistakes(l, [[num(v0 * t + a * t * t, l), "quên hệ số ½", "forgot the factor ½", "漏了系数 ½"]]),
    opts: opts(l, [s, ...w], "m"),
  }), "s = v₀t + at²/2", 70);
} });

// 3. Định luật II Newton có ma sát
add({ key: "phy.mech.friction", subject: "physics", topic: "Cơ học", subtopic: "Động lực học – lực ma sát", difficulty: "medium", build(r) {
  const m = r.int(2, 10), mu = r.pick([0.1, 0.2, 0.25, 0.3, 0.5]), g = 10, fms = mu * m * g, F = Math.ceil(fms + r.int(2, 30));
  const a = (F - fms) / m; if (!nice(a, 2) || a <= 0) return null;
  const w = pickN(a, [F / m, (F + fms) / m, F - fms, fms / m, (F - fms) / (2 * m)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Vật khối lượng ${u(m, l, "kg")} đặt trên mặt phẳng ngang, hệ số ma sát trượt ${M(`\\mu=${num(mu, l)}`)}. Tác dụng lực kéo nằm ngang ${u(F, l, "N")}. Lấy ${M("g=10\\ \\text{m/s}^2")}. Gia tốc của vật là`, `A ${u(m, l, "kg")} block lies on a horizontal surface with kinetic friction coefficient ${M(`\\mu=${num(mu, l)}`)}. A horizontal pull of ${u(F, l, "N")} is applied. Take ${M("g=10\\ \\text{m/s}^2")}. The acceleration is`, `质量 ${u(m, l, "kg")} 的物体放在水平面上，动摩擦因数 ${M(`\\mu=${num(mu, l)}`)}，受水平拉力 ${u(F, l, "N")}，取 ${M("g=10\\ \\text{m/s}^2")}，则加速度为`),
    steps: P(l, `${M(`F_{ms}=\\mu mg=${num(fms, l)}\\ \\text{N}`)}. ${M(`a=\\dfrac{F-F_{ms}}{m}=\\dfrac{${F}-${num(fms, l)}}{${m}}=${num(a, l)}\\ \\text{m/s}^2`)}. `, `${M(`F_{f}=\\mu mg=${num(fms, l)}\\ \\text{N}`)}; ${M(`a=\\dfrac{F-F_f}{m}=${num(a, l)}\\ \\text{m/s}^2`)}. `, `${M(`F_f=\\mu mg=${num(fms, l)}\\ \\text{N}`)}，${M(`a=\\dfrac{F-F_f}{m}=${num(a, l)}\\ \\text{m/s}^2`)}。`) +
      mistakes(l, [[num(F / m, l), "bỏ qua ma sát", "ignored friction", "忽略了摩擦力"]]),
    opts: opts(l, [a, ...w], "m/s^2"),
  }), "Định luật II Newton", 100);
} });

// 4. Rơi tự do: v = sqrt(2gh)
add({ key: "phy.mech.free_fall", subject: "physics", topic: "Cơ học", subtopic: "Bảo toàn cơ năng", difficulty: "medium", build(r) {
  const h = r.pick([5, 20, 45, 80, 125, 180]), v = Math.sqrt(2 * 10 * h);
  const w = pickN(v, [10 * h, 2 * 10 * h, v / 2, Math.sqrt(10 * h), 2 * v]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Thả rơi tự do một vật từ độ cao ${u(h, l, "m")} so với mặt đất. Bỏ qua sức cản không khí, lấy ${M("g=10\\ \\text{m/s}^2")}. Vận tốc của vật ngay trước khi chạm đất là`, `An object is dropped from rest at a height of ${u(h, l, "m")}. Ignoring air resistance and taking ${M("g=10\\ \\text{m/s}^2")}, its speed just before hitting the ground is`, `物体从 ${u(h, l, "m")} 高处自由落下，不计空气阻力，取 ${M("g=10\\ \\text{m/s}^2")}，落地前瞬间速度为`),
    steps: P(l, `Bảo toàn cơ năng: ${M(`mgh=\\dfrac12mv^2\\Rightarrow v=\\sqrt{2gh}=\\sqrt{2\\cdot10\\cdot${h}}=${v}\\ \\text{m/s}`)}. `, `Energy conservation: ${M(`mgh=\\dfrac12mv^2\\Rightarrow v=\\sqrt{2gh}=${v}\\ \\text{m/s}`)}. `, `机械能守恒：${M(`mgh=\\dfrac12mv^2\\Rightarrow v=\\sqrt{2gh}=${v}\\ \\text{m/s}`)}。`) +
      mistakes(l, [[String(10 * h), "quên lấy căn", "forgot the square root", "忘记开方"], [String(2 * 10 * h), "đây là v², chưa lấy căn", "this is v², not v", "这是 v² 而非 v"]]),
    opts: opts(l, [v, ...w], "m/s"),
  }), "Bảo toàn cơ năng", 80);
} });

// 5. Mạch nối tiếp: I = U/(R1+R2)
add({ key: "phy.elec.series_current", subject: "physics", topic: "Điện học", subtopic: "Định luật Ôm – mạch nối tiếp", difficulty: "easy", build(r) {
  const r1 = r.int(2, 20), r2 = r.int(2, 20), I = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), U = I * (r1 + r2);
  const w = pickN(I, [U / r1, U / r2, (U * (r1 + r2)) / (r1 * r2), U * (r1 + r2), U / Math.abs(r1 - r2 || 1)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Hai điện trở ${u(r1, l, "\\Omega")} và ${u(r2, l, "\\Omega")} mắc nối tiếp vào hiệu điện thế ${u(U, l, "V")}. Cường độ dòng điện trong mạch là`, `Two resistors ${u(r1, l, "\\Omega")} and ${u(r2, l, "\\Omega")} are connected in series across ${u(U, l, "V")}. The current in the circuit is`, `两个电阻 ${u(r1, l, "\\Omega")} 和 ${u(r2, l, "\\Omega")} 串联后接在 ${u(U, l, "V")} 的电压上，电路中的电流为`),
    steps: P(l, `${M(`R=R_1+R_2=${r1 + r2}\\ \\Omega`)}; ${M(`I=\\dfrac UR=\\dfrac{${num(U, l)}}{${r1 + r2}}=${num(I, l)}\\ \\text{A}`)}. `, `${M(`R=R_1+R_2=${r1 + r2}\\ \\Omega`)}; ${M(`I=U/R=${num(I, l)}\\ \\text{A}`)}. `, `${M(`R=R_1+R_2=${r1 + r2}\\ \\Omega`)}，${M(`I=U/R=${num(I, l)}\\ \\text{A}`)}。`),
    opts: opts(l, [I, ...w], "A"),
  }), "Định luật Ôm", 50);
} });

// 6. Điện trở tương đương mạch song song
const PAR: [number, number][] = [[3, 6], [4, 12], [6, 12], [12, 24], [20, 30], [10, 40], [15, 60], [30, 60], [5, 20], [8, 24], [6, 3], [9, 18]];
add({ key: "phy.elec.parallel_resistance", subject: "physics", topic: "Điện học", subtopic: "Điện trở tương đương", difficulty: "easy", build(r) {
  const [r1, r2] = r.pick(PAR), R = parallelR(r1, r2);
  const w = pickN(R, [r1 + r2, (r1 + r2) / 2, r1 * r2, Math.abs(r1 - r2)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Hai điện trở ${u(r1, l, "\\Omega")} và ${u(r2, l, "\\Omega")} mắc song song. Điện trở tương đương của đoạn mạch là`, `Two resistors ${u(r1, l, "\\Omega")} and ${u(r2, l, "\\Omega")} are connected in parallel. The equivalent resistance is`, `两个电阻 ${u(r1, l, "\\Omega")} 和 ${u(r2, l, "\\Omega")} 并联，等效电阻为`),
    steps: P(l, `${M(`\\dfrac1R=\\dfrac1{R_1}+\\dfrac1{R_2}\\Rightarrow R=\\dfrac{R_1R_2}{R_1+R_2}=\\dfrac{${r1 * r2}}{${r1 + r2}}=${num(R, l)}\\ \\Omega`)}. `, `${M(`R=\\dfrac{R_1R_2}{R_1+R_2}=${num(R, l)}\\ \\Omega`)}. `, `${M(`R=\\dfrac{R_1R_2}{R_1+R_2}=${num(R, l)}\\ \\Omega`)}。`) +
      mistakes(l, [[String(r1 + r2), "cộng như mạch nối tiếp", "added them as in series", "按串联相加"]]),
    opts: opts(l, [R, ...w], "\\Omega"),
  }), "Điện trở song song", 50);
} });

// 7. Công suất P = I²R
add({ key: "phy.elec.power", subject: "physics", topic: "Điện học", subtopic: "Công suất điện", difficulty: "medium", build(r) {
  const I = r.int(1, 6), R = r.int(2, 30), p = I * I * R;
  const w = pickN(p, [I * R, I * I, I * R * R, (I * R) / 2, I * I * R * 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Dòng điện ${u(I, l, "A")} chạy qua điện trở ${u(R, l, "\\Omega")}. Công suất tỏa nhiệt trên điện trở là`, `A current of ${u(I, l, "A")} flows through a ${u(R, l, "\\Omega")} resistor. The power dissipated is`, `${u(I, l, "A")} 的电流通过 ${u(R, l, "\\Omega")} 的电阻，其发热功率为`),
    steps: P(l, `${M(`P=I^2R=${I}^2\\cdot${R}=${p}\\ \\text{W}`)}. `, `${M(`P=I^2R=${p}\\ \\text{W}`)}. `, `${M(`P=I^2R=${p}\\ \\text{W}`)}。`) + mistakes(l, [[String(I * R), "đây là hiệu điện thế (V)", "this is the voltage (V)", "这是电压 (V)"]]),
    opts: opts(l, [p, ...w], "W"),
  }), "Công suất điện", 50);
} });

// 8. Tiền điện
add({ key: "phy.elec.bill", subject: "physics", topic: "Điện học", subtopic: "Điện năng tiêu thụ", difficulty: "easy", build(r) {
  const pw = r.int(2, 20) * 100, hrs = r.int(2, 8), days = r.pick([10, 15, 20, 30]), price = r.pick([1500, 2000, 2500, 3000]);
  const kwh = (pw / 1000) * hrs * days, cost = Math.round(kwh * price);
  const w = pickN(cost, [cost * 1000, (cost / days), (pw * hrs * days * price) / 1000 / 2, pw * hrs * price / 1000, cost * 2]); if (!w) return null;
  const fmt = (l: "vi" | "en" | "zh", x: number) => M(`${Math.round(x).toLocaleString(l === "vi" ? "de-DE" : "en-US")}\\ \\text{${l === "vi" ? "đồng" : l === "en" ? "VND" : "越南盾"}}`);
  return make((l) => ({
    body: P(l, `Một thiết bị công suất ${u(pw, l, "W")} dùng ${hrs} giờ mỗi ngày trong ${days} ngày. Giá điện ${price.toLocaleString("de-DE")} đồng/kWh. Tiền điện của thiết bị này là`, `A ${u(pw, l, "W")} appliance runs ${hrs} hours a day for ${days} days. Electricity costs ${price.toLocaleString("en-US")} VND per kWh. The cost is`, `一台 ${u(pw, l, "W")} 的电器每天使用 ${hrs} 小时，共 ${days} 天，电价 ${price.toLocaleString("en-US")} 越南盾/千瓦时，电费为`),
    steps: P(l, `Điện năng ${M(`A=${num(pw / 1000, l)}\\cdot${hrs}\\cdot${days}=${num(kwh, l)}\\ \\text{kWh}`)}; tiền điện ${M(`${num(kwh, l)}\\cdot${price}`)} = ${fmt(l, cost)}. `, `Energy ${M(`${num(kwh, l)}\\ \\text{kWh}`)}; cost = ${fmt(l, cost)}. `, `电能 ${M(`${num(kwh, l)}\\ \\text{kWh}`)}，电费 = ${fmt(l, cost)}。`),
    opts: [cost, ...w].map((x) => fmt(l, x)),
  }), "Điện năng tiêu thụ", 70);
} });

// 9. Nhiệt lượng Q = mcΔT
add({ key: "phy.heat.q", subject: "physics", topic: "Nhiệt học", subtopic: "Nhiệt lượng", difficulty: "medium", build(r) {
  const m = r.pick([0.5, 1, 1.5, 2, 3, 5]), t1 = r.int(15, 40), t2 = r.int(60, 95), c = 4200, Q = heat(m, c, t2 - t1) / 1000;
  const w = pickN(Q, [Q * 1000, (m * c * t2) / 1000, (m * c * (t1 + t2)) / 1000, (c * (t2 - t1)) / 1000, Q / 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Đun ${u(m, l, "kg")} nước từ ${u(t1, l, "^\\circ C")} đến ${u(t2, l, "^\\circ C")}. Biết nhiệt dung riêng của nước là ${M("4200\\ \\text{J/(kg·K)}")}. Nhiệt lượng cần cung cấp là`, `${u(m, l, "kg")} of water is heated from ${u(t1, l, "^\\circ C")} to ${u(t2, l, "^\\circ C")}. The specific heat of water is ${M("4200\\ \\text{J/(kg·K)}")}. The heat required is`, `将 ${u(m, l, "kg")} 水从 ${u(t1, l, "^\\circ C")} 加热到 ${u(t2, l, "^\\circ C")}，水的比热容为 ${M("4200\\ \\text{J/(kg·K)}")}，需要吸收的热量为`),
    steps: P(l, `${M(`Q=mc\\Delta t=${num(m, l)}\\cdot4200\\cdot(${t2}-${t1})=${num(Q * 1000, l)}\\ \\text{J}=${num(Q, l)}\\ \\text{kJ}`)}. `, `${M(`Q=mc\\Delta t=${num(Q, l)}\\ \\text{kJ}`)}. `, `${M(`Q=mc\\Delta t=${num(Q, l)}\\ \\text{kJ}`)}。`) + mistakes(l, [[num((m * c * t2) / 1000, l), "dùng nhiệt độ cuối thay vì độ tăng nhiệt độ", "used the final temperature instead of the change", "用了末温而不是温度变化"]]),
    opts: opts(l, [Q, ...w], "kJ"),
  }), "Q = mcΔt", 70);
} });

// 10. Nhiệt độ cân bằng
add({ key: "phy.heat.mixing", subject: "physics", topic: "Nhiệt học", subtopic: "Phương trình cân bằng nhiệt", difficulty: "hard", build(r) {
  const m1 = r.int(1, 5), m2 = r.int(1, 5), t1 = r.int(10, 40), t2 = r.int(60, 100), T = mixTemp(m1, t1, m2, t2);
  if (!nice(T, 1) || m1 === m2) return null;
  const w = pickN(T, [(t1 + t2) / 2, mixTemp(m2, t1, m1, t2), t2 - t1, (m1 * t1 + m2 * t2) / (m1 * m2)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Trộn ${u(m1, l, "kg")} nước ở ${u(t1, l, "^\\circ C")} với ${u(m2, l, "kg")} nước ở ${u(t2, l, "^\\circ C")}. Bỏ qua hao phí nhiệt. Nhiệt độ khi cân bằng là`, `${u(m1, l, "kg")} of water at ${u(t1, l, "^\\circ C")} is mixed with ${u(m2, l, "kg")} of water at ${u(t2, l, "^\\circ C")}. Ignoring heat loss, the final temperature is`, `将 ${u(m1, l, "kg")} 的 ${u(t1, l, "^\\circ C")} 的水与 ${u(m2, l, "kg")} 的 ${u(t2, l, "^\\circ C")} 的水混合，不计热损失，平衡温度为`),
    steps: P(l, `${M(`m_1c(T-t_1)=m_2c(t_2-T)\\Rightarrow T=\\dfrac{m_1t_1+m_2t_2}{m_1+m_2}=\\dfrac{${m1 * t1 + m2 * t2}}{${m1 + m2}}=${num(T, l)}\\,^\\circ\\text{C}`)}. `, `${M(`T=\\dfrac{m_1t_1+m_2t_2}{m_1+m_2}=${num(T, l)}\\,^\\circ\\text{C}`)}. `, `${M(`T=\\dfrac{m_1t_1+m_2t_2}{m_1+m_2}=${num(T, l)}\\,^\\circ\\text{C}`)}。`) + mistakes(l, [[num((t1 + t2) / 2, l), "lấy trung bình cộng, bỏ qua khối lượng", "simple average, ignoring masses", "简单平均，忽略质量"]]),
    opts: opts(l, [T, ...w], "^\\circ C"),
  }), "Cân bằng nhiệt", 110);
} });

// 11. Định luật Bôi-lơ – Ma-ri-ốt
add({ key: "phy.heat.boyle", subject: "physics", topic: "Nhiệt học", subtopic: "Khí lí tưởng – quá trình đẳng nhiệt", difficulty: "easy", build(r) {
  const p1 = r.pick([1, 2, 3, 4, 6]), v1 = r.pick([6, 8, 12, 15, 20, 24]), p2 = r.pick([2, 3, 4, 6, 8, 12]);
  const v2 = (p1 * v1) / p2; if (!nice(v2, 1) || p2 === p1) return null;
  const w = pickN(v2, [(p2 * v1) / p1, v1 + (p2 - p1), p1 * v1 * p2, v1 * (p1 + p2) / p2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Một lượng khí lí tưởng ở nhiệt độ không đổi có thể tích ${u(v1, l, "lít")} và áp suất ${u(p1, l, "atm")}. Khi áp suất tăng lên ${u(p2, l, "atm")} thì thể tích là`, `An ideal gas at constant temperature has volume ${u(v1, l, "L")} and pressure ${u(p1, l, "atm")}. When the pressure becomes ${u(p2, l, "atm")}, the volume is`, `一定量理想气体温度不变，体积 ${u(v1, l, "L")}、压强 ${u(p1, l, "atm")}。压强变为 ${u(p2, l, "atm")} 时，体积为`),
    steps: P(l, `${M(`p_1V_1=p_2V_2\\Rightarrow V_2=\\dfrac{${p1}\\cdot${v1}}{${p2}}=${num(v2, l)}\\ \\text{L}`)}. `, `${M(`p_1V_1=p_2V_2\\Rightarrow V_2=${num(v2, l)}\\ \\text{L}`)}. `, `${M(`p_1V_1=p_2V_2\\Rightarrow V_2=${num(v2, l)}\\ \\text{L}`)}。`),
    opts: opts(l, [v2, ...w], "L"),
  }), "Định luật Bôi-lơ–Ma-ri-ốt", 60);
} });

// 12. Sóng: v = λf
add({ key: "phy.wave.speed", subject: "physics", topic: "Sóng", subtopic: "Tốc độ truyền sóng", difficulty: "easy", build(r) {
  const lam = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), f = r.int(2, 20) * 10, v = lam * f;
  const w = pickN(v, [f / lam, (lam * f) / 2, 2 * lam * f, lam + f]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Một sóng cơ có bước sóng ${u(lam, l, "m")} và tần số ${u(f, l, "Hz")}. Tốc độ truyền sóng là`, `A mechanical wave has wavelength ${u(lam, l, "m")} and frequency ${u(f, l, "Hz")}. Its speed is`, `一列机械波的波长为 ${u(lam, l, "m")}，频率为 ${u(f, l, "Hz")}，则波速为`),
    steps: P(l, `${M(`v=\\lambda f=${num(lam, l)}\\cdot${f}=${num(v, l)}\\ \\text{m/s}`)}. `, `${M(`v=\\lambda f=${num(v, l)}\\ \\text{m/s}`)}. `, `${M(`v=\\lambda f=${num(v, l)}\\ \\text{m/s}`)}。`),
    opts: opts(l, [v, ...w], "m/s"),
  }), "v = λf", 40);
} });

// 13. Sóng dừng trên dây hai đầu cố định
add({ key: "phy.wave.standing", subject: "physics", topic: "Sóng", subtopic: "Sóng dừng", difficulty: "hard", build(r) {
  const L = r.pick([0.4, 0.5, 0.6, 0.8, 1, 1.2]), v = r.pick([20, 24, 30, 40, 48, 60, 80, 120]), n = r.int(2, 5);
  const f = (n * v) / (2 * L); if (!nice(f, 2)) return null;
  const w = pickN(f, [(n * v) / L, (n * v) / (4 * L), v / (2 * L), (n * v) / (2 * L) / 2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Sợi dây dài ${u(L, l, "m")} hai đầu cố định, tốc độ truyền sóng trên dây ${u(v, l, "m/s")}. Tần số của họa âm bậc ${n} (có ${n} bụng sóng) là`, `A string of length ${u(L, l, "m")} is fixed at both ends; the wave speed is ${u(v, l, "m/s")}. The frequency of the ${n}${n === 2 ? "nd" : n === 3 ? "rd" : "th"} harmonic (${n} antinodes) is`, `长 ${u(L, l, "m")} 的弦两端固定，波速 ${u(v, l, "m/s")}，第 ${n} 谐频（${n} 个波腹）的频率为`),
    steps: P(l, `Hai đầu cố định: ${M(`L=n\\dfrac{\\lambda}{2}`)} nên ${M(`f=\\dfrac{nv}{2L}=\\dfrac{${n}\\cdot${v}}{2\\cdot${num(L, l)}}=${num(f, l)}\\ \\text{Hz}`)}. `, `Both ends fixed: ${M(`L=n\\lambda/2`)} so ${M(`f=\\dfrac{nv}{2L}=${num(f, l)}\\ \\text{Hz}`)}. `, `两端固定：${M(`L=n\\lambda/2`)}，故 ${M(`f=\\dfrac{nv}{2L}=${num(f, l)}\\ \\text{Hz}`)}。`) + mistakes(l, [[num((n * v) / (4 * L), l), "dùng công thức một đầu cố định, một đầu tự do", "used the fixed–free (quarter-wave) formula", "误用一端固定一端自由的公式"]]),
    opts: opts(l, [f, ...w], "Hz"),
  }), "Sóng dừng trên dây", 110);
} });

// 14. Thấu kính hội tụ
const LENS: [number, number][] = [[10, 15], [10, 20], [10, 30], [12, 18], [12, 36], [20, 30], [15, 30], [20, 60], [30, 45], [30, 60], [24, 36], [16, 48]];
add({ key: "phy.optics.thin_lens", subject: "physics", topic: "Quang học", subtopic: "Thấu kính hội tụ", difficulty: "medium", build(r) {
  const [f, d] = r.pick(LENS), dp = lensImage(f, d);
  const w = pickN(dp, [f * d, d - f, (f * d) / (d + f), f + d]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Vật sáng đặt cách thấu kính hội tụ tiêu cự ${u(f, l, "cm")} một khoảng ${u(d, l, "cm")}. Ảnh của vật cách thấu kính`, `An object is ${u(d, l, "cm")} from a converging lens of focal length ${u(f, l, "cm")}. The image is at a distance from the lens of`, `物体距焦距 ${u(f, l, "cm")} 的凸透镜 ${u(d, l, "cm")}，像到透镜的距离为`),
    steps: P(l, `${M(`\\dfrac1f=\\dfrac1d+\\dfrac1{d'}\\Rightarrow d'=\\dfrac{df}{d-f}=\\dfrac{${d}\\cdot${f}}{${d - f}}=${num(dp, l)}\\ \\text{cm}`)} (ảnh thật). `, `${M(`d'=\\dfrac{df}{d-f}=${num(dp, l)}\\ \\text{cm}`)} (real image). `, `${M(`d'=\\dfrac{df}{d-f}=${num(dp, l)}\\ \\text{cm}`)}（实像）。`),
    opts: opts(l, [dp, ...w], "cm"),
  }), "Công thức thấu kính", 80);
} });

// 15. Vận tốc ánh sáng trong môi trường
add({ key: "phy.optics.light_speed", subject: "physics", topic: "Quang học", subtopic: "Chiết suất", difficulty: "easy", build(r) {
  const n = r.pick([1.2, 1.25, 1.5, 2, 2.5, 3]), v = 3 / n;
  const w = pickN(v, [3 * n, n / 3, 3 - n, 3 / (n + 1)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Chiết suất tuyệt đối của một môi trường là ${M(`n=${num(n, l)}`)}. Biết tốc độ ánh sáng trong chân không là ${M("3\\cdot10^8\\ \\text{m/s}")}. Tốc độ ánh sáng trong môi trường đó là`, `A medium has refractive index ${M(`n=${num(n, l)}`)}. The speed of light in vacuum is ${M("3\\cdot10^8\\ \\text{m/s}")}. The speed of light in this medium is`, `某介质的折射率 ${M(`n=${num(n, l)}`)}，真空中光速为 ${M("3\\cdot10^8\\ \\text{m/s}")}，则光在该介质中的速度为`),
    steps: P(l, `${M(`v=\\dfrac cn=\\dfrac{3\\cdot10^8}{${num(n, l)}}=${num(v, l)}\\cdot10^8\\ \\text{m/s}`)}. `, `${M(`v=c/n=${num(v, l)}\\cdot10^8\\ \\text{m/s}`)}. `, `${M(`v=c/n=${num(v, l)}\\cdot10^8\\ \\text{m/s}`)}。`),
    opts: [v, ...w].map((x) => M(`${num(x, l)}\\cdot10^8\\ \\text{m/s}`)),
  }), "v = c/n", 45);
} });

// 16. Năng lượng photon (eV)
add({ key: "phy.modern.photon_energy", subject: "physics", topic: "Vật lý hiện đại", subtopic: "Lượng tử ánh sáng", difficulty: "medium", build(r) {
  const lam = r.pick([124, 248, 310, 400, 496, 620, 775, 1240]), E = 1240 / lam;
  if (!nice(E, 2)) return null;
  const w = pickN(E, [E * 10, E / 10, E * 2, E + 1]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Một photon có bước sóng ${u(lam, l, "nm")}. Cho ${M("hc=1240\\ \\text{eV·nm}")}. Năng lượng của photon là`, `A photon has wavelength ${u(lam, l, "nm")}. Given ${M("hc=1240\\ \\text{eV·nm}")}, its energy is`, `一个光子的波长为 ${u(lam, l, "nm")}，已知 ${M("hc=1240\\ \\text{eV·nm}")}，则光子能量为`),
    steps: P(l, `${M(`E=\\dfrac{hc}{\\lambda}=\\dfrac{1240}{${lam}}=${num(E, l)}\\ \\text{eV}`)}. `, `${M(`E=\\dfrac{hc}{\\lambda}=${num(E, l)}\\ \\text{eV}`)}. `, `${M(`E=\\dfrac{hc}{\\lambda}=${num(E, l)}\\ \\text{eV}`)}。`),
    opts: opts(l, [E, ...w], "eV"),
  }), "E = hc/λ", 60);
} });

// 17. Hiệu ứng quang điện: động năng cực đại
add({ key: "phy.modern.photoelectric", subject: "physics", topic: "Vật lý hiện đại", subtopic: "Hiệu ứng quang điện", difficulty: "hard", build(r) {
  const lam = r.pick([248, 310, 400, 496]), E = 1240 / lam, W = r.pick([1.9, 2.1, 2.3, 2.5, 3, 3.6, 4.1]);
  const K = E - W; if (K <= 0 || !nice(K, 2)) return null;
  const w = pickN(K, [E + W, E, W, E * W]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Chiếu ánh sáng bước sóng ${u(lam, l, "nm")} vào kim loại có công thoát ${u(W, l, "eV")}. Cho ${M("hc=1240\\ \\text{eV·nm}")}. Động năng ban đầu cực đại của quang electron là`, `Light of wavelength ${u(lam, l, "nm")} hits a metal of work function ${u(W, l, "eV")}. With ${M("hc=1240\\ \\text{eV·nm}")}, the maximum kinetic energy of the photoelectrons is`, `波长 ${u(lam, l, "nm")} 的光照射逸出功为 ${u(W, l, "eV")} 的金属，已知 ${M("hc=1240\\ \\text{eV·nm}")}，光电子的最大初动能为`),
    steps: P(l, `${M(`E=\\dfrac{1240}{${lam}}=${num(E, l)}\\ \\text{eV}`)}; ${M(`K_{max}=E-A=${num(E, l)}-${num(W, l)}=${num(K, l)}\\ \\text{eV}`)}. `, `${M(`E=${num(E, l)}\\ \\text{eV}`)}; ${M(`K_{max}=E-A=${num(K, l)}\\ \\text{eV}`)}. `, `${M(`E=${num(E, l)}\\ \\text{eV}`)}，${M(`K_{max}=E-A=${num(K, l)}\\ \\text{eV}`)}。`) + mistakes(l, [[num(E + W, l), "cộng thay vì trừ công thoát", "added the work function instead of subtracting", "把逸出功加了而不是减"]]),
    opts: opts(l, [K, ...w], "eV"),
  }), "Phương trình Anh-xtanh", 90);
} });

export const PHYSICS_TEMPLATES = T;
void nz;
