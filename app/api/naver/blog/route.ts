import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 🛡️ 보안 체크: 내 사이트에서 온 요청인지 확인
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  
  if (process.env.NODE_ENV === "production" && referer && host && !referer.includes(host)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const display = searchParams.get("display") || "3";

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(
        query + " 서평 리뷰"
      )}&display=${display}&sort=sim`,
      {
        headers: {
          "X-Naver-Client-Id": clientId!,
          "X-Naver-Client-Secret": clientSecret!,
        },
        next: { revalidate: 86400 } // 🛡️ 24시간 캐싱
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
