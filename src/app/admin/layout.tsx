import Link from "next/link";
import { ADMIN_AREAS, requireAdmin } from "@/lib/auth";

const LINKS = [
  ["/admin", "Dashboard", "dashboard"], ["/admin/analytics", "Analytics", "analytics"], ["/admin/review", "Duyệt câu hỏi", "questions"], ["/admin/blueprint", "Blueprint", "questions"], ["/admin/questions", "Question Bank", "questions"], ["/admin/tests", "Mock Test", "tests"],
  ["/admin/data/schools", "Trường", "schools"], ["/admin/data/scholarships", "Học bổng", "schools"], ["/admin/leads", "Tư vấn / Leads", "leads"],
  ["/admin/data/courses", "Khóa học", "academy"], ["/admin/data/lessons", "Bài giảng", "academy"], ["/admin/data/teachers", "Giáo viên", "academy"],
  ["/admin/orders", "Đơn hàng", "orders"], ["/admin/users", "Người dùng", "users"],
] as const;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin("dashboard");
  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      <nav className="card h-fit space-y-1 text-sm">
        {LINKS.filter(([, , a]) => (ADMIN_AREAS[a] as readonly string[]).includes(me.role)).map(([h, l]) => <Link key={h} href={h} className="block rounded px-2 py-1 hover:bg-stone-100">{l}</Link>)}
      </nav>
      <div>{children}</div>
    </div>
  );
}
