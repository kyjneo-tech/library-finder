import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReadStamp {
  id: string; // Added ID for uniqueness
  isbn: string;
  title: string;
  bookImageUrl?: string;
  author?: string;
  emoji?: '😆' | '😭' | '❤️' | '😴';
  createdAt: string; // ISO String
  childId?: string; // Optional: specific child assignment
}

interface ReadingRecordState {
  stamps: ReadStamp[];
  addStamp: (stamp: Omit<ReadStamp, 'id' | 'createdAt'>) => void;
  removeStamp: (isbn: string, childId?: string) => void;
  hasStamp: (isbn: string, childId?: string) => boolean;
  getStamp: (isbn: string, childId?: string) => ReadStamp | undefined;
  syncWithServer: () => Promise<void>;
  moveStampsToChild: (isbns: string[], targetChildId: string, sourceChildId?: string) => Promise<void>;
}

export const useReadingRecord = create<ReadingRecordState>()(
  persist(
    (set, get) => ({
      stamps: [],
      
      addStamp: (stamp) => {
        const newStamp: ReadStamp = { 
          ...stamp, 
          id: crypto.randomUUID(), 
          createdAt: new Date().toISOString() 
        };
        set((state) => {
          // Check duplicates with same ISBN AND childId
          // Normalize childId to null for comparison
          const targetChildId = stamp.childId || null;
          
          const exists = state.stamps.some((s) => 
            s.isbn === stamp.isbn && (s.childId || null) === targetChildId
          );
          
          if (exists) {
             return {
              stamps: state.stamps.map((s) => 
                (s.isbn === stamp.isbn && (s.childId || null) === targetChildId) ? newStamp : s
              )
            };
          }
          return { stamps: [newStamp, ...state.stamps] };
        });
      },

      removeStamp: (isbn, childId) => {
        set((state) => ({
          stamps: state.stamps.filter((s) => {
            // If deleting specific child's stamp
            if (childId !== undefined) {
               return !(s.isbn === isbn && s.childId === childId);
            }
            // If generic (or old behavior), delete all with this ISBN? 
            // Better: if childId undefined, delete where childId is null (Inbox) to be safe?
            // Existing logic was just `s.isbn !== isbn`. This deletes ALL copies across all children.
            // We should probably refine this.
            // For now, let's keep it safe: if childId provided, delete match. If not, delete match with null?
            // Actually, the previous logic `s.isbn !== isbn` deleted GLOBALLY.
            // Let's refine:
            const targetChildId = childId || null;
            return !(s.isbn === isbn && (s.childId || null) === targetChildId);
          })
        }));
      },

      hasStamp: (isbn, childId) => {
         const targetChildId = childId || null;
         return get().stamps.some((s) => s.isbn === isbn && (s.childId || null) === targetChildId);
      },

      getStamp: (isbn, childId) => {
        const targetChildId = childId || null;
        return get().stamps.find((s) => s.isbn === isbn && (s.childId || null) === targetChildId);
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
             const errorData = await response.json().catch(() => ({}));
             console.error('Sync server error:', errorData);
             throw new Error(`Sync failed: ${errorData.details || response.statusText}`);
          }

          const data = await response.json();
          if (data.stamps) {
            set({ stamps: data.stamps });
          }
        } catch (error) {
          console.error('Failed to sync reading record:', error);
        }
      },

      moveStampsToChild: async (isbns: string[], targetChildId: string, sourceChildId?: string) => {
        try {
          // 1. API Call
          const res = await fetch('/api/reading-record/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isbns, targetChildId, sourceChildId }),
          });

          if (!res.ok) throw new Error('Failed to move books');

          // 2. Optimistic Update
          set((state) => {
            const newStamps = [...state.stamps];
            isbns.forEach((isbn) => {
              // Find source stamp
              // Normalize undefined/null to null for comparison
              const normalizedSourceId = sourceChildId || null;
              
              const sourceIndex = newStamps.findIndex(s => 
                s.isbn === isbn && (s.childId || null) === normalizedSourceId
              );
              
              if (sourceIndex > -1) {
                const sourceStamp = newStamps[sourceIndex];
                // Check if target already has this book
                const targetIndex = newStamps.findIndex(s => s.isbn === isbn && s.childId === targetChildId);
                
                if (targetIndex > -1) {
                   // If target already has it, just remove source (Merge/Delete from source)
                   newStamps.splice(sourceIndex, 1);
                } else {
                   // Otherwise, move source to target. 
                   // Use spread to create new object.
                   newStamps[sourceIndex] = { ...sourceStamp, childId: targetChildId };
                }
              }
            });
            return { stamps: newStamps };
          });
          
        } catch (error) {
          console.error('Failed to move books:', error);
          throw error;
        }
      }
    }),
    {
      name: 'reading-record-storage', // localStorage key
    }
  )
);
