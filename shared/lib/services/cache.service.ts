import { getCachedCoverFromDB, saveCoverToDB, getCachedPopularBooksFromDB, savePopularBooksToDB } from '../actions/cache.action';

const MEMORY_CACHE = new Map<string, any>();
const COVER_CACHE_KEY = 'book_cover_cache';

/**
 * 통합 캐시 서비스 (Unified Cache Service)
 * - 책 표지: Memory -> localStorage -> DB -> API
 * - 인기도서: Memory -> DB -> API
 * - 일반 데이터: Memory -> API
 */
export const cacheService = {
  /**
   * 1. 책 표지 가져오기 (이미지 전용 최적화)
   */
  async getBookCover(isbn: string, fallbackFn?: () => Promise<string | null>): Promise<string | null> {
    if (!isbn) return null;

    // 1. Memory Cache
    if (MEMORY_CACHE.has(`cover:${isbn}`)) {
      return MEMORY_CACHE.get(`cover:${isbn}`);
    }

    // 2. localStorage (Client only)
    if (typeof window !== 'undefined') {
      try {
        const localCache = JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || '{}');
        if (localCache[isbn]) {
          MEMORY_CACHE.set(`cover:${isbn}`, localCache[isbn]);
          return localCache[isbn];
        }
      } catch {}
    }

    // 3. DB (Server Action)
    try {
      const dbCover = await getCachedCoverFromDB(isbn);
      if (dbCover) {
        MEMORY_CACHE.set(`cover:${isbn}`, dbCover);
        saveToLocalCache(isbn, dbCover);
        return dbCover;
      }
    } catch {}

    // 4. API Fallback
    if (fallbackFn) {
      const imageUrl = await fallbackFn();
      if (imageUrl) {
        saveToLocalCache(isbn, imageUrl);
        MEMORY_CACHE.set(`cover:${isbn}`, imageUrl);
        saveCoverToDB(isbn, imageUrl).catch(() => {});
        return imageUrl;
      }
    }

    return null;
  },

  /**
   * 2. 인기도서/신착도서 가져오기 (DB 공유 캐시 활용)
   */
  async getPopularBooks<T>(
      category: string, 
      regionCode: string, 
      fallbackFn: () => Promise<T>, 
      ttlSeconds: number = 3600
  ): Promise<T> {
    const memKey = `popular:${category}:${regionCode}`;

    // 1. Memory Cache
    if (MEMORY_CACHE.has(memKey)) {
        // TTL 체크 로직이 메모리엔 없지만, 짧은 세션 동안은 유효하다고 가정
        // (필요 시 timestamp 추가 가능)
        return MEMORY_CACHE.get(memKey) as T;
    }

    // 2. DB Shared Cache (Server Action)
    try {
        const cachedData = await getCachedPopularBooksFromDB(category, regionCode);
        if (cachedData) {
            MEMORY_CACHE.set(memKey, cachedData);
            return cachedData as T;
        }
    } catch {}

    // 3. API Fallback
    const data = await fallbackFn();
    if (data) {
        MEMORY_CACHE.set(memKey, data);
        // 비동기 저장
        savePopularBooksToDB(category, data, regionCode, ttlSeconds).catch(() => {});
    }
    return data;
  },

  /**
   * 3. 일반 데이터 캐시 (Memory Only for Session)
   * 예: 도서관 검색 결과, 단순 API 응답 등
   */
  async getData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
      if (MEMORY_CACHE.has(key)) {
          return MEMORY_CACHE.get(key) as T;
      }
      
      const data = await fetcher();
      if (data) {
          MEMORY_CACHE.set(key, data);
      }
      return data;
  }
};

// Helper: localStorage 저장 (책 표지용)
function saveToLocalCache(isbn: string, url: string) {
  if (typeof window === 'undefined') return;
  try {
    const cache = JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || '{}');
    
    // LRU (500개 제한)
    const keys = Object.keys(cache);
    if (keys.length >= 500) {
      const keysToRemove = keys.slice(0, keys.length - 500 + 1);
      keysToRemove.forEach(k => delete cache[k]);
    }
    
    cache[isbn] = url;
    localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}
