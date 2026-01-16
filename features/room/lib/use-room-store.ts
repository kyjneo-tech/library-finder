import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PatternType = 'dots' | 'grid' | 'zigzag' | 'plain';
export type ThemeColor = 'yellow' | 'blue' | 'pink' | 'green' | 'purple' | 'dark' | 'white';

export interface RoomDecoration {
  id: string;
  type: 'plant' | 'lamp' | 'toy' | 'poster' | 'clock' | 'rug_circle' | 'rug_rect' | 'chair' | 'table' | 'plant_large' | 'frame' | 'window' | 'cat';
  variant: number; // For different styles of the same type
  x: number; // Percent 0-100 or Grid Column
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface RoomConfig {
  id: string; // userId or childId
  wallColor: ThemeColor;
  wallPattern: PatternType;
  shelfColor: ThemeColor;
  showLighting: boolean;
  decorations: RoomDecoration[]; // Items placed in the room
}

interface RoomState {
  rooms: Record<string, RoomConfig>;
  
  // Actions
  updateRoom: (roomId: string, config: Partial<RoomConfig>) => void;
  addDecoration: (roomId: string, decoration: RoomDecoration) => void;
  updateDecoration: (roomId: string, decorationId: string, updates: Partial<RoomDecoration>) => void;
  removeDecoration: (roomId: string, decorationId: string) => void;
  getRoomConfig: (roomId: string) => RoomConfig;
}

const DEFAULT_CONFIG: RoomConfig = {
  id: 'default',
  wallColor: 'yellow',
  wallPattern: 'dots',
  shelfColor: 'dark', // 'dark' maps to black/stone-900
  showLighting: true,
  decorations: [],
};

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: {},

      updateRoom: (roomId, config) => {
        set((state) => {
          const current = state.rooms[roomId] || { ...DEFAULT_CONFIG, id: roomId };
          return {
            rooms: {
              ...state.rooms,
              [roomId]: { ...current, ...config },
            },
          };
        });
      },

      addDecoration: (roomId, decoration) => {
        set((state) => {
          const current = state.rooms[roomId] || { ...DEFAULT_CONFIG, id: roomId };
          return {
            rooms: {
              ...state.rooms,
              [roomId]: {
                ...current,
                decorations: [...current.decorations, decoration],
              },
            },
          };
        });
      },

      updateDecoration: (roomId, decorationId, updates) => {
        set((state) => {
           const current = state.rooms[roomId];
           if (!current) return state;
           
           const newDecorations = current.decorations.map(d => 
             d.id === decorationId ? { ...d, ...updates } : d
           );

           return {
             rooms: {
                ...state.rooms,
                [roomId]: { ...current, decorations: newDecorations }
             }
           };
        });
      },

      removeDecoration: (roomId, decorationId) => {
        set((state) => {
          const current = state.rooms[roomId];
          if (!current) return state;
          return {
            rooms: {
              ...state.rooms,
              [roomId]: {
                ...current,
                decorations: current.decorations.filter(d => d.id !== decorationId),
              },
            },
          };
        });
      },

      getRoomConfig: (roomId) => {
        const state = get();
        return state.rooms[roomId] || { ...DEFAULT_CONFIG, id: roomId };
      },
    }),
    {
      name: 'room-customization-storage',
    }
  )
);
