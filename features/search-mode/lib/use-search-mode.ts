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
      mode: 'general', // 기본: 일반 모드

      setMode: (mode) => {
        set({ mode });
      },

      getSearchConfig: () => {
        const { mode } = get();

        if (mode === 'kids') {
          return {
            mode: 'kids',
            showKidsFeatures: true,
            placeholder: '우리 아이 그림책 찾기 🎈',
            recommendations: 'kids',
          };
        }

        return {
          mode: 'general',
          showKidsFeatures: false,
          placeholder: '어떤 책을 찾으세요?',
          recommendations: 'popular',
        };
      },
    }),
    {
      name: 'search-mode-storage',
    }
  )
);
