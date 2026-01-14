'use client';

import { create } from 'zustand';
import { LibraryWithBookInfo } from '@/entities/library/model/types';
import { BookAvailability } from '@/entities/book/model/types';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';
import { calculateDistance } from '@/shared/lib/utils/distance';
import { globalCache } from '@/shared/lib/cache/memory-cache';

interface LibrarySearchState {
  librariesWithBook: LibraryWithBookInfo[];
  librariesLoading: boolean;

  // Actions
  searchLibrariesWithBook: (
    isbn: string,
    region: string,
    isWideSearch?: boolean,
    userLocation?: { lat: number; lng: number } | null
  ) => Promise<void>;
  searchLibrariesNationwide: (isbn: string) => Promise<void>;
  deepScan: (isbn: string, region: string) => Promise<void>;
  clearLibraries: () => void;
  mergeLibraries: (
    newLibraries: LibraryWithBookInfo[],
    userLocation?: { lat: number; lng: number } | null
  ) => void;
}

export const useLibrarySearch = create<LibrarySearchState>((set, get) => ({
  librariesWithBook: [],
  librariesLoading: false,

  searchLibrariesWithBook: async (
    isbn: string,
    region?: string,
    isWideSearch: boolean = false,
    userLocation?: { lat: number; lng: number } | null
  ) => {
    if (get().librariesLoading) return;

    if (!region) {
      await get().searchLibrariesNationwide(isbn);
      return;
    }

    set({ librariesLoading: true });
    try {
      const searchRegion =
        isWideSearch && region.length === 5 ? region.substring(0, 2) : region;
      const result = await bookRepository.getLibrariesWithBook(isbn, searchRegion);

      const checkLimit = 5;
      const librariesWithInfo = await Promise.all(
        result.libraries.map(async (lib, idx) => {
          const lat = lib.latitude ? parseFloat(lib.latitude) : 0;
          const lng = lib.longitude ? parseFloat(lib.longitude) : 0;
          let distance: number | undefined;

          if (userLocation && lat && lng) {
            distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
          }

          if (idx < checkLimit) {
            try {
              const availability = await bookRepository.getBookAvailability(
                isbn,
                lib.libraryCode
              );
              const info = availability[0];
              return {
                libCode: lib.libraryCode,
                libName: lib.libraryName,
                address: lib.address || '',
                tel: lib.tel || '',
                latitude: lat,
                longitude: lng,
                homepage: lib.homepage,
                hasBook: info?.hasBook ?? true,
                loanAvailable: info?.loanAvailable ?? false,
                distance,
              };
            } catch {
              // Ignore error
            }
          }
          return {
            libCode: lib.libraryCode,
            libName: lib.libraryName,
            address: lib.address || '',
            tel: lib.tel || '',
            latitude: lat,
            longitude: lng,
            homepage: lib.homepage,
            hasBook: true,
            loanAvailable: false,
            distance,
          };
        })
      );

      const sortedLibraries = librariesWithInfo.sort((a, b) => {
        if (a.loanAvailable !== b.loanAvailable) return a.loanAvailable ? -1 : 1;
        if (a.distance !== undefined && b.distance !== undefined)
          return a.distance - b.distance;
        return 0;
      });

      set({ librariesWithBook: sortedLibraries, librariesLoading: false });
    } catch {
      set({ librariesLoading: false });
    }
  },

  searchLibrariesNationwide: async (isbn: string) => {
    const cacheKey = `nationwide_${isbn}`;
    const cached = globalCache.get(cacheKey);

    if (cached) {
      set({ librariesWithBook: cached as LibraryWithBookInfo[], librariesLoading: false });
      return;
    }

    set({ librariesLoading: true });
    try {
      const regionCodes = [
        '11', '21', '22', '23', '24', '25', '26',
        '31', '32', '33', '34', '35', '36', '37', '38', '39',
        '50',
      ];

      const results = await Promise.allSettled(
        regionCodes.map((code) => bookRepository.getLibrariesWithBook(isbn, code))
      );

      const allLibraries = results
        .filter(
          (r): r is PromiseFulfilledResult<{ libraries: BookAvailability[]; totalCount: number }> =>
            r.status === 'fulfilled'
        )
        .flatMap((r) => r.value.libraries);

      // 기본 정보 채우기 + 대출가능 여부 확인 대상 표시
      let librariesWithInfo: LibraryWithBookInfo[] = allLibraries.map((lib: BookAvailability) => ({
        libCode: lib.libraryCode,
        libName: lib.libraryName,
        address: lib.address || '',
        tel: lib.tel || '',
        latitude: lib.latitude ? parseFloat(lib.latitude) : 0,
        longitude: lib.longitude ? parseFloat(lib.longitude) : 0,
        homepage: lib.homepage,
        hasBook: true,
        loanAvailable: false, // 기본값 (미확인)
        availabilityChecked: false, // 확인 여부 추적
      }));

      // ✅ 신뢰성 강화: 상위 30개 도서관 대출가능 여부 확인 (배치 처리로 Rate Limit 방지)
      const CHECK_LIMIT = 30;
      const BATCH_SIZE = 10;
      const BATCH_DELAY_MS = 200;

      const librariesToCheck = librariesWithInfo.slice(0, CHECK_LIMIT);
      const batches: LibraryWithBookInfo[][] = [];
      
      for (let i = 0; i < librariesToCheck.length; i += BATCH_SIZE) {
        batches.push(librariesToCheck.slice(i, i + BATCH_SIZE));
      }

      // 배치별로 순차 처리 (Rate Limit 방지)
      let checkedIndex = 0;
      for (const batch of batches) {
        const batchResults = await Promise.allSettled(
          batch.map((lib) => bookRepository.getBookAvailability(isbn, lib.libCode))
        );

        batchResults.forEach((result, batchIdx) => {
          const globalIdx = checkedIndex + batchIdx;
          if (globalIdx < librariesWithInfo.length) {
            if (result.status === 'fulfilled' && result.value[0]) {
              librariesWithInfo[globalIdx] = {
                ...librariesWithInfo[globalIdx],
                loanAvailable: result.value[0].loanAvailable ?? false,
                availabilityChecked: true,
              };
            } else {
              // API 실패해도 '확인 시도됨' 표시
              librariesWithInfo[globalIdx] = {
                ...librariesWithInfo[globalIdx],
                availabilityChecked: true,
              };
            }
          }
        });

        checkedIndex += batch.length;

        // 다음 배치 전 딜레이 (마지막 배치 제외)
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      // 정렬: 1)대출가능 상단 2)확인된 도서관 우선 3)나머지
      librariesWithInfo = librariesWithInfo.sort((a, b) => {
        // 대출 가능 여부 우선
        if (a.loanAvailable !== b.loanAvailable) return a.loanAvailable ? -1 : 1;
        // 확인 여부 차선
        const aChecked = (a as any).availabilityChecked ?? false;
        const bChecked = (b as any).availabilityChecked ?? false;
        if (aChecked !== bChecked) return aChecked ? -1 : 1;
        return 0;
      });

      // 캐시 저장 (availabilityChecked 플래그 제거하고 저장)
      const cleanedForCache = librariesWithInfo.map(({ ...lib }) => {
        delete (lib as any).availabilityChecked;
        return lib;
      });

      globalCache.set(cacheKey, cleanedForCache, 300000); // 5 minutes

      set({
        librariesWithBook: cleanedForCache,
        librariesLoading: false,
      });
    } catch {
      set({ librariesLoading: false });
    }
  },

  deepScan: async (isbn: string, region: string) => {
    set({ librariesLoading: true });
    try {
      const result = await bookRepository.deepScanLibraries(isbn, region);
      const librariesWithInfo: LibraryWithBookInfo[] = result.libraries.map(
        (lib: BookAvailability) => ({
          libCode: lib.libraryCode,
          libName: lib.libraryName,
          address: lib.address || '',
          tel: lib.tel || '',
          latitude: lib.latitude ? parseFloat(lib.latitude) : 0,
          longitude: lib.longitude ? parseFloat(lib.longitude) : 0,
          homepage: lib.homepage,
          hasBook: lib.hasBook,
          loanAvailable: lib.loanAvailable,
        })
      );
      set({ librariesWithBook: librariesWithInfo, librariesLoading: false });
    } catch {
      set({ librariesLoading: false });
    }
  },

  clearLibraries: () => {
    set({ librariesWithBook: [] });
  },

  mergeLibraries: (newLibraries, userLocation) => {
    const { librariesWithBook } = get();
    const existingCodes = new Set(librariesWithBook.map((lib) => lib.libCode));
    const uniqueNewLibraries = newLibraries.filter(
      (lib) => !existingCodes.has(lib.libCode)
    );

    const newLibsWithDistance = uniqueNewLibraries.map((lib) => {
      if (userLocation && lib.latitude && lib.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lib.latitude,
          lib.longitude
        );
        return { ...lib, distance };
      }
      return lib;
    });

    const merged = [...librariesWithBook, ...newLibsWithDistance].sort((a, b) => {
      if (a.loanAvailable !== b.loanAvailable) return a.loanAvailable ? -1 : 1;
      if (a.distance !== undefined && b.distance !== undefined)
        return a.distance - b.distance;
      return 0;
    });

    set({ librariesWithBook: merged });
  },
}));
