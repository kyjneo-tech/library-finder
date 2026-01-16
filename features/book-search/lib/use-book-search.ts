'use client';

import { create } from 'zustand';
import { Book, BookSearchFilters } from '@/entities/book/model/types';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';
import { useLoadingStore, LOADING_KEYS } from '@/shared/lib/stores/use-loading-store';
import { isExcludedBook } from '@/entities/book/lib/book-filter';

interface BookSearchState {
  // 검색 결과
  books: Book[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  filters: BookSearchFilters;

  // 선택된 책 (도서관 검색용)
  selectedBook: Book | null;

  // Actions
  searchBooks: (filters: BookSearchFilters) => Promise<void>;
  setFilters: (filters: Partial<BookSearchFilters>) => void;
  clearSearch: () => void;
  selectBook: (book: Book | null) => Promise<void>;
  searchByKdc: (kdc: string, keyword: string, region?: string, libCode?: string) => Promise<void>;
  setBooks: (books: Book[]) => void;
}

export const useBookSearch = create<BookSearchState>((set, get) => ({
  books: [],
  totalCount: 0,
  loading: false,
  error: null,
  filters: {
    pageNo: 1,
    pageSize: 50,  // 🔥 기본값 50으로 증가
  },
  selectedBook: null,

  searchBooks: async (filters: BookSearchFilters) => {
    // ... searchBooks logic ...
    set({ loading: true, error: null });
    useLoadingStore.getState().startLoading(LOADING_KEYS.SEARCH_BOOKS);
    try {
      const result = await bookRepository.searchBooks(filters);

      // ✅ Fallback 1: 결과 없으면 띄어쓰기 제거 후 재검색
      // 예: "클로드 코드" → "클로드코드"
      if (result.books.length === 0 && filters.query) {
        const noSpaceQuery = filters.query.replace(/\s+/g, '');
        
        if (noSpaceQuery !== filters.query && noSpaceQuery.length > 1) {
          const noSpaceResult = await bookRepository.searchBooks({
            ...filters,
            query: noSpaceQuery,
          });

          if (noSpaceResult.books.length > 0) {
            set({
              books: noSpaceResult.books,
              totalCount: noSpaceResult.totalCount,
              filters,
              loading: false,
              selectedBook: null,
            });
            return;
          }
        }

        // ✅ Fallback 2: 첫 단어만 추출
        const firstWord = filters.query.split(' ')[0];

        if (firstWord !== filters.query && firstWord.length > 1) {
          const fallbackResult = await bookRepository.searchBooks({
            ...filters,
            query: firstWord,
          });

          if (fallbackResult.books.length > 0) {
            set({
              books: fallbackResult.books,
              totalCount: fallbackResult.totalCount,
              filters,
              loading: false,
              selectedBook: null,
            });
            return;
          }
        }

        // ✅ Fallback 3: 최후의 fallback (아동 모드에서만)
        // "그림책"은 아동용이므로, 일반 검색에서는 빈 결과 유지
        // 주석 처리 - 원하지 않는 결과 방지
        // const genericResult = await bookRepository.searchBooks({
        //   ...filters,
        //   query: '그림책',
        // });
        // set({ books: genericResult.books, ... });
      }

      set({
        books: result.books,
        totalCount: result.totalCount,
        filters,
        loading: false,
        // 새 검색 시 이전 선택된 책 초기화
        selectedBook: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다',
        loading: false,
      });
    } finally {
      useLoadingStore.getState().stopLoading(LOADING_KEYS.SEARCH_BOOKS);
    }
  },

  setFilters: (newFilters: Partial<BookSearchFilters>) => {
    // ...
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters });
    get().searchBooks(updatedFilters);
  },

  clearSearch: () => {
    // ...
    set({
      books: [],
      totalCount: 0,
      filters: { pageNo: 1, pageSize: 50 },
      error: null,
      selectedBook: null,
    });
  },

  selectBook: async (book: Book | null) => {
    // ...
    set({ selectedBook: book });
    
    if (!book) return;

    // 설명이 없으면 상세 정보 API 호출하여 보강
    if (!book.description && book.isbn13) {
      // console.log(`[useBookSearch] Fetching details for ${book.title}...`);
      try {
        // 상세 정보(srchDtlList) 조회
        const detailedBook = await bookRepository.getBookDetail(book.isbn13);

        if (detailedBook) {
          // console.log('[useBookSearch] Details fetched successfully');
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
                },
              };
            }
            return state;
          });
        }
      } catch {
        // console.error('[useBookSearch] Failed to fetch book details:', error);
      }
    }
  },

  searchByKdc: async (kdc: string, keyword: string, region?: string, libCode?: string) => {
    set({ loading: true, error: null });
    useLoadingStore.getState().startLoading(LOADING_KEYS.LOAD_RECOMMENDATIONS, '추천 도서 분석 중...');
    try {
      // console.log(`[useBookSearch] Searching by KDC: ${kdc} (Keyword: ${keyword})`);

      // 1. KDC 기반 인기 도서 조회 (대출 가능한 책 우선)
      const popularBooks = await bookRepository.getPopularBooks({
        age: '0;6', // 초등 저학년(8) 제거하여 학습만화 노출 최소화 (유아 집중)
        addCode: '7',
        kdc: kdc,
        pageSize: 50,
        region,
        libCode,
      });
      
      // 🚨 [Enhanced Filtering] 학습만화 및 초등 인기 시리즈 강제 제외 로직
      // API에서 age=6으로 해도 "전체 이용가"인 만화책이 섞여 나오는 문제 해결
      const filteredBooks = popularBooks.filter((book) => !isExcludedBook(book.title));

      if (filteredBooks.length > 0) {
        // console.log(`[useBookSearch] Found ${filteredBooks.length} books via KDC (Filtered).`);
        set({
          books: filteredBooks,
          totalCount: filteredBooks.length,
          filters: { pageNo: 1, pageSize: 50 }, // 필터 초기화
          loading: false,
          selectedBook: null,
        });
        return;
      }

      // 2. 결과 없으면 네이버 검색으로 Fallback
      await get().searchBooks({ query: keyword });
    } catch (error) {
      // console.error('KDC 검색 오류:', error);
      set({
        error: error instanceof Error ? error.message : '주제별 검색 실패',
        loading: false,
      });
    } finally {
      useLoadingStore.getState().stopLoading(LOADING_KEYS.LOAD_RECOMMENDATIONS);
    }
  },

  setBooks: (books: Book[]) => {
    set({
      books,
      totalCount: books.length,
      loading: false,
      selectedBook: null,
    });
  },
}));
