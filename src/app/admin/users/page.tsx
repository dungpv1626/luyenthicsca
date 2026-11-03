import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { AUDIENCES, ROLES } from "@/lib/constants";
import { setUserRole } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const metadata = { title: "Người dùng – Quản trị" };

export default async function Page() {
  const me = await requireAdmin("users");
  const { data } = await adminDb().from("profiles").select("id, full_name, phone, audience, target, role, created_at").order("created_at", { ascending: false }).limit(300);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Người dùng</h1>
      <div className="card divide-y p-0">
        {data?.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <div className="flex-1"><p className="font-medium">{u.full_name || "(chưa có tên)"}</p><p className="text-slate-500">{u.phone ?? "—"} · {AUDIENCES[u.audience as keyof typeof AUDIENCES] ?? "—"} · {u.target ?? "—"}</p></div>
            {me.role === "super_admin" && u.id !== me.id ? (
              <form action={setUserRole.bind(null, u.id)} className="flex gap-1">
                <select name="role" aria-label={`Vai trò của ${u.full_name || "tài khoản"}`} defaultValue={u.role} className="input w-auto">{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                <ConfirmButton className="btn-outline" title="Đổi vai trò người dùng?" message={`Đổi vai trò của ${u.full_name || "tài khoản này"} thành “{value}”. Quyền truy cập khu quản trị thay đổi ngay lần đăng nhập tiếp theo.`} field="role" valueLabels={ROLES} extraWhen={{ value: "super_admin", text: "Super Admin có TOÀN QUYỀN, kể cả đổi vai trò của người khác." }} confirmText="Đổi vai trò">Lưu</ConfirmButton>
              </form>
            ) : <span className="rounded bg-slate-100 px-2 py-0.5">{ROLES[u.role as keyof typeof ROLES]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
