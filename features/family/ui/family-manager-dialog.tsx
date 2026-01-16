'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { useFamilyStore } from '@/features/family/model/use-family-store';
import { Trash2, User, Plus } from 'lucide-react';
import { AddChildDialog } from '@/features/auth/ui/add-child-dialog'; // We might want to rename this later

interface FamilyManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyManagerDialog({ open, onOpenChange }: FamilyManagerDialogProps) {
  const { members, removeMember, isLoading } = useFamilyStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`${name} 님을 가족 목록에서 삭제하시겠습니까? 서재 데이터는 유지되지만 접근할 수 없게 될 수 있습니다.`)) {
       // Note: removeMember needs to be implemented in store/service first if not exists
       // For now assuming it exists or we will add it.
       if (removeMember) {
         await removeMember(id);
       } else {
         alert('삭제 기능은 아직 구현 중입니다.');
       }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>가족 구성원 관리</DialogTitle>
            <DialogDescription>
              가족 구성원을 추가하거나 관리할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {members.length === 0 ? (
              <div className="text-center py-8 text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                등록된 가족이 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl shadow-sm hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-xl">
                        {member.emoji || <User className="w-5 h-5 text-stone-400" />}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{member.name}</p>
                        <p className="text-xs text-stone-500">{member.birthYear}년생</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-stone-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(member.id, member.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button 
              className="w-full h-12 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold gap-2"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="w-4 h-4" />
              새로운 가족 추가하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddChildDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
