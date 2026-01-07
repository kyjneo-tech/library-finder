"use client";

import { create } from "zustand";

type BottomSheetHeight = "min" | "mid" | "max";

interface BottomSheetState {
  height: BottomSheetHeight;
  isOpen: boolean;

  setHeight: (height: BottomSheetHeight) => void;
  toggleSheet: () => void;
  openSheet: () => void;
  closeSheet: () => void;
}

export const useBottomSheet = create<BottomSheetState>((set) => ({
  height: "min",
  isOpen: true,

  setHeight: (height: BottomSheetHeight) => {
    set({ height });
  },

  toggleSheet: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  openSheet: () => {
    set({ isOpen: true });
  },

  closeSheet: () => {
    set({ isOpen: false });
  },
}));
