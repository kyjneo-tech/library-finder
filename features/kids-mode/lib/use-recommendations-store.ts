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
            
            // 🛡️ [해결] 0-2세와 3-5세를 위해 KDC(주제분류)를 다르게 적용하여 100% 다른 결과 보장
            if (age === '0-2') {
                // 0~2세: 영유아(0) 중 가장 인기 있는 '그림책/문학(KDC 8)' 위주
                finalBooks = await bookRepository.getPopularBooks({
                    age: '0',
                    addCode: '7',
                    kdc: '8',
                    pageSize: 12
                });
            } else if (age === '3-5') {
                // 3~5세: 영유아(0) 중 '자연과학/예술/사회(KDC 4;6;3)' 등 지식 확장형 책 위주
                finalBooks = await bookRepository.getPopularBooks({
                    age: '0',
                    addCode: '7',
                    kdc: '4;6;3', // 과학, 예술, 사회과학 통합
                    pageSize: 12
                });
            } else {
                // 6세 이상은 기존의 정밀한 연령대 코드 사용
                let ageParam = age === '6-7' ? '6' : 'a8';
                finalBooks = await bookRepository.getPopularBooks({
                    age: ageParam,
                    addCode: '7',
                    pageSize: 12,
                });
            }

            // ⚠️ 만약 특정 분류 결과가 0건이면 전체 영유아 인기 도서로 보강
            if (finalBooks.length === 0) {
                finalBooks = await bookRepository.getPopularBooks({
                    age: '0',
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
      name: "library-recommendations-storage-v6", // 캐시 무효화 및 버전업
    }
  )
);
