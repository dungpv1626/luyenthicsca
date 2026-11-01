import { createClient } from "@supabase/supabase-js";

/** Service role: CHỈ dùng ở server. Bỏ qua RLS — luôn kiểm tra quyền trước khi gọi. */
export function adminDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
