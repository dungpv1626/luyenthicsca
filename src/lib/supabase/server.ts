import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client theo phiên đăng nhập của người dùng (đọc cookie). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* gọi từ Server Component: bỏ qua, proxy sẽ làm mới phiên */
          }
        },
      },
    },
  );
}
