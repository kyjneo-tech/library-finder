'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Image from 'next/image';
import { Book } from '@/entities/book/model/types';
import { libraryApiClient } from '@/entities/book/api/library-api.client';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';
import { useSearchMode } from '@/features/search-mode/lib/use-search-mode';
import { isExcludedBook } from '@/entities/book/lib/book-filter';
import { BookCarousel } from '@/shared/ui/book-carousel';
import { Button } from '@/shared/ui/button';
import { useMapStore } from '@/features/library-map/lib/use-map-store';

interface NewArrivalsModalProps {
  onBookSelect: (book: Book) => void;
  onShowAll: () => void;
}

export function NewArrivalsModal({ onBookSelect, onShowAll }: NewArrivalsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [libraryName, setLibraryName] = useState('');
  const [dontShowToday, setDontShowToday] = useState(false);

  const { selectedRegion, selectedSubRegion } = useRegionStore();
  const { mode } = useSearchMode(); // 'kids' or 'general'
  const { selectedLibrary } = useMapStore();

  useEffect(() => {
    // 1. "오늘 하루 보지 않기" 체크
    const lastClosedDate = localStorage.getItem('NEW_ARRIVALS_CLOSED_DATE');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastClosedDate === today) {
      return; // 오늘 이미 닫았으면 띄우지 않음
    }

    // 2. 신착 도서 로딩
    const loadNewArrivals = async () => {
      try {
        const params: any = { pageSize: 20 };
        
        // 지역/도서관 설정 (우선순위: 선택된 도서관 > 세부 지역 > 지역)
        if (selectedLibrary?.libCode) {
          params.libCode = selectedLibrary.libCode;
        } else if (selectedSubRegion?.code) {
          params.dtl_region = selectedSubRegion.code;
        } else if (selectedRegion?.code) {
          params.region = selectedRegion.code;
        } else {
            return; // 지역 선택 안되어 있으면 스킵
        }

        const response = await libraryApiClient.getExtendedLibraryInfo(params);
        const libs = response?.response?.libs || [];

        if (libs.length > 0) {
          const lib = libs[0].lib;
          setLibraryName(lib.libInfo?.libName || '우리 동네 도서관');

          let newBooks: Book[] = (lib.newBooks || []).map((item: any) => ({
            isbn: item.book?.isbn13 || item.book?.isbn,
            isbn13: item.book?.isbn13,
            title: item.book?.bookname,
            author: item.book?.authors,
            publisher: item.book?.publisher,
            publishYear: item.book?.publication_year,
            bookImageURL: item.book?.bookImageURL,
            additionSymbol: item.book?.addition_symbol,
            classNo: item.book?.class_no,
            className: item.book?.class_nm,
          }));

          // 🚨 필터링 로직 적용
          if (mode === 'kids') {
            // 키즈 모드: 아동서(7) + 유해 키워드 제외
            newBooks = newBooks.filter(book => 
              book.additionSymbol?.startsWith('7') && !isExcludedBook(book.title)
            );
          } else {
            // 일반 모드: 필터 없음 (또는 필요시 성인 도서 위주로 필터링 가능)
             // 중복 제거 (ISBN 기준) - 항상 적용
            const seen = new Set();
            newBooks = newBooks.filter(book => {
              const key = book.isbn13 || book.isbn;
              if (key && seen.has(key)) return false;
              if (key) seen.add(key);
              return true;
            });
          }

          if (newBooks.length > 0) {
            setBooks(newBooks.slice(0, 10)); // 10권만 표시
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error('Failed to load popup books:', error);
      }
    };

    loadNewArrivals();
  }, [selectedRegion, selectedSubRegion, selectedLibrary, mode]);

  const handleClose = (hideToday: boolean) => {
    setIsOpen(false);
    if (hideToday) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('NEW_ARRIVALS_CLOSED_DATE', today);
    }
  };

  const currentTheme = mode === 'kids' ? {
    bg: 'from-orange-400 to-rose-500',
    title: '새로 들어온 친구들이에요! 📚',
    button: 'bg-white text-orange-600 hover:bg-orange-50'
  } : {
    bg: 'from-blue-600 to-indigo-700',
    title: '이번 주 신착 도서 ✨',
    button: 'bg-white/10 text-white hover:bg-white/20'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${currentTheme.bg} p-6 pb-12 relative overflow-hidden`}>
              <button 
                onClick={() => handleClose(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold mb-2 border border-white/20">
                  {libraryName}
                </span>
                <h2 className="text-xl font-black text-white leading-tight">
                  {currentTheme.title}
                </h2>
              </motion.div>
            </div>

            {/* Books (Overlapping Header) */}
            <div className="-mt-8 px-4 relative z-10 pb-6">
                <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
                    <BookCarousel className="py-2">
                        {books.map((book, idx) => (
                        <div 
                            key={`${book.isbn13 || book.isbn || 'book'}-${idx}`} 
                            className="w-24 shrink-0 cursor-pointer snap-start"
                            onClick={() => {
                                onBookSelect(book);
                                handleClose(false); 
                            }}
                        >
                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-md mb-2">
                             {book.bookImageURL ? (
                                <Image
                                    src={book.bookImageURL}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                />
                             ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">이미지 없음</div>
                             )}
                            </div>
                            <p className="text-xs font-bold text-gray-800 line-clamp-1">{book.title}</p>
                        </div>
                        ))}
                    </BookCarousel>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <Button 
                        onClick={() => {
                          onShowAll();
                          handleClose(false);
                        }}
                        className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold text-base"
                    >
                        전체 보기 
                    </Button>
                    
                    <button
                        onClick={() => handleClose(true)}
                        className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors py-2"
                    >
                        <Check className={`w-3.5 h-3.5 ${dontShowToday ? 'text-blue-500' : 'text-gray-400'}`} />
                        오늘 하루 보지 않기
                    </button>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
