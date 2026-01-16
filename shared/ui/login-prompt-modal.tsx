'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Monitor, Cloud } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { supabase } from '@/shared/lib/supabase/client';

const PROMPT_STORAGE_KEY = 'login-prompt-last-shown';
const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

interface LoginPromptModalProps {
  readCount: number;
  onClose: () => void;
}

export function LoginPromptModal({ readCount, onClose }: LoginPromptModalProps) {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/my-bookshelf`,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] rounded-2xl p-8 max-w-md w-full"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-black mb-2">
            멋져요! 벌써 {readCount}권을 읽었어요!
          </h2>
          <p className="text-stone-500 mb-6">
            로그인하면 기록이 저장되고<br />
            다른 기기에서도 볼 수 있어요
          </p>

          {/* Benefits */}
          <div className="bg-stone-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pop-blue/10 rounded-full flex items-center justify-center">
                <Cloud className="w-5 h-5 text-pop-blue" />
              </div>
              <span className="font-bold">기록이 영원히 저장돼요</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pop-green/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-pop-green" />
              </div>
              <span className="font-bold">핸드폰 ↔ 컴퓨터 자동 연동</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pop-yellow/10 rounded-full flex items-center justify-center">
                <Monitor className="w-5 h-5 text-pop-orange" />
              </div>
              <span className="font-bold">가족끼리 서재 공유</span>
            </div>
          </div>

          {/* Actions */}
          <Button
            onClick={handleLogin}
            className="w-full bg-[#FEE500] text-black border-2 border-black shadow-[4px_4px_0_0_#000] font-black text-lg py-6 hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            카카오로 시작하기
          </Button>
          <button
            onClick={onClose}
            className="mt-4 text-sm text-stone-400 hover:text-stone-600"
          >
            나중에 할게요
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Hook to manage login prompt logic
export function useLoginPrompt(readCount: number) {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if logged in
    if (user) return;
    
    // Don't show if under threshold
    if (readCount < 10) return;

    // Check cooldown
    const lastShown = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (lastShown) {
      const elapsed = Date.now() - parseInt(lastShown, 10);
      if (elapsed < PROMPT_COOLDOWN_MS) return;
    }

    // Show prompt
    setShow(true);
    localStorage.setItem(PROMPT_STORAGE_KEY, Date.now().toString());
  }, [user, readCount]);

  const close = () => setShow(false);

  return { showPrompt: show, closePrompt: close };
}
