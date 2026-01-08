import { API_CONFIG } from "@/shared/config/constants";
import {
  Book,
  BookAvailability,
  BookSearchFilters,
  PopularBooksOptions,
  BookSchema,
  BookAvailabilitySchema,
} from "../model/types";

import { BookRepository } from "./book.repository";
import { libraryRepository } from "../../library/repository/library.repository.impl";

export class BookRepositoryImpl implements BookRepository {
  // private readonly baseUrl = API_CONFIG.LIBRARY_API_BASE; // 이제 사용 안 함
  // private readonly authKey = API_CONFIG.LIBRARY_API_KEY; // 이제 사용 안 함

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // ✅ 보안 프록시(/api/libraries)를 통해 호출
    // 클라이언트 사이드에서는 상대 경로 사용 가능
    const url = new URL(`/api/libraries/${endpoint}`, typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Details:", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        errorBody: errorText,
      });
      throw new Error(
        `API Error [${response.status}]: ${response.statusText}. Endpoint: ${endpoint}`
      );
    }

    return response.json();
  }

  async searchBooks(filters: BookSearchFilters): Promise<{ books: Book[]; totalCount: number }> {
    try {
      console.log("[BookRepository] Searching via Library Data API:", filters);
      
      const query = filters.query || "";
      const pageNo = filters.pageNo || 1;
      const pageSize = filters.pageSize || 10;

      // 도서관 실적 데이터 기반 검색 (실제로 도서관에 존재하는 책들만 검색됨)
      const data = await this.fetch("srchBooks", {
        keyword: query,
        pageNo,
        pageSize,
        sort: "loan", // 대출순 정렬로 대여 가능 확률 높은 도서 우선 노출
        order: "desc"
      });
      
      const docs = (data as any).response?.docs || [];
      const totalCount = Number((data as any).response?.numFound) || 0;

      if (docs.length === 0) {
        console.log("[BookRepository] No library results, falling back to Naver Search...");
        // 만약 도서관 데이터에 없으면 최후의 수단으로 네이버 검색 사용
        return this.searchViaNaver(query, pageNo, pageSize);
      }

      const books = docs.map((item: any) => BookSchema.parse(this.mapBookData(item.doc)));

      return {
        books,
        totalCount,
      };
    } catch (error) {
      console.error("Search books error:", error);
      return { books: [], totalCount: 0 };
    }
  }

  // 최후의 수단: 네이버 검색 로직 분리
  private async searchViaNaver(query: string, pageNo: number, pageSize: number) {
    const response = await fetch(`/api/naver/search?query=${encodeURIComponent(query)}&start=${pageNo}&display=${pageSize}`);
    if (!response.ok) return { books: [], totalCount: 0 };
    
    const data = await response.json();
    const items = data.items || [];
    const books = items.map((item: any) => BookSchema.parse({
        isbn: item.isbn.split(" ")[1] || item.isbn.split(" ")[0],
        isbn13: item.isbn.split(" ")[1] || item.isbn,
        title: item.title.replace(/<[^>]*>?/gm, ""),
        author: item.author.replace(/<[^>]*>?/gm, ""),
        publisher: item.publisher.replace(/<[^>]*>?/gm, ""),
        publishYear: item.pubdate?.substring(0, 4) || "",
        bookImageURL: item.image,
        description: item.description?.replace(/<[^>]*>?/gm, ""),
    }));

    return { books, totalCount: data.total || 0 };
  }

  async getBookDetail(isbn: string): Promise<Book | null> {
    try {
      const data = await this.fetch("srchDtlList", { isbn13: isbn, loaninfoYN: "Y" });
      const bookDetail = (data as any).response?.detail?.[0]?.book;

      if (!bookDetail) return null;

      return BookSchema.parse(this.mapBookData(bookDetail));
    } catch (error) {
      console.error("Get book detail error:", error);
      return null;
    }
  }

  async getBookAvailability(isbn: string, libCode?: string): Promise<BookAvailability[]> {
    try {
      if (!libCode) return [];

      const data = await this.fetch("bookExist", {
        isbn13: isbn,
        libCode,
      });

      const result = (data as any).response?.result;

      if (!result) return [];

      return [
        BookAvailabilitySchema.parse({
          isbn,
          libraryCode: libCode,
          libraryName: "Unknown Library", // bookExist 응답에는 도서관 이름이 없음 (API 한계). 필요 시 별도 조회 필요하나 여기선 생략.
          hasBook: result.hasBook === "Y",
          loanAvailable: result.loanAvailable === "Y",
          returnDate: undefined, // bookExist에는 반납 예정일 없음
        }),
      ];
    } catch (error) {
      console.error("Get book availability error:", error);
      return [];
    }
  }

  async getLibrariesWithBook(isbn: string, regionCode?: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }> {
    try {
      const params: any = { isbn };

      // 🛡️ [개선] 수원/안양 등 '구'가 있는 도시의 누락 방지 로직
      if (regionCode) {
        if (regionCode.length === 5) {
           // 5자리 코드(수원시 31010)가 들어오면 상위 시/도(경기도 31)로 일단 검색
           // 이렇게 해야 하위 '구'들에 있는 도서관들이 싹 잡힙니다.
           params.region = regionCode.substring(0, 2);
           params.dtl_region = regionCode; 
        } else {
           params.region = regionCode;
        }
      } else {
        params.region = "11"; // 기본값 서울
      }

      console.log(`[BookRepository] Searching libraries for ISBN: ${isbn}, RegionParams:`, params);
      const data = await this.fetch("libSrchByBook", params);
      let libraries = (data as any).response?.libs || [];

      // 만약 세부지역(구) 검색 결과가 너무 적으면, 해당 도(Province) 전체로 확장해서 재검색
      if (libraries.length === 0 && params.dtl_region) {
          console.log(`[BookRepository] No libs in ${params.dtl_region}, expanding search to region ${params.region}...`);
          delete params.dtl_region;
          const expandedData = await this.fetch("libSrchByBook", params);
          libraries = (expandedData as any).response?.libs || [];
      }

      return {
        libraries: libraries.map((libWrapper: any) => {
          const lib = libWrapper.lib;
          return BookAvailabilitySchema.parse({
            isbn,
            libraryCode: lib.libCode,
            libraryName: lib.libName,
            hasBook: true,
            loanAvailable: false, // 기본값, 이후 bookExist로 업데이트됨
            returnDate: undefined,
            latitude: lib.latitude,
            longitude: lib.longitude,
            homepage: lib.homepage || undefined,
          });
        }),
        totalCount: libraries.length,
      };
    } catch (error) {
      console.error("Get libraries with book error:", error);
      return { libraries: [], totalCount: 0 };
    }
  }

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

      // 📅 데이터 누락 방지를 위해 기본 검색 기간을 최근 3개월로 설정 (매뉴얼 권장)
      if (!options?.startDt) {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        params.startDt = date.toISOString().split('T')[0];
      } else {
        params.startDt = options.startDt;
      }
      params.endDt = options?.endDt || new Date().toISOString().split('T')[0];

      let endpoint = "loanItemSrch";

      if (options?.region) {
        endpoint = "loanItemSrchByLib"; 
        if (options.region.length === 5) {
          params.region = options.region.substring(0, 2);
          params.dtl_region = options.region;
        } else {
          params.region = options.region;
        }
      }

      console.log(`[BookRepository] Fetching from ${endpoint} with params:`, params);
      const data = await this.fetch(endpoint, params);
      let docs = (data as any).response?.docs || [];

      // 🛡️ [Fallback 로직] 세부 지역 데이터가 0건인 경우 광역 지역으로 재시도
      if (docs.length === 0 && params.dtl_region) {
        console.warn(`[BookRepository] No data for dtl_region ${params.dtl_region}. Falling back to region ${params.region}...`);
        delete params.dtl_region;
        const fallbackData = await this.fetch(endpoint, params);
        docs = (fallbackData as any).response?.docs || [];
      }

      return docs.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch (error) {
      console.error("[BookRepository] Get popular books error:", error);
      return [];
    }
  }

  async getTrendingBooks(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const searchDt = options?.endDt || new Date().toISOString().split("T")[0];
      const data = await this.fetch("hotTrend", {
        searchDt,
      });

      const results = (data as any).response?.results || [];
      // hotTrend 응답: results -> result -> docs -> doc
      const books = results[0]?.result?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch (error) {
      console.error("Get trending books error:", error);
      return [];
    }
  }

  async getNewArrivals(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      // 신착도서조회(newArrivalBook)는 libCode가 필수이므로, 
      // 범용적인 신간 조회를 위해 도서검색(srchBooks) API를 활용하여 출판일순 정렬로 대체함.
      const data = await this.fetch("srchBooks", {
        sort: "pubYear",
        order: "desc",
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      });

      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch (error) {
      console.error("Get new arrivals error:", error);
      return [];
    }
  }

  async getRecommendedForEnthusiasts(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const data = await this.fetch("recommandList", {
        type: "mania",
        isbn13: "9788983922571", // 샘플 ISBN, 실제로는 입력받아야 함. 일단 하드코딩 또는 options에서 받아야 하나 options에 isbn 없음.
        // maniaList는 특정 책 기반 추천이므로 ISBN 필수. 
        // 일단 인기있는 책 하나를 기준으로 하거나 빈 리스트 반환해야 함.
        // 여기서는 임시로 빈 리스트 처리 또는 에러 방지.
      });
      // FIXME: ISBN이 필요한데 options에 없음. 일단 넘어가지만 추후 수정 필요.
      
      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.book)));
    } catch (error) {
      console.error("Get enthusiast recommendations error:", error);
      return [];
    }
  }

  async getRecommendedForReaders(isbn: string): Promise<Book[]> {
    try {
      const data = await this.fetch("recommandList", {
        isbn13: isbn,
        type: "reader",
      });
      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.book)));
    } catch (error) {
      console.error("Get reader recommendations error:", error);
      return [];
    }
  }

  async getMonthlyKeywords(): Promise<string[]> {
    try {
      const data = await this.fetch("monthlyKeywords");
      const keywords = (data as any).response?.keywords || [];
      return keywords.map((k: any) => k.word || k.keyword);
    } catch (error) {
      console.error("Get monthly keywords error:", error);
      return [];
    }
  }

  async getUsageAnalysis(isbn: string): Promise<any> {
    try {
      const data = await this.fetch("usageAnalysisList", { isbn13: isbn });
      return (data as any).response || null;
    } catch (error) {
      console.error("Get usage analysis error:", error);
      return null;
    }
  }

  async getBlogReviews(title: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/naver/blog?query=${encodeURIComponent(title)}&display=3`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      return [];
    }
  }



  async deepScanLibraries(isbn: string, regionCode: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }> {
    try {
      // 1. 해당 지역 모든 도서관 조회
      let region = regionCode.substring(0, 2);
      let dtl_region: string | undefined = regionCode;

      // 🛡️ 수원(31010), 안양(31040) 처럼 구가 있는 도시인 경우
      // dtl_region을 넣으면 하위 구 도서관이 누락될 수 있으므로, 
      // 아예 region(경기도)으로 넓게 받고 dtl_region으로 시작하는 코드들만 필터링하거나
      // API 특성에 따라 dtl_region을 비우고 상위 코드로만 조회하는 방식 선택
      console.log(`[DeepScan] Fetching libraries for regionCode: ${regionCode}`);
      
      const { libraries: allLibraries } = await libraryRepository.getLibraries({
        region,
        dtl_region: dtl_region, 
        pageSize: 150, 
      });

      // 만약 시 코드로 조회했는데 결과가 너무 적으면 '구' 단위 누락 가능성 -> 도(Province) 전체 조회로 전환
      let targetLibraries = allLibraries;
      if (allLibraries.length < 5) {
          const { libraries: provinceLibraries } = await libraryRepository.getLibraries({
            region,
            pageSize: 500,
          });
          // 내가 선택한 도시 코드로 시작하는 도서관들만 필터링 (예: 31010 수원 시 내의 모든 도서관)
          targetLibraries = provinceLibraries.filter(lib => String(lib.libCode).startsWith(regionCode.substring(0, 4)));
      }

      console.log(`[DeepScan] Checking ${targetLibraries.length} target libraries...`);

      // 2. 병렬로 소장 여부 확인 (bookExist API)
      const checkPromises = allLibraries.map(async (lib) => {
        try {
          const availability = await this.getBookAvailability(isbn, lib.libCode);
          
          if (availability.length > 0 && availability[0].hasBook) {
            // bookExist 결과에는 위경도/홈페이지가 없으므로 도서관 정보에서 병합
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
        } catch (e) {
          return null;
        }
      });

      const results = await Promise.all(checkPromises);
      const validResults = results.filter((r) => r !== null) as BookAvailability[];

      console.log(`[DeepScan] Found ${validResults.length} libraries.`);

      return {
        libraries: validResults,
        totalCount: validResults.length,
      };
    } catch (error) {
      console.error("Deep scan error:", error);
      return { libraries: [], totalCount: 0 };
    }
  }

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
      keywords: data.keywords ? data.keywords.split(";") : undefined,
      loanCnt: data.loan_count || data.loanCnt ? Number(data.loan_count || data.loanCnt) : undefined,
      ranking: data.ranking ? Number(data.ranking) : undefined,
      additionSymbol: data.addition_symbol || data.additionSymbol, // 부가기호(대상) 추가
    };
  }
}

// Singleton 인스턴스
export const bookRepository = new BookRepositoryImpl();
