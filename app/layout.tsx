import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import { Footer } from "@/shared/ui/footer";
import { Noto_Sans_KR } from "next/font/google";

const notoSansKR = Noto_Sans_KR({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://woorilib.com"),
  title: {
    template: "%s | 우리 가족 도서관",
    default: "우리 가족 도서관 | 동네 도서관 대출 현황 및 맞춤 책 추천",
  },
  description: "내 주변 도서관 대출 현황 실시간 확인! 영유아부터 성인까지 온 가족을 위한 맞춤형 도서 추천 서비스를 제공합니다.",
  keywords: ["도서관", "도서관검색", "대출가능조회", "책이음", "책바다", "그림책추천", "베스트셀러", "공공도서관"],
  authors: [{ name: "Library Finder" }],
  creator: "Library Finder",
  publisher: "Library Finder",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "우리 가족 도서관",
    description: "내 주변 도서관 대출 현황 실시간 확인! 영유아부터 성인까지 온 가족을 위한 맞춤형 도서 추천 서비스를 제공합니다.",
    url: "https://woorilib.com",
    siteName: "우리 가족 도서관",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "우리 가족 도서관",
    description: "내 주변 도서관 대출 현황 실시간 확인! 영유아부터 성인까지 온 가족을 위한 맞춤형 도서 추천 서비스를 제공합니다.",
  },
  verification: {
    google: "lgrYKoxQ9rWQHtQEBWV37D8ccvFxt_3fxXJiHcqme7w",
    other: {
      "naver-site-verification": "9d8a4cc57e00123b69ccce9581b98158dae30924",
      "google-adsense-account": "ca-pub-4234312634957489",
    },
  },
  alternates: {
    canonical: "https://woorilib.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="antialiased min-h-screen flex flex-col bg-white text-gray-900" style={{ fontFamily: 'var(--font-noto-sans), -apple-system, sans-serif' }}>
        <div className="flex-1 w-full">
          {children}
        </div>
        <Footer />
        <Toaster position="top-center" />
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
          strategy="beforeInteractive"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4234312634957489"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}