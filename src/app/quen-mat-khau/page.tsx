import Link from "next/link";
import { PasswordForm } from "@/components/PasswordForm";
import { forgotPassword } from "../password-actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="space-y-4">
      {error === "invalid" && <p role="alert" className="mx-auto max-w-md rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới bên dưới.</p>}
      <PasswordForm title="Quên mật khẩu" intro="Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới."
        fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]} action={forgotPassword} submit="Gửi liên kết đặt lại"
        footer={<Link href="/dang-nhap" className="font-semibold text-brand hover:underline">← Quay lại đăng nhập</Link>} />
    </div>
  );
}
