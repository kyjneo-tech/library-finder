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
  searchLibrariesNationwide: (
    isbn: string,
    userLocation?: { lat: number; lng: number } | null
  ) => Promise<void>;
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
    // 🛡️ 로딩 중이라도 위치 정보가 업데이트되면 재검색이 필요할 수 있음.
    // 기존 가드 제거: if (get().librariesLoading) return;
    
    console.log(`[useLibrarySearch] searchLibrariesWithBook: ${isbn}, region: ${region}, wide: ${isWideSearch}, loc: ${userLocation ? `${userLocation.lat},${userLocation.lng}` : 'null'}`);

    if (!region) {
      await get().searchLibrariesNationwide(isbn, userLocation);
      return;
    }

    set({ librariesLoading: true });
    try {
      const searchRegion =
        isWideSearch && region.length === 5 ? region.substring(0, 2) : region;
      const result = await bookRepository.getLibrariesWithBook(isbn, searchRegion);

      // 🚨 [Fallback] 해당 지역에 소장 도서관이 없을 때, 그 지역의 도서관 목록 표시 (대출 불가 상태로)
      let targetLibraries = result.libraries;
      let isFallback = false;

      if (targetLibraries.length === 0 && !isWideSearch) {
          // console.log(`[useLibrarySearch] No libraries found in region ${region}. Fetching all libraries for context.`);
          const { libraryRepository } = await import('@/entities/library/repository/library.repository.impl');
          
          const filters: any = {};
          if (region.length === 5) {
             filters.dtl_region = region;
             filters.region = region.substring(0, 2); 
          } else {
             filters.region = region;
          }
          
          const fallbackResult = await libraryRepository.getLibraries(filters);
          // Convert Library[] to BookAvailability[] (mock)
          targetLibraries = fallbackResult.libraries.map(lib => ({
             isbn: isbn, // ✅ Fix: Add missing isbn
             libraryCode: lib.libCode,
             libraryName: lib.libName,
             address: lib.address,
             tel: lib.tel,
             latitude: lib.latitude?.toString(),
             longitude: lib.longitude?.toString(),
             homepage: lib.homepage,
             hasBook: false,
             loanAvailable: false,
             closed: lib.closed,
             operatingTime: lib.operatingTime,
          }));
          isFallback = true;
      }

      const checkLimit = isFallback ? 0 : 5; // Fallback 상태면 굳이 대출 가능 확인 안 함 (이미 없음)
      const librariesWithInfo = await Promise.all(
        targetLibraries.map(async (lib, idx) => {
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
            hasBook: !isFallback, // Fallback이면 책 없음
            loanAvailable: false,
            distance,
          };
        })
      );

      const sortedLibraries = librariesWithInfo.sort((a, b) => {
        if (a.hasBook !== b.hasBook) return a.hasBook ? -1 : 1; // 책 있는 곳 우선
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

  searchLibrariesNationwide: async (
    isbn: string,
    userLocation?: { lat: number; lng: number } | null
  ) => {
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
      let librariesWithInfo: LibraryWithBookInfo[] = allLibraries.map((lib: BookAvailability) => {
        const lat = lib.latitude ? parseFloat(lib.latitude) : 0;
        const lng = lib.longitude ? parseFloat(lib.longitude) : 0;
        let distance: number | undefined;

        if (userLocation && lat && lng) {
          distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
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
          loanAvailable: false, // 기본값 (미확인)
          availabilityChecked: false, // 확인 여부 추적
          distance,
        };
      });

      // 🔍 [Fix] 거리순 1차 정렬 (내 주변 도서관을 우선적으로 확인하기 위함)
      // 이걸 안 하면 regionCodes 순서(서울 '11' 등)대로 상위 30개를 자르게 되어,
      // 지방 사용자는 서울 도서관만 확인하게 됨.
      librariesWithInfo.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0; // 거리 정보 없으면 순서 유지
      });

      // ✅ 신뢰성 강화: 상위 30개 도서관 대출가능 여부 확인 (배치 처리로 Rate Limit 방지)
      const CHECK_LIMIT = 30;
      const BATCH_SIZE = 5; // 10 -> 5로 감소 (Server Load 감소)
      const BATCH_DELAY_MS = 500; // 200ms -> 500ms로 증가 (여유롭게 요청)

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
        // 거리 우선 (옵션)
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
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
