import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    try {
      // 1. 현재 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      
      set({ 
        session, 
        user: session?.user ?? null,
        isLoading: false,
        initialized: true 
      });

      // 2. Auth 상태 변경 구독
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          session, 
          user: session?.user ?? null,
          isLoading: false 
        });
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ isLoading: false, initialized: true });
    }
  },

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
}));
