import Link from "next/link";
import { getMe } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Không có quyền truy cập", robots: { index: false, follow: false } };

const AREA: Record<string, string> = {
  questions: "câu hỏi và khuôn câu hỏi", tests: "đề thi", orders: "đơn hàng", users: "người dùng", schools: "trường và học bổng",
  academy: "khóa học", leads: "tư vấn", analytics: "phân tích", content: "blog SEO", dashboard: "khu quản trị",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area = "" } = await searchParams;
  const me = await getMe();
  const staff = !!me && me.role !== "student";
  return (
    <div className="mx-auto max-w-lg py-14 text-center">
      <p className="text-6xl" aria-hidden="true">🔒</p>
      <h1 className="mt-3 text-2xl font-extrabold text-navy">Bạn không có quyền vào mục này</h1>
      <p className="mt-2 text-slate-600">
        {me ? <>Tài khoản của bạn đang có vai trò <b>{ROLES[me.role]}</b>{AREA[area] ? <>, chưa được phép quản lý <b>{AREA[area]}</b></> : null}.</> : "Bạn cần đăng nhập bằng tài khoản có quyền phù hợp."}
        {" "}Nếu bạn cần quyền này, hãy liên hệ Quản trị cấp cao để được đổi vai trò.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {staff ? <Link href="/admin" className="btn">Về khu quản trị</Link> : null}
        <Link href={me ? "/dashboard" : "/dang-nhap"} className={staff ? "btn-outline" : "btn"}>{me ? "Về trang học viên" : "Đăng nhập"}</Link>
      </div>
    </div>
  );
}
