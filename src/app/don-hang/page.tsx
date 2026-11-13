import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { vnd } from "@/lib/constants";

const ST = { pending: "Chờ thanh toán", paid: "Đã thanh toán", cancelled: "Đã hủy", refunded: "Đã hoàn tiền" } as const;

export const metadata = { title: "Đơn hàng của tôi" };

export default async function Page() {
  const me = await requireMe("/don-hang");
  const { data } = await adminDb().from("orders").select("id, code, amount_vnd, status, created_at, tests(title), courses(title)").eq("user_id", me.id).order("created_at", { ascending: false });
  return (
    <div className="space-y-4">
      <h1 className="work-title">Đơn hàng</h1>
      {!data?.length && <p className="text-muted">Bạn chưa có đơn hàng nào.</p>}
      {data?.map((o) => (
        <Link key={o.id} href={`/thanh-toan/${o.id}`} className="card flex items-center justify-between hover:border-brand">
          <div><p className="font-semibold">{(o.tests as unknown as { title: string } | null)?.title ?? (o.courses as unknown as { title: string } | null)?.title}</p><p className="text-sm text-muted">{o.code} · {new Date(o.created_at).toLocaleDateString("vi-VN")}</p></div>
          <div className="text-right"><p className="font-bold">{vnd(o.amount_vnd)}</p><p className="text-sm">{ST[o.status as keyof typeof ST]}</p></div>
        </Link>
      ))}
    </div>
  );
}
