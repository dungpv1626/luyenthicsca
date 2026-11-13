import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { AUDIENCES, ROLES, SUBJECTS } from "@/lib/constants";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Pagination } from "@/components/admin/Pagination";
import { setReviewSubjects, setUserRole } from "../actions";

export const metadata = { title: "Người dùng – Quản trị" };
const PER = 30;
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—");

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; page?: string }> }) {
  const me = await requireAdmin("users");
  const sp = await searchParams;
  const db = adminDb();
  const [{ data: profiles }, authUsers] = await Promise.all([
    db.from("profiles").select("id, full_name, phone, audience, target, role, created_at").order("created_at", { ascending: false }).limit(5000),
    (async () => { const out: { id: string; email?: string; last_sign_in_at?: string | null }[] = []; for (let p = 1; p <= 5; p++) { const { data } = await db.auth.admin.listUsers({ page: p, perPage: 1000 }); out.push(...(data?.users ?? [])); if ((data?.users.length ?? 0) < 1000) break; } return out; })(),
  ]);
  // môn phụ trách của giáo viên duyệt: truy vấn riêng, chịu được việc cột chưa có
  const { data: rs } = await db.from("profiles").select("id, review_subjects").eq("role", "academic_reviewer");
  const subj = new Map((rs ?? []).map((r) => [r.id as string, ((r as { review_subjects?: string[] | null }).review_subjects ?? []) as string[]]));
  const auth = new Map(authUsers.map((u) => [u.id, u]));
  const term = (sp.q ?? "").trim().toLowerCase();
  const all = (profiles ?? []).map((u) => ({ ...u, email: auth.get(u.id)?.email ?? "", last: auth.get(u.id)?.last_sign_in_at ?? null }));
  const rows = all.filter((u) => (!sp.role || u.role === sp.role) && (!term || `${u.full_name ?? ""} ${u.email} ${u.phone ?? ""}`.toLowerCase().includes(term)));
  const page = Math.max(1, Number(sp.page) || 1);
  const view = rows.slice((page - 1) * PER, page * PER);
  const roleCount = (r: string) => all.filter((u) => u.role === r).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Người dùng <span className="text-base font-normal text-muted">{all.length.toLocaleString("vi-VN")} tài khoản</span></h1>
      <form className="card flex flex-wrap items-center gap-2 text-sm">
        <input type="search" name="q" defaultValue={sp.q ?? ""} aria-label="Tìm theo tên, email, số điện thoại" placeholder="Tìm theo tên, email, số điện thoại…" className="input min-w-[12rem] flex-1" />
        <select name="role" aria-label="Lọc theo vai trò" defaultValue={sp.role ?? ""} className="input min-w-0 flex-1 sm:w-auto sm:flex-none"><option value="">Mọi vai trò</option>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v} ({roleCount(k)})</option>)}</select>
        <button className="btn">Tìm</button>{(sp.q || sp.role) && <Link href="/admin/users" className="inline-flex min-h-[2.5rem] items-center px-2 font-semibold text-brand-text hover:underline">Xóa lọc</Link>}
      </form>
      <div className="card divide-y divide-slate-100 !p-0">
        {view.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 text-sm">
            <div className="min-w-0 flex-1 basis-60">
              <p className="font-semibold">{u.full_name || <span className="font-normal text-muted">(chưa có tên)</span>}</p>
              <p className="break-all text-slate-600">{u.email || "—"}</p>
              <p className="text-xs text-muted">{u.phone ?? "—"} · {AUDIENCES[u.audience as keyof typeof AUDIENCES] ?? "—"}{u.target ? ` · mục tiêu: ${u.target}` : ""} · tạo {fmt(u.created_at)} · đăng nhập gần nhất {fmt(u.last)}</p>
            </div>
            {me.role === "super_admin" && u.id !== me.id ? (
              <form action={setUserRole.bind(null, u.id)} className="flex items-center gap-1">
                <select name="role" aria-label={`Vai trò của ${u.full_name || u.email}`} defaultValue={u.role} className="input w-auto">{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                <ConfirmButton className="btn-outline" title="Đổi vai trò người dùng?" message={`Đổi vai trò của ${u.full_name || u.email} thành “{value}”. Quyền truy cập khu quản trị thay đổi ngay lần đăng nhập tiếp theo.`} field="role" valueLabels={ROLES} extraWhen={{ value: "super_admin", text: "Quản trị cấp cao có TOÀN QUYỀN, kể cả đổi vai trò của người khác." }} confirmText="Đổi vai trò">Lưu</ConfirmButton>
              </form>
            ) : <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">{ROLES[u.role as keyof typeof ROLES]}{u.id === me.id ? " (bạn)" : ""}</span>}
            {u.role === "academic_reviewer" && (me.role === "super_admin" ? (
              <form action={setReviewSubjects.bind(null, u.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold text-slate-600">Môn phụ trách duyệt (bỏ trống = mọi môn):</span>
                {Object.entries(SUBJECTS).map(([k, v]) => <label key={k} className="inline-flex min-h-[2.5rem] items-center gap-1.5 text-xs"><input type="checkbox" name="subjects" value={k} defaultChecked={(subj.get(u.id) ?? []).includes(k)} className="h-4 w-4" />{v.split(" (")[0]}</label>)}
                <button className="btn-outline !min-h-[2.5rem] !px-3 text-xs">Lưu môn</button>
              </form>
            ) : <p className="w-full text-xs text-muted">Môn phụ trách: {(subj.get(u.id) ?? []).map((k) => SUBJECTS[k as keyof typeof SUBJECTS]?.split(" (")[0]).join(", ") || "mọi môn"}</p>)}
          </div>
        ))}
        {!view.length && <p className="p-5 text-muted">Không có tài khoản nào khớp.</p>}
      </div>
      <Pagination base="/admin/users" params={{ q: sp.q, role: sp.role }} page={page} total={rows.length} perPage={PER} />
    </div>
  );
}
