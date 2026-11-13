// Gói đăng ký theo năm. File thuần để test được bằng node --test.
export type PlanKey = "free" | "starter" | "pro" | "max";
export type PaidPlan = Exclude<PlanKey, "free">;

export type PlanDef = {
  key: PlanKey; name: string; priceVnd: number; tagline: string;
  tutorPerDay: number;          // lượt hỏi Gia sư AI mỗi ngày
  forSale: boolean;             // false = chỉ hiện "sắp ra mắt"
  featured?: boolean;
  features: { text: string; on: boolean }[];
};

export const PLAN_DAYS = 365;

export const PLANS: PlanDef[] = [
  { key: "free", name: "Free", priceVnd: 0, tagline: "Làm quen và thử sức", tutorPerDay: 5, forSale: false,
    features: [
      { text: "Quick Test, luyện theo chuyên đề cơ bản", on: true },
      { text: "Đề Mức 1 Nền tảng và đề mô phỏng miễn phí", on: true },
      { text: "Gia sư AI: 5 lượt mỗi ngày", on: true },
      { text: "Mở toàn bộ đề theo Mức và đề mô phỏng", on: false },
      { text: "Cộng đồng hỗ trợ", on: false },
    ] },
  { key: "starter", name: "Starter", priceVnd: 299000, tagline: "Đủ đề để ôn đều mỗi ngày", tutorPerDay: 20, forSale: true,
    features: [
      { text: "Mở toàn bộ đề: Mức 1–4 và đề mô phỏng", on: true },
      { text: "Gia sư AI: 20 lượt mỗi ngày", on: true },
      { text: "Cộng đồng hỗ trợ", on: true },
      { text: "Hiệu lực 12 tháng", on: true },
    ] },
  { key: "pro", name: "Pro", priceVnd: 699000, tagline: "Học sâu, hỏi thoải mái", tutorPerDay: 150, forSale: true, featured: true,
    features: [
      { text: "Mở toàn bộ đề: Mức 1–4 và đề mô phỏng", on: true },
      { text: "Gia sư AI: 150 lượt mỗi ngày, gấp 7 lần Starter", on: true },
      { text: "Cộng đồng hỗ trợ", on: true },
      { text: "Hiệu lực 12 tháng", on: true },
    ] },
  { key: "max", name: "Max", priceVnd: 899000, tagline: "Có người đồng hành", tutorPerDay: 150, forSale: false,
    features: [
      { text: "Mọi quyền lợi của Pro", on: true },
      { text: "Video bài giảng", on: true },
      { text: "Ping mentor: nhắn trực tiếp người hướng dẫn thật", on: true },
      { text: "Hiệu lực 12 tháng", on: true },
    ] },
];

export const planDef = (k: PlanKey) => PLANS.find((p) => p.key === k)!;
const RANK: Record<PlanKey, number> = { free: 0, starter: 1, pro: 2, max: 3 };
export const rank = (k: PlanKey) => RANK[k];
export const isPaidPlan = (k: string): k is PaidPlan => k === "starter" || k === "pro" || k === "max";

export type PlanOrder = { plan: string | null; status: string; paid_at: string | null };

/** Gói đang hiệu lực của người dùng: lấy gói cao nhất còn hạn; hết hạn chung là mốc muộn nhất của gói đó. */
export function activePlan(orders: PlanOrder[], now = new Date()): { plan: PlanKey; endsAt: string | null } {
  let best: PlanKey = "free", ends: number | null = null;
  for (const o of orders) {
    if (!o.plan || o.status !== "paid" || !o.paid_at || !isPaidPlan(o.plan)) continue;
    const end = Date.parse(o.paid_at) + PLAN_DAYS * 86400000;
    if (end <= now.getTime()) continue;
    if (RANK[o.plan] > RANK[best]) { best = o.plan; ends = end; }
    else if (o.plan === best && (ends === null || end > ends)) ends = end;
  }
  return { plan: best, endsAt: ends === null ? null : new Date(ends).toISOString() };
}

export const daysLeft = (endsAt: string | null, now = new Date()) => (endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - now.getTime()) / 86400000)) : 0);
