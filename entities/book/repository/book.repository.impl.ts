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
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchBooks(filters: BookSearchFilters): Promise<{ books: Book[]; totalCount: number }> {
    try {
      const data = await this.fetch("srchBooks", {
        keyword: filters.query,
        kdcCode: filters.category,
        author: filters.author,
        publisher: filters.publisher,
        publishYear: filters.publishYear,
        pageNo: filters.pageNo || 1,
        pageSize: filters.pageSize || 20,
      });

      const books = (data as any).response?.docs || [];
      const totalCount = (data as any).response?.numFound || 0;

      return {
        books: books.map((book: any) => BookSchema.parse(this.mapBookData(book))),
        totalCount,
      };
    } catch (error) {
      console.error("Search books error:", error);
      return { books: [], totalCount: 0 };
    }
  }

  async getBookDetail(isbn: string): Promise<Book | null> {
    try {
      const data = await this.fetch("bookDtl", { isbn });
      const book = (data as any).response?.docs?.[0];

      if (!book) return null;

      return BookSchema.parse(this.mapBookData(book));
    } catch (error) {
      console.error("Get book detail error:", error);
      return null;
    }
  }

  async getBookAvailability(isbn: string, libCode?: string): Promise<BookAvailability[]> {
    try {
      const data = await this.fetch("loanAvailability", {
        isbn,
        libCode,
      });

      const items = (data as any).response?.result?.libraries || [];

      return items.map((item: any) =>
        BookAvailabilitySchema.parse({
          isbn,
          libraryCode: item.libCode,
          libraryName: item.libName,
          hasBook: item.hasBook === "Y",
          loanAvailable: item.loanAvailable === "Y",
          returnDate: item.returnDate,
        })
      );
    } catch (error) {
      console.error("Get book availability error:", error);
      return [];
    }
  }

  async getLibrariesWithBook(isbn: string): Promise<{
    libraries: BookAvailability[];
    totalCount: number;
  }> {
    try {
      const data = await this.fetch("bookExist", { isbn });
      const libraries = (data as any).response?.libs || [];

      return {
        libraries: libraries.map((lib: any) =>
          BookAvailabilitySchema.parse({
            isbn,
            libraryCode: lib.libCode,
            libraryName: lib.libName,
            hasBook: true,
            loanAvailable: lib.loanAvailable === "Y",
            returnDate: lib.returnDate,
          })
        ),
        totalCount: libraries.length,
      };
    } catch (error) {
      console.error("Get libraries with book error:", error);
      return { libraries: [], totalCount: 0 };
    }
  }

  async getPopularBooks(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const data = await this.fetch("usageAnalysisList", {
        region: options?.region,
        age: options?.age,
        gender: options?.gender,
        addCode: options?.addCode,
        kdc: options?.kdc,
        startDt: options?.startDt,
        endDt: options?.endDt,
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      });

      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book)));
    } catch (error) {
      console.error("Get popular books error:", error);
      return [];
    }
  }

  async getTrendingBooks(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const data = await this.fetch("loanGradeOfBooksTrend", {
        region: options?.region,
        kdc: options?.kdc,
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      });

      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book)));
    } catch (error) {
      console.error("Get trending books error:", error);
      return [];
    }
  }

  async getNewArrivals(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const data = await this.fetch("newBook", {
        startDt: options?.startDt,
        endDt: options?.endDt,
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      });

      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book)));
    } catch (error) {
      console.error("Get new arrivals error:", error);
      return [];
    }
  }

  async getRecommendedForEnthusiasts(options?: PopularBooksOptions): Promise<Book[]> {
    try {
      const data = await this.fetch("maniaList", {
        pageNo: options?.pageNo || 1,
        pageSize: options?.pageSize || 20,
      });

      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book)));
    } catch (error) {
      console.error("Get enthusiast recommendations error:", error);
      return [];
    }
  }

  async getRecommendedForReaders(isbn: string): Promise<Book[]> {
    try {
      const data = await this.fetch("readersList", { isbn });
      const books = (data as any).response?.docs || [];
      return books.map((book: any) => BookSchema.parse(this.mapBookData(book)));
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
