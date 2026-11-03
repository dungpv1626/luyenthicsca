import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { adminDb } from "./supabase/admin";
import type { Role } from "./constants";

export type Me = { id: string; email: string; full_name: string; role: Role };

export async function getMe(): Promise<Me | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await adminDb().from("profiles").select("full_name, role").eq("id", data.user.id).single();
  return { id: data.user.id, email: data.user.email ?? "", full_name: p?.full_name ?? "", role: (p?.role ?? "student") as Role };
}

export async function requireMe(next = "/dashboard"): Promise<Me> {
  const me = await getMe();
  if (!me) redirect(`/dang-nhap?next=${encodeURIComponent(next)}`);
  return me;
}

/** Quyền admin theo bảng phân quyền trong tài liệu. */
export const ADMIN_AREAS = {
  questions: ["super_admin", "content_manager", "academic_reviewer"],
  tests: ["super_admin", "content_manager"],
  orders: ["super_admin", "sales"],
  users: ["super_admin", "sales"],
  schools: ["super_admin", "content_manager", "sales"],
  academy: ["super_admin", "content_manager"],
  leads: ["super_admin", "sales"],
  content: ["super_admin", "content_manager"],
  analytics: ["super_admin", "content_manager", "sales"],
  dashboard: ["super_admin", "content_manager", "academic_reviewer", "sales"],
} as const satisfies Record<string, Role[]>;

export async function requireAdmin(area: keyof typeof ADMIN_AREAS): Promise<Me> {
  const me = await requireMe("/admin");
  if (!(ADMIN_AREAS[area] as readonly Role[]).includes(me.role)) redirect(`/khong-co-quyen?area=${area}`);
  return me;
}
