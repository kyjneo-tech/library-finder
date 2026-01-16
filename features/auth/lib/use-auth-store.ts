import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabase/client';

export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  birthYear: number;
  emoji: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  userType: 'general' | 'parent' | null;
  hasCompletedOnboarding: boolean;
  children: ChildProfile[];
  activeChildId: string | null;
  isLoading: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  updateUserType: (type: 'general' | 'parent') => Promise<void>;
  completeOnboarding: (type: 'general' | 'parent') => Promise<void>;
  refreshChildren: () => Promise<void>;
  setActiveChildId: (id: string | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  userType: null,
  hasCompletedOnboarding: false,
  children: [],
  activeChildId: null,
  isLoading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    try {
      // 1. 현재 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      
      let userType: 'general' | 'parent' | null = null;
      let hasCompletedOnboarding = false;
      let children: ChildProfile[] = [];

      if (session?.user) {
        // 2. 프로필(userType) 가져오기 (없으면 생성됨)
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            userType = data.profile?.userType || 'general';
            hasCompletedOnboarding = data.profile?.hasCompletedOnboarding || false;
            children = data.profile?.childProfiles || [];
          }
        } catch (e) {
          console.error('Failed to fetch user profile:', e);
        }
      }

      set({ 
        session, 
        user: session?.user ?? null,
        userType,
        hasCompletedOnboarding,
        children,
        isLoading: false,
        initialized: true 
      });

      // 3. Auth 상태 변경 구독
      supabase.auth.onAuthStateChange(async (_event, session) => {
        let userType: 'general' | 'parent' | null = null;
        let hasCompletedOnboarding = false;
        let children: ChildProfile[] = [];
        
        if (session?.user) {
           try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
              const data = await res.json();
              userType = data.profile?.userType || 'general';
              hasCompletedOnboarding = data.profile?.hasCompletedOnboarding || false;
              children = data.profile?.childProfiles || [];
            }
          } catch (e) {
            console.error('Failed to fetch user profile in auth change:', e);
          }
        }

        set({ 
          session, 
          user: session?.user ?? null,
          userType,
          hasCompletedOnboarding,
          children,
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
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ 
      user: null, 
      session: null, 
      userType: null, 
      hasCompletedOnboarding: false, 
      children: [],
      activeChildId: null 
    });
  },
  
  updateUserType: async (type) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: type }),
      });
      
      if (!res.ok) throw new Error('Failed to update user type');
      
      set({ userType: type });
    } catch (error) {
      console.error('Failed to update user type:', error);
      throw error;
    }
  },

  completeOnboarding: async (type) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userType: type,
          hasCompletedOnboarding: true 
        }),
      });
      
      if (!res.ok) throw new Error('Failed to complete onboarding');
      
      set({ 
        userType: type,
        hasCompletedOnboarding: true 
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  },

  refreshChildren: async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({ children: data.profile?.childProfiles || [] });
      }
    } catch (e) {
      console.error('Failed to refresh children:', e);
    }
  },

  setActiveChildId: (id) => set({ activeChildId: id }),
  addChild: async (child: Omit<ChildProfile, 'id' | 'userId'>) => {
    try {
      const res = await fetch('/api/auth/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(child),
      });

      if (!res.ok) throw new Error('Failed to create child profile');

      await get().refreshChildren();
    } catch (error) {
      console.error('Failed to add child:', error);
      throw error;
    }
  },
}));
