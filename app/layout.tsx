import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "우리동네 도서관 - 가까운 도서관에서 책 찾기",
  description: "근처 도서관을 찾고 원하는 책의 대출 가능 여부를 확인하세요. 인기 도서, 신간, 추천 도서 정보를 제공합니다.",
  keywords: ["도서관", "책 검색", "대출", "도서관 찾기", "도서 검색", "신간 도서", "인기 도서"],
  openGraph: {
    title: "우리동네 도서관",
    description: "근처 도서관에서 책 찾기",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="text/javascript"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
          async
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
