import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_LIBRARY_API_BASE || "http://data4library.kr/api";
const API_KEY = process.env.LIBRARY_API_KEY || process.env.NEXT_PUBLIC_LIBRARY_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
