import Link from "next/link";
import { redirect } from "next/navigation";
import { isStaff, requireMe } from "@/lib/auth";
import { PasswordForm } from "@/components/PasswordForm";
import { changePassword } from "../password-actions";

export const metadata = { title: "Đổi mật khẩu" };

export default async function Page() {
  const me = await requireMe("/doi-mat-khau");
  if (isStaff(me.role)) redirect("/admin/doi-mat-khau"); // nhân viên đổi mật khẩu trong khu quản trị
  return (
    <PasswordForm title="Đổi mật khẩu" intro="Nhập mật khẩu hiện tại và mật khẩu mới. Sau khi đổi, các thiết bị khác sẽ bị đăng xuất."
      fields={[{ name: "current", label: "Mật khẩu hiện tại", autoComplete: "current-password" }, { name: "password", label: "Mật khẩu mới (tối thiểu 8 ký tự)", autoComplete: "new-password" }, { name: "confirm", label: "Nhập lại mật khẩu mới", autoComplete: "new-password" }]}
      action={changePassword} submit="Đổi mật khẩu"
      footer={<Link href="/dashboard" className="inline-block py-2.5 font-semibold text-brand-text hover:underline">← Về Dashboard</Link>} />
  );
}
