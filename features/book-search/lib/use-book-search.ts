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
  loadingMore: boolean;  // 🆕 추가 로딩 상태
  error: string | null;
  filters: BookSearchFilters;
  
  // 🆕 무한스크롤 지원
  hasMore: boolean;
  currentPage: number;
  lastQuery: string;

  // 선택된 책 (도서관 검색용)
  selectedBook: Book | null;

  // Actions
  searchBooks: (filters: BookSearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;  // 🆕 추가
  setFilters: (filters: Partial<BookSearchFilters>) => void;
  clearSearch: () => void;
  selectBook: (book: Book | null) => Promise<void>;
  searchByKdc: (kdc: string, keyword: string, region?: string, libCode?: string) => Promise<void>;
  setBooks: (books: Book[]) => void;
}

const PAGE_SIZE = 20; // 🔥 한 번에 20개씩 로드 (API 호출 최적화)

export const useBookSearch = create<BookSearchState>((set, get) => ({
  books: [],
  totalCount: 0,
  loading: false,
  loadingMore: false,
  error: null,
  filters: {
    pageNo: 1,
    pageSize: PAGE_SIZE,
  },
  hasMore: false,
  currentPage: 1,
  lastQuery: '',
  selectedBook: null,

  searchBooks: async (filters: BookSearchFilters) => {
    const query = filters.query || '';
    
    // 🛡️ 중복 검색 방지: 같은 쿼리로 연속 검색 시 무시
    const { lastQuery, loading } = get();
    if (loading || (query === lastQuery && get().books.length > 0)) {
      return;
    }

    set({ 
      loading: true, 
      error: null, 
      books: [],  // 새 검색 시 초기화
      currentPage: 1,
      lastQuery: query,
    });
    useLoadingStore.getState().startLoading(LOADING_KEYS.SEARCH_BOOKS);
    
    try {
      const searchFilters = { ...filters, pageNo: 1, pageSize: PAGE_SIZE };
      const result = await bookRepository.searchBooks(searchFilters);

      // ✅ Fallback 1: 결과 없으면 띄어쓰기 제거 후 재검색
      if (result.books.length === 0 && query) {
        const noSpaceQuery = query.replace(/\s+/g, '');
        
        if (noSpaceQuery !== query && noSpaceQuery.length > 1) {
          const noSpaceResult = await bookRepository.searchBooks({
            ...searchFilters,
            query: noSpaceQuery,
          });

          if (noSpaceResult.books.length > 0) {
            set({
              books: noSpaceResult.books,
              totalCount: noSpaceResult.totalCount,
              hasMore: noSpaceResult.books.length < noSpaceResult.totalCount,
              filters: searchFilters,
              loading: false,
              selectedBook: null,
            });
            return;
          }
        }

        // ✅ Fallback 2: 첫 단어만 추출
        const firstWord = query.split(' ')[0];

        if (firstWord !== query && firstWord.length > 1) {
          const fallbackResult = await bookRepository.searchBooks({
            ...searchFilters,
            query: firstWord,
          });

          if (fallbackResult.books.length > 0) {
            set({
              books: fallbackResult.books,
              totalCount: fallbackResult.totalCount,
              hasMore: fallbackResult.books.length < fallbackResult.totalCount,
              filters: searchFilters,
              loading: false,
              selectedBook: null,
            });
            return;
          }
        }
      }

      set({
        books: result.books,
        totalCount: result.totalCount,
        hasMore: result.books.length < result.totalCount,
        filters: searchFilters,
        loading: false,
        selectedBook: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다',
        loading: false,
        hasMore: false,
      });
    } finally {
      useLoadingStore.getState().stopLoading(LOADING_KEYS.SEARCH_BOOKS);
    }
  },

  // 🆕 무한스크롤: 다음 페이지 로드
  loadMore: async () => {
    const { loadingMore, hasMore, currentPage, lastQuery, books, filters } = get();
    
    // 로딩 중이거나 더 이상 데이터가 없으면 무시
    if (loadingMore || !hasMore || !lastQuery) {
      return;
    }

    set({ loadingMore: true });
    
    try {
      const nextPage = currentPage + 1;
      const result = await bookRepository.searchBooks({
        ...filters,
        query: lastQuery,
        pageNo: nextPage,
        pageSize: PAGE_SIZE,
      });

      // 중복 제거: ISBN 기준
      const existingIsbns = new Set(books.map(b => b.isbn13 || b.isbn));
      const newBooks = result.books.filter(b => {
        const isbn = b.isbn13 || b.isbn;
        return isbn && !existingIsbns.has(isbn);
      });

      const allBooks = [...books, ...newBooks];
      
      set({
        books: allBooks,
        currentPage: nextPage,
        hasMore: allBooks.length < result.totalCount && newBooks.length > 0,
        loadingMore: false,
      });
    } catch (error) {
      set({ loadingMore: false });
      console.error('Load more error:', error);
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
      filters: { pageNo: 1, pageSize: PAGE_SIZE },
      error: null,
      selectedBook: null,
      hasMore: false,
      currentPage: 1,
      lastQuery: '',
    });
  },

  selectBook: async (book: Book | null) => {
    set({ selectedBook: book });
    
    if (!book) return;

    // 설명이 없으면 상세 정보 API 호출하여 보강
    if (!book.description && book.isbn13) {
      try {
        const detailedBook = await bookRepository.getBookDetail(book.isbn13);
        if (detailedBook) {
          set((state) => {
            const currentBook = state.selectedBook;
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
        // Silent fail
      }
    }
  },

  searchByKdc: async (kdc: string, keyword: string, region?: string, libCode?: string) => {
    set({ loading: true, error: null, lastQuery: keyword });
    useLoadingStore.getState().startLoading(LOADING_KEYS.LOAD_RECOMMENDATIONS, '추천 도서 분석 중...');
    try {
      const popularBooks = await bookRepository.getPopularBooks({
        age: '0;6',
        addCode: '7',
        kdc: kdc,
        pageSize: 50,
        region,
        libCode,
      });
      
      const filteredBooks = popularBooks.filter((book) => !isExcludedBook(book.title));

      if (filteredBooks.length > 0) {
        set({
          books: filteredBooks,
          totalCount: filteredBooks.length,
          hasMore: false,  // KDC 검색은 페이지네이션 없음
          filters: { pageNo: 1, pageSize: 50 },
          loading: false,
          selectedBook: null,
        });
        return;
      }

      // 결과 없으면 일반 검색으로 Fallback
      await get().searchBooks({ query: keyword });
    } catch (error) {
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
      hasMore: false,
    });
  },
}));
