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
      mode: 'kids', // 기본: 아이책 모드

      setMode: (mode) => {
        set({ mode });
      },

      getSearchConfig: () => {
        const { mode } = get();

        if (mode === 'kids') {
          return {
            mode: 'kids',
            showKidsFeatures: true,
            placeholder: '우리 아이가 좋아할 책을 찾아보세요 🧸',
            recommendations: 'kids',
          };
        }

        return {
          mode: 'general',
          showKidsFeatures: false,
          placeholder: '찾으시는 도서명을 입력해 주세요',
          recommendations: 'popular',
        };
      },
    }),
    {
      name: 'search-mode-storage',
    }
  )
);
