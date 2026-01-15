import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReadStamp {
  isbn: string;
  title: string;
  bookImageUrl?: string;
  author?: string;
  emoji?: '😆' | '😭' | '❤️' | '😴';
  createdAt: string; // ISO String
}

interface ReadingRecordState {
  stamps: ReadStamp[];
  addStamp: (stamp: Omit<ReadStamp, 'createdAt'>) => void;
  removeStamp: (isbn: string) => void;
  hasStamp: (isbn: string) => boolean;
  getStamp: (isbn: string) => ReadStamp | undefined;
  syncWithServer: () => Promise<void>;
}

export const useReadingRecord = create<ReadingRecordState>()(
  persist(
    (set, get) => ({
      stamps: [],
      
      addStamp: (stamp) => {
        const newStamp = { ...stamp, createdAt: new Date().toISOString() };
        set((state) => {
          // 이미 있으면 업데이트, 없으면 추가
          const exists = state.stamps.some((s) => s.isbn === stamp.isbn);
          if (exists) {
            return {
              stamps: state.stamps.map((s) => 
                s.isbn === stamp.isbn ? newStamp : s
              )
            };
          }
          return { stamps: [newStamp, ...state.stamps] };
        });
      },

      removeStamp: (isbn) => {
        set((state) => ({
          stamps: state.stamps.filter((s) => s.isbn !== isbn)
        }));
      },

      hasStamp: (isbn) => {
        return get().stamps.some((s) => s.isbn === isbn);
      },

      getStamp: (isbn) => {
        return get().stamps.find((s) => s.isbn === isbn);
      },

      syncWithServer: async () => {
        try {
          const localStamps = get().stamps;
          const response = await fetch('/api/sync/reading-record', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ localStamps }),
          });

          if (!response.ok) {
             if (response.status === 401) return; // Not logged in
             throw new Error('Sync failed');
          }

          const data = await response.json();
          if (data.stamps) {
            set({ stamps: data.stamps });
          }
        } catch (error) {
          console.error('Failed to sync reading record:', error);
        }
      }
    }),
    {
      name: 'reading-record-storage', // localStorage key
    }
  )
);
