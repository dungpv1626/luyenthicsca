import { requireMe } from "@/lib/auth";
import { PageHeader } from "@/components/Section";
import { TutorChat } from "@/components/TutorChat";
import Link from "next/link";
import { getPlan } from "@/lib/entitlement";
import { planDef } from "@/lib/plans";

export const metadata = { title: "Gia sư AI" };

export default async function Page() {
  const me = await requireMe("/gia-su");
  const { plan } = await getPlan(me.id);
  const limit = planDef(plan).tutorPerDay;
  return (
    <div>
      <PageHeader en="AI Tutor" vi="Gia sư AI 24/7">Hỏi bất cứ khái niệm, bài tập hay từ vựng nào. Gói {planDef(plan).name}: tối đa {limit} lượt hỏi mỗi ngày.{plan !== "pro" && plan !== "max" && <> <Link href="/bang-gia" className="font-semibold text-brand-text hover:underline">Nâng cấp để hỏi nhiều hơn</Link>.</>} Muốn hỏi về một câu cụ thể, hãy mở bài đã làm và bấm "Hỏi gia sư".</PageHeader>
      <div className="w-read"><TutorChat suggestions={["Giải thích định lý Vi-ét", "Công thức tính gia tốc và ví dụ", "Cách cân bằng phương trình hóa học", "“函数” và “方程” khác nhau thế nào?"]} /></div>
    </div>
  );
}
