import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { money, ROLES } from "@/lib/constants";

export const metadata = { title: "Tổng quan – Quản trị" };

type Task = { title: string; desc: string; n: number; href: string; cta: string; urgent?: boolean };
type Kpi = { label: string; value: string | number; href?: string };

const HINTS: Record<string, string> = {
  super_admin: "Bạn có toàn quyền. Dưới đây là những việc đang chờ xử lý, ưu tiên từ trên xuống.",
  academic_reviewer: "Việc của bạn là kiểm tra đáp án và nội dung câu hỏi trước khi học viên tin dùng.",
  content_manager: "Quản lý bài blog, khóa học, bài giảng và nội dung hiển thị cho học viên.",
  sales: "Theo dõi đơn hàng chờ thu tiền và khách đang cần tư vấn.",
};

export default async function Page() {
  const me = await requireAdmin("dashboard");
  const db = adminDb();
  const count = async (t: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const q = db.from(t).select("*", { count: "exact", head: true });
    return (await (f ? f(q) : q)).count ?? 0;
  };
  // Mỗi vai trò chỉ thấy phạm vi công việc của mình (giáo viên không thấy doanh thu/đơn hàng).
  const content = ["super_admin", "content_manager", "academic_reviewer"].includes(me.role);
  const business = ["super_admin", "sales"].includes(me.role);
  const reviewer = ["super_admin", "academic_reviewer"].includes(me.role);
  const tasks: Task[] = [], kpis: Kpi[] = [];
  let mine: { today: number; total: number } | null = null;

  if (content) {
    const startOfDay = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) + "T00:00:00+07:00").toISOString();
    const [total, approved, review, waiting, tplPending, reports, today, allMine] = await Promise.all([
      count("questions"), count("questions", (q) => q.eq("status", "approved")), count("questions", (q) => q.eq("status", "review")),
      count("questions", (q) => q.eq("status", "approved").eq("auto_published", true)), count("template_reviews", (q) => q.eq("status", "pending")), count("question_reports"),
      reviewer ? count("questions", (q) => q.eq("reviewer", me.id).gte("reviewed_at", startOfDay)) : Promise.resolve(0),
      reviewer ? count("questions", (q) => q.eq("reviewer", me.id)) : Promise.resolve(0),
    ]);
    if (reviewer) mine = { today, total: allMine };
    tasks.push(
      { title: "Câu hỏi chờ duyệt", desc: "Chưa hiển thị cho học viên. Duyệt để công bố hoặc loại kèm lý do.", n: review, href: "/admin/review", cta: "Bắt đầu duyệt", urgent: review > 0 },
      { title: "Câu đang hiển thị, chờ giáo viên xác nhận", desc: "Học viên đang thấy các câu này. Câu bị báo lỗi nhiều nằm đầu hàng.", n: waiting, href: "/admin/review?view=live", cta: "Xác nhận" },
      { title: "Khuôn câu hỏi chờ duyệt", desc: "Duyệt một khuôn là xác nhận toàn bộ biến thể của nó.", n: tplPending, href: "/admin/templates", cta: "Xem khuôn" },
      { title: "Báo lỗi từ học viên", desc: "Học viên bấm báo lỗi trên câu hỏi.", n: reports, href: "/admin/review?view=live", cta: "Xem báo lỗi" },
    );
    kpis.push({ label: "Câu đã duyệt / tổng", value: `${approved.toLocaleString("vi-VN")} / ${total.toLocaleString("vi-VN")}`, href: "/admin/questions" });
  }
  if (business) {
    const [users, attempts, paidOrders, paid, pendingOrders, newLeads] = await Promise.all([
      count("profiles"), count("attempts", (q) => q.not("submitted_at", "is", null)), count("orders", (q) => q.eq("status", "paid")),
      db.from("orders").select("amount_vnd").eq("status", "paid"), count("orders", (q) => q.eq("status", "pending")), count("consultations", (q) => q.eq("status", "new")),
    ]);
    const revenue = (paid.data ?? []).reduce((s, o) => s + o.amount_vnd, 0);
    tasks.unshift(
      { title: "Đơn chờ xác nhận thu tiền", desc: "Khách đã đặt, chờ đối chiếu chuyển khoản.", n: pendingOrders, href: "/admin/orders", cta: "Xử lý đơn", urgent: pendingOrders > 0 },
      { title: "Tư vấn mới chưa liên hệ", desc: "Khách để lại thông tin, nên gọi trong ngày.", n: newLeads, href: "/admin/leads", cta: "Liên hệ", urgent: newLeads > 0 },
    );
    kpis.push(
      { label: "Doanh thu", value: money(revenue) }, { label: "Đơn đã thanh toán", value: paidOrders, href: "/admin/orders" },
      { label: "Người dùng", value: users, href: "/admin/users" }, { label: "Bài thi đã nộp", value: attempts },
    );
  }
  const open = tasks.filter((t) => t.n > 0);
  const roleLabel = ROLES[me.role as keyof typeof ROLES] ?? me.role;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold">Xin chào, {me.full_name || "bạn"}</h1>
        <p className="mt-1 text-sm text-slate-600"><span className="chip mr-2">{roleLabel}</span>{HINTS[me.role] ?? ""}</p>
      </div>

      {mine && (
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="card !p-3"><p className="text-xs font-semibold text-slate-500">Bạn đã xử lý hôm nay</p><p className="text-2xl font-extrabold text-navy">{mine.today.toLocaleString("vi-VN")}</p></div>
          <div className="card !p-3"><p className="text-xs font-semibold text-slate-500">Tổng cộng</p><p className="text-2xl font-extrabold text-navy">{mine.total.toLocaleString("vi-VN")}</p></div>
        </div>
      )}

      <section aria-labelledby="todo">
        <h2 id="todo" className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Việc cần làm {open.length > 0 && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{open.length}</span>}</h2>
        {open.length === 0 ? <div className="card text-sm text-slate-600">Không có việc tồn đọng. ✅</div> : (
          <ul className="card divide-y divide-slate-100 !p-0">
            {open.map((t) => (
              <li key={t.title} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <span className={`grid h-10 min-w-[3.25rem] place-items-center rounded-lg px-2 text-lg font-extrabold ${t.urgent ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{t.n > 9999 ? "9999+" : t.n.toLocaleString("vi-VN")}</span>
                <div className="min-w-0 flex-1 basis-56"><p className="font-semibold text-ink">{t.title}</p><p className="text-sm text-slate-500">{t.desc}</p></div>
                <Link href={t.href} className={t.urgent ? "btn" : "btn-outline"}>{t.cta} →</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {kpis.length > 0 && (
        <section aria-labelledby="kpi">
          <h2 id="kpi" className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Số liệu</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map((k) => {
              const body = <><p className="text-xs font-semibold text-slate-500">{k.label}</p><p className="mt-0.5 text-xl font-extrabold text-ink">{typeof k.value === "number" ? k.value.toLocaleString("vi-VN") : k.value}</p></>;
              return k.href ? <Link key={k.label} href={k.href} className="card card-hover block !p-3">{body}</Link> : <div key={k.label} className="card !p-3">{body}</div>;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
