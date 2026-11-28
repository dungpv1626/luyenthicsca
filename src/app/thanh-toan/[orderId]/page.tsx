import { notFound } from "next/navigation";
import Link from "next/link";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { vietQrUrl } from "@/lib/vietqr";
import { SUBJECTS, vnd, type Subject } from "@/lib/constants";
import { planDef, isPaidPlan, planLabel } from "@/lib/plans";
import { BANK, COMPANY } from "@/lib/company";

export const metadata = { title: "Thanh toán" };

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const me = await requireMe(`/thanh-toan/${orderId}`);
  const { data: o } = await adminDb().from("orders").select("*, tests(title), courses(title)").eq("id", orderId).eq("user_id", me.id).single();
  if (!o) notFound();
  const paid = o.status === "paid";
  const title = o.plan && isPaidPlan(o.plan)
    ? `${planLabel(o.plan, o.plan_subject, (s) => SUBJECTS[s as Subject]?.split(" (")[0] ?? s)} · ${planDef(o.plan).durationLabel}`
    : ((o.tests as { title: string } | null)?.title ?? (o.courses as { title: string } | null)?.title);
  const row = (k: string, v: React.ReactNode) => <div className="flex justify-between gap-3 py-1.5"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>;

  return (
    <div className="card mx-auto max-w-md space-y-3 text-center">
      <h1 className="work-title">Thanh toán đơn hàng</h1>
      <p>{title}</p>
      <p className="text-3xl font-extrabold text-brand-text">{vnd(o.amount_vnd)}</p>
      <p className="text-xs text-muted">Giá đã bao gồm VAT. Xem <Link href="/chinh-sach-gia" className="underline">Chính sách giá</Link> và <Link href="/chinh-sach-hoan-tien" className="underline">Chính sách hoàn tiền</Link>.</p>
      {paid ? (
        <>
          <p className="rounded bg-success-bg p-3 font-medium text-success">Đã thanh toán – nội dung đã được mở khóa.</p>
          <Link href={o.plan ? "/thi-thu" : o.course_id ? `/academy/${o.course_id}` : `/thi-thu/${o.test_id}`} className="btn">{o.plan ? "Vào làm đề ngay" : o.course_id ? "Vào học ngay" : "Làm bài ngay"}</Link>
        </>
      ) : o.status === "pending" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vietQrUrl(o.amount_vnd, o.code)} alt="Mã VietQR chuyển khoản" className="mx-auto w-64" />
          <p className="text-sm">Quét mã QR, hoặc chuyển khoản thủ công theo thông tin dưới đây:</p>
          <dl className="divide-y divide-slate-100 rounded-xl bg-mist px-4 py-1 text-left text-sm">
            {row("Ngân hàng", BANK.bankName)}
            {row("Số tài khoản", <span className="font-mono">{BANK.accountNo}</span>)}
            {row("Chủ tài khoản", BANK.accountName)}
            {row("Số tiền", vnd(o.amount_vnd))}
            {row("Nội dung chuyển khoản", <span className="font-mono text-base font-bold text-brand-text">{o.code}</span>)}
          </dl>
          <p className="text-sm text-muted">Ghi đúng nội dung <b className="font-mono">{o.code}</b> để hệ thống tự mở khóa (thường trong vài phút; tối đa 24 giờ nếu cần xác nhận thủ công). Tải lại trang để kiểm tra.</p>
          <p className="text-xs text-muted">Đã chuyển khoản mà chưa được mở khóa? Gọi hoặc nhắn Zalo <a href={`tel:${COMPANY.phoneHref}`} className="font-semibold">{COMPANY.phone}</a> ({COMPANY.hours}), kèm mã đơn.</p>
        </>
      ) : (
        <p className="text-muted">Đơn hàng đã {o.status === "cancelled" ? "bị hủy" : "được hoàn tiền"}.</p>
      )}
    </div>
  );
}
