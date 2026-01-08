import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "@/entities/book/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";

interface RecommendationsState {
  // 연령별 인기 도서 캐시 (키: 연령대 문자열, 값: 도서 목록)
  ageRecommendations: Record<string, Book[]>;
  ageRecommendationsTimestamp: number;

  // 지역/세부지역별 통합 인기 도서 캐시 (키: 지역코드, 값: 도서 목록)
  // 이제 familyPopularBooks도 지역별로 관리하여 데이터 섞임 방지
  familyPopularBooks: Record<string, Book[]>;
  familyPopularBooksTimestamp: Record<string, number>;

  // Actions
  fetchAgeRecommendations: (age: string) => Promise<Book[]>;
  fetchFamilyPopularBooks: (regionCode?: string) => Promise<Book[]>;
}

// 캐시 유효 시간 (6시간)
const CACHE_DURATION = 6 * 60 * 60 * 1000;

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      ageRecommendations: {},
      ageRecommendationsTimestamp: 0,
      familyPopularBooks: {},
      familyPopularBooksTimestamp: {},

      fetchAgeRecommendations: async (age: string) => {
        const { ageRecommendations, ageRecommendationsTimestamp } = get();
        const now = Date.now();

        if (
          ageRecommendations[age] &&
          ageRecommendations[age].length > 0 &&
          now - ageRecommendationsTimestamp < CACHE_DURATION
        ) {
          return ageRecommendations[age];
        }

        let ageParam: string | undefined;
        if (age !== 'all') {
            switch (age) {
            case '0-2': ageParam = '0'; break;
            case '3-5': ageParam = '0'; break;
            case '6-7': ageParam = '6'; break;
            case '8-10': ageParam = '8'; break;
            }
        } else {
            ageParam = "0;6;8";
        }

        try {
            const books = await bookRepository.getPopularBooks({
                age: ageParam,
                addCode: '7',
                pageSize: 6,
            });

            set((state) => ({
                ageRecommendations: { ...state.ageRecommendations, [age]: books },
                ageRecommendationsTimestamp: now
            }));

            return books;
        } catch (error) {
            return [];
        }
      },

      fetchFamilyPopularBooks: async (regionCode?: string) => {
        const { familyPopularBooks, familyPopularBooksTimestamp } = get();
        const now = Date.now();
        const cacheKey = regionCode || "nationwide";

        if (
            familyPopularBooks[cacheKey] &&
            familyPopularBooks[cacheKey].length > 0 &&
            now - (familyPopularBooksTimestamp[cacheKey] || 0) < CACHE_DURATION
        ) {
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
        } catch (error) {
            console.error("Failed to fetch family recommendations:", error);
            return [];
        }
      },
    }),
    {
      name: "library-recommendations-storage-v2", // 버전업하여 기존 캐시 무효화
    }
  )
);
