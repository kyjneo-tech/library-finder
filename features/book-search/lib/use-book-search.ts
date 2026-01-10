"use client";

import { create } from "zustand";
import { Book, BookSearchFilters } from "@/entities/book/model/types";
import { Library } from "@/entities/library/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";
import { libraryRepository } from "@/entities/library/repository/library.repository.impl";
import { calculateDistance } from "@/shared/lib/utils/distance";

interface LibraryWithBookInfo extends Library {
  hasBook?: boolean;
  loanAvailable?: boolean;
  homepage?: string;
  distance?: number; // 사용자 위치 기준 거리 (미터)
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

  // 사용자 위치 (거리 계산용)
  userLocation: { lat: number; lng: number } | null;

  // Actions
  searchBooks: (filters: BookSearchFilters) => Promise<void>;
  setFilters: (filters: Partial<BookSearchFilters>) => void;
  clearSearch: () => void;
  selectBook: (book: Book) => Promise<void>;
  searchLibrariesWithBook: (isbn: string, region: string, isWideSearch?: boolean, userLocation?: { lat: number; lng: number } | null) => Promise<void>;
  searchLibrariesNationwide: (isbn: string) => Promise<void>;
  deepScan: (isbn: string, region: string) => Promise<void>;
  clearLibraries: () => void;
  searchByKdc: (kdc: string, keyword: string) => Promise<void>;
  setBooks: (books: Book[]) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  mergeLibraries: (newLibraries: LibraryWithBookInfo[]) => void; // 도서관 목록 병합 (줌아웃용)
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
  userLocation: null,

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
        const detailedBook = await bookRepository.getBookDetail(book.isbn13);
        
        if (detailedBook) {
          console.log("[useBookSearch] Details fetched successfully");
          set((state) => {
             const currentBook = state.selectedBook;
             // 선택된 책이 바뀌지 않았을 때만 업데이트
             if (currentBook && currentBook.isbn13 === book.isbn13) {
                 return {
                     selectedBook: {
                         ...currentBook,
                         description: detailedBook.description,
                         keywords: detailedBook.keywords,
                         publisher: detailedBook.publisher || currentBook.publisher,
                         publishYear: detailedBook.publishYear || currentBook.publishYear,
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

  searchLibrariesWithBook: async (isbn: string, region: string, isWideSearch: boolean = false, userLocation?: { lat: number; lng: number } | null) => {
    // 🛡️ [방어] 이미 같은 조건으로 로딩 중이면 중복 호출 차단
    if (get().librariesLoading) return;

    // 사용자 위치가 파라미터로 전달되면 저장
    const currentUserLocation = userLocation ?? get().userLocation;

    console.log(`[useBookSearch] Searching libraries for ISBN: ${isbn}, Region: ${region}, Wide: ${isWideSearch}`);
    set({ librariesLoading: true });
    try {
      // 🛡️ [확장 검색 로직] 
      // 만약 세부 지역(5자리)인데 검색 범위 확장이 필요한 경우(책이음/책바다용) 상위 지역(2자리)으로 요청
      const searchRegion = isWideSearch && region.length === 5 ? region.substring(0, 2) : region;
      
      const result = await bookRepository.getLibrariesWithBook(isbn, searchRegion);
      console.log(`[useBookSearch] Found ${result.libraries.length} libraries.`);

      const checkLimit = 5; // 호출 절약을 위해 5곳 우선 확인
      const librariesWithInfo = await Promise.all(
        result.libraries.map(async (lib, idx) => {
          const lat = lib.latitude ? parseFloat(lib.latitude) : 0;
          const lng = lib.longitude ? parseFloat(lib.longitude) : 0;
          
          // 🛡️ 거리 계산 (사용자 위치가 있을 경우)
          let distance: number | undefined;
          if (currentUserLocation && lat && lng) {
            distance = calculateDistance(
              currentUserLocation.lat,
              currentUserLocation.lng,
              lat,
              lng
            );
          }

          if (idx < checkLimit) {
            try {
              const availability = await bookRepository.getBookAvailability(isbn, lib.libraryCode);
              const info = availability[0];
              return {
                libCode: lib.libraryCode,
                libName: lib.libraryName,
                address: lib.address || "",
                tel: lib.tel || "",
                latitude: lat,
                longitude: lng,
                homepage: lib.homepage,
                hasBook: info?.hasBook ?? true,
                loanAvailable: info?.loanAvailable ?? false,
                distance,
              };
            } catch (e) { /* 에러 무시 */ }
          }
          return {
            libCode: lib.libraryCode,
            libName: lib.libraryName,
            address: lib.address || "",
            tel: lib.tel || "",
            latitude: lat,
            longitude: lng,
            homepage: lib.homepage,
            hasBook: true,
            loanAvailable: false,
            distance,
          };
        })
      );

      // 🛡️ 정렬: 1) 대출가능 우선, 2) 거리 가까운 순
      const sortedLibraries = librariesWithInfo.sort((a, b) => {
        // 대출 가능 여부 먼저 비교
        if (a.loanAvailable !== b.loanAvailable) {
          return a.loanAvailable ? -1 : 1;
        }
        // 거리가 있으면 거리순 정렬
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
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

  // 🌍 전국 검색 (책이음/책바다 서비스용)
  // 🛡️ 캐시: 동일 ISBN 5분간 캐싱
  searchLibrariesNationwide: async (isbn: string) => {
    console.log(`[useBookSearch] 전국 검색 시작: ISBN ${isbn}`);
    
    // 캐시 키 생성
    const cacheKey = `nationwide_${isbn}`;
    const cached = (window as any).__nationwideCache?.[cacheKey];
    
    if (cached && Date.now() < cached.expiry) {
      console.log(`[useBookSearch] 캐시 히트! ${cached.data.length}개 도서관`);
      set({ librariesWithBook: cached.data, librariesLoading: false });
      return;
    }
    
    set({ librariesLoading: true });
    try {
      // 17개 광역시도 코드
      const regionCodes = ['11', '21', '22', '23', '24', '25', '26', '31', '32', '33', '34', '35', '36', '37', '38', '39', '50'];
      
      // 병렬로 모든 지역 검색 (속도 최적화)
      const results = await Promise.allSettled(
        regionCodes.map(code => bookRepository.getLibrariesWithBook(isbn, code))
      );
      
      // 성공한 결과만 병합
      const allLibraries = results
        .filter((r): r is PromiseFulfilledResult<{ libraries: any[]; totalCount: number }> => r.status === 'fulfilled')
        .flatMap(r => r.value.libraries);
      
      console.log(`[useBookSearch] 전국 검색 완료: ${allLibraries.length}개 도서관 발견`);

      // LibraryWithBookInfo 형태로 변환
      const librariesWithInfo: LibraryWithBookInfo[] = allLibraries.map(lib => ({
        libCode: lib.libraryCode,
        libName: lib.libraryName,
        address: lib.address || "",
        tel: lib.tel || "",
        latitude: lib.latitude ? parseFloat(lib.latitude) : 0,
        longitude: lib.longitude ? parseFloat(lib.longitude) : 0,
        homepage: lib.homepage,
        hasBook: true,
        loanAvailable: false, // 전국 검색은 대출 가능 여부 미확인 (API 호출 최소화)
      }));

      // 캐시 저장 (5분)
      if (typeof window !== 'undefined') {
        (window as any).__nationwideCache = (window as any).__nationwideCache || {};
        (window as any).__nationwideCache[cacheKey] = {
          data: librariesWithInfo,
          expiry: Date.now() + 300000 // 5분
        };
      }

      set({
        librariesWithBook: librariesWithInfo,
        librariesLoading: false,
      });
    } catch (error) {
      console.error("전국 검색 오류:", error);
      set({ librariesLoading: false });
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

  setBooks: (books: Book[]) => {
    set({ 
      books, 
      totalCount: books.length,
      loading: false,
      selectedBook: null,
      librariesWithBook: []
    });
  },

  setUserLocation: (location: { lat: number; lng: number } | null) => {
    set({ userLocation: location });
  },

  // 🛡️ 도서관 목록 병합 (줌아웃 시 기존 + 새로운 도서관 병합)
  mergeLibraries: (newLibraries: LibraryWithBookInfo[]) => {
    const { librariesWithBook, userLocation } = get();
    
    // 기존 도서관 코드 Set
    const existingCodes = new Set(librariesWithBook.map(lib => lib.libCode));
    
    // 새로운 도서관만 필터링
    const uniqueNewLibraries = newLibraries.filter(lib => !existingCodes.has(lib.libCode));
    
    // 거리 계산 (새 도서관에 대해)
    const newLibsWithDistance = uniqueNewLibraries.map(lib => {
      if (userLocation && lib.latitude && lib.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lib.latitude,
          lib.longitude
        );
        return { ...lib, distance };
      }
      return lib;
    });
    
    // 병합 후 정렬
    const merged = [...librariesWithBook, ...newLibsWithDistance];
    const sorted = merged.sort((a, b) => {
      if (a.loanAvailable !== b.loanAvailable) {
        return a.loanAvailable ? -1 : 1;
      }
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });
    
    set({ librariesWithBook: sorted });
  },
}));
