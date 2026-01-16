'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { useFamilyStore } from '@/features/family/model/use-family-store';

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChildDialog({ open, onOpenChange }: AddChildDialogProps) {
  const { refreshChildren } = useAuthStore();
  const { addMember, isLoading } = useFamilyStore();
  
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthYear) return;

    try {
      // Use the new Centralized Family Store
      await addMember({
        name,
        birthYear: parseInt(birthYear),
        emoji: '😃', // Default generic emoji
      });
      
      // Sync with legacy store (MyBookshelf still uses this)
      await refreshChildren();
      
      onOpenChange(false);
      setName('');
      setBirthYear('');
    } catch (e) {
      // Error handled by store or global handler
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>가족 구성원 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              이름 (별명)
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="예: 배우자, 사랑이"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthYear" className="text-right">
              태어난 연도
            </Label>
            <Input
              id="birthYear"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="col-span-3"
              placeholder="예: 1985"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '추가 중...' : '가족 추가하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
