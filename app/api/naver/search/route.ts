import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const start = searchParams.get("start") || "1";
  const display = searchParams.get("display") || "10";

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Naver API credentials not configured" },
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
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Naver Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
