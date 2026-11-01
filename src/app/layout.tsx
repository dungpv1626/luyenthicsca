import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getMe } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Luyenthicsca – Đánh giá & nâng cao năng lực CSCA",
  description: "Thi thử CSCA miễn phí, AI phân tích điểm mạnh/yếu, luyện tập theo chủ đề.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col">
        <Header me={me} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
