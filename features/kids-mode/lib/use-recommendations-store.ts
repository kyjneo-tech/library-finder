import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "@/entities/book/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";

interface RecommendationsState {
  ageRecommendations: Record<string, Book[]>;
  ageRecommendationsTimestamp: Record<string, number>;
  familyPopularBooks: Record<string, Book[]>;
  familyPopularBooksTimestamp: Record<string, number>;
  localKidsPopularBooks: Record<string, Book[]>;
  localKidsPopularBooksTimestamp: Record<string, number>;

  // 🛡️ API 호출 폭발 방지를 위한 진행 상태 관리
  loadingStates: Record<string, boolean>;

  fetchAgeRecommendations: (age: string) => Promise<Book[]>;
  fetchFamilyPopularBooks: (regionCode?: string) => Promise<Book[]>;
  fetchLocalKidsPopularBooks: (regionCode?: string) => Promise<Book[]>;
}

const CACHE_DURATION = 6 * 60 * 60 * 1000;

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      ageRecommendations: {},
      ageRecommendationsTimestamp: {},
      familyPopularBooks: {},
      familyPopularBooksTimestamp: {},
      localKidsPopularBooks: {},
      localKidsPopularBooksTimestamp: {},
      loadingStates: {},

      fetchAgeRecommendations: async (age: string) => {
        const { ageRecommendations, ageRecommendationsTimestamp, loadingStates } = get();
        const now = Date.now();
        const loadKey = `age-${age}`;

        // 1. 캐시 확인
        if (ageRecommendations[age] && now - (ageRecommendationsTimestamp[age] || 0) < CACHE_DURATION) {
          return ageRecommendations[age];
        }

        // 2. 🛡️ 중복 요청 방지: 이미 이 데이터를 불러오는 중이면 대기
        if (loadingStates[loadKey]) {
            console.log(`[Store] ${loadKey} is already loading, waiting...`);
            // 잠시 대기 후 캐시 확인하는 방식으로 재귀 호출 최소화
            await new Promise(resolve => setTimeout(resolve, 500));
            return get().fetchAgeRecommendations(age);
        }

        try {
            set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: true } }));
            
            let finalBooks: Book[] = [];
            if (age === '0-2') {
                const result = await bookRepository.searchBooks({ query: "보드북 촉각책 초점책 그림책", pageSize: 12 });
                finalBooks = result.books;
            } else if (age === '3-5') {
                const result = await bookRepository.searchBooks({ query: "창작동화 인성동화 생활습관", pageSize: 12 });
                finalBooks = result.books;
            } else {
                let ageParam = age === '6-7' ? '6' : 'a8';
                finalBooks = await bookRepository.getPopularBooks({ age: ageParam, addCode: '7', pageSize: 12 });
            }

            if (finalBooks.length === 0) {
                finalBooks = await bookRepository.getPopularBooks({ age: '0', addCode: '7', pageSize: 12 });
            }

            set((state) => ({
                ageRecommendations: { ...state.ageRecommendations, [age]: finalBooks },
                ageRecommendationsTimestamp: { ...state.ageRecommendationsTimestamp, [age]: now },
                loadingStates: { ...state.loadingStates, [loadKey]: false }
            }));

            return finalBooks;
        } catch (error) { 
            set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: false } }));
            return []; 
        }
      },

      fetchFamilyPopularBooks: async (regionCode?: string) => {
        const { familyPopularBooks, familyPopularBooksTimestamp, loadingStates } = get();
        const now = Date.now();
        const cacheKey = regionCode || "nationwide";
        const loadKey = `family-${cacheKey}`;

        if (familyPopularBooks[cacheKey] && now - (familyPopularBooksTimestamp[cacheKey] || 0) < CACHE_DURATION) {
            return familyPopularBooks[cacheKey];
        }

        if (loadingStates[loadKey]) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return get().fetchFamilyPopularBooks(regionCode);
        }

        try {
            set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: true } }));
            const books = await bookRepository.getPopularBooks({
                region: regionCode || undefined,
                age: "14;20;30;40", 
                pageSize: 10,
            });
            set((state) => ({
                familyPopularBooks: { ...state.familyPopularBooks, [cacheKey]: books },
                familyPopularBooksTimestamp: { ...state.familyPopularBooksTimestamp, [cacheKey]: now },
                loadingStates: { ...state.loadingStates, [loadKey]: false }
            }));
            return books;
        } catch (error) { 
            set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: false } }));
            return []; 
        }
      },

      fetchLocalKidsPopularBooks: async (regionCode?: string) => {
        const { localKidsPopularBooks, localKidsPopularBooksTimestamp, loadingStates } = get();
        const now = Date.now();
        const cacheKey = regionCode || "nationwide";
        const loadKey = `kids-local-${cacheKey}`;

        if (localKidsPopularBooks[cacheKey] && now - (localKidsPopularBooksTimestamp[cacheKey] || 0) < CACHE_DURATION) {
            return localKidsPopularBooks[cacheKey];
        }

        if (loadingStates[loadKey]) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return get().fetchLocalKidsPopularBooks(regionCode);
        }

        try {
            set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: true } }));
            const books = await bookRepository.getPopularBooks({
                region: regionCode || undefined,
                age: "0;6;8", 
                addCode: "7",
                pageSize: 15,
            });
            set((state) => ({
                localKidsPopularBooks: { ...state.localKidsPopularBooks, [cacheKey]: books },
                localKidsPopularBooksTimestamp: { ...state.localKidsPopularBooksTimestamp, [cacheKey]: now },
                loadingStates: { ...state.loadingStates, [loadKey]: false }
            }));
            return books;
        } catch (error) { 
            set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: false } }));
            return []; 
        }
      },
    }),
    {
      name: "library-recommendations-storage-v7",
    }
  )
);