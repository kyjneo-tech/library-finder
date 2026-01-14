'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle2, ChevronRight, BookOpen, Search as SearchIcon } from 'lucide-react';
import Image from 'next/image';
import { Book } from '@/entities/book/model/types';
import { useBookSearch } from '@/features/book-search/lib/use-book-search';
import { useSearchMode } from '@/features/search-mode/lib/use-search-mode';
import { cn } from '@/shared/lib/cn';
import { staggerContainer, staggerItem } from '@/shared/lib/animations/variants';
import { sanitizeHTML } from '@/shared/lib/utils/sanitize';

import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';

const MotionCard = motion(Card);

interface HomeSearchSectionProps {
  showSearchResults: boolean;
  searchQuery: string;
  handleCloseSearchResults: () => void;
  handleBookSelect: (book: Book) => void;
  books: Book[];
  totalCount: number;
}

export function HomeSearchSection({
  showSearchResults,
  searchQuery,
  handleCloseSearchResults,
  handleBookSelect,
  books,
  totalCount,
}: HomeSearchSectionProps) {
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const { loading, error } = useBookSearch();
  const { mode } = useSearchMode();

  // Scroll to top when showing results
  useEffect(() => {
    if (showSearchResults && searchResultsRef.current) {
      searchResultsRef.current.scrollTop = 0;
    }
  }, [showSearchResults]);

  return (
    <AnimatePresence>
      {showSearchResults && (
        <motion.div
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', duration: 0.4 }}
        >
          <div className="flex-none p-4 border-b border-gray-100 bg-white/50 shadow-sm flex items-center justify-between safe-top">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                '{searchQuery}' <span className="text-purple-500">검색 결과</span>
              </h2>
              <p className="text-xs font-bold text-gray-500">
                총 {totalCount.toLocaleString()}권의 책을 찾았어요
              </p>
            </div>
            <button
              onClick={handleCloseSearchResults}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 safe-bottom" ref={searchResultsRef}>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-500 animate-pulse">열심히 책을 찾고 있어요...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-lg font-black text-gray-800">오류가 발생했어요</p>
                <p className="text-sm text-gray-500">{error}</p>
                <button
                  onClick={handleCloseSearchResults}
                  className="px-6 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200"
                >
                  돌아가기
                </button>
              </div>
            ) : books.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 gap-4 max-w-2xl mx-auto pb-20"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {books.map((book) => (
                  <MotionCard
                    key={book.isbn13}
                    variants={staggerItem}
                    onClick={() => handleBookSelect(book)}
                    className="flex rounded-2xl p-4 shadow-sm border-gray-100 hover:border-purple-200 transition-all cursor-pointer group active:scale-98 relative overflow-hidden"
                  >
                    {book.bookImageURL ? (
                      <div className="relative w-20 h-28 shrink-0 mr-4 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                        <Image
                          src={book.bookImageURL}
                          alt={book.title}
                          width={80}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-28 shrink-0 mr-4 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        {book.emotion && mode === 'kids' && (
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none mb-1.5 px-2 py-0.5 text-[10px] font-black rounded-md">
                            {book.emotion}
                          </Badge>
                        )}
                        <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-purple-600 transition-colors">
                          <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(book.title) }} />
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(book.author || '') }} /> · {book.publisher}
                        </p>
                      </div>

                    </div>
                  </MotionCard>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                  <SearchIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-black text-gray-800">검색 결과가 없어요</p>
                <p className="text-sm text-gray-500">다른 단어로 검색해보는 건 어떨까요?</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}
