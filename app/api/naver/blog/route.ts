import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
