import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { vnd } from "@/lib/constants";
import { planDef, type PaidPlan } from "@/lib/plans";
import { confirmOrder, setOrderStatus } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const metadata = { title: "Đơn hàng – Quản trị" };

export default async function Page() {
  await requireAdmin("orders");
  const { data } = await adminDb().from("orders").select("id, code, plan, amount_vnd, status, created_at, tests(title), courses(title), profiles(full_name)").order("created_at", { ascending: false }).limit(200);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Đơn hàng</h1>
      <div className="card divide-y p-0">
        {data?.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <div className="flex-1"><p className="font-medium">{o.plan ? `Gói ${planDef(o.plan as PaidPlan).name} (1 năm)` : (o.tests as unknown as { title: string } | null)?.title ?? (o.courses as unknown as { title: string } | null)?.title} <span className="font-mono text-muted">{o.code}</span></p><p className="text-muted">{(o.profiles as unknown as { full_name: string } | null)?.full_name} · {new Date(o.created_at).toLocaleString("vi-VN")}</p></div>
            <b>{vnd(o.amount_vnd)}</b>
            <span className="rounded bg-slate-100 px-2 py-0.5">{({ pending: "Chờ thanh toán", paid: "Đã thu", cancelled: "Đã hủy", refunded: "Đã hoàn" } as Record<string, string>)[o.status] ?? o.status}</span>
            {o.status === "pending" && <><form action={confirmOrder.bind(null, o.id)}><ConfirmButton className="inline-flex min-h-[2.5rem] items-center rounded-lg px-3 font-semibold text-success hover:bg-green-50" title="Xác nhận đã thu tiền?" message={`Đơn ${o.code} (${vnd(o.amount_vnd)}) sẽ chuyển sang “Đã thu” và học viên được mở quyền truy cập ngay. Chỉ xác nhận khi tiền đã vào tài khoản.`} confirmText="Đã nhận tiền">Xác nhận đã thu</ConfirmButton></form><form action={setOrderStatus.bind(null, o.id, "cancelled")}><ConfirmButton danger className="inline-flex min-h-[2.5rem] items-center rounded-lg px-3 font-semibold text-danger hover:bg-danger-bg" title="Hủy đơn hàng?" message={`Đơn ${o.code} sẽ bị hủy. Nếu học viên đã chuyển khoản thì đây không phải việc hoàn tiền.`} confirmText="Hủy đơn">Hủy</ConfirmButton></form></>}
            {o.status === "paid" && <form action={setOrderStatus.bind(null, o.id, "refunded")}><ConfirmButton danger className="inline-flex min-h-[2.5rem] items-center rounded-lg px-3 font-semibold text-danger hover:bg-danger-bg" title="Hoàn tiền đơn hàng?" message={`Đơn ${o.code} (${vnd(o.amount_vnd)}) sẽ chuyển sang “Đã hoàn” và học viên mất quyền truy cập. Hệ thống KHÔNG tự chuyển tiền lại: bạn phải hoàn tiền thủ công cho học viên.`} confirmText="Đã hoàn tiền">Hoàn tiền</ConfirmButton></form>}
          </div>
        ))}
        {!data?.length && <p className="p-4 text-muted">Chưa có đơn hàng.</p>}
      </div>
    </div>
  );
}
