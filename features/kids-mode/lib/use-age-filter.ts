import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgeGroup = 'all' | '0-2' | '3-5' | '6-7' | '8-10';

interface AgeFilterState {
  selectedAge: AgeGroup;
  setSelectedAge: (age: AgeGroup) => void;
}

export const useAgeFilter = create<AgeFilterState>()(
  persist(
    (set) => ({
      selectedAge: 'all',

      setSelectedAge: (age) => {
        set({ selectedAge: age });
      },
    }),
    {
      name: 'age-filter-storage',
    }
  )
);
