import { cacheService } from '../services/cache.service';

/**
 * 책 표지 이미지 Fallback 유틸리티
 * 도서관 API에서 표지가 없을 때 네이버 API에서 가져옴
 * localStorage + Supabase 영구 캐시 적용
 */

// 검색 쿼리 정제 (특수문자 제거)
function cleanSearchQuery(title: string): string {
  return title
    .replace(/[()[\]{}:;!?…·]/g, ' ') // 괄호, 콜론 등 제거
    .replace(/\s+/g, ' ')              // 중복 공백 제거
    .trim();
}

// 네이버 API로 책 표지 가져오기
async function searchNaverBookImage(query: string): Promise<string | null> {
  try {
    // Top 3개를 가져와서 이미지가 있는 첫 번째 항목 선택
    const response = await fetch(`/api/naver/search?query=${encodeURIComponent(query)}&display=3`);
    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const itemWithImage = data.items.find((item: any) => item.image && item.image.trim() !== '');
      return itemWithImage?.image || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 책 표지 이미지 가져오기 (Fallback 지원 + 캐시 서비스)
 * @param existingImageUrl - 기존 이미지 URL (도서관 API에서 받은 값)
 * @param isbn - ISBN (있으면 우선 검색)
 * @param title - 책 제목 (ISBN 실패 시 사용)
 * @returns 이미지 URL 또는 null
 */
export async function getBookCoverImage(
  existingImageUrl: string | undefined | null,
  isbn: string | undefined | null,
  title: string | undefined | null
): Promise<string | null> {
  // 1. 기존 이미지가 유효하면 그대로 사용
  if (existingImageUrl && existingImageUrl.trim() !== '') {
    // 유효한 이미지가 있으면 캐시에도 저장 (나중을 위해)
    if (isbn) {
      // 비동기로 조용히 저장 (사용자 대기 X)
      cacheService.getBookCover(isbn, async () => existingImageUrl).catch(() => {});
    }
    return existingImageUrl;
  }

  // 2. ISBN이 있으면 캐시 서비스(Memory -> Local -> Supabase) 조회
  // 없다면 네이버 API(SDK 호출)로 검색
  if (isbn && isbn.trim() !== '') {
    const cachedOrFetched = await cacheService.getBookCover(isbn, async () => {
      // 캐시 없음 -> API 호출 (Callback)
      return searchNaverBookImage(isbn);
    });
    
    if (cachedOrFetched) return cachedOrFetched;
  }

  // 3. 제목으로 검색 (특수문자 정제 후) - 제목 검색은 캐시 키가 애매하므로 API 호출 후 ISBN 기반 저장 시도
  if (title && title.trim() !== '') {
    const cleanedTitle = cleanSearchQuery(title);
    
    // 제목 검색은 캐시하기 어려우므로 (동음이의어 등) 직접 호출하되, 결과가 있으면 ISBN 키로 저장
    const titleResult = await searchNaverBookImage(cleanedTitle);
    
    if (titleResult && isbn) {
      // ISBN 키로 저장해두면 다음에 ISBN으로 조회 시 캐시 히트
      cacheService.getBookCover(isbn, async () => titleResult).catch(() => {});
      return titleResult;
    }
    
    if (titleResult) return titleResult;
  }

  return null;
}

/**
 * 여러 책의 표지를 일괄 가져오기 (Rate Limit 방지용 배치 처리)
 */
export async function getBookCoverImages(
  books: Array<{
    bookImageURL?: string;
    isbn?: string;
    isbn13?: string;
    title?: string;
  }>
): Promise<string[]> {
  const BATCH_SIZE = 5;
  const BATCH_DELAY = 100;

  const results: string[] = [];

  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map((book) =>
        getBookCoverImage(
          book.bookImageURL,
          book.isbn13 || book.isbn,
          book.title
        )
      )
    );
    
    results.push(...batchResults.map(r => r || ''));

    // Rate limit 방지 딜레이
    if (i + BATCH_SIZE < books.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
    }
  }

  return results;
}
