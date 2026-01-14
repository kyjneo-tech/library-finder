'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Book } from '@/entities/book/model/types';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';
import { Skeleton } from '@/shared/ui/skeleton';
import { BookCarousel } from '@/shared/ui/book-carousel';
import { TrendingUp, Flame, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface HotTrendBooksProps {
  onBookSelect: (book: Book) => void;
  filterKids?: boolean; // true면 아동용만 필터링
}

export function HotTrendBooks({ onBookSelect, filterKids = false }: HotTrendBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        let trendingBooks = await bookRepository.getTrendingBooks();
        
        // 우리 아이 탭: 아동용(addCode=7) 필터링
        if (filterKids && trendingBooks.length > 0) {
          trendingBooks = trendingBooks.filter(book => 
            book.additionSymbol?.startsWith('7')
          );
        }
        
        setBooks(trendingBooks.slice(0, 5));
      } catch (error) {
        console.error('Failed to load hot trend books:', error);
      }
      setLoading(false);
    };
    loadBooks();
  }, [filterKids]);

  if (loading) {
    return (
      <div className="mx-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-24 h-36 rounded-xl shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <section className="mx-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-800">
              {filterKids ? '아이들 급상승 도서' : '급상승 도서'}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">최근 7일간 대출 순위 급상승!</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          HOT
        </div>
      </div>
      
      <BookCarousel className="pt-3">
        {books.map((book, idx) => (
          <motion.div
            key={book.isbn}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onBookSelect(book)}
            className="relative shrink-0 cursor-pointer group"
          >
            {/* 순위 배지 */}
            <div className={cn(
              "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 shadow-lg",
              idx === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" :
              idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
              idx === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
              "bg-gray-200 text-gray-600"
            )}>
              {idx + 1}
            </div>
            
            {/* 책 이미지 */}
            <div className="w-24 h-36 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              {book.bookImageURL ? (
                <Image
                  src={book.bookImageURL}
                  alt={book.title}
                  width={96}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* 제목 */}
            <p className="mt-2 text-[11px] font-bold text-gray-700 line-clamp-2 w-24 text-center">
              {book.title}
            </p>
          </motion.div>
        ))}
      </BookCarousel>
    </section>
  );
}
