import { API_CONFIG } from '@/shared/config/constants';

export class LibraryApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  private cache = new Map<string, { data: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  private async fetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`/api/libraries/${endpoint}`, this.baseUrl);

    // Create a stable cache key
    const sortedParams = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    const cacheKey = `${endpoint}?${sortedParams}`;

    // 1. Check pending requests (Deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // 2. Check cache (only for GET-like requests, which all of these effectively are)
    const cached = this.cache.get(cacheKey);
    
    // Dynamic TTL based on endpoint
    const LONG_LIV_ENDPOINTS = ['hotTrend', 'extends/libSrch', 'monthlyKeywords'];
    const currentTTL = LONG_LIV_ENDPOINTS.some(ep => endpoint.includes(ep))
      ? 60 * 60 * 1000 // 1 hour for popular/new books
      : this.CACHE_TTL; // 5 mins for others

    if (cached && Date.now() - cached.timestamp < currentTTL) {
      return cached.data as T;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    // 3. Execute request with Retry Logic
    const requestPromise = (async () => {
      try {
        let attempts = 0;
        const MAX_RETRIES = 3;
        const BASE_DELAY = 1000;

        while (attempts < MAX_RETRIES) {
          try {
            const response = await fetch(url.toString());
            
            if (response.status === 429) {
               console.warn(`[LibraryApiClient] 429 Too Many Requests. Retrying... (${attempts + 1}/${MAX_RETRIES})`);
               const delay = BASE_DELAY * Math.pow(2, attempts);
               await new Promise(resolve => setTimeout(resolve, delay));
               attempts++;
               continue;
            }

            if (!response.ok) {
              if (response.status >= 500 && attempts < MAX_RETRIES) {
                 console.warn(`[LibraryApiClient] Server Error ${response.status}. Retrying... (${attempts + 1}/${MAX_RETRIES})`);
                 const delay = BASE_DELAY * Math.pow(2, attempts);
                 await new Promise(resolve => setTimeout(resolve, delay));
                 attempts++;
                 continue;
              }
              throw new Error(`API Error [${response.status}]: ${response.statusText}`);
            }

            const data = await response.json();
            // Cache success response
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
          } catch (error: any) {
             if (attempts < MAX_RETRIES && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                const delay = BASE_DELAY * Math.pow(2, attempts);
                await new Promise(resolve => setTimeout(resolve, delay));
                attempts++;
                continue;
             }
             throw error;
          }
        }
        throw new Error(`API Error: Max retries exceeded for ${endpoint}`);
      } finally {
        // Remove from pending validation regardless of success/failure
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async searchBooks(params: {
    keyword: string;
    pageNo: number;
    pageSize: number;
    sort?: string;
    order?: string;
    region?: string;
    dtl_region?: string;
  }) {
    // API Spec: srchBooks uses 'title' for keyword search
    const finalParams = {
      title: params.keyword,
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      sort: params.sort,
      order: params.order,
      region: params.region,
      dtl_region: params.dtl_region,
    };
    return this.fetch<any>('srchBooks', finalParams);
  }

  async getBookDetail(isbn13: string) {
    return this.fetch<any>('srchDtlList', { isbn13, loaninfoYN: 'Y' });
  }

  async checkBookExistence(isbn13: string, libCode: string) {
    return this.fetch<any>('bookExist', { isbn13, libCode });
  }

  async searchLibrariesByBook(params: {
    isbn: string;
    region?: string;
    dtl_region?: string;
    pageSize?: number;
  }) {
    return this.fetch<any>('libSrchByBook', params);
  }

  async getLoanItemSearch(params: any) {
    return this.fetch<any>('loanItemSrch', params);
  }

  async getLoanItemSearchByLib(params: any) {
    return this.fetch<any>('loanItemSrchByLib', params);
  }

  async getUsageAnalysis(isbn13: string) {
    return this.fetch<any>('usageAnalysisList', { isbn13 });
  }

  async getHotTrend(searchDt: string) {
    return this.fetch<any>('hotTrend', { searchDt });
  }

  async getRecommendList(isbn13: string) {
    return this.fetch<any>('recommandList', { isbn13, type: 'reader' });
  }

  async getMonthlyKeywords() {
    return this.fetch<any>('monthlyKeywords');
  }

  async getUsageTrend(libCode: string, type: 'D' | 'H') {
    return this.fetch<any>('usageTrend', { libCode, type });
  }

  async getExtendedLibraryInfo(params: {
    libCode?: string;
    region?: string;
    dtl_region?: string;
    pageNo?: number;
    pageSize?: number;
  }) {
    return this.fetch<any>('extends/libSrch', params);
  }
}

export const libraryApiClient = new LibraryApiClient();
