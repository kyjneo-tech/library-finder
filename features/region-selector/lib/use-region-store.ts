'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { REGIONS, RegionData, SubRegion, District } from '@/shared/config/region-codes';

interface RegionState {
  selectedRegion: RegionData | null;
  selectedSubRegion: SubRegion | null;
  selectedDistrict: District | null; // 🛡️ '구' 선택 상태 추가
  isOpen: boolean;

  setRegion: (region: RegionData | null) => void;
  setSubRegion: (subRegion: SubRegion | null) => void;
  setDistrict: (district: District | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  reset: () => void;

  getRegionCode: () => string | null;
  getDisplayName: () => string;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      selectedRegion: null,
      selectedSubRegion: null,
      selectedDistrict: null,
      isOpen: false,

      setRegion: (region) => {
        set({ selectedRegion: region, selectedSubRegion: null, selectedDistrict: null });
      },

      setSubRegion: (subRegion) => {
        set({ selectedSubRegion: subRegion, selectedDistrict: null });
      },

      setDistrict: (district) => {
        set({ selectedDistrict: district, isOpen: false });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      reset: () => {
        set({ selectedRegion: null, selectedSubRegion: null, selectedDistrict: null });
      },

      getRegionCode: () => {
        const { selectedDistrict, selectedSubRegion, selectedRegion } = get();
        // 🛡️ 구 -> 시 -> 도 순으로 가장 구체적인 코드 반환
        if (selectedDistrict) return selectedDistrict.code;
        if (selectedSubRegion) return selectedSubRegion.code;
        if (selectedRegion) return selectedRegion.code;
        return null;
      },

      getDisplayName: () => {
        const { selectedRegion, selectedSubRegion, selectedDistrict } = get();
        if (selectedDistrict && selectedSubRegion && selectedRegion) {
          return `${selectedSubRegion.name} ${selectedDistrict.name}`;
        }
        if (selectedSubRegion && selectedRegion) {
          return `${selectedRegion.name} ${selectedSubRegion.name}`;
        }
        if (selectedRegion) {
          return selectedRegion.name;
        }
        return '지역을 선택하세요';
      },
    }),
    {
      name: 'region-storage-v2',
      partialize: (state) => ({
        selectedRegion: state.selectedRegion,
        selectedSubRegion: state.selectedSubRegion,
        selectedDistrict: state.selectedDistrict,
      }),
    }
  )
);

export { REGIONS };
