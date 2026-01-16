import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { Footer } from '@/shared/ui/footer';
import { GlobalLoadingOverlay } from '@/shared/ui/global-loading-overlay';
import { ContactSupport } from '@/features/contact/ui/contact-support';
import { Noto_Sans_KR } from 'next/font/google';
import { OnboardingModal } from '@/features/onboarding/ui/onboarding-modal';
import { UserModeSyncer } from '@/features/user/ui/user-mode-syncer';

const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://woorilib.com'),
  title: {
    template: '%s | 우리도서관',
    default: '우리도서관 | 내 손안의 공공도서관',
  },
  description:
    '아직도 책 사서 보세요? 전국 2,800개 도서관의 신간/베스트셀러 재고를 0원에 찾아드립니다. 대출 가능 여부까지 3초 만에 확인하세요.',
  keywords: [
    '우리도서관',
    '도서관',
    '도서관검색',
    '대출가능조회',
    '책이음',
    '책바다',
    '책육아',
    '공공도서관',
  ],
  authors: [{ name: 'Woori Library' }],
  creator: 'Woori Library',
  publisher: 'Woori Library',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: '우리도서관',
    description:
      '아직도 책 사서 보세요? 전국 2,800개 도서관의 신간/베스트셀러 재고를 0원에 찾아드립니다.',
    url: 'https://woorilib.com',
    siteName: '우리도서관',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '우리도서관',
    description:
      '아직도 책 사서 보세요? 전국 2,800개 도서관의 신간/베스트셀러 재고를 0원에 찾아드립니다.',
  },
  verification: {
    google: 'lgrYKoxQ9rWQHtQEBWV37D8ccvFxt_3fxXJiHcqme7w',
    other: {
      'naver-site-verification': '9d8a4cc57e00123b69ccce9581b98158dae30924',
      'google-adsense-account': 'ca-pub-4234312634957489',
    },
  },
  alternates: {
    canonical: 'https://woorilib.com',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '우리도서관',
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body
        className="antialiased min-h-screen flex flex-col bg-white text-gray-900"
        style={{ fontFamily: 'var(--font-noto-sans), -apple-system, sans-serif' }}
      >
        <UserModeSyncer />
        <OnboardingModal />
        <div className="flex-1 w-full">{children}</div>
        <Footer />
        <ContactSupport />
        <Toaster position="top-center" />
        <GlobalLoadingOverlay />
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
