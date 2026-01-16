import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '우리도서관',
    short_name: '우리도서관',
    description: '아직도 책 사서 보세요? 전국 2,800개 도서관의 신간/베스트셀러 재고를 0원에 찾아드립니다.',
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
