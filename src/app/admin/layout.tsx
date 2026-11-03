import { ADMIN_AREAS, requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { ROLES } from "@/lib/constants";
import { AdminShell, type NavGroup } from "@/components/admin/AdminShell";

type Area = keyof typeof ADMIN_AREAS;
type Def = { href: string; label: string; area: Area; badge?: "review" | "templates" | "orders" | "leads" };
const GROUPS: { title: string; items: Def[] }[] = [
  { title: "Việc cần làm", items: [{ href: "/admin", label: "Tổng quan", area: "dashboard" }, { href: "/admin/review", label: "Duyệt câu hỏi", area: "questions", badge: "review" }, { href: "/admin/templates", label: "Khuôn câu hỏi", area: "questions", badge: "templates" }] },
  { title: "Nội dung", items: [{ href: "/admin/questions", label: "Ngân hàng câu hỏi", area: "questions" }, { href: "/admin/blueprint", label: "Phủ đề cương", area: "questions" }, { href: "/admin/blog", label: "Blog SEO", area: "content" }, { href: "/admin/data/schools", label: "Trường", area: "schools" }, { href: "/admin/data/scholarships", label: "Học bổng", area: "schools" }] },
  { title: "Đề thi & khóa học", items: [{ href: "/admin/levels", label: "Đề theo mức", area: "tests" }, { href: "/admin/tests", label: "Đề thi", area: "tests" }, { href: "/admin/data/courses", label: "Khóa học", area: "academy" }, { href: "/admin/data/lessons", label: "Bài giảng", area: "academy" }, { href: "/admin/data/teachers", label: "Giáo viên", area: "academy" }] },
  { title: "Kinh doanh", items: [{ href: "/admin/orders", label: "Đơn hàng", area: "orders", badge: "orders" }, { href: "/admin/leads", label: "Tư vấn khách hàng", area: "leads", badge: "leads" }, { href: "/admin/analytics", label: "Phân tích", area: "analytics" }] },
  { title: "Hệ thống", items: [{ href: "/admin/users", label: "Người dùng", area: "users" }] },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin("dashboard");
  const db = adminDb();
  const count = async (t: string, f: (q: any) => any) => (await f(db.from(t).select("*", { count: "exact", head: true }))).count ?? 0; // eslint-disable-line @typescript-eslint/no-explicit-any
  const [review, templates, orders, leads] = await Promise.all([
    count("questions", (q) => q.eq("status", "review")), count("template_reviews", (q) => q.eq("status", "pending")),
    count("orders", (q) => q.eq("status", "pending")), count("consultations", (q) => q.eq("status", "new")),
  ]);
  const badges = { review, templates, orders, leads };
  const groups: NavGroup[] = GROUPS.map((g) => ({ title: g.title, items: g.items.filter((i) => (ADMIN_AREAS[i.area] as readonly string[]).includes(me.role)).map((i) => ({ href: i.href, label: i.label, badge: i.badge ? badges[i.badge] : undefined })) })).filter((g) => g.items.length);
  return <AdminShell groups={groups} name={me.full_name || me.email} roleLabel={ROLES[me.role]}>{children}</AdminShell>;
}
