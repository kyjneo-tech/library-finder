/* eslint-disable @typescript-eslint/no-explicit-any */
export class MemoryCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();
  private defaultDuration: number;

  constructor(defaultDurationMs: number = 5 * 60 * 1000) {
    this.defaultDuration = defaultDurationMs;
  }

  set(key: string, data: T, durationMs?: number): void {
    const expiry = Date.now() + (durationMs || this.defaultDuration);
    this.cache.set(key, { data, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Singleton instance for global cache
export const globalCache = new MemoryCache<any>();
