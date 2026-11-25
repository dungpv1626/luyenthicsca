import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { money, ROLES, SUBJECTS, type Subject } from "@/lib/constants";
import { reviewSubjectsOf } from "@/lib/reviewer";

export const metadata = { title: "Tổng quan – Quản trị" };

type Task = { title: string; desc: string; n: number; href: string; cta: string; urgent?: boolean };
type Kpi = { label: string; value: string | number; href?: string };

const HINTS: Record<string, string> = {
  super_admin: "Bạn có toàn quyền. Dưới đây là những việc đang chờ xử lý, ưu tiên từ trên xuống.",
  academic_reviewer: "Việc của bạn là kiểm tra đáp án và nội dung câu hỏi trước khi học viên tin dùng.",
  content_manager: "Quản lý bài blog, khóa học, bài giảng và nội dung hiển thị cho học viên.",
  sales: "Theo dõi đơn hàng chờ thu tiền và khách đang cần tư vấn.",
};

type Step = { title: string; desc: string; href: string };
/** Quy trình làm việc theo vai trò: cho người mới biết bắt đầu từ đâu. */
const GUIDE: Record<string, Step[]> = {
  academic_reviewer: [
    { title: "Duyệt câu hỏi chờ duyệt", desc: "Đọc đề ở cả 3 ngôn ngữ, tự giải để kiểm tra đáp án, rồi bấm Duyệt hoặc Loại kèm lý do.", href: "/admin/review" },
    { title: "Xác nhận câu đang hiển thị", desc: "Các câu học viên đang làm nhưng chưa có giáo viên xác nhận. Câu bị báo lỗi nằm đầu hàng.", href: "/admin/review?view=live" },
    { title: "Duyệt khuôn câu hỏi", desc: "Xem vài biến thể của một khuôn; duyệt khuôn là xác nhận toàn bộ biến thể.", href: "/admin/templates" },
  ],
  content_manager: [
    { title: "Viết và công bố bài blog", desc: "Sửa bài nháp, lên lịch hoặc công bố. Bài còn dòng giữ chỗ sẽ bị chặn công bố.", href: "/admin/blog" },
    { title: "Lắp đề theo mức", desc: "Chọn mức, môn, số đề: hệ thống lắp từ câu đã duyệt. Kiểm tra rồi bấm Công bố.", href: "/admin/levels" },
    { title: "Cập nhật khóa học, bài giảng", desc: "Thêm hoặc sửa khóa học và bài giảng hiển thị ở Academy.", href: "/admin/data/courses" },
  ],
  sales: [
    { title: "Xác nhận đơn đã chuyển khoản", desc: "Đối chiếu mã đơn LTC… trong sao kê, bấm “Xác nhận đã thu” để mở quyền cho học viên.", href: "/admin/orders" },
    { title: "Gọi khách cần tư vấn", desc: "Khách để lại thông tin trên website; nên liên hệ trong ngày.", href: "/admin/leads" },
    { title: "Tra cứu học viên", desc: "Tìm tài khoản theo email hoặc tên khi khách hỏi.", href: "/admin/users" },
  ],
  super_admin: [
    { title: "Xử lý việc tồn đọng", desc: "Danh sách bên dưới, ưu tiên từ trên xuống.", href: "#todo" },
    { title: "Phân quyền nhân viên", desc: "Đổi vai trò tài khoản và gán môn phụ trách cho giáo viên.", href: "/admin/users" },
    { title: "Theo dõi số liệu", desc: "Doanh thu, nguồn đăng ký, bài thi đã nộp.", href: "/admin/analytics" },
  ],
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
  // Giáo viên đã được gán môn chỉ thấy số câu của môn mình (giống trang Duyệt câu hỏi).
  const subjects = me.role === "academic_reviewer" ? await reviewSubjectsOf(me.id) : [];
  const own = (q: any) => (subjects.length ? q.in("subject", subjects) : q); // eslint-disable-line @typescript-eslint/no-explicit-any

  if (content) {
    const startOfDay = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) + "T00:00:00+07:00").toISOString();
    const [total, approved, review, waiting, tplPending, reports, today, allMine] = await Promise.all([
      count("questions", own), count("questions", (q) => own(q.eq("status", "approved"))), count("questions", (q) => own(q.eq("status", "review"))),
      count("questions", (q) => own(q.eq("status", "approved").eq("auto_published", true))), count("template_reviews", (q) => q.eq("status", "pending")), count("question_reports"),
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
  const first = open[0];
  const steps = GUIDE[me.role] ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bold">Xin chào, {me.full_name || "bạn"}</h1>
        <p className="mt-1 text-sm text-slate-600">
          <span className="chip mr-2">{roleLabel}</span>
          {subjects.length > 0 && <span className="chip mr-2">Môn phụ trách: {subjects.map((s) => SUBJECTS[s as Subject] ?? s).join(", ")}</span>}
          {HINTS[me.role] ?? ""}
        </p>
      </div>

      <section aria-labelledby="start" className="card border-brand/30 bg-brand-soft/60">
        <h2 id="start" className="text-sm font-bold uppercase tracking-wide text-brand-text">Bắt đầu từ đây</h2>
        {first ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="min-w-0 flex-1 basis-64">
              <p className="text-lg font-bold text-ink">{first.title}: {first.n.toLocaleString("vi-VN")}</p>
              <p className="text-sm text-muted">{first.desc}</p>
            </div>
            <Link href={first.href} className="btn">{first.cta} →</Link>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-700">Hiện không có việc tồn đọng. Bạn có thể xem lại các bước làm việc bên dưới.</p>
        )}
        {steps.length > 0 && (
          <ol className="mt-4 grid gap-3 border-t border-brand/20 pt-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <Link href={s.href} className="flex h-full gap-3 rounded-xl bg-surface p-3 transition hover:shadow-card">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                  <span className="min-w-0"><span className="block font-semibold text-ink">{s.title}</span><span className="block text-sm text-muted">{s.desc}</span></span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {mine && (
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="card !p-3"><p className="text-xs font-semibold text-muted">Bạn đã xử lý hôm nay</p><p className="text-2xl font-extrabold text-navy">{mine.today.toLocaleString("vi-VN")}</p></div>
          <div className="card !p-3"><p className="text-xs font-semibold text-muted">Tổng cộng</p><p className="text-2xl font-extrabold text-navy">{mine.total.toLocaleString("vi-VN")}</p></div>
        </div>
      )}

      <section aria-labelledby="todo">
        <h2 id="todo" className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Việc cần làm {open.length > 0 && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-warning">{open.length}</span>}</h2>
        {open.length === 0 ? <div className="card text-sm text-slate-600">Không có việc tồn đọng.</div> : (
          <ul className="card divide-y divide-slate-100 !p-0">
            {open.map((t) => (
              <li key={t.title} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <span className={`grid h-10 min-w-[3.25rem] place-items-center rounded-lg px-2 text-lg font-extrabold ${t.urgent ? "bg-amber-100 text-warning" : "bg-slate-100 text-slate-700"}`}>{t.n > 9999 ? "9999+" : t.n.toLocaleString("vi-VN")}</span>
                <div className="min-w-0 flex-1 basis-56"><p className="font-semibold text-ink">{t.title}</p><p className="text-sm text-muted">{t.desc}</p></div>
                <Link href={t.href} className={t.urgent ? "btn" : "btn-outline"}>{t.cta} →</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {kpis.length > 0 && (
        <section aria-labelledby="kpi">
          <h2 id="kpi" className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Số liệu</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map((k) => {
              const body = <><p className="text-xs font-semibold text-muted">{k.label}</p><p className="mt-0.5 text-xl font-extrabold text-ink">{typeof k.value === "number" ? k.value.toLocaleString("vi-VN") : k.value}</p></>;
              return k.href ? <Link key={k.label} href={k.href} className="card card-hover block !p-3">{body}</Link> : <div key={k.label} className="card !p-3">{body}</div>;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
