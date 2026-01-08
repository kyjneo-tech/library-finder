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

      fetchAgeRecommendations: async (age: string) => {
        const { ageRecommendations, ageRecommendationsTimestamp } = get();
        const now = Date.now();

        if (ageRecommendations[age] && now - (ageRecommendationsTimestamp[age] || 0) < CACHE_DURATION) {
          return ageRecommendations[age];
        }

        try {
            let finalBooks: Book[] = [];
            
            // 🎨 [차별화 전략] API의 한계를 키워드 검색(srchBooks + loan sort)으로 극복
            if (age === '0-2') {
                // 0~2세는 진짜 영아용 키워드로 검색 (대출순 정렬)
                const result = await bookRepository.searchBooks({
                    query: "보드북 촉각책 초점책 그림책",
                    pageSize: 12
                });
                finalBooks = result.books;
            } else if (age === '3-5') {
                // 3~5세는 유아기 사회성/창작 키워드로 검색
                const result = await bookRepository.searchBooks({
                    query: "창작동화 인성동화 생활습관",
                    pageSize: 12
                });
                finalBooks = result.books;
            } else {
                // 6세 이상은 기존의 정밀한 loanItemSrch API 사용
                let ageParam = age === '6-7' ? '6' : 'a8';
                finalBooks = await bookRepository.getPopularBooks({
                    age: ageParam,
                    addCode: '7',
                    pageSize: 12,
                });
            }

            set((state) => ({
                ageRecommendations: { ...state.ageRecommendations, [age]: finalBooks },
                ageRecommendationsTimestamp: { ...state.ageRecommendationsTimestamp, [age]: now }
            }));

            return finalBooks;
        } catch (error) { return []; }
      },

      fetchFamilyPopularBooks: async (regionCode?: string) => {
        const { familyPopularBooks, familyPopularBooksTimestamp } = get();
        const now = Date.now();
        const cacheKey = regionCode || "nationwide";

        if (familyPopularBooks[cacheKey] && now - (familyPopularBooksTimestamp[cacheKey] || 0) < CACHE_DURATION) {
            return familyPopularBooks[cacheKey];
        }

        try {
            const books = await bookRepository.getPopularBooks({
                region: regionCode || undefined,
                age: "14;20;30;40", 
                pageSize: 10,
            });
            set((state) => ({
                familyPopularBooks: { ...state.familyPopularBooks, [cacheKey]: books },
                familyPopularBooksTimestamp: { ...state.familyPopularBooksTimestamp, [cacheKey]: now }
            }));
            return books;
        } catch (error) { return []; }
      },

      fetchLocalKidsPopularBooks: async (regionCode?: string) => {
        const { localKidsPopularBooks, localKidsPopularBooksTimestamp } = get();
        const now = Date.now();
        const cacheKey = regionCode || "nationwide";

        if (localKidsPopularBooks[cacheKey] && now - (localKidsPopularBooksTimestamp[cacheKey] || 0) < CACHE_DURATION) {
            return localKidsPopularBooks[cacheKey];
        }

        try {
            const books = await bookRepository.getPopularBooks({
                region: regionCode || undefined,
                age: "0;6;8", 
                addCode: "7",
                pageSize: 15,
            });
            set((state) => ({
                localKidsPopularBooks: { ...state.localKidsPopularBooks, [cacheKey]: books },
                localKidsPopularBooksTimestamp: { ...state.localKidsPopularBooksTimestamp, [cacheKey]: now }
            }));
            return books;
        } catch (error) { return []; }
      },
    }),
    {
      name: "library-recommendations-storage-v5", // 캐시 강제 무효화
    }
  )
);