"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/site";

type State = { error?: string; ok?: string } | undefined;
const MIN = 8;

function validateNew(pw: string, confirm: string): string | null {
  if (pw.length < MIN) return `Mật khẩu mới tối thiểu ${MIN} ký tự.`;
  if (pw !== confirm) return "Mật khẩu nhập lại không khớp.";
  return null;
}

/** Quên mật khẩu: luôn trả cùng một thông báo dù email có tồn tại hay không (tránh lộ danh sách tài khoản). */
export async function forgotPassword(_: State, fd: FormData): Promise<State> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Email không hợp lệ." };
  const supabase = await createClient();
  const origin = await requestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/dat-lai-mat-khau` });
  if (error) {
    console.error("resetPasswordForEmail:", error.status, error.message);
    if (error.status === 429) return { error: "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau ít phút." };
    return { error: "Chưa gửi được email. Vui lòng thử lại sau." };
  }
  return { ok: "Nếu email này đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Hãy kiểm tra hộp thư (cả mục Spam). Liên kết có hiệu lực trong thời gian ngắn." };
}

/** Đặt lại mật khẩu sau khi bấm link trong email (đã có phiên khôi phục từ /auth/confirm). */
export async function resetPassword(_: State, fd: FormData): Promise<State> {
  const pw = String(fd.get("password") ?? ""), confirm = String(fd.get("confirm") ?? "");
  const bad = validateNew(pw, confirm);
  if (bad) return { error: bad };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Liên kết đã hết hạn. Vui lòng yêu cầu liên kết mới ở trang Quên mật khẩu." };
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) return { error: /different|same/i.test(error.message) ? "Mật khẩu mới phải khác mật khẩu cũ." : "Không đổi được mật khẩu. Vui lòng thử lại." };
  await supabase.auth.signOut({ scope: "others" }); // đăng xuất các thiết bị khác
  redirect("/dashboard?pw=reset");
}

/** Đổi mật khẩu khi đang đăng nhập: bắt buộc nhập đúng mật khẩu hiện tại. */
export async function changePassword(_: State, fd: FormData): Promise<State> {
  const cur = String(fd.get("current") ?? ""), pw = String(fd.get("password") ?? ""), confirm = String(fd.get("confirm") ?? "");
  if (!cur) return { error: "Vui lòng nhập mật khẩu hiện tại." };
  const bad = validateNew(pw, confirm);
  if (bad) return { error: bad };
  if (pw === cur) return { error: "Mật khẩu mới phải khác mật khẩu hiện tại." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/dang-nhap?next=/doi-mat-khau");
  const { error: e1 } = await supabase.auth.signInWithPassword({ email: user.email, password: cur });
  if (e1) return { error: "Mật khẩu hiện tại không đúng." };
  const { error: e2 } = await supabase.auth.updateUser({ password: pw });
  if (e2) return { error: "Không đổi được mật khẩu. Vui lòng thử lại." };
  await supabase.auth.signOut({ scope: "others" });
  return { ok: "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất." };
}
