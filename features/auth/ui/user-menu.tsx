'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { useAuthStore } from '../lib/use-auth-store';
import { signOut } from '../lib/supabase-auth';
import { LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!user) return null;

  // 사용자 이니셜 또는 이름
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '사용자';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full px-0 hover:bg-transparent">
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
              {displayName[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white shadow-xl border-gray-200" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 내 책장 - 추후 구현 */}
        <DropdownMenuItem asChild>
          <Link href="/my-bookshelf" className="cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>내 책장</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>프로필 설정</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
