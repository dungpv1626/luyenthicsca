import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { money } from "@/lib/constants";

export const metadata = { title: "Tổng quan – Quản trị" };

type Card = { label: string; value: string | number; href?: string; hint?: string; tone?: "warn" };

export default async function Page() {
  const me = await requireAdmin("dashboard");
  const db = adminDb();
  const count = async (t: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const q = db.from(t).select("*", { count: "exact", head: true });
    return (await (f ? f(q) : q)).count ?? 0;
  };
  // Mỗi vai trò chỉ thấy số liệu thuộc phạm vi công việc của mình (giáo viên không thấy doanh thu/đơn hàng).
  const content = ["super_admin", "content_manager", "academic_reviewer"].includes(me.role);
  const business = ["super_admin", "sales"].includes(me.role);
  const cards: Card[] = [];
  if (content) {
    const [total, approved, review, waiting, tplPending, reports] = await Promise.all([
      count("questions"), count("questions", (q) => q.eq("status", "approved")), count("questions", (q) => q.eq("status", "review")),
      count("questions", (q) => q.eq("status", "approved").eq("auto_published", true)), count("template_reviews", (q) => q.eq("status", "pending")), count("question_reports"),
    ]);
    cards.push(
      { label: "Câu chờ duyệt (chưa công bố)", value: review, href: "/admin/review", tone: review ? "warn" : undefined },
      { label: "Đã công bố, chờ giáo viên xác nhận", value: waiting, href: "/admin/review?view=live", hint: "đang hiển thị cho học viên", tone: waiting ? "warn" : undefined },
      { label: "Khuôn câu hỏi chờ duyệt", value: tplPending, href: "/admin/templates", tone: tplPending ? "warn" : undefined },
      { label: "Báo lỗi từ học viên", value: reports, href: "/admin/review?view=live" },
      { label: "Câu hỏi (đã duyệt/tổng)", value: `${approved}/${total}`, href: "/admin/questions" },
    );
  }
  if (business) {
    const [users, attempts, paidOrders, paid, pendingOrders, newLeads] = await Promise.all([
      count("profiles"), count("attempts", (q) => q.not("submitted_at", "is", null)), count("orders", (q) => q.eq("status", "paid")),
      db.from("orders").select("amount_vnd").eq("status", "paid"), count("orders", (q) => q.eq("status", "pending")), count("consultations", (q) => q.eq("status", "new")),
    ]);
    const revenue = (paid.data ?? []).reduce((s, o) => s + o.amount_vnd, 0);
    cards.push(
      { label: "Đơn chờ xác nhận thu tiền", value: pendingOrders, href: "/admin/orders", tone: pendingOrders ? "warn" : undefined },
      { label: "Tư vấn mới chưa liên hệ", value: newLeads, href: "/admin/leads", tone: newLeads ? "warn" : undefined },
      { label: "Người dùng", value: users, href: me.role === "super_admin" || me.role === "sales" ? "/admin/users" : undefined },
      { label: "Bài thi đã nộp", value: attempts },
      { label: "Đơn đã thanh toán", value: paidOrders, href: "/admin/orders" },
      { label: "Doanh thu", value: money(revenue) },
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((c) => {
          const body = <><p className="text-sm text-slate-500">{c.label}</p><p className={`text-2xl font-bold ${c.tone === "warn" ? "text-amber-700" : ""}`}>{typeof c.value === "number" ? c.value.toLocaleString("vi-VN") : c.value}</p>{c.hint && <p className="text-xs text-slate-400">{c.hint}</p>}</>;
          return c.href ? <Link key={c.label} href={c.href} className="card card-hover block">{body}</Link> : <div key={c.label} className="card">{body}</div>;
        })}
      </div>
    </div>
  );
}
