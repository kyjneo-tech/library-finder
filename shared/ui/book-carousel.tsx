'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface BookCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export function BookCarousel({ children, className }: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollability);
      // ResizeObserver for dynamic content
      const observer = new ResizeObserver(checkScrollability);
      observer.observe(ref);
      return () => {
        ref.removeEventListener('scroll', checkScrollability);
        observer.disconnect();
      };
    }
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={cn('relative group', className)}>
      {/* 왼쪽 화살표 */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
                     w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg 
                     flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     hover:scale-110 hover:bg-white
                     border border-gray-100
                     -ml-2"
          aria-label="이전으로 스크롤"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
      >
        {children}
      </div>

      {/* 오른쪽 화살표 */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
                     w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg 
                     flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     hover:scale-110 hover:bg-white
                     border border-gray-100
                     -mr-2"
          aria-label="다음으로 스크롤"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* 그라데이션 페이드 효과 */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
