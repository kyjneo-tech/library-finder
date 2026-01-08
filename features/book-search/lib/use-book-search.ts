"use client";

import { create } from "zustand";
import { Book, BookSearchFilters } from "@/entities/book/model/types";
import { Library } from "@/entities/library/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";
import { libraryRepository } from "@/entities/library/repository/library.repository.impl";

interface LibraryWithBookInfo extends Library {
  hasBook?: boolean;
  loanAvailable?: boolean;
  homepage?: string;
}

interface BookSearchState {
  // 검색 결과
  books: Book[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  filters: BookSearchFilters;

  // 선택된 책 (도서관 검색용)
  selectedBook: Book | null;

  // 선택된 책을 소장한 도서관 목록
  librariesWithBook: LibraryWithBookInfo[];
  librariesLoading: boolean;

  // Actions
  searchBooks: (filters: BookSearchFilters) => Promise<void>;
  setFilters: (filters: Partial<BookSearchFilters>) => void;
  clearSearch: () => void;
  selectBook: (book: Book) => Promise<void>;
  searchLibrariesWithBook: (isbn: string, region: string) => Promise<void>;
  deepScan: (isbn: string, region: string) => Promise<void>;
  clearLibraries: () => void;
  searchByKdc: (kdc: string, keyword: string) => Promise<void>;
}

export const useBookSearch = create<BookSearchState>((set, get) => ({
  books: [],
  totalCount: 0,
  loading: false,
  error: null,
  filters: {
    pageNo: 1,
    pageSize: 20,
  },
  selectedBook: null,
  librariesWithBook: [],
  librariesLoading: false,

  searchBooks: async (filters: BookSearchFilters) => {
    set({ loading: true, error: null });
    try {
      const result = await bookRepository.searchBooks(filters);

      // ✅ Fallback: 결과 없으면 더 넓은 키워드로 재시도
      if (result.books.length === 0 && filters.query) {
        console.log("[Fallback] No results found, trying broader search...");

        // 키워드에서 첫 단어만 추출
        const firstWord = filters.query.split(' ')[0];

        if (firstWord !== filters.query && firstWord.length > 1) {
          console.log(`[Fallback] Trying with "${firstWord}"...`);
          const fallbackResult = await bookRepository.searchBooks({
            ...filters,
            query: firstWord,
          });

          if (fallbackResult.books.length > 0) {
            console.log(`[Fallback] Found ${fallbackResult.books.length} books with "${firstWord}"`);
            set({
              books: fallbackResult.books,
              totalCount: fallbackResult.totalCount,
              filters,
              loading: false,
              selectedBook: null,
              librariesWithBook: [],
            });
            return;
          }
        }

        // 최후의 fallback: "그림책"으로 검색
        console.log("[Fallback] Trying generic '그림책' search...");
        const genericResult = await bookRepository.searchBooks({
          ...filters,
          query: "그림책",
        });

        set({
          books: genericResult.books,
          totalCount: genericResult.totalCount,
          filters,
          loading: false,
          selectedBook: null,
          librariesWithBook: [],
        });
        return;
      }

      set({
        books: result.books,
        totalCount: result.totalCount,
        filters,
        loading: false,
        // 새 검색 시 이전 선택된 책/도서관 초기화
        selectedBook: null,
        librariesWithBook: [],
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "검색 중 오류가 발생했습니다",
        loading: false,
      });
    }
  },

  setFilters: (newFilters: Partial<BookSearchFilters>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters });
    get().searchBooks(updatedFilters);
  },

  clearSearch: () => {
    set({
      books: [],
      totalCount: 0,
      filters: { pageNo: 1, pageSize: 20 },
      error: null,
      selectedBook: null,
      librariesWithBook: [],
    });
  },

  selectBook: async (book: Book) => {
    set({ selectedBook: book });

    // 설명이 없으면 상세 정보 API 호출하여 보강
    if (!book.description && book.isbn13) {
      console.log(`[useBookSearch] Fetching details for ${book.title}...`);
      try {
        // 상세 정보(srchDtlList) 조회
        // 참고: Repository의 getBookDetail이 srchDtlList를 호출함
        const detailedBook = await bookRepository.getBookDetail(book.isbn13);
        
        if (detailedBook) {
          console.log("[useBookSearch] Details fetched successfully");
          set((state) => {
             // 선택된 책이 바뀌지 않았을 때만 업데이트
             if (state.selectedBook?.isbn13 === book.isbn13) {
                 return {
                     selectedBook: {
                         ...state.selectedBook,
                         description: detailedBook.description,
                         keywords: detailedBook.keywords,
                         publisher: detailedBook.publisher || state.selectedBook.publisher,
                         publishYear: detailedBook.publishYear || state.selectedBook.publishYear,
                     }
                 };
             }
             return state;
          });
        }
      } catch (error) {
        console.error("[useBookSearch] Failed to fetch book details:", error);
      }
    }
  },

  searchLibrariesWithBook: async (isbn: string, region: string) => {
    console.log(`[useBookSearch] Searching libraries for ISBN: ${isbn}, Region: ${region}`);
    set({ librariesLoading: true });
    try {
      // libSrchByBook API 호출
      if (isbn.length !== 13) {
        console.warn(`[useBookSearch] Warning: ISBN length is ${isbn.length}, expected 13.`);
      }

      const result = await bookRepository.getLibrariesWithBook(isbn, region);
      console.log(`[useBookSearch] Found ${result.libraries.length} libraries holding the book.`);

      // 각 도서관의 대출 가능 여부 조회 (bookExist API) - 병렬 처리
      const librariesWithInfo = await Promise.all(
        result.libraries.map(async (lib) => {
          try {
            const availability = await bookRepository.getBookAvailability(isbn, lib.libraryCode);
            const info = availability[0];
            
            // 디버깅 로그
            if (info) {
               console.log(`[Availability] Lib: ${lib.libraryName}, Has: ${info.hasBook}, Loanable: ${info.loanAvailable}`);
            }

            return {
              libCode: lib.libraryCode,
              libName: lib.libraryName,
              address: "",
              tel: "",
              latitude: lib.latitude ? parseFloat(lib.latitude) : 0,
              longitude: lib.longitude ? parseFloat(lib.longitude) : 0,
              homepage: lib.homepage,
              hasBook: info?.hasBook ?? true,
              loanAvailable: info?.loanAvailable ?? false,
            };
          } catch (error) {
            console.error(`[Availability] Failed for lib ${lib.libraryName}:`, error);
            // 개별 도서관 조회 실패 시 기본값으로 추가 (보수적으로 대출불가 처리)
            return {
              libCode: lib.libraryCode,
              libName: lib.libraryName,
              address: "",
              tel: "",
              latitude: lib.latitude ? parseFloat(lib.latitude) : 0,
              longitude: lib.longitude ? parseFloat(lib.longitude) : 0,
              hasBook: true,
              loanAvailable: false,
            };
          }
        })
      );

      // 대출 가능 도서관을 상단으로 정렬
      const sortedLibraries = librariesWithInfo.sort((a, b) => {
        if (a.loanAvailable === b.loanAvailable) return 0;
        return a.loanAvailable ? -1 : 1;
      });

      set({
        librariesWithBook: sortedLibraries,
        librariesLoading: false,
      });
    } catch (error) {
      console.error("도서관 검색 오류:", error);
      set({ librariesLoading: false });
    }
  },

  searchByKdc: async (kdc: string, keyword: string) => {
    set({ loading: true, error: null });
    try {
      console.log(`[useBookSearch] Searching by KDC: ${kdc} (Keyword: ${keyword})`);
      
      // 1. KDC 기반 인기 도서 조회 (대출 가능한 책 우선)
      const popularBooks = await bookRepository.getPopularBooks({
        age: "0;6;8",
        addCode: "7",
        kdc: kdc,
        pageSize: 20,
      });

      if (popularBooks.length > 0) {
        console.log(`[useBookSearch] Found ${popularBooks.length} books via KDC.`);
        set({
          books: popularBooks,
          totalCount: popularBooks.length,
          filters: { pageNo: 1, pageSize: 20 }, // 필터 초기화
          loading: false,
          selectedBook: null,
          librariesWithBook: [],
        });
        return;
      }

      // 2. 결과 없으면 네이버 검색으로 Fallback
      console.log(`[useBookSearch] No books found via KDC. Fallback to Naver search with keyword: ${keyword}`);
      await get().searchBooks({ query: keyword });

    } catch (error) {
      console.error("KDC 검색 오류:", error);
      set({
        error: error instanceof Error ? error.message : "주제별 검색 실패",
        loading: false,
      });
    }
  },

  deepScan: async (isbn: string, region: string) => {
    console.log(`[useBookSearch] Deep scanning libraries for ISBN: ${isbn}, Region: ${region}`);
    set({ librariesLoading: true });
    try {
      const result = await bookRepository.deepScanLibraries(isbn, region);

      const librariesWithInfo: LibraryWithBookInfo[] = result.libraries.map(lib => ({
        libCode: lib.libraryCode,
        libName: lib.libraryName,
        address: lib.address || "",
        tel: lib.tel || "",
        latitude: lib.latitude ? parseFloat(lib.latitude) : 0,
        longitude: lib.longitude ? parseFloat(lib.longitude) : 0,
        homepage: lib.homepage,
        hasBook: lib.hasBook,
        loanAvailable: lib.loanAvailable,
      }));

      set({
        librariesWithBook: librariesWithInfo,
        librariesLoading: false,
      });
    } catch (error) {
      console.error("Deep scan 오류:", error);
      set({ librariesLoading: false });
    }
  },

  clearLibraries: () => {
    set({ librariesWithBook: [], selectedBook: null });
  },
}));
