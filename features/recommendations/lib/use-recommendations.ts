"use client";

import { create } from "zustand";
import { Book } from "@/entities/book/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";

interface RecommendationsState {
  popularBooks: Book[];
  trendingBooks: Book[];
  newArrivals: Book[];
  monthlyKeywords: string[];
  loading: boolean;
  error: string | null;

  loadPopularBooks: () => Promise<void>;
  loadTrendingBooks: () => Promise<void>;
  loadNewArrivals: () => Promise<void>;
  loadMonthlyKeywords: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useRecommendations = create<RecommendationsState>((set) => ({
  popularBooks: [],
  trendingBooks: [],
  newArrivals: [],
  monthlyKeywords: [],
  loading: false,
  error: null,

  loadPopularBooks: async () => {
    set({ loading: true });
    try {
      const books = await bookRepository.getPopularBooks({ pageSize: 10 });
      set({ popularBooks: books, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "인기 도서 로딩 실패",
        loading: false,
      });
    }
  },

  loadTrendingBooks: async () => {
    set({ loading: true });
    try {
      const books = await bookRepository.getTrendingBooks({ pageSize: 10 });
      set({ trendingBooks: books, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "트렌딩 도서 로딩 실패",
        loading: false,
      });
    }
  },

  loadNewArrivals: async () => {
    set({ loading: true });
    try {
      const books = await bookRepository.getNewArrivals({ pageSize: 10 });
      set({ newArrivals: books, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "신간 도서 로딩 실패",
        loading: false,
      });
    }
  },

  loadMonthlyKeywords: async () => {
    try {
      const keywords = await bookRepository.getMonthlyKeywords();
      set({ monthlyKeywords: keywords });
    } catch (error) {
      console.error("Failed to load monthly keywords:", error);
    }
  },

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        bookRepository.getPopularBooks({ pageSize: 10 }),
        bookRepository.getTrendingBooks({ pageSize: 10 }),
        bookRepository.getNewArrivals({ pageSize: 10 }),
        bookRepository.getMonthlyKeywords(),
      ]).then(([popular, trending, newBooks, keywords]) => {
        set({
          popularBooks: popular,
          trendingBooks: trending,
          newArrivals: newBooks,
          monthlyKeywords: keywords,
          loading: false,
        });
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "추천 데이터 로딩 실패",
        loading: false,
      });
    }
  },
}));
