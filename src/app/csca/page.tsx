import Link from "next/link";
import { SUBJECTS } from "@/lib/constants";
import { PageHeader } from "@/components/Section";
import { Icon } from "@/components/Icon";

const FAQ = [
  ["CSCA là gì?", "CSCA (China Scholastic Competency Assessment) là kỳ thi đánh giá năng lực học thuật dành cho học sinh quốc tế muốn học bậc đại học tại Trung Quốc."],
  ["Ai cần thi CSCA?", "Học sinh, sinh viên quốc tế đăng ký vào các trường đại học Trung Quốc có yêu cầu điểm CSCA. Hãy kiểm tra yêu cầu của từng trường/ngành."],
  ["Thi bằng ngôn ngữ nào?", "Đề có thể bằng tiếng Trung hoặc tiếng Anh tùy môn/thí sinh lựa chọn. Hãy xác nhận ở thông báo chính thức."],
  ["Cách tính điểm?", "Mỗi môn được chấm riêng. Readiness Score trên website là chỉ số ước lượng mức sẵn sàng, không phải điểm thi chính thức."],
];

export default function Page() {
  return (
    <div className="space-y-10">
      <PageHeader en="What is CSCA?" vi="Tìm hiểu kỳ thi">Kỳ thi đánh giá năng lực học thuật cho học sinh quốc tế vào đại học Trung Quốc.</PageHeader>
      <section>
        <h2 className="mb-4 text-xl font-bold">Các môn thi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.values(SUBJECTS).map((s) => <div key={s} className="card card-hover text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-white"><Icon name="book" /></span><p className="mt-3 font-bold">{s}</p></div>)}</div>
        <p className="mt-3 text-sm text-stone-500">Cấu trúc, lịch thi và quy định chi tiết: vui lòng đối chiếu thông báo chính thức của đơn vị tổ chức kỳ thi.</p>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold">Câu hỏi thường gặp</h2>
        <div className="space-y-2">{FAQ.map(([q, a]) => <details key={q} className="card group"><summary className="cursor-pointer font-semibold marker:text-brand">{q}</summary><p className="mt-2 text-stone-600">{a}</p></details>)}</div>
      </section>
      <div className="flex flex-wrap gap-3"><Link href="/quick-test" className="btn">Thi thử miễn phí ngay</Link><Link href="/truong" className="btn-outline">Xem trường yêu cầu CSCA</Link></div>
    </div>
  );
}
