'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { cn } from '@/shared/lib/cn';

export function OnboardingModal() {
  const { user, hasCompletedOnboarding, completeOnboarding, isLoading, initialized } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show modal if:
    // 1. App is initialized
    // 2. Not loading
    // 3. User is logged in
    // 4. Onboarding NOT completed
    if (initialized && !isLoading && user && !hasCompletedOnboarding) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user, hasCompletedOnboarding, isLoading, initialized]);

  const handleSelect = async (type: 'general' | 'parent') => {
    await completeOnboarding(type);
    setOpen(false);
    // Optional: Refresh page or trigger other effects
    window.location.reload(); 
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl">
        <div className="bg-gradient-to-br from-indigo-50 to-white px-6 pt-8 pb-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center mb-4"
          >
            <span className="text-3xl">👋</span>
          </motion.div>
          <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
            환영합니다!
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            누구를 위한 도서관인가요?
            <br />
            <span className="text-xs text-gray-400 font-normal">
              선택에 따라 앱의 테마와 추천이 달라집니다.
            </span>
          </DialogDescription>
        </div>

        <div className="p-4 grid gap-3 bg-gray-50/50">
          <button
            onClick={() => handleSelect('general')}
            className="group relative flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-transparent hover:border-wisdom-300 hover:shadow-glow-purple transition-all text-left"
          >
            <div className="w-12 h-12 rounded-full bg-wisdom-100 flex items-center justify-center text-wisdom-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 group-hover:text-wisdom-700 transition-colors">
                나를 위한 독서
              </h3>
              <p className="text-xs text-gray-500">
                베스트셀러, 신간, 자료 검색
              </p>
            </div>
            <div className="absolute inset-0 rounded-xl ring-2 ring-wisdom-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>

          <button
            onClick={() => handleSelect('parent')}
            className="group relative flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-transparent hover:border-warmth-300 hover:shadow-glow-warmth transition-all text-left"
          >
            <div className="w-12 h-12 rounded-full bg-warmth-100 flex items-center justify-center text-warmth-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 group-hover:text-warmth-700 transition-colors">
                아이와 함께 독서
              </h3>
              <p className="text-xs text-gray-500">
                그림책, 육아 기록, 전집 추천
              </p>
            </div>
            <div className="absolute inset-0 rounded-xl ring-2 ring-warmth-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
