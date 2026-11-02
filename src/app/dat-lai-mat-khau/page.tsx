import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordForm } from "@/components/PasswordForm";
import { resetPassword } from "../password-actions";

export default async function Page() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) redirect("/quen-mat-khau?error=invalid");
  return (
    <PasswordForm title="Đặt mật khẩu mới" intro={`Đặt mật khẩu mới cho ${user.email}.`}
      fields={[{ name: "password", label: "Mật khẩu mới (tối thiểu 8 ký tự)", autoComplete: "new-password" }, { name: "confirm", label: "Nhập lại mật khẩu mới", autoComplete: "new-password" }]}
      action={resetPassword} submit="Lưu mật khẩu mới" />
  );
}
