import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PasswordForm } from "@/components/PasswordForm";
import { changePassword } from "../../password-actions";

export const metadata = { title: "Đổi mật khẩu – Quản trị" };

/** Đổi mật khẩu cho nhân viên, nằm trong khung quản trị (không phải chuyển sang giao diện học viên). */
export default async function Page() {
  const me = await requireAdmin("dashboard");
  return (
    <div className="py-4">
      <PasswordForm title="Đổi mật khẩu" intro={`Tài khoản ${me.email}. Nhập mật khẩu hiện tại và mật khẩu mới. Sau khi đổi, các thiết bị khác đang đăng nhập tài khoản này sẽ bị đăng xuất.`}
        fields={[{ name: "current", label: "Mật khẩu hiện tại", autoComplete: "current-password" }, { name: "password", label: "Mật khẩu mới (tối thiểu 8 ký tự)", autoComplete: "new-password" }, { name: "confirm", label: "Nhập lại mật khẩu mới", autoComplete: "new-password" }]}
        action={changePassword} submit="Đổi mật khẩu"
        footer={<Link href="/admin" className="inline-block py-2.5 font-semibold text-brand-text hover:underline">← Về trang quản trị</Link>} />
    </div>
  );
}
