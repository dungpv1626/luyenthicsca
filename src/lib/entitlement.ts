import { adminDb } from "./supabase/admin";
import { accessFrom, type Access } from "./plans";

/** Quyền của học viên suy ra từ các đơn mua gói đã thanh toán (xem migration 0018). */
export async function getAccess(userId: string | undefined): Promise<Access> {
  if (!userId) return accessFrom([]);
  const { data } = await adminDb().from("orders").select("plan, plan_subject, status, paid_at").eq("user_id", userId).not("plan", "is", null).eq("status", "paid");
  return accessFrom(data ?? []);
}
