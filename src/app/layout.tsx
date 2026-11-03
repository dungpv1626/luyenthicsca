import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/NavLinks";
import { getMe } from "@/lib/auth";
import { headers } from "next/headers";
import { ChromeSync } from "@/components/ChromeSync";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "CSCA Việt Nam – Luyện thi CSCA | Luyenthicsca", template: "%s · CSCA Việt Nam" },
  description: "Thi thử CSCA miễn phí, AI phân tích điểm mạnh/yếu, luyện tập theo chủ đề.",
  openGraph: { title: "CSCA Việt Nam – Luyện thi CSCA", description: "Thi thử CSCA miễn phí, AI phân tích điểm mạnh/yếu, luyện tập theo chủ đề.", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: "vi_VN", type: "website" },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  const isAdmin = ((await headers()).get("x-pathname") ?? "").startsWith("/admin");
  return (
    <html lang="vi" data-admin={isAdmin ? "1" : undefined}>
      <body className="flex min-h-screen flex-col">
        <ChromeSync />
        <div data-chrome><Header me={me} /></div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 lg:pb-8">{children}</main>
        <div data-chrome><Footer /></div>
        <div data-chrome><BottomNav /></div>
      </body>
    </html>
  );
}
