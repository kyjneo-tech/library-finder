'use client';

import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'; 
import { useReadingRecord } from '../lib/use-reading-record';
import { useAuthStore } from '@/features/auth/lib/use-auth-store';
import { cn } from '@/shared/lib/cn';
import { useConfetti } from '@/shared/hooks/use-confetti';
import { toast } from 'sonner';
import { LoginPromptModal } from '@/shared/ui/login-prompt-modal';

interface ReadStampButtonProps {
  book: {
    isbn: string;
    title: string;
    author: string;
    image: string;
  };
  className?: string;
}

const EMOJIS = [
  { char: '😆', label: '재밌어요' },
  { char: '😭', label: '슬퍼요' },
  { char: '😴', label: '졸려요' },
  { char: '❤️', label: '또 볼래요' },
] as const;

const LOGIN_PROMPT_KEY = 'login-prompt-shown';

export function ReadStampButton({ book, className }: ReadStampButtonProps) {
  const { hasStamp, addStamp, removeStamp, getStamp, stamps } = useReadingRecord();
  const { user } = useAuthStore();
  const isRead = hasStamp(book.isbn);
  const currentStamp = getStamp(book.isbn);

  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { fireFromElement } = useConfetti();

  // Count of stamps (all stamps are "read" implicitly)
  const readCount = stamps.length;

  const handleToggle = () => {
    if (isRead) {
      removeStamp(book.isbn);
    } else {
      setIsOpen(true);
    }
  };

  const handleEmojiSelect = (emoji: '😆' | '😭' | '❤️' | '😴') => {
    addStamp({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      bookImageUrl: book.image,
      emoji,
    });
    setIsOpen(false);

    // 🎉 Celebration Effect
    fireFromElement(buttonRef.current);
    
    // Toast message
    const newCount = readCount + 1;
    toast.success(
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className="font-bold">{newCount}번째 책이에요! 🎉</div>
          <div className="text-sm text-stone-500">{book.title}</div>
        </div>
      </div>,
      {
        duration: 3000,
        className: 'border-2 border-black shadow-pop',
      }
    );

    // 🔐 Login Prompt: Show at exactly 10 books for non-logged-in users
    if (!user && newCount === 10) {
      const alreadyShown = sessionStorage.getItem(LOGIN_PROMPT_KEY);
      if (!alreadyShown) {
        setTimeout(() => {
          setShowLoginPrompt(true);
          sessionStorage.setItem(LOGIN_PROMPT_KEY, 'true');
        }, 1500); // Delay to let confetti/toast show first
      }
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {!isRead ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              ref={buttonRef}
              variant="outline"
              className="rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 font-bold gap-2 transition-all"
              onClick={() => setIsOpen(true)}
            >
              <span className="grayscale opacity-50">📖</span>
              읽었어요
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 border-2 border-black shadow-pop" align="center">
            <div className="flex gap-2">
              {EMOJIS.map(({ char, label }) => (
                <button
                  key={char}
                  onClick={() => handleEmojiSelect(char)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 active:scale-90 transition-all"
                >
                  <span className="text-2xl">{char}</span>
                  <span className="text-[10px] text-gray-500">{label}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Button 
          variant="outline"
          className="rounded-xl bg-purple-50 border-purple-200 text-purple-700 font-bold gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-500 group transition-all"
          onClick={handleToggle}
        >
          <span>{currentStamp?.emoji || '✅'}</span>
          읽음
          <span className="hidden group-hover:inline text-xs ml-1">
             (취소)
          </span>
        </Button>
      )}

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <LoginPromptModal
            readCount={readCount + 1}
            onClose={() => setShowLoginPrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

