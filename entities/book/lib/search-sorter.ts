import { Book } from '../model/types';

/**
 * 도서 검색 결과 재정렬 로직 (Client-side Sorting)
 * API가 정확도순 정렬을 제공하지 않으므로, 클라이언트에서 정확도 보정
 */
export function sortBooksByRelevance(books: Book[], query: string): Book[] {
  if (!query) return books;

  const normalizedQuery = query.toLowerCase().trim();

  return [...books].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, normalizedQuery);
    const scoreB = calculateRelevanceScore(b, normalizedQuery);

    // 점수가 높을수록 앞으로
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // 점수가 같으면 대출 건수(loanCnt) 내림차순 (인기도)
    const loanA = a.loanCnt || 0;
    const loanB = b.loanCnt || 0;
    return loanB - loanA;
  });
}

function calculateRelevanceScore(book: Book, query: string): number {
  const title = (book.title || '').toLowerCase();
  const author = (book.author || '').toLowerCase();
  
  // 1. 제목 정확히 일치 (가장 높은 점수)
  if (title === query) return 100;

  // 2. 제목이 검색어로 시작 (시리즈물의 경우 중요)
  if (title.startsWith(query)) return 90;

  // 3. 제목에 검색어 포함 (공백 포함 정확도)
  if (title.includes(query)) return 80;

  // 4. 저자에 검색어 포함
  if (author.includes(query)) return 70;

  // 5. 제목에서 특수문자 제거 후 포함 여부 (느슨한 매칭)
  const cleanTitle = title.replace(/[^a-z0-9가-힣\s]/g, '');
  const cleanQuery = query.replace(/[^a-z0-9가-힣\s]/g, '');
  if (cleanTitle.includes(cleanQuery)) return 60;

  return 0;
}
