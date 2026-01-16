export interface FamilyMember {
  id: string;
  name: string;
  birthYear: number;
  emoji: string | null;
  userId: string;
}

export interface CreateFamilyMemberDto {
  name: string;
  birthYear: number;
  emoji?: string;
}

export const familyApi = {
  // Get all family members
  getMembers: async (): Promise<FamilyMember[]> => {
    const res = await fetch('/api/auth/children', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch family members');
    const data = await res.json();
    return data.children;
  },

  // Add a new family member
  addMember: async (dto: CreateFamilyMemberDto): Promise<FamilyMember> => {
    const res = await fetch('/api/auth/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    
    if (!res.ok) throw new Error('Failed to add family member');
    const data = await res.json();
    return data.child;
  },

  removeMember: async (id: string): Promise<void> => {
    const res = await fetch(`/api/auth/children?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) throw new Error('Failed to remove family member');
  }
};
