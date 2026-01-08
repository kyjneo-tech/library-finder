"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { REGIONS, RegionData, SubRegion } from "@/shared/config/region-codes";

interface RegionState {
  // 선택된 광역시/도
  selectedRegion: RegionData | null;
  // 선택된 시/군/구
  selectedSubRegion: SubRegion | null;
  // 드롭다운 열림 상태
  isOpen: boolean;

  // Actions
  setRegion: (region: RegionData | null) => void;
  setSubRegion: (subRegion: SubRegion | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  reset: () => void;

  // Computed
  getRegionCode: () => string | null;
  getDisplayName: () => string;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      selectedRegion: null,
      selectedSubRegion: null,
      isOpen: false,

      setRegion: (region) => {
        set({ selectedRegion: region, selectedSubRegion: null });
      },

      setSubRegion: (subRegion) => {
        set({ selectedSubRegion: subRegion, isOpen: false });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      reset: () => {
        set({ selectedRegion: null, selectedSubRegion: null });
      },

      getRegionCode: () => {
        const { selectedRegion, selectedSubRegion } = get();
        // 세부지역이 선택되면 세부지역 코드, 아니면 광역시/도 코드
        if (selectedSubRegion) return selectedSubRegion.code;
        if (selectedRegion) return selectedRegion.code;
        return null;
      },

      getDisplayName: () => {
        const { selectedRegion, selectedSubRegion } = get();
        if (selectedSubRegion && selectedRegion) {
          return `${selectedRegion.name} ${selectedSubRegion.name}`;
        }
        if (selectedRegion) {
          return selectedRegion.name;
        }
        return "지역을 선택하세요";
      },
    }),
    {
      name: "region-storage",
      partialize: (state) => ({
        selectedRegion: state.selectedRegion,
        selectedSubRegion: state.selectedSubRegion,
      }),
    }
  )
);

// Helper: 모든 지역 목록
export { REGIONS };
