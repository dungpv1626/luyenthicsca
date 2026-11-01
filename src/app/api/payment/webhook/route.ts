import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminDb } from "@/lib/supabase/admin";
import { markOrderPaid } from "@/lib/orders";

/**
 * Webhook xác nhận chuyển khoản tự động (định dạng tương thích SePay):
 * Header: Authorization: Apikey <PAYMENT_WEBHOOK_KEY>
 * Body: { content: "... LTCABC123 ...", transferAmount: 49000, transferType: "in" }
 */
export async function POST(req: Request) {
  const key = process.env.PAYMENT_WEBHOOK_KEY;
  const got = (req.headers.get("authorization") ?? "").replace(/^Apikey\s+/i, "");
  if (!key || got.length !== key.length || !timingSafeEqual(Buffer.from(got), Buffer.from(key))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const content = String(body?.content ?? "").toUpperCase();
  const amount = Number(body?.transferAmount ?? 0);
  const code = content.match(/LTC[A-Z0-9]{6}/)?.[0];
  if (!code || body?.transferType === "out") return NextResponse.json({ ok: true, matched: false });

  const { data: order } = await adminDb().from("orders").select("amount_vnd").eq("code", code).eq("status", "pending").single();
  // Chỉ xác nhận khi số tiền đủ
  if (!order || amount < order.amount_vnd) return NextResponse.json({ ok: true, matched: false });
  await markOrderPaid({ code });
  return NextResponse.json({ ok: true, matched: true });
}
