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

  // 🛡️ 마지막 호출 시간 저장 (Throttling)
  lastFetched: {
    popular: number;
    trending: number;
    newArrivals: number;
    keywords: number;
  };

  loadPopularBooks: (force?: boolean) => Promise<void>;
  loadTrendingBooks: (force?: boolean) => Promise<void>;
  loadNewArrivals: (force?: boolean) => Promise<void>;
  loadMonthlyKeywords: (force?: boolean) => Promise<void>;
  loadAll: (force?: boolean) => Promise<void>;
}

// 1시간 (밀리초)
const CACHE_DURATION = 60 * 60 * 1000;

export const useRecommendations = create<RecommendationsState>((set, get) => ({
  popularBooks: [],
  trendingBooks: [],
  newArrivals: [],
  monthlyKeywords: [],
  
  loading: false,
  error: null,

  lastFetched: {
    popular: 0,
    trending: 0,
    newArrivals: 0,
    keywords: 0,
  },

  loadPopularBooks: async (force = false) => {
    const { lastFetched, popularBooks, loading } = get();
    const now = Date.now();

    // 🛡️ 이미 로딩 중이거나, 데이터가 있고 유효기간 내라면 스킵
    if (!force && !loading && popularBooks.length > 0 && (now - lastFetched.popular < CACHE_DURATION)) {
      console.log("[useRecommendations] Using cached popular books");
      return;
    }

    set({ loading: true });
    try {
      const books = await bookRepository.getPopularBooks({ pageSize: 10 });
      set((state) => ({ 
        popularBooks: books, 
        loading: false,
        lastFetched: { ...state.lastFetched, popular: Date.now() }
      }));
    } catch (error) {
      console.error("Failed to load popular books:", error);
      set({
        popularBooks: [],
        error: error instanceof Error ? error.message : "인기 도서 로딩 실패",
        loading: false,
      });
    }
  },

  loadTrendingBooks: async (force = false) => {
    const { lastFetched, trendingBooks, loading } = get();
    const now = Date.now();

    if (!force && !loading && trendingBooks.length > 0 && (now - lastFetched.trending < CACHE_DURATION)) {
      console.log("[useRecommendations] Using cached trending books");
      return;
    }

    set({ loading: true });
    try {
      const books = await bookRepository.getTrendingBooks({ pageSize: 10 });
      set((state) => ({ 
        trendingBooks: books, 
        loading: false,
        lastFetched: { ...state.lastFetched, trending: Date.now() }
      }));
    } catch (error) {
      console.error("Failed to load trending books:", error);
      set({
        trendingBooks: [],
        error: error instanceof Error ? error.message : "트렌딩 도서 로딩 실패",
        loading: false,
      });
    }
  },

  loadNewArrivals: async (force = false) => {
    const { lastFetched, newArrivals, loading } = get();
    const now = Date.now();

    if (!force && !loading && newArrivals.length > 0 && (now - lastFetched.newArrivals < CACHE_DURATION)) {
      console.log("[useRecommendations] Using cached new arrivals");
      return;
    }

    set({ loading: true });
    try {
      const books = await bookRepository.getNewArrivals({ pageSize: 10 });
      set((state) => ({ 
        newArrivals: books, 
        loading: false,
        lastFetched: { ...state.lastFetched, newArrivals: Date.now() }
      }));
    } catch (error) {
      console.error("Failed to load new arrivals:", error);
      set({
        newArrivals: [],
        error: error instanceof Error ? error.message : "신간 도서 로딩 실패",
        loading: false,
      });
    }
  },

  loadMonthlyKeywords: async (force = false) => {
    const { lastFetched, monthlyKeywords } = get();
    const now = Date.now();

    if (!force && monthlyKeywords.length > 0 && (now - lastFetched.keywords < CACHE_DURATION)) {
      return;
    }

    try {
      const keywords = await bookRepository.getMonthlyKeywords();
      set((state) => ({ 
        monthlyKeywords: keywords,
        lastFetched: { ...state.lastFetched, keywords: Date.now() }
      }));
    } catch (error) {
      console.error("Failed to load monthly keywords:", error);
    }
  },

  loadAll: async (force = false) => {
    const { loadPopularBooks, loadTrendingBooks, loadNewArrivals, loadMonthlyKeywords } = get();
    
    set({ loading: true, error: null });
    try {
      await Promise.all([
        loadPopularBooks(force),
        loadTrendingBooks(force),
        loadNewArrivals(force),
        loadMonthlyKeywords(force),
      ]);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "추천 데이터 로딩 실패",
        loading: false,
      });
    }
  },
}));
