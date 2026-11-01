import { adminDb } from "./supabase/admin";

export async function markOrderPaid(match: { id?: string; code?: string }) {
  let q = adminDb().from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("status", "pending");
  if (match.id) q = q.eq("id", match.id);
  if (match.code) q = q.eq("code", match.code);
  const { data } = await q.select("id");
  return data?.length ?? 0;
}

export function newOrderCode() {
  return "LTC" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
