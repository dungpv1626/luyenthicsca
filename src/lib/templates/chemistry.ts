import { type Template, make, P, M, num, nice, rnd, pick3, mistakes } from "./core.ts";

const T: Template[] = [];
const add = (t: Template) => T.push(t);
const pickN = (correct: number, cands: number[]) => { const w = pick3(String(rnd(correct)), cands.map((x) => String(rnd(x)))); return w ? w.map(Number) : null; };
const u = (x: number, l: "vi" | "en" | "zh", unit: string, d = 3) => M(`${num(x, l, d)}\\ \\text{${unit}}`);
const opts = (l: "vi" | "en" | "zh", vals: number[], unit: string, d = 3) => vals.map((v) => u(v, l, unit, d));
const frm = (s: string) => `\\text{${s}}`; // công thức tạm, dùng cho tên chất đơn giản

// ---------- dữ liệu ----------
const SUBSTANCES: [string, string, number][] = [ // [công thức LaTeX, tên hiển thị, M]
  ["\\text{NaOH}", "NaOH", 40], ["\\text{KOH}", "KOH", 56], ["\\text{H}_2\\text{SO}_4", "H2SO4", 98], ["\\text{Na}_2\\text{CO}_3", "Na2CO3", 106],
  ["\\text{HCl}", "HCl", 36.5], ["\\text{CaCl}_2", "CaCl2", 111], ["\\text{NaCl}", "NaCl", 58.5], ["\\text{C}_6\\text{H}_{12}\\text{O}_6", "glucose", 180],
];
const REACTIONS: { eq: string; reagent: string; gas: string; M: number; ratio: number; name: string }[] = [
  { eq: "\\text{CaCO}_3 \\xrightarrow{t^\\circ} \\text{CaO} + \\text{CO}_2", reagent: "\\text{CaCO}_3", gas: "\\text{CO}_2", M: 100, ratio: 1, name: "CaCO3" },
  { eq: "\\text{Zn} + 2\\text{HCl} \\to \\text{ZnCl}_2 + \\text{H}_2", reagent: "\\text{Zn}", gas: "\\text{H}_2", M: 65, ratio: 1, name: "Zn" },
  { eq: "\\text{Mg} + 2\\text{HCl} \\to \\text{MgCl}_2 + \\text{H}_2", reagent: "\\text{Mg}", gas: "\\text{H}_2", M: 24, ratio: 1, name: "Mg" },
  { eq: "\\text{Fe} + \\text{H}_2\\text{SO}_4 \\to \\text{FeSO}_4 + \\text{H}_2", reagent: "\\text{Fe}", gas: "\\text{H}_2", M: 56, ratio: 1, name: "Fe" },
  { eq: "2\\text{Al} + 6\\text{HCl} \\to 2\\text{AlCl}_3 + 3\\text{H}_2", reagent: "\\text{Al}", gas: "\\text{H}_2", M: 27, ratio: 1.5, name: "Al" },
  { eq: "2\\text{Na} + 2\\text{H}_2\\text{O} \\to 2\\text{NaOH} + \\text{H}_2", reagent: "\\text{Na}", gas: "\\text{H}_2", M: 23, ratio: 0.5, name: "Na" },
  { eq: "2\\text{KClO}_3 \\xrightarrow{t^\\circ} 2\\text{KCl} + 3\\text{O}_2", reagent: "\\text{KClO}_3", gas: "\\text{O}_2", M: 122.5, ratio: 1.5, name: "KClO3" },
];
const OXI: { el: string; x: number; calc: (l: "vi" | "en" | "zh") => string; formula: string }[] = [
  { formula: "\\text{KMnO}_4", el: "Mn", x: 7, calc: () => "1+x+4\\cdot(-2)=0" },
  { formula: "\\text{K}_2\\text{Cr}_2\\text{O}_7", el: "Cr", x: 6, calc: () => "2\\cdot1+2x+7\\cdot(-2)=0" },
  { formula: "\\text{K}_2\\text{MnO}_4", el: "Mn", x: 6, calc: () => "2\\cdot1+x+4\\cdot(-2)=0" },
  { formula: "\\text{KClO}_3", el: "Cl", x: 5, calc: () => "1+x+3\\cdot(-2)=0" },
  { formula: "\\text{NaClO}_4", el: "Cl", x: 7, calc: () => "1+x+4\\cdot(-2)=0" },
  { formula: "\\text{H}_2\\text{SO}_4", el: "S", x: 6, calc: () => "2\\cdot1+x+4\\cdot(-2)=0" },
  { formula: "\\text{H}_2\\text{SO}_3", el: "S", x: 4, calc: () => "2\\cdot1+x+3\\cdot(-2)=0" },
  { formula: "\\text{HNO}_3", el: "N", x: 5, calc: () => "1+x+3\\cdot(-2)=0" },
  { formula: "\\text{HNO}_2", el: "N", x: 3, calc: () => "1+x+2\\cdot(-2)=0" },
  { formula: "\\text{H}_3\\text{PO}_4", el: "P", x: 5, calc: () => "3\\cdot1+x+4\\cdot(-2)=0" },
  { formula: "\\text{KIO}_3", el: "I", x: 5, calc: () => "1+x+3\\cdot(-2)=0" },
  { formula: "\\text{Na}_2\\text{SO}_4", el: "S", x: 6, calc: () => "2\\cdot1+x+4\\cdot(-2)=0" },
];
const ELEMENTS: [string, number, number, number[]][] = [ // [ký hiệu, Z, A, các điện tích ion thường gặp]
  ["Na", 11, 23, [1]], ["Mg", 12, 24, [2]], ["Al", 13, 27, [3]], ["K", 19, 39, [1]], ["Ca", 20, 40, [2]], ["Fe", 26, 56, [2, 3]],
  ["Cu", 29, 64, [2]], ["Zn", 30, 65, [2]], ["O", 8, 16, [-2]], ["S", 16, 32, [-2]], ["Cl", 17, 35, [-1]], ["F", 9, 19, [-1]],
];
const shells = (z: number) => { const cap = [2, 8, 8, 2]; const out: number[] = []; let left = z; for (const c of cap) { if (left <= 0) break; out.push(Math.min(c, left)); left -= c; } return out; };
export const valenceOf = (z: number) => shells(z).at(-1)!;
export const periodOf = (z: number) => shells(z).length;
const sup = (q: number) => (Math.abs(q) === 1 ? "" : String(Math.abs(q))) + (q > 0 ? "+" : "-");

// 1. Nồng độ mol
add({ key: "chem.solution.molarity", subject: "chemistry", topic: "Dung dịch", subtopic: "Nồng độ mol", difficulty: "easy", build(r) {
  const [fl, , Mw] = r.pick(SUBSTANCES), n = r.pick([0.1, 0.2, 0.25, 0.5, 1, 2]), V = r.pick([0.1, 0.2, 0.25, 0.5, 1, 2]);
  const m = rnd(n * Mw, 3), C = n / V;
  const w = pickN(C, [m / V, n * V, V / n, m / Mw / (V * 2)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Hòa tan ${u(m, l, "g")} ${M(fl)} (khối lượng mol ${u(Mw, l, "g/mol")}) vào nước thành ${u(V, l, "lít")} dung dịch. Nồng độ mol của dung dịch là`, `${u(m, l, "g")} of ${M(fl)} (molar mass ${u(Mw, l, "g/mol")}) is dissolved in water to make ${u(V, l, "L")} of solution. The molarity is`, `将 ${u(m, l, "g")} ${M(fl)}（摩尔质量 ${u(Mw, l, "g/mol")}）溶于水配成 ${u(V, l, "L")} 溶液，其物质的量浓度为`),
    steps: P(l, `${M(`n=\\dfrac mM=\\dfrac{${num(m, l)}}{${num(Mw, l)}}=${num(n, l)}\\ \\text{mol}`)}; ${M(`C_M=\\dfrac nV=\\dfrac{${num(n, l)}}{${num(V, l)}}=${num(C, l)}\\ \\text{M}`)}. `, `${M(`n=m/M=${num(n, l)}\\ \\text{mol}`)}; ${M(`C_M=n/V=${num(C, l)}\\ \\text{M}`)}. `, `${M(`n=m/M=${num(n, l)}\\ \\text{mol}`)}，${M(`C_M=n/V=${num(C, l)}\\ \\text{M}`)}。`) + mistakes(l, [[num(m / V, l), "dùng khối lượng thay cho số mol", "used mass instead of moles", "用质量代替了物质的量"]]),
    opts: opts(l, [C, ...w], "M"),
  }), "Nồng độ mol", 60);
} });

// 2. Pha loãng dung dịch
add({ key: "chem.solution.dilution", subject: "chemistry", topic: "Dung dịch", subtopic: "Pha loãng", difficulty: "medium", build(r) {
  const C2 = r.pick([0.1, 0.2, 0.25, 0.5]), k = r.pick([2, 3, 4, 5]), C1 = rnd(C2 * k, 3), V1 = r.pick([50, 100, 150, 200, 250]);
  const water = V1 * (k - 1);
  const w = pickN(water, [V1 * k, V1 / k, V1 * (k + 1), V1 * (k - 1) / 2, V1 * C2]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cần thêm bao nhiêu mL nước vào ${u(V1, l, "mL")} dung dịch ${u(C1, l, "M")} để thu được dung dịch ${u(C2, l, "M")}?`, `How many mL of water must be added to ${u(V1, l, "mL")} of a ${u(C1, l, "M")} solution to obtain a ${u(C2, l, "M")} solution?`, `向 ${u(V1, l, "mL")} ${u(C1, l, "M")} 的溶液中加多少 mL 水，才能得到 ${u(C2, l, "M")} 的溶液？`),
    steps: P(l, `${M(`C_1V_1=C_2V_2\\Rightarrow V_2=\\dfrac{${num(C1, l)}\\cdot${V1}}{${num(C2, l)}}=${V1 * k}\\ \\text{mL}`)}. Thể tích nước thêm: ${M(`${V1 * k}-${V1}=${water}\\ \\text{mL}`)}. `, `${M(`C_1V_1=C_2V_2\\Rightarrow V_2=${V1 * k}\\ \\text{mL}`)}; water added ${M(`${V1 * k}-${V1}=${water}\\ \\text{mL}`)}. `, `${M(`C_1V_1=C_2V_2\\Rightarrow V_2=${V1 * k}\\ \\text{mL}`)}，加水 ${M(`${V1 * k}-${V1}=${water}\\ \\text{mL}`)}。`) + mistakes(l, [[String(V1 * k), "đây là thể tích dung dịch sau pha, chưa trừ thể tích ban đầu", "this is the final volume, not the volume of water added", "这是稀释后总体积，不是加水量"]]),
    opts: opts(l, [water, ...w], "mL"),
  }), "Pha loãng C₁V₁=C₂V₂", 90);
} });

// 3. pH của dung dịch axit/bazơ mạnh
add({ key: "chem.acidbase.ph", subject: "chemistry", topic: "Axit–bazơ", subtopic: "Tính pH", difficulty: "medium", build(r) {
  const type = r.pick(["HCl", "NaOH", "H2SO4", "BaOH2"] as const), n = r.int(2, 5);
  let C: string, pH: number, wrong: number[], reason: [string, string, string, string];
  if (type === "HCl") { C = `10^{-${n}}`; pH = n; wrong = [14 - n, n + 1, -n, 7 - n]; reason = ["tính pOH hoặc dùng 14 − pH", "computed pOH or 14 − pH", "算成了 pOH 或用了 14 − pH", ""]; }
  else if (type === "NaOH") { C = `10^{-${n}}`; pH = 14 - n; wrong = [n, 14 + n, 7 - n, 14 - n - 1]; reason = ["quên đổi từ pOH sang pH", "forgot to convert pOH to pH", "忘记由 pOH 换算为 pH", ""]; }
  else if (type === "H2SO4") { C = `5\\cdot10^{-${n}}`; pH = n - 1; wrong = [n, n + 1, 14 - n, n - 2]; reason = ["quên H₂SO₄ phân li 2 nấc cho 2 H⁺", "forgot H₂SO₄ gives 2 H⁺", "忘记 H₂SO₄ 电离出 2 个 H⁺", ""]; }
  else { C = `5\\cdot10^{-${n}}`; pH = 15 - n; wrong = [14 - n, 14 - n + 1, n, n - 1]; reason = ["quên Ba(OH)₂ cho 2 OH⁻", "forgot Ba(OH)₂ gives 2 OH⁻", "忘记 Ba(OH)₂ 提供 2 个 OH⁻", ""]; }
  const w = pickN(pH, wrong); if (!w) return null;
  const sol = { HCl: "\\text{HCl}", NaOH: "\\text{NaOH}", H2SO4: "\\text{H}_2\\text{SO}_4", BaOH2: "\\text{Ba(OH)}_2" }[type];
  const ion = type === "HCl" ? `[\\text{H}^+]=10^{-${n}}` : type === "NaOH" ? `[\\text{OH}^-]=10^{-${n}}` : type === "H2SO4" ? `[\\text{H}^+]=2\\cdot5\\cdot10^{-${n}}=10^{-${n - 1}}` : `[\\text{OH}^-]=2\\cdot5\\cdot10^{-${n}}=10^{-${n - 1}}`;
  return make((l) => ({
    body: P(l, `Dung dịch ${M(sol)} nồng độ ${M(`${C}\\ \\text{M}`)} ở ${M("25^\\circ\\text{C}")} có pH bằng`, `A ${M(sol)} solution of concentration ${M(`${C}\\ \\text{M}`)} at ${M("25^\\circ\\text{C}")} has pH equal to`, `${M("25^\\circ\\text{C}")} 时，浓度为 ${M(`${C}\\ \\text{M}`)} 的 ${M(sol)} 溶液的 pH 为`),
    steps: P(l, `${M(ion)}${type === "HCl" || type === "H2SO4" ? `, nên ${M(`\\text{pH}=${pH}`)}` : `, nên ${M(`\\text{pOH}=${type === "NaOH" ? n : n - 1}`)} và ${M(`\\text{pH}=14-\\text{pOH}=${pH}`)}`}. `, `${M(ion)}; hence ${M(`\\text{pH}=${pH}`)}. `, `${M(ion)}，所以 ${M(`\\text{pH}=${pH}`)}。`) + mistakes(l, [[String(w[0]), reason[0], reason[1], reason[2]]]),
    opts: [pH, ...w].map((x) => M(String(x))),
  }), "Tính pH", 90);
} });

// 4. Thể tích khí (đktc)
add({ key: "chem.reaction.gas_volume", subject: "chemistry", topic: "Phản ứng hóa học", subtopic: "Tính toán theo phương trình", difficulty: "medium", build(r) {
  const rx = r.pick(REACTIONS), n = r.pick([0.1, 0.2, 0.25, 0.5, 1]), m = rnd(n * rx.M, 3), V = rnd(n * rx.ratio * 22.4, 3);
  const w = pickN(V, [n * 22.4 * (rx.ratio === 1 ? 2 : 1), n * rx.ratio, V * 2, V / 2, n * 22.4 * rx.ratio * 1.5]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Cho phản ứng ${M(rx.eq)}. Dùng ${u(m, l, "g")} ${M(rx.reagent)} (khối lượng mol ${u(rx.M, l, "g/mol")}), phản ứng hoàn toàn. Thể tích khí ${M(rx.gas)} thu được ở đktc (${M("22{,}4\\ \\text{L/mol}")}) là`, `For the reaction ${M(rx.eq)}, ${u(m, l, "g")} of ${M(rx.reagent)} (molar mass ${u(rx.M, l, "g/mol")}) reacts completely. The volume of ${M(rx.gas)} at STP (${M("22.4\\ \\text{L/mol}")}) is`, `反应 ${M(rx.eq)} 中，${u(m, l, "g")} ${M(rx.reagent)}（摩尔质量 ${u(rx.M, l, "g/mol")}）完全反应，标准状况下（${M("22.4\\ \\text{L/mol}")}）生成 ${M(rx.gas)} 的体积为`),
    steps: P(l, `${M(`n=\\dfrac{${num(m, l)}}{${num(rx.M, l)}}=${num(n, l)}\\ \\text{mol}`)}. Theo phương trình, số mol khí gấp ${M(num(rx.ratio, l))} lần: ${M(`n_{khi}=${num(n * rx.ratio, l)}`)} mol; ${M(`V=${num(n * rx.ratio, l)}\\cdot22{,}4=${num(V, l)}\\ \\text{L}`)}. `, `${M(`n=${num(n, l)}\\ \\text{mol}`)}. The gas moles are ${M(num(rx.ratio, l))}× that: ${M(`V=${num(n * rx.ratio, l)}\\cdot22.4=${num(V, l)}\\ \\text{L}`)}. `, `${M(`n=${num(n, l)}\\ \\text{mol}`)}，气体物质的量为其 ${M(num(rx.ratio, l))} 倍，${M(`V=${num(V, l)}\\ \\text{L}`)}。`) + mistakes(l, [[num(n * 22.4, l), "bỏ qua hệ số tỉ lệ mol trong phương trình", "ignored the mole ratio in the equation", "忽略了方程式中的物质的量之比"]]),
    opts: opts(l, [V, ...w], "L"),
  }), "Tính theo phương trình", 100);
} });

// 5. Số oxi hóa
add({ key: "chem.redox.oxidation_number", subject: "chemistry", topic: "Oxi hóa–khử", subtopic: "Số oxi hóa", difficulty: "easy", build(r) {
  const o = r.pick(OXI), w = pick3(String(o.x), [String(o.x - 1), String(o.x + 1), String(o.x - 2), String(-o.x), String(o.x + 2)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Số oxi hóa của nguyên tố ${M(`\\text{${o.el}}`)} trong hợp chất ${M(o.formula)} là`, `The oxidation number of ${M(`\\text{${o.el}}`)} in ${M(o.formula)} is`, `${M(o.formula)} 中 ${M(`\\text{${o.el}}`)} 元素的氧化数是`),
    steps: P(l, `Gọi số oxi hóa của ${o.el} là ${M("x")}: ${M(`${o.calc(l)}\\Rightarrow x=+${o.x}`)}. `, `Let the oxidation number of ${o.el} be ${M("x")}: ${M(`${o.calc(l)}\\Rightarrow x=+${o.x}`)}. `, `设 ${o.el} 的氧化数为 ${M("x")}：${M(`${o.calc(l)}\\Rightarrow x=+${o.x}`)}。`),
    opts: [o.x, ...w.map(Number)].map((x) => M(x > 0 ? `+${x}` : String(x))),
  }), "Số oxi hóa", 45);
} });

// 6. Số nơtron
add({ key: "chem.atom.neutrons", subject: "chemistry", topic: "Cấu tạo nguyên tử", subtopic: "Hạt cơ bản", difficulty: "easy", build(r) {
  const [s, z, a] = r.pick(ELEMENTS), n = a - z;
  const w = pick3(String(n), [String(z), String(a), String(a + z), String(n + 1), String(n - 1)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Nguyên tử ${M(`{}^{${a}}_{${z}}\\text{${s}}`)} có số nơtron là`, `An atom of ${M(`{}^{${a}}_{${z}}\\text{${s}}`)} has how many neutrons?`, `原子 ${M(`{}^{${a}}_{${z}}\\text{${s}}`)} 含有多少个中子？`),
    steps: P(l, `Số nơtron = A − Z = ${M(`${a}-${z}=${n}`)}. `, `Neutrons = A − Z = ${M(`${a}-${z}=${n}`)}. `, `中子数 = A − Z = ${M(`${a}-${z}=${n}`)}。`),
    opts: [String(n), ...w].map(M),
  }), "Số nơtron", 40);
} });

// 7. Số electron của ion
add({ key: "chem.atom.ion_electrons", subject: "chemistry", topic: "Cấu tạo nguyên tử", subtopic: "Ion", difficulty: "medium", build(r) {
  const [s, z, a, qs] = r.pick(ELEMENTS), q = r.pick(qs), e = z - q;
  const w = pick3(String(e), [String(z), String(z + q), String(a - z), String(e + 2), String(a)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Ion ${M(`{}^{${a}}_{${z}}\\text{${s}}^{${sup(q)}}`)} có số electron là`, `The ion ${M(`{}^{${a}}_{${z}}\\text{${s}}^{${sup(q)}}`)} has how many electrons?`, `离子 ${M(`{}^{${a}}_{${z}}\\text{${s}}^{${sup(q)}}`)} 含有多少个电子？`),
    steps: P(l, `Nguyên tử trung hòa có ${z} electron; ion mang điện ${M(sup(q))} nên ${q > 0 ? "mất" : "nhận thêm"} ${Math.abs(q)} electron: ${M(`${z}${q > 0 ? "-" : "+"}${Math.abs(q)}=${e}`)}. `, `The neutral atom has ${z} electrons; the ion carries ${M(sup(q))}, so it ${q > 0 ? "lost" : "gained"} ${Math.abs(q)}: ${M(`${z}${q > 0 ? "-" : "+"}${Math.abs(q)}=${e}`)}. `, `中性原子有 ${z} 个电子；该离子带 ${M(sup(q))}，${q > 0 ? "失去" : "得到"} ${Math.abs(q)} 个电子：${M(`${z}${q > 0 ? "-" : "+"}${Math.abs(q)}=${e}`)}。`),
    opts: [String(e), ...w].map(M),
  }), "Electron của ion", 60);
} });

// 8. Số electron lớp ngoài cùng
const MAIN = [3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20];
add({ key: "chem.periodic.valence", subject: "chemistry", topic: "Bảng tuần hoàn", subtopic: "Cấu hình electron", difficulty: "easy", build(r) {
  const z = r.pick(MAIN), v = valenceOf(z), sh = shells(z);
  const w = pick3(String(v), [String(z), String(periodOf(z)), String(8 - v), String(v + 1), String(v - 1)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Nguyên tố X có số hiệu nguyên tử ${M(`Z=${z}`)}. Số electron ở lớp ngoài cùng của nguyên tử X là`, `Element X has atomic number ${M(`Z=${z}`)}. The number of electrons in the outer shell of X is`, `元素 X 的原子序数 ${M(`Z=${z}`)}，其最外层电子数为`),
    steps: P(l, `Phân bố electron theo lớp: ${M(sh.join(","))}. Lớp ngoài cùng có ${M(String(v))} electron (X thuộc chu kì ${periodOf(z)}). `, `Electrons per shell: ${M(sh.join(","))}. The outer shell has ${M(String(v))} electrons (period ${periodOf(z)}). `, `各电子层电子数：${M(sh.join(","))}，最外层有 ${M(String(v))} 个电子（第 ${periodOf(z)} 周期）。`) + mistakes(l, [[String(periodOf(z)), "đây là số lớp electron (chu kì)", "this is the number of shells (period)", "这是电子层数（周期数）"]]),
    opts: [String(v), ...w].map(M),
  }), "Cấu hình electron", 55);
} });

// 9. Trung hòa axit–bazơ
const ACIDS: [string, number][] = [["\\text{HCl}", 1], ["\\text{HNO}_3", 1], ["\\text{H}_2\\text{SO}_4", 2]];
const BASES: [string, number][] = [["\\text{NaOH}", 1], ["\\text{KOH}", 1], ["\\text{Ba(OH)}_2", 2], ["\\text{Ca(OH)}_2", 2]];
add({ key: "chem.acidbase.neutralization", subject: "chemistry", topic: "Axit–bazơ", subtopic: "Phản ứng trung hòa", difficulty: "hard", build(r) {
  const [ac, a] = r.pick(ACIDS), [bs, b] = r.pick(BASES), Ca = r.pick([0.1, 0.2, 0.25, 0.5, 1]), Cb = r.pick([0.1, 0.2, 0.25, 0.5, 1]), Va = r.pick([10, 20, 25, 30, 40, 50, 100]);
  const Vb = (Ca * Va * a) / (Cb * b); if (!nice(Vb, 1) || Vb < 5 || Vb > 400) return null;
  const w = pickN(Vb, [(Ca * Va) / Cb, (Ca * Va * b) / (Cb * a), Va, Vb * 2, Vb / 2, (Cb * Va) / Ca]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Để trung hòa hoàn toàn ${u(Va, l, "mL")} dung dịch ${M(ac)} ${u(Ca, l, "M")} cần bao nhiêu mL dung dịch ${M(bs)} ${u(Cb, l, "M")}?`, `How many mL of ${u(Cb, l, "M")} ${M(bs)} are needed to completely neutralise ${u(Va, l, "mL")} of ${u(Ca, l, "M")} ${M(ac)}?`, `完全中和 ${u(Va, l, "mL")} ${u(Ca, l, "M")} 的 ${M(ac)} 需要 ${u(Cb, l, "M")} 的 ${M(bs)} 多少 mL？`),
    steps: P(l, `${M(`n_{H^+}=${a}\\cdot${num(Ca, l)}\\cdot${Va}=${num(a * Ca * Va, l)}`)} (mmol); ${M(`n_{OH^-}=${b}\\cdot${num(Cb, l)}\\cdot V_b`)}. Cân bằng ${M("n_{H^+}=n_{OH^-}")}: ${M(`V_b=${num(Vb, l)}\\ \\text{mL}`)}. `, `${M(`n_{H^+}=${num(a * Ca * Va, l)}`)} mmol; ${M(`n_{OH^-}=${b}\\cdot${num(Cb, l)}\\cdot V_b`)}. Setting them equal: ${M(`V_b=${num(Vb, l)}\\ \\text{mL}`)}. `, `${M(`n_{H^+}=${num(a * Ca * Va, l)}`)} mmol，${M(`n_{OH^-}=${b}\\cdot${num(Cb, l)}\\cdot V_b`)}，令二者相等得 ${M(`V_b=${num(Vb, l)}\\ \\text{mL}`)}。`) + mistakes(l, [[num((Ca * Va * b) / (Cb * a), l), "nhầm hóa trị axit và bazơ", "swapped the acid and base valences", "把酸和碱的元数弄反"]]),
    opts: opts(l, [Vb, ...w], "mL"),
  }), "Chuẩn độ trung hòa", 120);
} });

// 10. Ankan: tìm n từ khối lượng mol
add({ key: "chem.organic.alkane_n", subject: "chemistry", topic: "Hóa hữu cơ", subtopic: "Ankan", difficulty: "easy", build(r) {
  const n = r.int(1, 12), Mw = 14 * n + 2;
  const w = pick3(String(n), [String(n + 1), String(n - 1), String(Math.round(Mw / 14)), String(n + 2), String(n * 2)].filter((x) => Number(x) > 0)); if (!w) return null;
  return make((l) => ({
    body: P(l, `Một ankan có khối lượng mol ${u(Mw, l, "g/mol")}. Số nguyên tử cacbon trong phân tử là`, `An alkane has molar mass ${u(Mw, l, "g/mol")}. The number of carbon atoms per molecule is`, `某烷烃的摩尔质量为 ${u(Mw, l, "g/mol")}，其分子中的碳原子数为`),
    steps: P(l, `Ankan ${M("\\text{C}_n\\text{H}_{2n+2}")}: ${M(`14n+2=${Mw}\\Rightarrow n=${n}`)}. `, `Alkane ${M("\\text{C}_n\\text{H}_{2n+2}")}: ${M(`14n+2=${Mw}\\Rightarrow n=${n}`)}. `, `烷烃 ${M("\\text{C}_n\\text{H}_{2n+2}")}：${M(`14n+2=${Mw}\\Rightarrow n=${n}`)}。`),
    opts: [String(n), ...w].map(M),
  }), "Công thức ankan", 50);
} });

// 11. Ankan: số liên kết σ
add({ key: "chem.organic.alkane_sigma", subject: "chemistry", topic: "Hóa hữu cơ", subtopic: "Liên kết trong ankan", difficulty: "medium", build(r) {
  const n = r.int(2, 10), s = 3 * n + 1;
  const w = pick3(String(s), [String(3 * n), String(3 * n + 2), String(2 * n + 1), String(4 * n), String(n - 1)]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Phân tử ankan ${M(`\\text{C}_{${n}}\\text{H}_{${2 * n + 2}}`)} có tổng số liên kết σ là`, `The alkane ${M(`\\text{C}_{${n}}\\text{H}_{${2 * n + 2}}`)} has how many σ bonds in total?`, `烷烃 ${M(`\\text{C}_{${n}}\\text{H}_{${2 * n + 2}}`)} 分子中 σ 键的总数为`),
    steps: P(l, `Có ${M(`${n - 1}`)} liên kết C–C và ${M(`${2 * n + 2}`)} liên kết C–H: ${M(`${n - 1}+${2 * n + 2}=${s}`)}. `, `${M(`${n - 1}`)} C–C bonds and ${M(`${2 * n + 2}`)} C–H bonds: ${M(`${n - 1}+${2 * n + 2}=${s}`)}. `, `C–C 键 ${M(`${n - 1}`)} 个，C–H 键 ${M(`${2 * n + 2}`)} 个，共 ${M(`${s}`)} 个。`),
    opts: [String(s), ...w].map(M),
  }), "Liên kết σ", 70);
} });

// 12. Đốt cháy ankan: thể tích O2
add({ key: "chem.organic.alkane_combustion", subject: "chemistry", topic: "Hóa hữu cơ", subtopic: "Phản ứng đốt cháy", difficulty: "hard", build(r) {
  const n = r.int(1, 5), V = r.pick([2, 4, 5, 10]), o2 = (V * (3 * n + 1)) / 2;
  const w = pickN(o2, [V * (3 * n + 1), (V * 3 * n) / 2, V * (2 * n + 1), V * n, (V * (3 * n + 1)) / 4]); if (!w) return null;
  return make((l) => ({
    body: P(l, `Đốt cháy hoàn toàn ${u(V, l, "L")} ankan ${M(`\\text{C}_{${n}}\\text{H}_{${2 * n + 2}}`)} (các khí đo cùng điều kiện). Thể tích ${M("\\text{O}_2")} cần dùng là`, `${u(V, l, "L")} of the alkane ${M(`\\text{C}_{${n}}\\text{H}_{${2 * n + 2}}`)} is burned completely (gases measured under the same conditions). The volume of ${M("\\text{O}_2")} required is`, `完全燃烧 ${u(V, l, "L")} 烷烃 ${M(`\\text{C}_{${n}}\\text{H}_{${2 * n + 2}}`)}（气体体积在相同条件下测定），需要 ${M("\\text{O}_2")} 的体积为`),
    steps: P(l, `${M(`\\text{C}_n\\text{H}_{2n+2}+\\dfrac{3n+1}{2}\\text{O}_2\\to n\\text{CO}_2+(n+1)\\text{H}_2\\text{O}`)}. ${M(`V_{O_2}=${V}\\cdot\\dfrac{3\\cdot${n}+1}{2}=${num(o2, l)}\\ \\text{L}`)}. `, `${M(`\\text{C}_n\\text{H}_{2n+2}+\\dfrac{3n+1}{2}\\text{O}_2\\to n\\text{CO}_2+(n+1)\\text{H}_2\\text{O}`)}. ${M(`V_{O_2}=${num(o2, l)}\\ \\text{L}`)}. `, `${M(`\\text{C}_n\\text{H}_{2n+2}+\\dfrac{3n+1}{2}\\text{O}_2\\to n\\text{CO}_2+(n+1)\\text{H}_2\\text{O}`)}，${M(`V_{O_2}=${num(o2, l)}\\ \\text{L}`)}。`) + mistakes(l, [[num(V * (3 * n + 1), l), "quên chia 2 ở hệ số O₂", "forgot the ½ in the O₂ coefficient", "漏了 O₂ 系数中的 1/2"]]),
    opts: opts(l, [o2, ...w], "L"),
  }), "Đốt cháy ankan", 110);
} });

export const CHEMISTRY_TEMPLATES = T;
void frm;
