import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["recovery", "email", "signup"];
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

/**
 * Xác thực link trong email. Hỗ trợ 2 kiểu:
 *  - ?token_hash=...&type=recovery  (mẫu email tùy chỉnh; mở được trên thiết bị khác)
 *  - ?code=...                      (mẫu email mặc định của Supabase, PKCE; phải mở trong CÙNG trình duyệt đã yêu cầu)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const token_hash = sp.get("token_hash");
  const type = sp.get("type") as EmailOtpType | null;
  const next = safeNext(sp.get("next"));
  const code = sp.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    redirect("/quen-mat-khau?error=invalid");
  }
  if (token_hash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
  }
  redirect("/quen-mat-khau?error=invalid");
}
