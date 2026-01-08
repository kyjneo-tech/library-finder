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

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`/api/libraries/${endpoint}`, typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error [${response.status}]: ${response.statusText}`);
    }

    return response.json();
  }

  async searchBooks(filters: BookSearchFilters): Promise<{ books: Book[]; totalCount: number }> {
    try {
      const query = filters.query || "";
      const pageNo = filters.pageNo || 1;
      const pageSize = filters.pageSize || 10;

      const data = await this.fetch("srchBooks", {
        keyword: query,
        pageNo,
        pageSize,
        sort: "loan",
        order: "desc"
      });
      
      const docs = (data as any).response?.docs || [];
      const totalCount = Number((data as any).response?.numFound) || 0;

      if (docs.length === 0) {
        return this.searchViaNaver(query, pageNo, pageSize);
      }

      const books = docs.map((item: any) => BookSchema.parse(this.mapBookData(item.doc)));

      return { books, totalCount };
    } catch (error) {
      console.error("Search books error:", error);
      return { books: [], totalCount: 0 };
    }
  }

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
      return null;
    }
  }

  async getBookAvailability(isbn: string, libCode?: string): Promise<BookAvailability[]> {
    try {
      if (!libCode) return [];
      const data = await this.fetch("bookExist", { isbn13: isbn, libCode });
      const result = (data as any).response?.result;
      if (!result) return [];

      return [
        BookAvailabilitySchema.parse({
          isbn,
          libraryCode: libCode,
          libraryName: "Unknown Library",
          hasBook: result.hasBook === "Y",
          loanAvailable: result.loanAvailable === "Y",
        }),
      ];
    } catch (error) {
      return [];
    }
  }

  async getLibrariesWithBook(isbn: string, regionCode?: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }> {
    try {
      const params: any = { isbn, pageSize: 500 }; 

      if (regionCode) {
        params.region = regionCode.substring(0, 2);
        params.dtl_region = regionCode; // 🛡️ UI에서 보낸 정확한 구 코드를 사용
      } else {
        params.region = "11";
      }

      const data = await this.fetch("libSrchByBook", params);
      const libraries = (data as any).response?.libs || [];

      return {
        libraries: libraries.map((libWrapper: any) => {
          const lib = libWrapper.lib;
          return BookAvailabilitySchema.parse({
            isbn,
            libraryCode: lib.libCode,
            libraryName: lib.libName,
            hasBook: true,
            loanAvailable: false,
            latitude: lib.latitude,
            longitude: lib.longitude,
            homepage: lib.homepage || undefined,
          });
        }),
        totalCount: libraries.length,
      };
    } catch (error) {
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

      const date = new Date();
      date.setMonth(date.getMonth() - 6); // 📅 기간 6개월 확장
      params.startDt = date.toISOString().split('T')[0];
      params.endDt = new Date().toISOString().split('T')[0];

      let endpoint = "loanItemSrch";

      if (options?.region) {
        endpoint = "loanItemSrchByLib"; 
        params.region = options.region.substring(0, 2);
        params.dtl_region = options.region; // 🛡️ 정확한 구 코드 매칭
      }

      // 🛡️ 아동용 필터가 명시적으로 들어온 경우 파라미터 고정
      if (options?.addCode === '7') {
          params.addCode = '7';
      }

      console.log(`[BookRepository] Fetching from ${endpoint}:`, params.dtl_region || "Nationwide");
      const data = await this.fetch(endpoint, params);
      let docs = (data as any).response?.docs || [];

      // 🛡️ [혁신] 데이터 절벽 해결 (의령군 등 결과 0건인 경우)
      if (docs.length === 0 && params.dtl_region) {
          console.warn(`[BookRepository] ${params.dtl_region} has zero data. Falling back to province ${params.region}`);
          // 세부 지역 코드를 비우고 상위 지역(Province)으로 재시도
          delete params.dtl_region;
          const fallbackData = await this.fetch(endpoint, params);
          docs = (fallbackData as any).response?.docs || [];
      }

      return docs.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch (error) {
      return [];
    }
  }

  async getUsageAnalysis(isbn: string): Promise<any> {
    try {
      const data = await this.fetch("usageAnalysisList", { isbn13: isbn });
      return (data as any).response || null;
    } catch (error) {
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

  async getTrendingBooks(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const searchDt = options?.endDt || new Date().toISOString().split("T")[0];
      const data = await this.fetch("hotTrend", { searchDt });
      const results = (data as any).response?.results || [];
      const books = results[0]?.result?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch (error) {
      return [];
    }
  }

  async getNewArrivals(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const data = await this.fetch("srchBooks", {
        sort: "pubYear",
        order: "desc",
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      });
      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.doc)));
    } catch (error) {
      return [];
    }
  }

  async getRecommendedForEnthusiasts(options?: PopularBooksOptions): Promise<Book[]> {
    return []; // 미구현
  }

  async getRecommendedForReaders(isbn: string): Promise<Book[]> {
    try {
      const data = await this.fetch("recommandList", { isbn13: isbn, type: "reader" });
      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book.book)));
    } catch (error) {
      return [];
    }
  }

  async getMonthlyKeywords(): Promise<string[]> {
    try {
      const data = await this.fetch("monthlyKeywords");
      const keywords = (data as any).response?.keywords || [];
      return keywords.map((k: any) => k.word || k.keyword);
    } catch (error) {
      return [];
    }
  }

  async getLibraryUsageTrend(libCode: string, type: "D" | "H"): Promise<any> {
    try {
      const data = await this.fetch("usageTrend", { libCode, type });
      return (data as any).response || null;
    } catch (error) {
      return null;
    }
  }

  async deepScanLibraries(isbn: string, regionCode: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }> {
    try {
      const region = regionCode.substring(0, 2);
      const { libraries: allLibraries } = await libraryRepository.getLibraries({
        region,
        dtl_region: regionCode, 
        pageSize: 150, 
      });

      const checkPromises = allLibraries.map(async (lib) => {
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
        } catch (e) {
          return null;
        }
      });

      const results = await Promise.all(checkPromises);
      const validResults = results.filter((r) => r !== null) as BookAvailability[];

      return { libraries: validResults, totalCount: validResults.length };
    } catch (error) {
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
      additionSymbol: data.addition_symbol || data.additionSymbol,
    };
  }
}

export const bookRepository = new BookRepositoryImpl();