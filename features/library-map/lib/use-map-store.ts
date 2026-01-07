"use client";

import { create } from "zustand";
import { Library } from "@/entities/library/model/types";
import { libraryRepository } from "@/entities/library/repository/library.repository.impl";

interface MapState {
  libraries: Library[];
  selectedLibrary: Library | null;
  userLocation: { lat: number; lng: number } | null;
  distanceFilter: number; // 미터 단위
  loading: boolean;
  error: string | null;

  loadLibraries: (region?: string) => Promise<void>;
  setSelectedLibrary: (library: Library | null) => void;
  setUserLocation: (location: { lat: number; lng: number }) => void;
  setDistanceFilter: (distance: number) => void;
  getFilteredLibraries: () => Library[];
}

export const useMapStore = create<MapState>((set, get) => ({
  libraries: [],
  selectedLibrary: null,
  userLocation: null,
  distanceFilter: 3000, // 기본 3km
  loading: false,
  error: null,

  loadLibraries: async (region?: string) => {
    set({ loading: true, error: null });
    try {
      const result = await libraryRepository.getLibraries({ region });
      set({
        libraries: result.libraries,
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "도서관 목록을 불러오는 중 오류가 발생했습니다",
        loading: false,
      });
    }
  },

  setSelectedLibrary: (library: Library | null) => {
    set({ selectedLibrary: library });
  },

  setUserLocation: (location: { lat: number; lng: number }) => {
    set({ userLocation: location });
  },

  setDistanceFilter: (distance: number) => {
    set({ distanceFilter: distance });
  },

  getFilteredLibraries: () => {
    const { libraries, userLocation, distanceFilter } = get();

    if (!userLocation) return libraries;

    // 거리 필터링 로직 (간단한 구현)
    return libraries.filter((lib) => {
      if (!lib.latitude || !lib.longitude) return false;

      // 간단한 거리 계산 (실제로는 Haversine formula 사용)
      const latDiff = Math.abs(lib.latitude - userLocation.lat);
      const lngDiff = Math.abs(lib.longitude - userLocation.lng);
      const approxDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // 대략적인 변환

      return approxDistance <= distanceFilter;
    });
  },
}));
