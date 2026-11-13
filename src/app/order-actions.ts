"use server";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { newOrderCode } from "@/lib/orders";
import { planDef, isPaidPlan } from "@/lib/plans";

export async function buyTestAction(testId: string) {
  const me = await requireMe(`/thi-thu/${testId}`);
  const db = adminDb();
  const { data: test } = await db.from("tests").select("id, price_vnd").eq("id", testId).eq("is_published", true).single();
  if (!test || test.price_vnd === 0) redirect(`/thi-thu/${testId}`);

  const { data: existing } = await db.from("orders").select("id").eq("user_id", me.id).eq("test_id", testId).eq("status", "pending").limit(1);
  if (existing?.[0]) redirect(`/thanh-toan/${existing[0].id}`);

  const { data, error } = await db.from("orders").insert({ code: newOrderCode(), user_id: me.id, test_id: testId, amount_vnd: test.price_vnd }).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/thanh-toan/${data.id}`);
}

/** Mua gói đăng ký theo năm. Gói chưa mở bán (Max) không tạo được đơn. */
export async function buyPlanAction(plan: string) {
  const me = await requireMe("/bang-gia");
  if (!isPaidPlan(plan) || !planDef(plan).forSale) redirect("/bang-gia");
  const db = adminDb();
  const { data: existing } = await db.from("orders").select("id").eq("user_id", me.id).eq("plan", plan).eq("status", "pending").limit(1);
  if (existing?.[0]) redirect(`/thanh-toan/${existing[0].id}`);
  const { data, error } = await db.from("orders").insert({ code: newOrderCode(), user_id: me.id, plan, amount_vnd: planDef(plan).priceVnd }).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/thanh-toan/${data.id}`);
}
