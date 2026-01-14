import { create } from 'zustand';

interface LoadingState {
  // 로딩 중인 작업들을 키로 관리
  loadingKeys: Set<string>;
  
  // 전체 로딩 상태 (어떤 작업이든 로딩 중이면 true)
  isLoading: boolean;
  
  // 로딩 메시지 (가장 최근 작업)
  loadingMessage: string | null;
  
  // 액션
  startLoading: (key: string, message?: string) => void;
  stopLoading: (key: string) => void;
  isKeyLoading: (key: string) => boolean;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingKeys: new Set(),
  isLoading: false,
  loadingMessage: null,
  
  startLoading: (key: string, message?: string) => {
    set((state) => {
      const newKeys = new Set(state.loadingKeys);
      newKeys.add(key);
      return {
        loadingKeys: newKeys,
        isLoading: true,
        loadingMessage: message || getDefaultMessage(key),
      };
    });
  },
  
  stopLoading: (key: string) => {
    set((state) => {
      const newKeys = new Set(state.loadingKeys);
      newKeys.delete(key);
      const isLoading = newKeys.size > 0;
      return {
        loadingKeys: newKeys,
        isLoading,
        loadingMessage: isLoading ? state.loadingMessage : null,
      };
    });
  },
  
  isKeyLoading: (key: string) => {
    return get().loadingKeys.has(key);
  },
}));

// 키별 기본 로딩 메시지
function getDefaultMessage(key: string): string {
  const messages: Record<string, string> = {
    'search-books': '도서 검색 중...',
    'search-libraries': '도서관 찾는 중...',
    'load-popular': '인기 도서 불러오는 중...',
    'load-trending': '급상승 도서 확인 중...',
    'load-new-arrivals': '신착 도서 확인 중...',
    'load-recommendations': '추천 도서 분석 중...',
    'check-availability': '대출 가능 여부 확인 중...',
  };
  return messages[key] || '잠시만 기다려주세요...';
}

// 편의를 위한 로딩 키 상수
export const LOADING_KEYS = {
  SEARCH_BOOKS: 'search-books',
  SEARCH_LIBRARIES: 'search-libraries',
  LOAD_POPULAR: 'load-popular',
  LOAD_TRENDING: 'load-trending',
  LOAD_NEW_ARRIVALS: 'load-new-arrivals',
  LOAD_RECOMMENDATIONS: 'load-recommendations',
  CHECK_AVAILABILITY: 'check-availability',
} as const;
