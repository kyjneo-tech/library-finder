import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 도서관정보나루 (도서 이미지)
      {
        protocol: "https",
        hostname: "cover.nl.go.kr",
      },
      {
        protocol: "http",
        hostname: "cover.nl.go.kr",
      },
      {
        protocol: "https",
        hostname: "image.aladin.co.kr",
      },
      // 네이버 책 이미지
      {
        protocol: "https",
        hostname: "shopping-phinf.pstatic.net",
      },
      {
        protocol: "https",
        hostname: "bookthumb-phinf.pstatic.net",
      },
      // 기타 필요한 이미지 소스
      {
        protocol: "https",
        hostname: "contents.kyobobook.co.kr",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // XSS 공격 방어
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 클릭재킹 방어
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // DNS Prefetch 제어
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Referrer 정책 (개인정보 보호)
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 불필요한 브라우저 기능 차단
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          // HTTPS 강제 (프로덕션 환경에서만 활성화)
          // ...(process.env.NODE_ENV === "production"
          //   ? [
          //       {
          //         key: "Strict-Transport-Security",
          //         value: "max-age=31536000; includeSubDomains",
          //       },
          //     ]
          //   : []),
          // Content Security Policy (단계적 적용)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com http://dapi.kakao.com *.daumcdn.net https://pagead2.googlesyndication.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: http: *.daumcdn.net *.kakaocdn.net",
              "font-src 'self' data:",
              "connect-src 'self' https://dapi.kakao.com http://dapi.kakao.com *.daumcdn.net https://openapi.naver.com http://data4library.kr https://*.data4library.kr",
              "frame-src 'self' https://pagead2.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
