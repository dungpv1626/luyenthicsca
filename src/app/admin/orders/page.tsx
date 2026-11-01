import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { vnd } from "@/lib/constants";
import { confirmOrder, setOrderStatus } from "../actions";

export default async function Page() {
  await requireAdmin("orders");
  const { data } = await adminDb().from("orders").select("id, code, amount_vnd, status, created_at, tests(title), profiles(full_name)").order("created_at", { ascending: false }).limit(200);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Đơn hàng</h1>
      <div className="card divide-y p-0">
        {data?.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <div className="flex-1"><p className="font-medium">{(o.tests as unknown as { title: string } | null)?.title} <span className="font-mono text-stone-400">{o.code}</span></p><p className="text-stone-500">{(o.profiles as unknown as { full_name: string } | null)?.full_name} · {new Date(o.created_at).toLocaleString("vi-VN")}</p></div>
            <b>{vnd(o.amount_vnd)}</b>
            <span className="rounded bg-stone-100 px-2 py-0.5">{o.status}</span>
            {o.status === "pending" && <><form action={confirmOrder.bind(null, o.id)}><button className="text-green-700 hover:underline">Xác nhận đã thu</button></form><form action={setOrderStatus.bind(null, o.id, "cancelled")}><button className="text-red-700 hover:underline">Hủy</button></form></>}
            {o.status === "paid" && <form action={setOrderStatus.bind(null, o.id, "refunded")}><button className="text-red-700 hover:underline">Hoàn tiền</button></form>}
          </div>
        ))}
        {!data?.length && <p className="p-4 text-stone-500">Chưa có đơn hàng.</p>}
      </div>
    </div>
  );
}
