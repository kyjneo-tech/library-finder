import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "우리 가족 도서관 | 우리 동네 도서관 대출 현황 및 도서 추천",
  description: "안양시, 수원시 등 우리 동네 도서관의 실제 대출 현황을 실시간으로 확인하세요. 0~2세 영유아부터 성인까지 가족 모두를 위한 맞춤형 도서 추천 서비스를 제공합니다.",
  keywords: ["도서관", "도서관검색", "안양시도서관", "수원시도서관", "그림책추천", "베스트셀러", "대출가능조회"],
  openGraph: {
    title: "우리 가족 도서관",
    description: "가까운 도서관에서 지금 바로 빌릴 수 있는 책을 찾아보세요.",
    type: "website",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
        <Toaster position="top-center" />
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
