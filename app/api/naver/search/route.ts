import { NextResponse, NextRequest } from 'next/server';
import { checkRateLimit, getRemainingRequests } from '@/shared/lib/utils/rate-limit';

// Rate Limit 설정
const RATE_LIMIT = 200; // 분당 최대 요청 수 (대량 조회 대응을 위해 상향)
const RATE_WINDOW = 60000; // 1분

export async function GET(request: NextRequest) {
  // 🛡️ Rate Limiting 체크
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(clientIp, RATE_LIMIT, RATE_WINDOW)) {
    const remaining = getRemainingRequests(clientIp, RATE_LIMIT);
    return NextResponse.json(
      { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    );
  }

  // 🛡️ 보안 체크: 내 사이트에서 온 요청인지 확인
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (process.env.NODE_ENV === 'production' && referer && host && !referer.includes(host)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const start = searchParams.get('start') || '1';
  const display = searchParams.get('display') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET');
    return NextResponse.json(
      { error: '검색 서비스 설정이 완료되지 않았습니다. 관리자에게 문의하세요.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(
        query
      )}&start=${start}&display=${display}&sort=sim`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        next: { revalidate: 86400 }, // 🛡️ 24시간 캐싱 (할당량 절약 핵심)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Naver Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
