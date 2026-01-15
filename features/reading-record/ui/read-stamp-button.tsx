'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'; 
// Note: Popover is needed. Checking if I have it. If not, I will install it.
// Assuming I need to install popover.
import { useReadingRecord } from '../lib/use-reading-record';
import { cn } from '@/shared/lib/cn';

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

export function ReadStampButton({ book, className }: ReadStampButtonProps) {
  const { hasStamp, addStamp, removeStamp, getStamp } = useReadingRecord();
  const isRead = hasStamp(book.isbn);
  const currentStamp = getStamp(book.isbn);

  const [isOpen, setIsOpen] = useState(false);

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
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {!isRead ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              className="rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 font-bold gap-2 transition-all"
              onClick={() => setIsOpen(true)}
            >
              <span className="grayscale opacity-50">📖</span>
              읽었어요
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="center">
            <div className="flex gap-2">
              {EMOJIS.map(({ char, label }) => (
                <button
                  key={char}
                  onClick={() => handleEmojiSelect(char)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
    </div>
  );
}
