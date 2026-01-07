"use client";

import { create } from "zustand";
import { Book, BookSearchFilters } from "@/entities/book/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";

interface BookSearchState {
  books: Book[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  filters: BookSearchFilters;

  searchBooks: (filters: BookSearchFilters) => Promise<void>;
  setFilters: (filters: Partial<BookSearchFilters>) => void;
  clearSearch: () => void;
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

  searchBooks: async (filters: BookSearchFilters) => {
    set({ loading: true, error: null });
    try {
      const result = await bookRepository.searchBooks(filters);
      set({
        books: result.books,
        totalCount: result.totalCount,
        filters,
        loading: false,
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
    });
  },
}));
