import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getMe } from "@/lib/auth";
import { QUICK_TEST } from "@/lib/constants";
import { startQuickTestAction } from "../exam-actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const me = await getMe();
  return (
    <div className="card mx-auto max-w-xl space-y-4 text-center !p-8 shadow-soft">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-white"><Icon name="test" className="h-7 w-7" /></span>
      <h1 className="text-2xl font-extrabold">Quick Test CSCA</h1>
      <p>{QUICK_TEST.questions} câu hỏi · {QUICK_TEST.minutes} phút · chấm điểm tự động · AI phân tích ngay sau khi nộp bài.</p>
      {error && <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">Ngân hàng câu hỏi chưa có câu đã duyệt. Vui lòng quay lại sau.</p>}
      {me ? (
        <form action={startQuickTestAction}><button className="btn w-full">Bắt đầu làm bài</button></form>
      ) : (
        <>
          <p className="text-sm text-slate-600">Tạo tài khoản miễn phí (30 giây) để lưu kết quả và nhận báo cáo AI.</p>
          <div className="flex justify-center gap-3">
            <Link href="/dang-ky?next=/quick-test" className="btn">Đăng ký</Link>
            <Link href="/dang-nhap?next=/quick-test" className="btn-outline">Đăng nhập</Link>
          </div>
        </>
      )}
    </div>
  );
}
