import {
  Book,
  BookAvailability,
  BookSearchFilters,
  PopularBooksOptions,
} from "../model/types";

/**
 * 도서 Repository 인터페이스
 */
export interface BookRepository {
  /**
   * 도서 검색 (API #16)
   */
  searchBooks(filters: BookSearchFilters): Promise<{
    books: Book[];
    totalCount: number;
  }>;

  /**
   * 도서 상세 조회 (API #6)
   */
  getBookDetail(isbn: string): Promise<Book | null>;

  /**
   * 도서 대출 가능 여부 조회 (API #11)
   */
  getBookAvailability(isbn: string, libCode?: string): Promise<BookAvailability[]>;

  /**
   * 도서 소장 도서관 조회 (API #13)
   */
  getLibrariesWithBook(isbn: string, regionCode?: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }>;

  /**
   * 인기 대출 도서 조회 (API #3)
   */
  getPopularBooks(options?: PopularBooksOptions): Promise<Book[]>;

  /**
   * 대출 급상승 도서 조회 (API #12)
   */
  getTrendingBooks(options?: PopularBooksOptions): Promise<Book[]>;

  /**
   * 신착 도서 조회 (API #19)
   */
  getNewArrivals(options?: PopularBooksOptions): Promise<Book[]>;

  /**
   * 마니아 추천 도서 (API #4)
   */
  getRecommendedForEnthusiasts(options?: PopularBooksOptions): Promise<Book[]>;

  /**
   * 다독자 추천 도서 (API #5)
   */
  getRecommendedForReaders(isbn: string): Promise<Book[]>;

  /**
   * 이달의 키워드 (API #17)
   */
  getMonthlyKeywords(): Promise<string[]>;

  /**
   * [Deep Scan] 지역 내 모든 도서관 전수 조사
   */
  deepScanLibraries(isbn: string, regionCode: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }>;
}
