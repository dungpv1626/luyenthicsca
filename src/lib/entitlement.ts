import { adminDb } from "./supabase/admin";
import { activePlan, type PlanKey } from "./plans";

/** Gói đang hiệu lực của học viên (suy ra từ đơn đã thanh toán, xem migration 0017). */
export async function getPlan(userId: string | undefined): Promise<{ plan: PlanKey; endsAt: string | null }> {
  if (!userId) return { plan: "free", endsAt: null };
  const { data } = await adminDb().from("orders").select("plan, status, paid_at").eq("user_id", userId).not("plan", "is", null).eq("status", "paid");
  return activePlan(data ?? []);
}
