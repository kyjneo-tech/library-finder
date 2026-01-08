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
  private readonly baseUrl = API_CONFIG.LIBRARY_API_BASE;
  private readonly authKey = API_CONFIG.LIBRARY_API_KEY;

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append("authKey", this.authKey);
    url.searchParams.append("format", "json");

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
      console.log("[BookRepository] Searching via Naver API:", filters);
      
      const query = filters.query || "";
      const pageNo = filters.pageNo || 1;
      const pageSize = filters.pageSize || 10;

      const response = await fetch(`/api/naver/search?query=${encodeURIComponent(query)}&start=${pageNo}&display=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`Naver API error: ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];
      const totalCount = data.total || 0;

      // 네이버 API 응답 매핑
      const books = items.map((item: any) => ({
        isbn: item.isbn.split(" ")[1] || item.isbn.split(" ")[0], // 10/13자리 공백 구분됨
        isbn13: item.isbn.split(" ")[1] || item.isbn, // 뒷부분이 13자리일 확률 높음
        title: item.title.replace(/<[^>]*>?/gm, ""), // 태그 제거
        author: item.author.replace(/<[^>]*>?/gm, ""),
        publisher: item.publisher.replace(/<[^>]*>?/gm, ""),
        publishYear: item.pubdate?.substring(0, 4) || "",
        bookImageURL: item.image,
        description: item.description?.replace(/<[^>]*>?/gm, ""),
      }));

      return {
        books: books.map((book: any) => BookSchema.parse(book)),
        totalCount,
      };
    } catch (error) {
      console.error("Search books error:", error);
      return { books: [], totalCount: 0 };
    }
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

      // 지역 코드 처리 로직 개선
      if (regionCode) {
        if (regionCode.length === 2) {
           // 시/도 단위 (예: 11 서울)
           params.region = regionCode;
        } else if (regionCode.length === 5) {
           // 시/군/구 단위 (예: 11010 종로구)
           // API 매뉴얼에 따르면 dtl_region을 쓰려면 region도 보내야 할 수 있음.
           // 보통 11010의 앞 2자리가 region이 됨.
           params.region = regionCode.substring(0, 2);
           params.dtl_region = regionCode;
        }
      } else {
        // 기본값: 서울
        params.region = "11";
      }

      console.log(`[BookRepository] getLibrariesWithBook params:`, params);
      const data = await this.fetch("libSrchByBook", params);
      console.log(`[BookRepository] libSrchByBook response:`, JSON.stringify(data, null, 2));

      const libraries = (data as any).response?.libs || [];
      console.log(`[BookRepository] Found ${libraries.length} libraries.`);

      if (libraries.length === 0) {
          console.warn(`[BookRepository] No libraries found for ISBN: ${isbn}, Region: ${regionCode}`);
      }

      return {
        libraries: libraries.map((libWrapper: any) => {
          const lib = libWrapper.lib;
          return BookAvailabilitySchema.parse({
            isbn,
            libraryCode: lib.libCode,
            libraryName: lib.libName,
            hasBook: true,
            loanAvailable: false,
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
      console.log("[BookRepository] getPopularBooks called with options:", options);
      
      const params: any = {
        age: options?.age,
        gender: options?.gender,
        addCode: options?.addCode,
        kdc: options?.kdc,
        startDt: options?.startDt,
        endDt: options?.endDt,
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      };

      if (options?.region) {
        if (options.region.length === 5) {
          params.region = options.region.substring(0, 2);
          params.dtl_region = options.region;
        } else {
          params.region = options.region;
        }
      }

      const data = await this.fetch("loanItemSrch", params);

      console.log("[BookRepository] loanItemSrch response:", data);
      const books = (data as any).response?.docs || [];
      console.log("[BookRepository] Parsed books count:", books.length);
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
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



  async deepScanLibraries(isbn: string, regionCode: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }> {
    try {
      // 1. 해당 지역 모든 도서관 조회
      let region = regionCode;
      let dtl_region = undefined;

      if (regionCode.length === 5) {
        region = regionCode.substring(0, 2);
        dtl_region = regionCode;
      }

      console.log(`[DeepScan] Fetching libraries for region: ${regionCode}`);
      const { libraries: allLibraries } = await libraryRepository.getLibraries({
        region,
        dtl_region,
        pageSize: 100, // 충분히 많이 조회
      });

      console.log(`[DeepScan] Checking ${allLibraries.length} libraries...`);

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
      loanCnt: Number(data.loanCnt) || undefined,
      ranking: Number(data.ranking) || undefined,
    };
  }
}

// Singleton 인스턴스
export const bookRepository = new BookRepositoryImpl();
