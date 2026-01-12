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
  description: "안양시, 수원시 등 전국 우리 동네 도서관의 실제 대출 현황을 실시간으로 확인하세요. 0~2세 영유아부터 성인까지 가족 모두를 위한 맞춤형 도서 추천 서비스를 제공합니다.",
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
    description: "가까운 도서관에서 지금 바로 빌릴 수 있는 책을 찾아보세요. 대출 가능 여부를 실시간으로 알려드립니다.",
    url: "https://library-finder.vercel.app",
    siteName: "우리 가족 도서관",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // public 폴더에 대표 이미지 추가 권장 (1200x630)
        width: 1200,
        height: 630,
        alt: "우리 가족 도서관 미리보기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "우리 가족 도서관",
    description: "가까운 도서관 대출 가능 여부 실시간 조회 & 맞춤 책 추천",
  },
  verification: {
    google: "google-site-verification-code", // 구글 서치 콘솔 코드 입력 필요
    other: {
      "naver-site-verification": "naver-site-verification-code", // 네이버 서치 어드바이저 코드 입력 필요
    },
  },
  alternates: {
    canonical: "https://library-finder.vercel.app",
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
        {/* 구글 애드센스 스크립트 (승인 후 활성화) */}
        {/* <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        /> */}
      </body>
    </html>
  );
}
