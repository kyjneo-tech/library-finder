import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRemainingRequests } from "@/shared/lib/utils/rate-limit";

const BASE_URL = process.env.NEXT_PUBLIC_LIBRARY_API_BASE || "http://data4library.kr/api";
const API_KEY = process.env.LIBRARY_API_KEY || process.env.NEXT_PUBLIC_LIBRARY_API_KEY;

// Rate Limit 설정
const RATE_LIMIT = 100; // 분당 최대 요청 수
const RATE_WINDOW = 60000; // 1분

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // 🛡️ Rate Limiting 체크
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
  
  if (!checkRateLimit(clientIp, RATE_LIMIT, RATE_WINDOW)) {
    const remaining = getRemainingRequests(clientIp, RATE_LIMIT);
    return NextResponse.json(
      { error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
      { 
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": String(remaining),
        }
      }
    );
  }

  // 🛡️ 보안 체크: 내 사이트에서 온 요청인지 확인 (CORS 대용)
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  
  // 개발 환경(localhost)이 아니고, referer가 내 호스트를 포함하지 않으면 차단
  if (process.env.NODE_ENV === "production" && referer && host && !referer.includes(host)) {
    console.warn(`[API Proxy] Blocked request from: ${referer}`);
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { path } = await params;
  const endpoint = path.join("/");
  
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams(searchParams);

  // 서버 환경 변수에서 API 키 주입 (클라이언트에서 온 키가 있다면 무시하거나 덮어씌움)
  if (API_KEY) {
    query.set("authKey", API_KEY);
  }
  
  // 포맷은 JSON 고정
  query.set("format", "json");

  const url = `${BASE_URL}/${endpoint}?${query.toString()}`;

  console.log(`[API Proxy] Forwarding to: ${BASE_URL}/${endpoint}`);

  // 🛡️ 캐싱 전략 설정
  // 실시간성이 필요한 API (대출 가능 여부 등)는 캐싱하지 않음
  const NO_CACHE_ENDPOINTS = ['bookExist', 'usageAnalysisList', 'usageTrend'];
  const shouldCache = !NO_CACHE_ENDPOINTS.some(path => endpoint.includes(path));

  try {
    const fetchOptions: RequestInit = {};
    
    // Next.js Data Cache 설정 (서버 측 캐싱)
    if (shouldCache) {
      fetchOptions.next = { revalidate: 86400 }; // 24시간 캐시
    } else {
      fetchOptions.cache = 'no-store'; // 캐시 안 함
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // CDN 캐시 헤더 설정 (클라이언트/CDN 측 캐싱)
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (shouldCache) {
        // 24시간(86400초) 동안 신선함 유지, 이후 1시간(3600초) 동안은 낡은 캐시 허용하며 백그라운드 갱신
        headers["Cache-Control"] = "public, s-maxage=86400, stale-while-revalidate=3600";
    } else {
        headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
