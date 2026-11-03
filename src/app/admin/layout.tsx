import Link from "next/link";
import { ADMIN_AREAS, requireAdmin } from "@/lib/auth";

const LINKS = [
  ["/admin", "Tổng quan", "dashboard"], ["/admin/analytics", "Phân tích", "analytics"], ["/admin/review", "Duyệt câu hỏi", "questions"], ["/admin/templates", "Khuôn câu hỏi", "questions"], ["/admin/blueprint", "Phủ đề cương", "questions"], ["/admin/questions", "Ngân hàng câu hỏi", "questions"], ["/admin/levels", "Đề theo mức", "tests"], ["/admin/tests", "Đề thi", "tests"],
  ["/admin/data/schools", "Trường", "schools"], ["/admin/data/scholarships", "Học bổng", "schools"], ["/admin/leads", "Tư vấn khách hàng", "leads"],
  ["/admin/data/courses", "Khóa học", "academy"], ["/admin/data/lessons", "Bài giảng", "academy"], ["/admin/data/teachers", "Giáo viên", "academy"],
  ["/admin/blog", "Blog SEO", "content"], ["/admin/orders", "Đơn hàng", "orders"], ["/admin/users", "Người dùng", "users"],
] as const;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin("dashboard");
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
      <nav className="card -mx-1 flex h-fit gap-1 overflow-x-auto !p-2 text-sm md:mx-0 md:block md:space-y-1 md:overflow-visible md:!p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LINKS.filter(([, , a]) => (ADMIN_AREAS[a] as readonly string[]).includes(me.role)).map(([h, l]) => <Link key={h} href={h} className="block shrink-0 whitespace-nowrap rounded-lg px-3 py-2.5 font-medium transition hover:bg-brand-soft hover:text-brand md:py-1.5">{l}</Link>)}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
