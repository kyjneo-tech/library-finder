'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, ChevronRight, BookOpen, Search as SearchIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Book } from '@/entities/book/model/types';
import { useBookSearch } from '@/features/book-search/lib/use-book-search';
import { useSearchMode } from '@/features/search-mode/lib/use-search-mode';
import { cn } from '@/shared/lib/cn';
import { staggerContainer, staggerItem } from '@/shared/lib/animations/variants';
import { sanitizeHTML } from '@/shared/lib/utils/sanitize';

import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { loading, loadingMore, hasMore, loadMore, error } = useBookSearch();
  const { mode } = useSearchMode();

  // Scroll to top when showing results
  useEffect(() => {
    if (showSearchResults && searchResultsRef.current) {
      searchResultsRef.current.scrollTop = 0;
    }
  }, [showSearchResults]);

  // 🆕 Intersection Observer for infinite scroll
  useEffect(() => {
    if (!showSearchResults || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [showSearchResults, hasMore, loadingMore, loadMore]);

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
                총 {totalCount.toLocaleString()}권 중 {books.length}권 표시
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
                {books.map((book, index) => (
                  <MotionCard
                    key={`${book.isbn13 || book.isbn}-${index}`}
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

                {/* 🆕 무한스크롤 로딩 인디케이터 */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-6">
                    {loadingMore ? (
                      <div className="flex items-center gap-2 text-purple-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">더 불러오는 중...</span>
                      </div>
                    ) : (
                      <button
                        onClick={loadMore}
                        className="px-6 py-2 bg-purple-100 text-purple-600 rounded-xl text-sm font-bold hover:bg-purple-200 transition-colors"
                      >
                        더 보기
                      </button>
                    )}
                  </div>
                )}

                {/* 🆕 검색 결과 종료 안내 */}
                {!hasMore && books.length > 0 && (
                  <div className="text-center py-4 space-y-1">
                    <p className="text-sm text-gray-400">
                      {books.length >= 100 
                        ? '최대 100권까지 표시됩니다'
                        : '모든 검색 결과를 표시했어요'}
                    </p>
                    {books.length >= 100 && (
                      <p className="text-xs text-gray-400">
                        더 많은 결과는 검색어를 구체화해주세요
                      </p>
                    )}
                  </div>
                )}
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
