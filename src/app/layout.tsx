import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/NavLinks";
import { getMe } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://luyenthicsca.edu.vn"),
  title: "Luyenthicsca – Đánh giá & nâng cao năng lực CSCA",
  description: "Thi thử CSCA miễn phí, AI phân tích điểm mạnh/yếu, luyện tập theo chủ đề.",
  openGraph: { title: "CSCA Việt Nam – Luyện thi CSCA", description: "Thi thử CSCA miễn phí, AI phân tích điểm mạnh/yếu, luyện tập theo chủ đề.", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: "vi_VN", type: "website" },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col">
        <Header me={me} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 lg:pb-8">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
