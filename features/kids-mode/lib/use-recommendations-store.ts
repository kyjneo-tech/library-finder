import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "@/entities/book/model/types";
import { bookRepository } from "@/entities/book/repository/book.repository.impl";

interface RecommendationsState {
  // 연령별 인기 도서 캐시 (키: 연령대 문자열, 값: 도서 목록)
  ageRecommendations: Record<string, Book[]>;
  ageRecommendationsTimestamp: number;

  // 지역별 인기 도서 캐시 (키: 지역코드, 값: 도서 목록)
  localPopularBooks: Record<string, Book[]>;
  localPopularBooksTimestamp: number;

  // Actions
  fetchAgeRecommendations: (age: string) => Promise<Book[]>;
  fetchLocalPopularBooks: (regionCode: string) => Promise<{ books: Book[], isFallback: boolean }>;
}

// 캐시 유효 시간 (예: 1시간)
const CACHE_DURATION = 60 * 60 * 1000;

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      ageRecommendations: {},
      ageRecommendationsTimestamp: 0,
      localPopularBooks: {},
      localPopularBooksTimestamp: 0,

      fetchAgeRecommendations: async (age: string) => {
        const { ageRecommendations, ageRecommendationsTimestamp } = get();
        const now = Date.now();

        if (
          ageRecommendations[age] &&
          ageRecommendations[age].length > 0 &&
          now - ageRecommendationsTimestamp < CACHE_DURATION
        ) {
          console.log(`[Cache] Using cached recommendations for age: ${age}`);
          return ageRecommendations[age];
        }

        console.log(`[API] Fetching new recommendations for age: ${age}`);
        
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
                region: undefined,
                age: ageParam,
                addCode: '7',
                pageSize: 6,
            });

            set((state) => ({
                ageRecommendations: {
                    ...state.ageRecommendations,
                    [age]: books
                },
                ageRecommendationsTimestamp: now
            }));

            return books;
        } catch (error) {
            console.error("Failed to fetch age recommendations:", error);
            return [];
        }
      },

      fetchLocalPopularBooks: async (regionCode: string) => {
        const { localPopularBooks, localPopularBooksTimestamp } = get();
        const now = Date.now();
        const cacheKey = regionCode || "nationwide";

        if (
            localPopularBooks[cacheKey] &&
            localPopularBooks[cacheKey].length > 0 &&
            now - localPopularBooksTimestamp < CACHE_DURATION
        ) {
            console.log(`[Cache] Using cached local books for region: ${cacheKey}`);
            // 캐시된 데이터 반환 (Fallback 여부는 알 수 없으므로 false 가정)
            return { books: localPopularBooks[cacheKey], isFallback: false };
        }

        console.log(`[API] Fetching new local books for region: ${cacheKey}`);

        try {
            let isFallback = false;
            let books = await bookRepository.getPopularBooks({
                region: regionCode || undefined,
                age: "0;6;8",
                addCode: "7",
                pageSize: 10,
            });

            if (books.length === 0 && regionCode) {
                console.log("[Cache] Local fetch empty, trying nationwide fallback...");
                books = await bookRepository.getPopularBooks({
                    region: undefined,
                    age: "0;6;8",
                    addCode: "7",
                    pageSize: 10,
                });
                isFallback = true;
            }

            set((state) => ({
                localPopularBooks: {
                    ...state.localPopularBooks,
                    [cacheKey]: books
                },
                localPopularBooksTimestamp: now
            }));

            return { books, isFallback };
        } catch (error) {
            console.error("Failed to fetch local popular books:", error);
            return { books: [], isFallback: false };
        }
      },
    }),
    {
      name: "library-recommendations-storage",
    }
  )
);
