import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "@/entities/book/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";

interface RecommendationsState {
  // 연령별 인기 도서 캐시 (키: 연령대 문자열, 값: 도서 목록)
  ageRecommendations: Record<string, Book[]>;
  ageRecommendationsTimestamp: Record<string, number>;

  // 지역별 인기 도서 캐시 (패밀리용)
  familyPopularBooks: Record<string, Book[]>;
  familyPopularBooksTimestamp: Record<string, number>;

  // 지역별 인기 도서 캐시 (키즈용) - 새로 추가
  localKidsPopularBooks: Record<string, Book[]>;
  localKidsPopularBooksTimestamp: Record<string, number>;

  // Actions
  fetchAgeRecommendations: (age: string) => Promise<Book[]>;
  fetchFamilyPopularBooks: (regionCode?: string) => Promise<Book[]>;
  fetchLocalKidsPopularBooks: (regionCode?: string) => Promise<Book[]>; // 새로 추가
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

        let ageParam: string | undefined;
        if (age !== 'all') {
            switch (age) {
            case '0-2': ageParam = '0'; break;
            case '3-5': ageParam = '0'; break;
            case '6-7': ageParam = '6'; break;
            case '8-10': ageParam = 'a8'; break; 
            }
        } else {
            ageParam = "0;6;8";
        }

        try {
            const books = await bookRepository.getPopularBooks({
                age: ageParam,
                addCode: '7',
                pageSize: 12,
            });
            set((state) => ({
                ageRecommendations: { ...state.ageRecommendations, [age]: books },
                ageRecommendationsTimestamp: { ...state.ageRecommendationsTimestamp, [age]: now }
            }));
            return books;
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
            // 🛡️ 키즈용 지역 인기 도서 - addCode: 7 (아동 전용) 강력 적용
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
      name: "library-recommendations-storage-v4",
    }
  )
);
