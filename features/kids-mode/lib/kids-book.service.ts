import { bookRepository } from '@/entities/book/repository/book.repository.impl';
import { Book } from '@/entities/book/model/types';

export class KidsBookService {
  /**
   * 연령별 맞춤 추천 도서 조회
   * '우리 아이' 탭의 핵심 로직 (0~7세)
   */
  async getRecommendationsByAge(age: string): Promise<Book[]> {
    try {
      let keywords: string[] = [];
      
      // 키워드 분산 검색 (OR 조건을 흉내내기 위해 병렬 호출)
      if (age === '0-2') {
        keywords = ['보드북', '초점책', '촉각책', '사운드북'];
      } else if (age === '3-5') {
        keywords = ['생활습관', '인성동화', '배변훈련', '공룡'];
      } else if (age === '6-7') {
        keywords = ['한글공부', '과학동화', '전래동화', '수학동화'];
      } else {
        keywords = ['학습만화', '법천자문', 'Why?', '흔한남매', '초등 과학'];
      }

      // 3. 병렬 Request (최대 4개)
      const requests = keywords.map(keyword => 
        bookRepository.searchBooks({
          query: keyword,
          pageSize: 10,
          sort: 'loan', // 인기도순
        })
      );

      const results = await Promise.all(requests);
      
      // 4. 결과 병합 및 중복 제거
      const allBooks = results.flatMap(r => r.books);
      const uniqueBooksMap = new Map<string, Book>();
      
      allBooks.forEach(book => {
        if (!uniqueBooksMap.has(book.isbn13 || book.isbn)) {
          uniqueBooksMap.set(book.isbn13 || book.isbn, book);
        }
      });

      let mergedBooks = Array.from(uniqueBooksMap.values());

      // 5. 대출 횟수(loanCnt) 기준 내림차순 정렬 (서로 다른 키워드 결과 섞기)
      mergedBooks.sort((a, b) => (b.loanCnt || 0) - (a.loanCnt || 0));

      // 6. 결과 자르기
      let finalBooks = mergedBooks.slice(0, 12);

      // Fallback: 결과가 너무 적으면(3권 미만), 기존 인기 대출 API로 보강
      if (finalBooks.length < 3) {
        let apiAge = '0';
        if (age === '6-7') apiAge = '6';
        if (age === '8-10' || age === '8-13') apiAge = 'a8'; 

        const fallbackBooks = await bookRepository.getPopularBooks({
           age: apiAge,
           addCode: '7',
           pageSize: 12
        });
        return fallbackBooks;
      }

      return finalBooks;
    } catch (error) {
      console.error('[KidsBookService] Failed to get recommendations:', error);
      return [];
    }
  }

  /**
   * 지역별 우리 아이 인기 도서
   */
  async getPopularBooks(regionCode?: string): Promise<Book[]> {
    return bookRepository.getPopularBooks({
      region: regionCode,
      age: '0;6;8', // 전 연령대 아동 (0~13세)
      addCode: '7',
      pageSize: 15
    });
  }

  // --- Helper ---
  private mapAgeToApi(age: string): string {
    if (age === '0-2') return '0';
    if (age === '3-5') return '0'; // 6세 미만은 0으로 통합되는 추세이나, API 스펙에 따름
    if (age === '6-7') return '6';
    return 'a8';
  }
}

export const kidsBookService = new KidsBookService();
