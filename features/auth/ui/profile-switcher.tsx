'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { useAuthStore } from '../lib/use-auth-store';
import { PlusCircle, Baby, User as UserIcon, LogOut, BookOpen } from 'lucide-react';
import { AddChildDialog } from './add-child-dialog';
import { signOut } from '../lib/supabase-auth';
import Link from 'next/link';

export function ProfileSwitcher() {
  const { user, children, activeChildId, setActiveChildId } = useAuthStore();
  const [openAddChild, setOpenAddChild] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const activeChild = children.find((c) => c.id === activeChildId);
  const displayName = activeChild ? activeChild.name : '부모님 (나)';
  const displayEmoji = activeChild ? activeChild.emoji : null;

  // 부모님 아바타 (기본)
  const parentAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const parentName = user.user_metadata?.full_name || user.user_metadata?.name || '부모님';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 pl-2 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 gap-2">
            <Avatar className="h-6 w-6">
              {displayEmoji ? (
                <AvatarFallback className="bg-orange-100 text-sm">{displayEmoji}</AvatarFallback>
              ) : (
                 <AvatarImage src={parentAvatarUrl} />
              )}
              <AvatarFallback className="bg-purple-100 text-xs">P</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm shadow-xl border-slate-200" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{parentName}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/my-bookshelf" className="cursor-pointer gap-2">
              <BookOpen className="h-4 w-4" />
              <span>내 책장 (가족 통합)</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer gap-2">
            <UserIcon className="h-4 w-4" />
            <span>프로필 설정</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-slate-500">프로필 전환</DropdownMenuLabel>
          
          {/* 부모님 (나) */}
          <DropdownMenuItem 
            className="cursor-pointer gap-2" 
            onClick={() => setActiveChildId(null)}
          >
            <Avatar className="h-5 w-5 border border-slate-200">
               <AvatarImage src={parentAvatarUrl} />
               <AvatarFallback className="bg-purple-100 text-[10px]">P</AvatarFallback>
            </Avatar>
            <span className={!activeChildId ? "font-bold" : ""}>부모님 (나)</span>
            {!activeChildId && <span className="ml-auto text-xs text-purple-600 font-medium">사용 중</span>}
          </DropdownMenuItem>


          {children.length > 0 && <DropdownMenuSeparator />}

          {/* 자녀 목록 */}
          {children.map((child) => (
            <DropdownMenuItem 
              key={child.id} 
              className="cursor-pointer gap-2"
              onClick={() => setActiveChildId(child.id)}
            >
              <span className="text-lg leading-none">{child.emoji || '🐥'}</span>
              <span className={activeChildId === child.id ? "font-bold" : ""}>{child.name}</span>
              {activeChildId === child.id && <span className="ml-auto text-xs text-orange-600">사용 중</span>}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          
          {/* 자녀 추가 */}
          <DropdownMenuItem 
            className="cursor-pointer gap-2 text-slate-600"
            onClick={() => setOpenAddChild(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>자녀 추가하기</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer gap-2">
            <LogOut className="h-4 w-4" />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddChildDialog open={openAddChild} onOpenChange={setOpenAddChild} />
    </>
  );
}
