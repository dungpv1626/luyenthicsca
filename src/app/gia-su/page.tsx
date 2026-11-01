import { requireMe } from "@/lib/auth";
import { PageHeader } from "@/components/Section";
import { TutorChat } from "@/components/TutorChat";
import { TUTOR_DAILY_LIMIT } from "@/lib/constants";

export default async function Page() {
  await requireMe("/gia-su");
  return (
    <div>
      <PageHeader en="AI Tutor" vi="Gia sư AI 24/7">Hỏi bất cứ khái niệm, bài tập hay từ vựng nào. Tối đa {TUTOR_DAILY_LIMIT} lượt hỏi mỗi ngày. Muốn hỏi về một câu cụ thể, hãy mở bài đã làm và bấm "Hỏi gia sư".</PageHeader>
      <div className="mx-auto max-w-2xl"><TutorChat suggestions={["Giải thích định lý Vi-ét", "Công thức tính gia tốc và ví dụ", "Cách cân bằng phương trình hóa học", "“函数” và “方程” khác nhau thế nào?"]} /></div>
    </div>
  );
}
