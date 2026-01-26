import { API_CONFIG } from '@/shared/config/constants';

export interface Library {
  libCode: string;
  libName: string;
  address: string;
  tel: string;
  homepage: string;
  latitude: string;
  longitude: string;
  closed: string;
  operatingTime: string;
}

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

    // 2. Check cache
    const cached = this.cache.get(cacheKey);
    const LONG_LIV_ENDPOINTS = ['hotTrend', 'extends/libSrch', 'monthlyKeywords'];
    const currentTTL = LONG_LIV_ENDPOINTS.some(ep => endpoint.includes(ep))
      ? 60 * 60 * 1000 
      : this.CACHE_TTL;

    if (cached && Date.now() - cached.timestamp < currentTTL) {
      return cached.data as T;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    // 3. Execute request
    const requestPromise = (async () => {
      try {
        let attempts = 0;
        const MAX_RETRIES = 3;
        const BASE_DELAY = 1000;
        
        const isServer = typeof window === 'undefined';
        const API_KEY = isServer ? process.env.LIBRARY_API_KEY : null;
        const API_BASE = process.env.NEXT_PUBLIC_LIBRARY_API_BASE || 'http://data4library.kr/api';
        
        let requestUrl = url.toString();

        // 🛡️ Server-side Direct Fetch Logic
        if (isServer && API_KEY) {
            const directUrl = new URL(`${API_BASE}/${endpoint}`);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    directUrl.searchParams.append(key, String(value));
                }
            });
            directUrl.searchParams.append('authKey', API_KEY);
            directUrl.searchParams.append('format', 'json');
            requestUrl = directUrl.toString();
        }

        while (attempts < MAX_RETRIES) {
          try {
            const response = await fetch(requestUrl);
            
            // Log for Server-side Debugging
            if (isServer && API_KEY) {
                const logUrl = requestUrl.replace(API_KEY, '***');
                try {
                    const clonedRes = response.clone();
                    const data = await clonedRes.json();
                    if (data.response?.error) {
                        console.error(`[LibraryAPI] ❌ API Error: ${data.response.error} | URL: ${logUrl}`);
                    } else if (endpoint === 'bookExist' && !data.response?.result) {
                        console.warn(`[LibraryAPI] ⚠️ No result for bookExist | URL: ${logUrl}`);
                    } else if (response.ok) {
                        console.log(`[LibraryAPI] ✅ Success: ${endpoint} | URL: ${logUrl}`);
                    }
                } catch (e) {
                    // Ignore peek errors
                }
            }

            if (response.status === 429) {
               const delay = BASE_DELAY * Math.pow(2, attempts);
               await new Promise(resolve => setTimeout(resolve, delay));
               attempts++;
               continue;
            }

            if (!response.ok) {
              if (response.status >= 500 && attempts < MAX_RETRIES) {
                 const delay = BASE_DELAY * Math.pow(2, attempts);
                 await new Promise(resolve => setTimeout(resolve, delay));
                 attempts++;
                 continue;
              }
              throw new Error(`API Error [${response.status}]: ${response.statusText}`);
            }

            const data = await response.json();
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
    return this.fetch<any>('srchBooks', {
      keyword: params.keyword,
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      sort: params.sort,
      order: params.order,
      region: params.region,
      dtl_region: params.dtl_region,
    });
  }

  async getBookDetail(isbn13: string) {
    return this.fetch<any>('srchDtlList', { isbn13, loaninfoYN: 'Y' });
  }

  async checkBookExistence(isbn: string, libCode: string) {
    if (!isbn || !libCode) return { response: { result: null } }; 
    
    // Sanitize ISBN: remove non-alphanumeric characters (keep it simple for now)
    const sanitizedIsbn = isbn.replace(/[^0-9X]/gi, '');
    
    // 🔥 [Fix] bookExist API only accepts 'isbn13' as the parameter name, 
    // even for 10-digit ISBNs.
    return this.fetch<any>('bookExist', {
      libCode,
      isbn13: sanitizedIsbn
    });
  }

  async searchLibrariesByBook(params: {
    isbn: string;
    region?: string;
    dtl_region?: string;
    pageSize?: number;
  }): Promise<{ libraries: Library[]; totalCount: number }> {
    const response = await this.fetch<any>('libSrchByBook', params);
    const libs = response.response?.libs?.map((item: any) => ({
      libCode: item.lib.libCode,
      libName: item.lib.libName,
      address: item.lib.address,
      tel: item.lib.tel,
      homepage: item.lib.homepage,
      latitude: item.lib.latitude,
      longitude: item.lib.longitude,
      closed: item.lib.closed,
      operatingTime: item.lib.operatingTime,
    })) || [];

    return {
      libraries: libs,
      totalCount: Number(response.response?.numFound || 0),
    };
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
