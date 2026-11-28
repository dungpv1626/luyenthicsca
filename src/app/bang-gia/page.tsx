import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { getMe } from "@/lib/auth";
import { getAccess } from "@/lib/entitlement";
import { PLANS, PLAN_SUBJECTS, daysLeft, hasPaidAccess, planDef, type PlanDef } from "@/lib/plans";
import { SUBJECTS, money } from "@/lib/constants";
import { buyPlanAction } from "../order-actions";

export const metadata = { title: "Bảng giá các gói", description: "Bảng giá gói luyện thi CSCA: Nền tảng miễn phí, Cơ bản 39.000đ, Gói theo môn 290.000đ, Gói trọn bộ 690.000đ, Gói đồng hành 1.990.000đ. Giá đã bao gồm VAT." };

const subjectName = (s: string) => SUBJECTS[s as keyof typeof SUBJECTS]?.split(" (")[0] ?? s;

function Cta({ p, loggedIn }: { p: PlanDef; loggedIn: boolean }) {
  if (p.key === "free") return loggedIn ? <span className="btn-outline w-full justify-center !cursor-default">Đang dùng</span> : <Link href="/dang-ky" className="btn-outline w-full justify-center">Đăng ký miễn phí</Link>;
  const label = loggedIn ? `Mua ${p.name}` : `Đăng nhập để mua`;
  return (
    <form action={buyPlanAction.bind(null, p.key)} className="space-y-2">
      {p.key === "theo_mon" && (
        <div>
          <label htmlFor="plan-subject" className="label">Chọn môn</label>
          <select id="plan-subject" name="subject" required defaultValue="" className="input">
            <option value="" disabled>— Chọn một môn —</option>
            {PLAN_SUBJECTS.map((s) => <option key={s} value={s}>{subjectName(s)}</option>)}
          </select>
        </div>
      )}
      <SubmitButton className={`${p.featured ? "btn" : "btn-outline"} w-full justify-center`} pendingText="Đang tạo đơn…">{label}</SubmitButton>
    </form>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const me = await getMe();
  const acc = await getAccess(me?.id);
  const ownSubjects = Object.entries(acc.subjects);
  return (
    <div className="space-y-6">
      <PageHeader en="Pricing" vi="Bảng giá các gói">Chọn gói theo thời gian ôn thi của bạn. Giá niêm yết bằng VNĐ, <b>đã bao gồm VAT</b>, không phát sinh phí ẩn; tổng tiền hiển thị trước khi thanh toán.</PageHeader>
      {error === "subject" && <p role="alert" className="rounded-2xl bg-danger-bg p-4 text-sm font-medium text-danger">Gói theo môn cần chọn một môn trước khi mua.</p>}
      {me && hasPaidAccess(acc) && (
        <div className="rounded-2xl bg-success-bg p-4 text-sm font-medium text-success">
          <p>Gói cao nhất đang dùng: <b>Mức {planDef(acc.plan).level} – {planDef(acc.plan).name}</b>.</p>
          {acc.fullUntil && <p>Mở mọi đề (Trọn bộ / Đồng hành): còn {daysLeft(acc.fullUntil)} ngày.</p>}
          {acc.basicUntil && <p>Đề cấp 1–2 mọi môn (Cơ bản): còn {daysLeft(acc.basicUntil)} ngày.</p>}
          {ownSubjects.map(([s, end]) => <p key={s}>Gói theo môn {subjectName(s)}: còn {daysLeft(end ?? null)} ngày.</p>)}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {PLANS.map((p) => (
          <section key={p.key} id={`plan-${p.key}`} aria-labelledby={`plan-h-${p.key}`} className={`card flex flex-col !p-5 ${p.featured ? "border-2 border-brand shadow-soft" : ""}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-text">Mức {p.level}</p>
            <div className="flex items-center justify-between gap-2">
              <h2 id={`plan-h-${p.key}`} className="text-xl font-extrabold text-navy">{p.name}</h2>
              {p.featured && <span className="chip">Chọn nhiều</span>}
            </div>
            <p className="mt-1 text-sm text-muted">{p.tagline}</p>
            <p className="mt-4 text-3xl font-black text-navy">{p.priceVnd ? money(p.priceVnd) : "Miễn phí"}</p>
            <p className="text-xs text-muted">{p.priceVnd ? `Thời hạn ${p.durationLabel} · đã gồm VAT` : "Không giới hạn thời gian"}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f.text} className={`flex items-start gap-2 ${f.on ? "text-slate-700" : "text-muted line-through"}`}>
                  <Icon name={f.on ? "check" : "x"} className={`mt-0.5 h-4 w-4 shrink-0 ${f.on ? "text-success" : "text-muted"}`} /><span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5"><Cta p={p} loggedIn={!!me} /></div>
          </section>
        ))}
      </div>
      <div className="card !p-5 text-sm text-slate-600">
        <h2 className="font-extrabold text-navy">Câu hỏi thường gặp</h2>
        <dl className="mt-3 space-y-3">
          <div><dt className="font-semibold text-ink">Thanh toán thế nào?</dt><dd>Chuyển khoản ngân hàng qua mã VietQR hoặc chuyển thủ công tới tài khoản của Công ty TNHH NovaPath Global (MBBANK). Gói được kích hoạt tự động khi nhận được tiền, chậm nhất 24 giờ nếu cần xác nhận thủ công. Xem <Link href="/chinh-sach-thanh-toan" className="font-semibold text-brand-text hover:underline">Chính sách thanh toán</Link>.</dd></div>
          <div><dt className="font-semibold text-ink">Gói có hiệu lực bao lâu?</dt><dd>Tính từ ngày thanh toán: Cơ bản 30 ngày, Gói theo môn và Gói trọn bộ 3 tháng, Gói đồng hành 12 tháng. Mua thêm gói khác khi còn hạn thì quyền lợi được cộng dồn, ví dụ Gói theo môn Vật lý cộng Cơ bản mở mọi đề Vật lý và đề cấp 1–2 các môn khác.</dd></div>
          <div><dt className="font-semibold text-ink">Các gói khác nhau thế nào?</dt><dd>Đề luyện chia 4 cấp: cấp 1 Nền tảng miễn phí; cấp 2 Cơ bản; cấp 3 Nâng cao; cấp 4 Mô phỏng thi. <b>Cơ bản</b> mở cấp 1–2 của cả 4 môn. <b>Gói theo môn</b> mở cả 4 cấp và đề mô phỏng thi thật của một môn. <b>Trọn bộ</b> và <b>Đồng hành</b> mở tất cả, kể cả đề tổng hợp 4 môn.</dd></div>
          <div><dt className="font-semibold text-ink">Số lượt hỏi Gia sư AI tính thế nào?</dt><dd>Mỗi câu hỏi là một lượt. Số lượt được làm mới mỗi ngày theo giờ Việt Nam.</dd></div>
          <div><dt className="font-semibold text-ink">Có được hoàn tiền không?</dt><dd>Hoàn 100% nếu yêu cầu trong 07 ngày kể từ ngày thanh toán và chưa sử dụng dịch vụ, hoặc khi thanh toán trùng, lỗi hệ thống. Chi tiết tại <Link href="/chinh-sach-hoan-tien" className="font-semibold text-brand-text hover:underline">Chính sách chấm dứt dịch vụ và hoàn tiền</Link>.</dd></div>
        </dl>
      </div>
    </div>
  );
}
