import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SearchMode = 'general' | 'kids';

interface SearchConfig {
  mode: SearchMode;
  showKidsFeatures: boolean;
  placeholder: string;
  recommendations: 'popular' | 'kids';
}

interface SearchModeState {
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  getSearchConfig: () => SearchConfig;
}

export const useSearchMode = create<SearchModeState>()(
  persist(
    (set, get) => ({
      mode: 'kids', // 기본은 친근하게 키즈로 시작하되 전체를 포괄

      setMode: (mode) => {
        set({ mode });
      },

      getSearchConfig: () => {
        const { mode } = get();

        if (mode === 'kids') {
          return {
            mode: 'kids',
            showKidsFeatures: true,
            placeholder: '아이와 함께 읽을 책을 찾아보세요 🧸',
            recommendations: 'kids',
          };
        }

        return {
          mode: 'general',
          showKidsFeatures: false,
          placeholder: '우리 가족 모두를 위한 책 검색 📚',
          recommendations: 'popular',
        };
      },
    }),
    {
      name: 'search-mode-storage',
    }
  )
);
