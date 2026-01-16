'use client';

import { formatDistanceToNow } from '@/shared/lib/format-date';
import { cn } from '@/shared/lib/cn';
import Link from 'next/link';

interface BookListItemProps {
  isbn: string;
  title: string;
  author?: string;
  imageUrl?: string;
  emoji?: string;
  createdAt: string;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggle?: () => void;
}

export function BookListItem({
  isbn,
  title,
  author,
  imageUrl,
  emoji,
  createdAt,
  isSelected,
  isSelectionMode,
  onToggle,
}: BookListItemProps) {
  const formattedDate = formatDistanceToNow(createdAt);

  const content = (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 bg-white border-2 rounded-xl transition-all",
        isSelectionMode ? "cursor-pointer" : "hover:shadow-md",
        isSelected 
          ? "border-pop-yellow bg-pop-yellow/10 shadow-md" 
          : "border-stone-200 hover:border-stone-300"
      )}
      onClick={isSelectionMode ? onToggle : undefined}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
          isSelected ? "bg-pop-green border-black" : "border-stone-300"
        )}>
          {isSelected && <span className="text-white text-sm">✓</span>}
        </div>
      )}

      {/* Book Cover */}
      <div className="w-14 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-stone-800 truncate">{title}</h3>
        {author && <p className="text-sm text-stone-500 truncate">{author}</p>}
        <p className="text-xs text-stone-400 mt-1">{formattedDate}</p>
      </div>

      {/* Emoji Badge */}
      {emoji && (
        <div className="text-2xl shrink-0">{emoji}</div>
      )}
    </div>
  );

  if (isSelectionMode) {
    return content;
  }

  return (
    <Link href={`/book/${isbn}`} className="block">
      {content}
    </Link>
  );
}
