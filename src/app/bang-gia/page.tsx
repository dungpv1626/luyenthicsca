import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { getMe } from "@/lib/auth";
import { getPlan } from "@/lib/entitlement";
import { PLANS, daysLeft, planDef, rank, type PlanDef } from "@/lib/plans";
import { money } from "@/lib/constants";
import { buyPlanAction } from "../order-actions";

export const metadata = { title: "Bảng giá các gói", description: "Gói Free, Starter và Pro cho ôn thi CSCA: mở toàn bộ đề và Gia sư AI. Thanh toán theo năm." };

function Cta({ p, current, loggedIn }: { p: PlanDef; current: PlanDef | null; loggedIn: boolean }) {
  if (p.key === current?.key) return <span className="btn-outline w-full justify-center !cursor-default">Gói hiện tại</span>;
  if (p.key === "free") return loggedIn ? null : <Link href="/dang-ky" className="btn-outline w-full justify-center">Đăng ký miễn phí</Link>;
  if (p.key === "max") return <span className="btn-outline w-full justify-center !cursor-default">Sắp ra mắt</span>;
  if (current && rank(current.key) > rank(p.key)) return <span className="text-center text-sm text-muted">Bạn đang dùng gói cao hơn</span>;
  return (
    <form action={buyPlanAction.bind(null, p.key)}>
      <SubmitButton className={`${p.featured ? "btn" : "btn-outline"} w-full justify-center`} pendingText="Đang tạo đơn…">{loggedIn ? `Chọn gói ${p.name}` : `Đăng nhập để chọn ${p.name}`}</SubmitButton>
    </form>
  );
}

export default async function Page() {
  const me = await getMe();
  const { plan, endsAt } = await getPlan(me?.id);
  const cur = me ? planDef(plan) : null;
  return (
    <div className="space-y-6">
      <PageHeader en="Pricing" vi="Bảng giá các gói">Trả một lần cho cả năm, mở toàn bộ đề và dùng Gia sư AI. Không còn mua đề lẻ. Gói Pro dành cho bạn muốn hỏi AI thoải mái mỗi ngày.</PageHeader>
      {me && plan !== "free" && (
        <p className="rounded-2xl bg-success-bg p-4 text-sm font-medium text-success">Bạn đang dùng gói <b>{cur?.name}</b>, còn {daysLeft(endsAt)} ngày.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <section key={p.key} aria-labelledby={`plan-${p.key}`} className={`card flex flex-col !p-5 ${p.featured ? "border-2 border-brand shadow-soft" : ""} ${p.key === "max" ? "opacity-90" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 id={`plan-${p.key}`} className="text-xl font-extrabold text-navy">{p.name}</h2>
              {p.featured && <span className="chip">Được chọn nhiều nhất</span>}
              {p.key === "max" && <span className="chip !bg-slate-100 !text-muted">Sắp ra mắt</span>}
            </div>
            <p className="mt-1 text-sm text-muted">{p.tagline}</p>
            <p className="mt-4 text-3xl font-black text-navy">{p.priceVnd ? money(p.priceVnd) : "0đ"}<span className="ml-1 text-sm font-medium text-muted">{p.priceVnd ? "/ năm" : ""}</span></p>
            {p.priceVnd > 0 && <p className="text-xs text-muted">Khoảng {money(Math.round(p.priceVnd / 12 / 1000) * 1000)} mỗi tháng</p>}
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f.text} className={`flex items-start gap-2 ${f.on ? "text-slate-700" : "text-muted line-through"}`}>
                  <Icon name={f.on ? "check" : "x"} className={`mt-0.5 h-4 w-4 shrink-0 ${f.on ? "text-success" : "text-muted"}`} /><span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5"><Cta p={p} current={cur} loggedIn={!!me} /></div>
          </section>
        ))}
      </div>
      <div className="card !p-5 text-sm text-slate-600">
        <h2 className="font-extrabold text-navy">Câu hỏi thường gặp</h2>
        <dl className="mt-3 space-y-3">
          <div><dt className="font-semibold text-ink">Thanh toán thế nào?</dt><dd>Chuyển khoản qua mã VietQR. Hệ thống tự mở khóa khi nhận được tiền, thường trong vài phút.</dd></div>
          <div><dt className="font-semibold text-ink">Gói có hiệu lực bao lâu?</dt><dd>12 tháng kể từ ngày thanh toán. Hết hạn bạn quay lại trang này để gia hạn.</dd></div>
          <div><dt className="font-semibold text-ink">Số lượt hỏi Gia sư AI tính thế nào?</dt><dd>Mỗi câu hỏi là một lượt. Số lượt được làm mới mỗi ngày theo giờ Việt Nam.</dd></div>
          <div><dt className="font-semibold text-ink">Gói Max gồm gì?</dt><dd>Mọi quyền lợi của Pro, cộng video bài giảng và ping mentor (người hướng dẫn thật). Gói này chưa mở bán.</dd></div>
        </dl>
      </div>
    </div>
  );
}
