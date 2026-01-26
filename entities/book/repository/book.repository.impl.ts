import { API_CONFIG } from '@/shared/config/constants';
import {
  Book,
  BookAvailability,
  BookSearchFilters,
  PopularBooksOptions,
  BookSchema,
  BookAvailabilitySchema,
} from '../model/types';
import { BookRepository } from './book.repository';
import { libraryRepository } from '@/entities/library/repository/library.repository.impl';
import { findSubRegionByCode } from '@/shared/config/region-codes';
import { libraryApiClient } from '../api/library-api.client';
import { sortBooksByRelevance } from '../lib/search-sorter';

export class BookRepositoryImpl implements BookRepository {
  // 1. 도서 검색 (중앙 로직)
  async searchBooks(filters: BookSearchFilters): Promise<{ books: Book[]; totalCount: number }> {
    try {
      const query = filters.query || '';
      const pageNo = filters.pageNo || 1;
      const pageSize = filters.pageSize || 100;

      let sortParam = filters.sort;
      if (sortParam === 'loan') sortParam = undefined;

      const data = await libraryApiClient.searchBooks({
        keyword: query,
        pageNo,
        pageSize,
        sort: sortParam,
        order: filters.order,
        region: filters.region,
        dtl_region: filters.dtl_region,
      });

      const docs = (data as any).response?.docs || [];
      const totalCount = Number((data as any).response?.numFound) || 0;
      
      const books = docs.map((item: any) => BookSchema.parse(this.mapBookData(item.doc)));
      const sortedBooks = sortBooksByRelevance(books, query);

      return { books: sortedBooks, totalCount };
    } catch (error) {
      return { books: [], totalCount: 0 };
    }
  }

  // 2. 도서 상세 정보
  async getBookDetail(isbn: string): Promise<Book | null> {
    try {
      const data = await libraryApiClient.getBookDetail(isbn);
      const bookDetail = (data as any).response?.detail?.[0]?.book;
      if (!bookDetail) return null;
      return BookSchema.parse(this.mapBookData(bookDetail));
    } catch (error) {
      return null;
    }
  }

  // 3. 도서 소장 여부 확인 (단일)
  async getBookAvailability(isbn: string, libCode?: string): Promise<BookAvailability[]> {
    try {
      if (!libCode) return [];
      // Calls updated LibraryApiClient which handles Direct Fetch (Server) vs Proxy (Client) automatically
      const data = await libraryApiClient.checkBookExistence(isbn, libCode);
      const result = (data as any).response?.result;
      
      if (!result) return [];

      return [
        BookAvailabilitySchema.parse({
          isbn,
          libraryCode: libCode,
          libraryName: 'Unknown Library',
          hasBook: result.hasBook === 'Y',
          loanAvailable: result.loanAvailable === 'Y',
        }),
      ];
    } catch (error) {
      return [];
    }
  }

  // 4. 도서 소장 도서관 찾기 (Deep Scan Logic)
  async getLibrariesWithBook(
    isbn: string,
    regionCode?: string
  ): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }> {
    try {
      const params: any = { isbn, pageSize: 100 }; // Increase default pageSize to 100
      let targetDistrictName: string | undefined;

      if (regionCode) {
        if (regionCode.length >= 5) {
          params.region = regionCode.substring(0, 2);
          params.dtl_region = regionCode; // 🔥 Always use dtl_region for 5-digit codes
          
          const regionInfo = findSubRegionByCode(regionCode);
          if (regionInfo) {
            targetDistrictName = regionInfo.district?.name || regionInfo.subRegion.name;
          }
        } else {
          params.region = regionCode;
        }
      } else {
        params.region = '11';
      }

      const data = await libraryApiClient.searchLibrariesByBook(params);
      let libraries = (data as any).libraries || []; // searchLibrariesByBook returns { libraries, totalCount } directly now

      // 스마트 필터링 로직
      if (targetDistrictName && libraries.length > 0) {
        let filtered = libraries.filter((item: any) => {
          const addr = item.address || '';
          return addr.includes(targetDistrictName!);
        });

        if (filtered.length > 0) {
          libraries = filtered;
        } else {
          const regionInfo = findSubRegionByCode(regionCode!);
          const subRegionName = regionInfo?.subRegion.name;
          if (subRegionName && subRegionName !== targetDistrictName) {
            filtered = libraries.filter((item: any) => {
              const addr = item.address || '';
              return addr.includes(subRegionName);
            });
            libraries = filtered.length > 0 ? filtered : [];
          } else {
            libraries = [];
          }
        }
      }

      // 🔥 [Refactor] 실제 대출 가능 여부 확인은 클라이언트(Store)에서 거리/우선순위 정렬 후 수행하도록 변경.
      // 여기서는 소장 도서관 목록만 빠르게 반환함.
      const librariesWithStatus: BookAvailability[] = libraries.map((lib: any) => {
        return BookAvailabilitySchema.parse({
          isbn,
          libraryCode: lib.libCode,
          libraryName: lib.libName,
          hasBook: true, // 소장 도서관 목록이므로 true
          loanAvailable: false, // 기본값 (클라이언트에서 확인)
          latitude: lib.latitude,
          longitude: lib.longitude,
          homepage: lib.homepage || undefined,
          address: lib.address || undefined,
          tel: lib.tel || undefined,
        });
      });

      return {
        libraries: librariesWithStatus,
        totalCount: Number((data as any).response?.numFound || 0),
      };
    } catch (error) {
       console.error('getLibrariesWithBook error:', error);
       return { libraries: [], totalCount: 0 };
    }
  }

  // 5. 인기 도서 조회
  async getPopularBooks(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const params: any = {
        age: options?.age,
        gender: options?.gender,
        addCode: options?.addCode,
        kdc: options?.kdc,
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      };

      const date = new Date();
      date.setMonth(date.getMonth() - 6);
      params.startDt = date.toISOString().split('T')[0];
      params.endDt = new Date().toISOString().split('T')[0];

      let responseData: any;

      if (options?.libCode) {
        params.libCode = options.libCode;
        responseData = await libraryApiClient.getLoanItemSearchByLib(params);
      } else if (options?.region) {
        params.region = options.region.substring(0, 2);
        responseData = await libraryApiClient.getLoanItemSearchByLib(params);
      } else {
        responseData = await libraryApiClient.getLoanItemSearch(params);
      }

      let docs = responseData?.response?.docs || [];

      if (docs.length === 0 && (options?.region || options?.libCode)) {
        const nationalParams = { ...params };
        delete nationalParams.region;
        delete nationalParams.libCode;
        responseData = await libraryApiClient.getLoanItemSearch(nationalParams);
        docs = responseData?.response?.docs || [];
      }

      return docs.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch (error) {
      return [];
    }
  }

  // 6. 기타 분석 API들
  async getUsageAnalysis(isbn: string): Promise<any> {
    try {
      const data = await libraryApiClient.getUsageAnalysis(isbn);
      return (data as any).response || null;
    } catch { return null; }
  }

  async getBlogReviews(title: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/naver/blog?query=${encodeURIComponent(title)}&display=3`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.items || [];
    } catch { return []; }
  }

  async getTrendingBooks(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const searchDt = options?.endDt || new Date().toISOString().split('T')[0];
      const data = await libraryApiClient.getHotTrend(searchDt);
      const results = (data as any).response?.results || [];
      const books = results[0]?.result?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch { return []; }
  }

  async getNewArrivals(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const data = await libraryApiClient.searchBooks({
        keyword: '', 
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
        sort: 'pubYear',
        order: 'desc',
      });
      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch { return []; }
  }

  async getRecommendedForEnthusiasts(options?: PopularBooksOptions): Promise<Book[]> {
    return []; 
  }

  async getRecommendedForReaders(isbn: string): Promise<Book[]> {
    try {
      const data = await libraryApiClient.getRecommendList(isbn);
      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.book)));
    } catch { return []; }
  }

  async getMonthlyKeywords(): Promise<string[]> {
    try {
      const data = await libraryApiClient.getMonthlyKeywords();
      const keywords = (data as any).response?.keywords || [];
      return keywords.map((k: any) => k.word || k.keyword);
    } catch { return []; }
  }

  async getLibraryUsageTrend(libCode: string, type: 'D' | 'H'): Promise<any> {
    try {
      const data = await libraryApiClient.getUsageTrend(libCode, type);
      return (data as any).response || null;
    } catch { return null; }
  }

  async deepScanLibraries(isbn: string, regionCode: string): Promise<{ libraries: BookAvailability[]; totalCount: number }> {
    try {
      const region = regionCode.substring(0, 2);
      const { libraries: allLibraries } = await libraryRepository.getLibraries({
        region,
        dtl_region: regionCode,
        pageSize: 150,
      });

      const MAX_CHECKS = 30; // Limit for performance
      const BATCH_SIZE = 5;

      const limitedLibraries = allLibraries.slice(0, MAX_CHECKS);
      const validResults: BookAvailability[] = [];

      for (let i = 0; i < limitedLibraries.length; i += BATCH_SIZE) {
        const batch = limitedLibraries.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (lib) => {
          try {
            const availability = await this.getBookAvailability(isbn, lib.libCode); 
            if (availability.length > 0 && availability[0].hasBook) {
              return {
                ...availability[0],
                libraryName: lib.libName,
                latitude: lib.latitude ? String(lib.latitude) : undefined,
                longitude: lib.longitude ? String(lib.longitude) : undefined,
                homepage: lib.homepage || undefined,
                address: lib.address || undefined,
                tel: lib.tel || undefined,
              };
            }
            return null;
          } catch (e) { return null; }
        });
        const batchResults = await Promise.all(batchPromises);
        validResults.push(...(batchResults.filter((r) => r !== null) as BookAvailability[]));
      }
      return { libraries: validResults, totalCount: validResults.length };
    } catch { return { libraries: [], totalCount: 0 }; }
  }

  // --- Helpers ---

  private mapBookData(data: any): Partial<Book> {
    return {
      isbn: data.isbn || data.isbn13,
      isbn13: data.isbn13,
      title: data.bookname || data.title,
      author: data.authors || data.author,
      publisher: data.publisher,
      publishYear: data.publication_year || data.publishYear,
      classNo: data.class_no || data.classNo,
      className: data.class_nm || data.className,
      bookImageURL: data.bookImageURL || data.book_image_url,
      description: data.description,
      keywords: data.keywords ? data.keywords.split(';') : undefined,
      loanCnt:
        data.loan_count || data.loanCnt ? Number(data.loan_count || data.loanCnt) : undefined,
      ranking: data.ranking ? Number(data.ranking) : undefined,
      additionSymbol: data.addition_symbol || data.additionSymbol,
      vol: data.vol,
    };
  }
}

export const bookRepository = new BookRepositoryImpl();
