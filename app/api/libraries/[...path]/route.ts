import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_LIBRARY_API_BASE || "http://data4library.kr/api";
const API_KEY = process.env.LIBRARY_API_KEY || process.env.NEXT_PUBLIC_LIBRARY_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // ✅ [API 다이어트] 캐시 시간을 24시간으로 대폭 연장 (API 쿼터 절약 핵심)
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
