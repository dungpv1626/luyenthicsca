import { notFound } from "next/navigation";
import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { vietQrUrl } from "@/lib/vietqr";
import { vnd } from "@/lib/constants";

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const me = await requireMe(`/thanh-toan/${orderId}`);
  const { data: o } = await adminDb().from("orders").select("*, tests(title)").eq("id", orderId).eq("user_id", me.id).single();
  if (!o) notFound();
  const paid = o.status === "paid";

  return (
    <div className="card mx-auto max-w-md space-y-3 text-center">
      <h1 className="text-xl font-bold">Thanh toán đơn hàng</h1>
      <p>{(o.tests as { title: string } | null)?.title}</p>
      <p className="text-3xl font-extrabold text-brand">{vnd(o.amount_vnd)}</p>
      {paid ? (
        <>
          <p className="rounded bg-green-50 p-3 font-medium text-green-700">Đã thanh toán – đề thi đã được mở khóa.</p>
          <Link href={`/thi-thu/${o.test_id}`} className="btn">Làm bài ngay</Link>
        </>
      ) : o.status === "pending" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vietQrUrl(o.amount_vnd, o.code)} alt="Mã VietQR" className="mx-auto w-64" />
          <p className="text-sm">Quét mã QR hoặc chuyển khoản với nội dung chính xác:</p>
          <p className="rounded bg-stone-100 p-2 font-mono text-lg font-bold">{o.code}</p>
          <p className="text-sm text-stone-500">Hệ thống tự mở đề sau khi nhận được tiền (thường trong vài phút). Tải lại trang để kiểm tra.</p>
        </>
      ) : (
        <p className="text-stone-500">Đơn hàng đã {o.status === "cancelled" ? "bị hủy" : "được hoàn tiền"}.</p>
      )}
    </div>
  );
}
