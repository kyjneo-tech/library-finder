import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CategoryTab = 'subject' | 'situation';

interface CategoryTabState {
  activeTab: CategoryTab;
  setActiveTab: (tab: CategoryTab) => void;
}

export const useCategoryTab = create<CategoryTabState>()(
  persist(
    (set) => ({
      activeTab: 'subject',

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },
    }),
    {
      name: 'category-tab-storage',
    }
  )
);
