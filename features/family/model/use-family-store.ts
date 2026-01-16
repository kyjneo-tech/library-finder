import { create } from 'zustand';
import { familyApi, FamilyMember, CreateFamilyMemberDto } from '../api/family.service';

interface FamilyStore {
  members: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMembers: () => Promise<void>;
  addMember: (dto: CreateFamilyMemberDto) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const members = await familyApi.getMembers();
      set({ members, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch members:', error);
      set({ error: '가족 목록을 불러오는데 실패했습니다.', isLoading: false });
    }
  },

  addMember: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const newMember = await familyApi.addMember(dto);
      set((state) => ({ 
        members: [...state.members, newMember],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to add member:', error);
      set({ error: '가족 추가에 실패했습니다.', isLoading: false });
      throw error; 
    }
  },

  removeMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await familyApi.removeMember(id);
      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to remove member:', error);
      set({ error: '가족 삭제에 실패했습니다.', isLoading: false });
      // throw error; // User optional
    }
  },
}));
