'use client';

import { create } from 'zustand';

type PendingAction = {
  type: 'book-select';
  payload: any; // Book object
} | {
  type: 'category-search';
  payload: { keyword: string; kdc?: string };
} | null;

interface PendingActionStore {
  pendingAction: PendingAction;
  showRegionModal: boolean;
  
  // Actions
  setPendingAction: (action: PendingAction) => void;
  openRegionModal: (action?: PendingAction) => void;
  closeRegionModal: () => void;
  executePendingAction: () => PendingAction;
}

export const usePendingActionStore = create<PendingActionStore>((set, get) => ({
  pendingAction: null,
  showRegionModal: false,
  
  setPendingAction: (action) => set({ pendingAction: action }),
  
  openRegionModal: (action) => {
    if (action) {
      set({ pendingAction: action, showRegionModal: true });
    } else {
      set({ showRegionModal: true });
    }
  },
  
  closeRegionModal: () => set({ showRegionModal: false }),
  
  // Returns the pending action and clears it
  executePendingAction: () => {
    const action = get().pendingAction;
    set({ pendingAction: null, showRegionModal: false });
    return action;
  },
}));
