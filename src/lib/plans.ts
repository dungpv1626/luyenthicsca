// Gói dịch vụ theo Chính sách giá (content/policies, trang /chinh-sach-gia). File thuần để test được bằng node --test.
// Giá và thời hạn PHẢI khớp chính sách đã công bố và tờ khai với Bộ Công Thương; đổi ở đây thì đổi cả hai nơi đó.
export type PlanKey = "free" | "co_ban" | "theo_mon" | "tron_bo" | "dong_hanh";
export type PaidPlan = Exclude<PlanKey, "free">;
export type PlanSubject = "math" | "physics" | "chemistry" | "chinese";

/** Phạm vi mở đề trả phí: basic = đề luyện cấp 1–2 mọi môn (không gồm đề mô phỏng);
 *  subject = mọi cấp và đề mô phỏng của một môn chọn khi mua (không gồm đề tổng hợp nhiều môn); full = mọi đề. */
export type Tier = "none" | "basic" | "subject" | "full";
/** Cấp đề cao nhất gói Cơ bản mở được (cấp theo lib/levels.ts). */
export const BASIC_MAX_LEVEL = 2;

export type PlanDef = {
  key: PlanKey; level: number; name: string; priceVnd: number;
  /** Thời hạn: số tháng (tính theo lịch) hoặc số ngày; free = không giới hạn. */
  months?: number; days?: number; durationLabel: string;
  tagline: string;
  tutorPerDay: number;          // lượt hỏi Gia sư AI mỗi ngày
  tier: Tier;
  forSale: boolean;
  featured?: boolean;
  features: { text: string; on: boolean }[];
};

export const PLANS: PlanDef[] = [
  { key: "free", level: 1, name: "Nền tảng", priceVnd: 0, durationLabel: "Không giới hạn", tagline: "Làm quen và thử sức", tutorPerDay: 5, tier: "none", forSale: false,
    features: [
      { text: "Quick Test, luyện tập theo chuyên đề", on: true },
      { text: "Đề cấp 1 Nền tảng và đề mô phỏng miễn phí", on: true },
      { text: "Gia sư AI: 5 lượt mỗi ngày", on: true },
      { text: "Đề cấp 2–4 và đề mô phỏng trả phí", on: false },
    ] },
  { key: "co_ban", level: 2, name: "Cơ bản", priceVnd: 39000, days: 30, durationLabel: "30 ngày", tagline: "Làm quen với đề trả phí trong một tháng", tutorPerDay: 20, tier: "basic", forSale: true,
    features: [
      { text: "Đề luyện cấp 1–2 của cả 4 môn, kể cả đề tổng hợp", on: true },
      { text: "Gia sư AI: 20 lượt mỗi ngày", on: true },
      { text: "Hiệu lực 30 ngày", on: true },
      { text: "Đề cấp 3–4 Nâng cao, Mô phỏng", on: false },
      { text: "Đề mô phỏng thi thật trả phí", on: false },
    ] },
  { key: "theo_mon", level: 3, name: "Gói theo môn", priceVnd: 290000, months: 3, durationLabel: "3 tháng", tagline: "Học sâu một môn đến đề thi thật", tutorPerDay: 150, tier: "subject", forSale: true,
    features: [
      { text: "Đề luyện cấp 1–4 của 1 môn chọn khi mua", on: true },
      { text: "Đề mô phỏng thi thật của môn đó", on: true },
      { text: "Gia sư AI: 150 lượt mỗi ngày", on: true },
      { text: "Hiệu lực 3 tháng", on: true },
      { text: "Các môn khác và đề tổng hợp 4 môn", on: false },
    ] },
  { key: "tron_bo", level: 4, name: "Gói trọn bộ", priceVnd: 690000, months: 3, durationLabel: "3 tháng", tagline: "Đủ cả 4 môn để về đích", tutorPerDay: 150, tier: "full", forSale: true, featured: true,
    features: [
      { text: "Đề luyện cấp 1–4 của cả 4 môn và đề tổng hợp", on: true },
      { text: "Đề mô phỏng thi thật của cả 4 môn", on: true },
      { text: "Gia sư AI: 150 lượt mỗi ngày", on: true },
      { text: "Hiệu lực 3 tháng", on: true },
    ] },
  { key: "dong_hanh", level: 5, name: "Gói đồng hành", priceVnd: 1990000, months: 12, durationLabel: "12 tháng", tagline: "Đồng hành cả năm ôn thi", tutorPerDay: 150, tier: "full", forSale: true,
    features: [
      { text: "Mọi quyền lợi của Gói trọn bộ, trong 12 tháng", on: true },
      { text: "Hỗ trợ ưu tiên qua Zalo 0705 537 538", on: true },
      { text: "Rẻ hơn mua 4 lần Gói trọn bộ (2.760.000đ)", on: true },
    ] },
];

export const planDef = (k: PlanKey) => PLANS.find((p) => p.key === k)!;
export const planLabel = (k: PlanKey, subject?: string | null, subjectName?: (s: string) => string) =>
  `Mức ${planDef(k).level} – ${planDef(k).name}${k === "theo_mon" && subject ? ` (${subjectName ? subjectName(subject) : subject})` : ""}`;
export const rank = (k: PlanKey) => planDef(k).level;
export const isPaidPlan = (k: unknown): k is PaidPlan => typeof k === "string" && k !== "free" && PLANS.some((p) => p.key === k);
export const PLAN_SUBJECTS: PlanSubject[] = ["math", "physics", "chemistry", "chinese"];
export const isPlanSubject = (s: unknown): s is PlanSubject => typeof s === "string" && (PLAN_SUBJECTS as string[]).includes(s);

/** Ngày hết hạn của một gói mua lúc `paidAt`: cộng tháng theo lịch (giữ ngày, lùi về cuối tháng nếu tháng đích ngắn hơn) hoặc cộng ngày. */
export function planEnd(plan: PaidPlan, paidAt: string | Date): Date {
  const d = new Date(paidAt), p = planDef(plan);
  if (p.days) return new Date(d.getTime() + p.days * 86400000);
  const r = new Date(d), day = d.getUTCDate();
  r.setUTCDate(1); r.setUTCMonth(r.getUTCMonth() + (p.months ?? 12));
  const last = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(day, last));
  return r;
}

export type PlanOrder = { plan: string | null; plan_subject?: string | null; status: string; paid_at: string | null };
export type Access = {
  /** Gói cao nhất đang hiệu lực (để hiển thị) và ngày hết hạn của nó. */
  plan: PlanKey; endsAt: string | null;
  /** Hạn mở mọi đề (Trọn bộ, Đồng hành), null = không có. */
  fullUntil: string | null;
  /** Hạn mở đề cấp 1–2 mọi môn (Cơ bản). */
  basicUntil: string | null;
  /** Hạn mở đề theo từng môn (Gói theo môn). */
  subjects: Partial<Record<PlanSubject, string>>;
  tutorPerDay: number;
};

/** Quyền truy cập suy ra từ các đơn đã thanh toán còn hạn. Đơn chưa thanh toán, đã hoàn tiền hoặc hết hạn không tính. */
export function accessFrom(orders: PlanOrder[], now = new Date()): Access {
  const a: Access = { plan: "free", endsAt: null, fullUntil: null, basicUntil: null, subjects: {}, tutorPerDay: planDef("free").tutorPerDay };
  const later = (x: string | null | undefined, y: string) => (!x || y > x ? y : x);
  for (const o of orders) {
    if (o.status !== "paid" || !o.paid_at || !isPaidPlan(o.plan)) continue;
    const end = planEnd(o.plan, o.paid_at);
    if (end <= now) continue;
    const iso = end.toISOString(), def = planDef(o.plan);
    if (def.tier === "full") a.fullUntil = later(a.fullUntil, iso);
    else if (def.tier === "basic") a.basicUntil = later(a.basicUntil, iso);
    else if (def.tier === "subject" && isPlanSubject(o.plan_subject)) a.subjects[o.plan_subject] = later(a.subjects[o.plan_subject], iso);
    else continue;
    a.tutorPerDay = Math.max(a.tutorPerDay, def.tutorPerDay);
    if (def.level > rank(a.plan)) { a.plan = o.plan; a.endsAt = iso; }
    else if (o.plan === a.plan) a.endsAt = later(a.endsAt, iso);
  }
  return a;
}

export type PaidTest = { scope?: string | null; subject?: string | null; level?: number | null; sim?: boolean | null };

/**
 * Đề trả phí mở được không:
 * - Trọn bộ / Đồng hành: mọi đề.
 * - Gói theo môn: mọi đề một môn (mọi cấp, kể cả đề mô phỏng) của đúng môn đó; không mở đề tổng hợp nhiều môn.
 * - Cơ bản: đề luyện cấp 1–2 mọi môn (kể cả tổng hợp); không mở đề mô phỏng và đề không gắn cấp.
 */
export function canOpenPaidTest(a: Access, t: PaidTest) {
  if (a.fullUntil) return true;
  if (t.scope === "subject" && isPlanSubject(t.subject) && a.subjects[t.subject]) return true;
  return !!a.basicUntil && !t.sim && typeof t.level === "number" && t.level <= BASIC_MAX_LEVEL;
}

/** Có gói trả phí nào đang hiệu lực không (để hiển thị trạng thái). */
export const hasPaidAccess = (a: Access) => !!(a.fullUntil || a.basicUntil || Object.keys(a.subjects).length);

export const daysLeft = (endsAt: string | null, now = new Date()) => (endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - now.getTime()) / 86400000)) : 0);

/** Các gói mở được một đề trả phí (để gợi ý ở đề đang khóa); suy ra từ canOpenPaidTest nên luôn khớp quy tắc thật. */
export function plansThatOpen(t: PaidTest): PaidPlan[] {
  const at = new Date().toISOString();
  return PLANS.filter((p): p is PlanDef & { key: PaidPlan } => p.key !== "free")
    .filter((p) => canOpenPaidTest(accessFrom([{ plan: p.key, plan_subject: isPlanSubject(t.subject) ? t.subject : "math", status: "paid", paid_at: at }]), t))
    .map((p) => p.key);
}
