import Link from "next/link";
import { SUBJECTS } from "@/lib/constants";

const FAQ = [
  ["CSCA là gì?", "CSCA (China Scholastic Competency Assessment) là kỳ thi đánh giá năng lực học thuật dành cho học sinh quốc tế muốn học bậc đại học tại Trung Quốc."],
  ["Ai cần thi CSCA?", "Học sinh, sinh viên quốc tế đăng ký vào các trường đại học Trung Quốc có yêu cầu điểm CSCA. Hãy kiểm tra yêu cầu của từng trường/ngành."],
  ["Thi bằng ngôn ngữ nào?", "Đề có thể bằng tiếng Trung hoặc tiếng Anh tùy môn/thí sinh lựa chọn. Hãy xác nhận ở thông báo chính thức."],
  ["Cách tính điểm?", "Mỗi môn được chấm riêng. Readiness Score trên website là chỉ số ước lượng mức sẵn sàng, không phải điểm thi chính thức."],
];

export default function Page() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">CSCA là gì?</h1>
      <section className="card">
        <h2 className="mb-2 text-xl font-bold">Các môn thi</h2>
        <ul className="list-disc pl-6">{Object.values(SUBJECTS).map((s) => <li key={s}>{s}</li>)}</ul>
        <p className="mt-3 text-sm text-stone-500">Cấu trúc, lịch thi và quy định chi tiết: vui lòng đối chiếu thông báo chính thức của đơn vị tổ chức kỳ thi.</p>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">FAQ</h2>
        <div className="space-y-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-stone-600">{a}</p></details>
          ))}
        </div>
      </section>
      <Link href="/quick-test" className="btn">Thi thử miễn phí ngay</Link>
    </div>
  );
}
