import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "우리 가족 도서관",
    short_name: "우리가족도서관",
    description: "내 주변 도서관 대출 현황 실시간 확인 및 맞춤 도서 추천",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
