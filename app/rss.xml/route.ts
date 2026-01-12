import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://woorilib.com';
  const buildDate = new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>우리 가족 도서관</title>
    <link>${baseUrl}</link>
    <description>동네 도서관 실시간 대출 확인 &amp; 맞춤 책 추천</description>
    <language>ko</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>

    <item>
      <title>우리 가족 도서관 - 동네 도서관 대출 현황 및 맞춤 책 추천</title>
      <link>${baseUrl}</link>
      <description>안양시, 수원시 등 전국 우리 동네 도서관의 실제 대출 현황을 실시간으로 확인하세요. 0~2세 영유아부터 성인까지 가족 모두를 위한 맞춤형 도서 추천 서비스를 제공합니다.</description>
      <pubDate>${buildDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}</guid>
    </item>

    <item>
      <title>도서관 검색 - 우리 가족 도서관</title>
      <link>${baseUrl}/search</link>
      <description>전국 공공도서관에서 원하는 책을 검색하고 대출 가능 여부를 확인하세요.</description>
      <pubDate>${buildDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/search</guid>
    </item>
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
