import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/NavLinks";
import { getMe } from "@/lib/auth";
import { headers } from "next/headers";
import { ChromeSync } from "@/components/ChromeSync";
import { AttributionTracker } from "@/components/AttributionTracker";
import Script from "next/script";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnam = Be_Vietnam_Pro({ subsets: ["vietnamese", "latin"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap", variable: "--font-be-vietnam" });

// Mã công khai, đặt trong .env.local (xem .env.example); không có mã thì không gắn gì.
const CF_BEACON = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
const GSC = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "CSCA Việt Nam – Luyện thi CSCA | Luyenthicsca", template: "%s · CSCA Việt Nam" },
  description: "Thi thử CSCA miễn phí, AI phân tích điểm mạnh/yếu, luyện tập theo chủ đề.",
  openGraph: { title: "CSCA Việt Nam – Luyện thi CSCA", description: "Thi thử CSCA miễn phí, AI phân tích điểm mạnh/yếu, luyện tập theo chủ đề.", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: "vi_VN", type: "website" },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  ...(GSC ? { verification: { google: GSC } } : {}),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  const isAdmin = ((await headers()).get("x-pathname") ?? "").startsWith("/admin");
  return (
    <html lang="vi" data-admin={isAdmin ? "1" : undefined} className={beVietnam.variable}>
      <body className="flex min-h-screen flex-col">
        <ChromeSync />
        <AttributionTracker />
        {CF_BEACON && <Script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: CF_BEACON })} strategy="afterInteractive" />}
        <div data-chrome><Header me={me} /></div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 lg:pb-8">{children}</main>
        <div data-chrome><Footer /></div>
        <div data-chrome><BottomNav /></div>
      </body>
    </html>
  );
}
