import { Library, LibrarySearchFilters, LibraryStats } from '../model/types';

/**
 * 도서관 Repository 인터페이스
 */
export interface LibraryRepository {
  /**
   * 도서관 목록 조회 (API #1)
   */
  getLibraries(filters?: LibrarySearchFilters): Promise<{
    libraries: Library[];
    totalCount: number;
  }>;

  /**
   * 도서관 상세 정보 조회 (API #14)
   */
  getLibraryDetail(libCode: string): Promise<Library | null>;

  /**
   * 도서관별 인기 도서 조회 (API #15)
   */
  getLibraryPopularBooks(libCode: string): Promise<any[]>;

  /**
   * 도서관별 대출/반납 추이 (API #10)
   */
  getLibraryStats(libCode: string, year: string, month: string): Promise<LibraryStats | null>;
}
