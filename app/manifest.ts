import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '우리도서관',
    short_name: '우리도서관',
    description: '내 손안의 공공도서관, 우리도서관! 책육아부터 전문서적까지 전국 도서관을 통합 검색하세요.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
