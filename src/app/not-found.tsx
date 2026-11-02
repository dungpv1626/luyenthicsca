import Link from "next/link";

export const metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-7xl font-black text-brand/25">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-navy">Không tìm thấy trang này</h1>
      <p className="mt-2 text-slate-600">Đường dẫn có thể đã thay đổi hoặc bài làm không thuộc tài khoản của bạn.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/" className="btn">Về trang chủ</Link><Link href="/dashboard" className="btn-outline">Dashboard</Link><Link href="/thi-thu" className="btn-outline">Thi thử</Link></div>
    </div>
  );
}
