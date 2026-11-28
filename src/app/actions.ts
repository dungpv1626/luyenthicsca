"use server";
import { cookies } from "next/headers";
import { ATTR_COOKIE, parseAttribution } from "@/lib/attribution";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminDb } from "@/lib/supabase/admin";

const FIELDS = ["email", "full_name", "phone", "audience", "target", "exam_date", "terms", "marketing"] as const;
/** Giữ lại giá trị đã nhập (trừ mật khẩu) vì React 19 xóa form sau mỗi lần submit. */
const keep = (fd: FormData) => Object.fromEntries(FIELDS.map((k) => [k, String(fd.get(k) ?? "")]));

const safeNext = (n: FormDataEntryValue | null) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

export async function signIn(_: unknown, fd: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("password")) });
  if (error) {
    if (error.code === "email_not_confirmed" || /not confirmed/i.test(error.message)) return { error: "Email này chưa được xác nhận. Hãy mở email xác nhận (kiểm tra cả mục Spam/Quảng cáo) hoặc gửi lại email bên dưới.", unconfirmed: String(fd.get("email")), values: keep(fd) };
    return { error: "Email hoặc mật khẩu không đúng.", values: keep(fd) };
  }
  const next = safeNext(fd.get("next"));
  // Nhân viên luôn vào trang quản trị (trừ khi đang được đưa tới một trang quản trị cụ thể).
  const { data: p } = await adminDb().from("profiles").select("role").eq("id", data.user.id).single();
  if (p?.role && p.role !== "student" && !next.startsWith("/admin")) redirect("/admin");
  redirect(next);
}

/** Gửi lại email xác nhận đăng ký. Trả về thông báo để hiển thị. */
export async function resendConfirmationAction(email: string): Promise<{ ok: boolean; message: string }> {
  const addr = String(email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return { ok: false, message: "Email không hợp lệ." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: addr });
  if (error) {
    if (error.code === "over_email_send_rate_limit" || /rate limit|seconds/i.test(error.message)) return { ok: false, message: "Bạn vừa yêu cầu gửi email. Vui lòng đợi khoảng 1 phút rồi thử lại." };
    return { ok: false, message: "Chưa gửi được email. Hãy thử lại sau ít phút hoặc liên hệ hỗ trợ." };
  }
  return { ok: true, message: `Đã gửi lại email xác nhận tới ${addr}.` };
}

export async function signUp(_: unknown, fd: FormData) {
  const supabase = await createClient();
  const password = String(fd.get("password"));
  if (password.length < 8) return { error: "Mật khẩu tối thiểu 8 ký tự.", values: keep(fd) };
  // Bắt buộc đồng ý Điều khoản sử dụng và Chính sách bảo mật (kiểm tra cả ở server, không chỉ ô bắt buộc trên trình duyệt).
  if (fd.get("terms") !== "1") return { error: "Vui lòng đọc và tích ô đồng ý Điều khoản sử dụng và Chính sách bảo mật.", values: keep(fd) };
  const acceptedAt = new Date().toISOString();
  const marketing = fd.get("marketing") === "1";
  const { data, error } = await supabase.auth.signUp({
    email: String(fd.get("email")),
    password,
    // Lưu cả trong hồ sơ đăng nhập để luôn có bằng chứng đồng ý, kể cả khi bảng profiles chưa có cột mới.
    options: { data: { full_name: String(fd.get("full_name")), phone: String(fd.get("phone") ?? ""), audience: String(fd.get("audience") ?? ""), terms_accepted_at: acceptedAt, marketing_opt_in: marketing } },
  });
  if (error) return { error: error.message, values: keep(fd) };
  if (data.user) {
    const db = adminDb();
    // đồng ý điều khoản / nhận tin (migration 0018); lỗi ở đây không được làm hỏng việc đăng ký
    try { await db.from("profiles").update({ terms_accepted_at: acceptedAt, marketing_opt_in: marketing }).eq("id", data.user.id); } catch { /* bỏ qua */ }
    // nguồn truy cập đầu tiên (first-touch) từ cookie
    const attr = parseAttribution((await cookies()).get(ATTR_COOKIE)?.value);
    if (attr) { try { await db.from("profiles").update({ signup_source: attr }).eq("id", data.user.id); } catch { /* bỏ qua */ } }
  }
  if (!data.session) return { pending: String(fd.get("email")), values: keep(fd) };
  const target = String(fd.get("target") ?? "").trim();
  const examDate = String(fd.get("exam_date") ?? "");
  if (data.user && (target || examDate)) {
    await adminDb().from("profiles").update({ target: target || null, exam_date: examDate || null }).eq("id", data.user.id);
  }
  redirect(safeNext(fd.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
