import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '@/entities/book/model/types';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';
import { kidsBookService } from './kids-book.service';

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

        if (
          ageRecommendations[age] &&
          now - (ageRecommendationsTimestamp[age] || 0) < CACHE_DURATION
        ) {
          return ageRecommendations[age];
        }

        if (loadingStates[loadKey]) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return get().fetchAgeRecommendations(age);
        }

        try {
          set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: true } }));

          // Delegate complex logic to KidsBookService
          const finalBooks = await kidsBookService.getRecommendationsByAge(age);

          set((state) => ({
            ageRecommendations: { ...state.ageRecommendations, [age]: finalBooks },
            ageRecommendationsTimestamp: { ...state.ageRecommendationsTimestamp, [age]: now },
            loadingStates: { ...state.loadingStates, [loadKey]: false },
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
        const cacheKey = regionCode || 'nationwide';
        const loadKey = `family-${cacheKey}`;

        if (
          familyPopularBooks[cacheKey] &&
          now - (familyPopularBooksTimestamp[cacheKey] || 0) < CACHE_DURATION
        ) {
          return familyPopularBooks[cacheKey];
        }

        if (loadingStates[loadKey]) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return get().fetchFamilyPopularBooks(regionCode);
        }

        try {
          set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: true } }));
          // General logical uses BookRepository directly (simple)
          const books = await bookRepository.getPopularBooks({
            region: regionCode || undefined,
            age: '14;20;30;40', // Adults/Parents
            pageSize: 10,
          });
          set((state) => ({
            familyPopularBooks: { ...state.familyPopularBooks, [cacheKey]: books },
            familyPopularBooksTimestamp: { ...state.familyPopularBooksTimestamp, [cacheKey]: now },
            loadingStates: { ...state.loadingStates, [loadKey]: false },
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
        const cacheKey = regionCode || 'nationwide';
        const loadKey = `kids-local-${cacheKey}`;

        if (
          localKidsPopularBooks[cacheKey] &&
          now - (localKidsPopularBooksTimestamp[cacheKey] || 0) < CACHE_DURATION
        ) {
          return localKidsPopularBooks[cacheKey];
        }

        if (loadingStates[loadKey]) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return get().fetchLocalKidsPopularBooks(regionCode);
        }

        try {
          set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: true } }));
          
          // Delegate to KidsBookService
          const books = await kidsBookService.getPopularBooks(regionCode);

          set((state) => ({
            localKidsPopularBooks: { ...state.localKidsPopularBooks, [cacheKey]: books },
            localKidsPopularBooksTimestamp: {
              ...state.localKidsPopularBooksTimestamp,
              [cacheKey]: now,
            },
            loadingStates: { ...state.loadingStates, [loadKey]: false },
          }));
          return books;
        } catch (error) {
          set((state) => ({ loadingStates: { ...state.loadingStates, [loadKey]: false } }));
          return [];
        }
      },
    }),
    {
      name: 'library-recommendations-storage-v9',
    }
  )
);
