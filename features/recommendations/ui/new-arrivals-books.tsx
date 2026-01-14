'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Book } from '@/entities/book/model/types';
import { libraryApiClient } from '@/entities/book/api/library-api.client';
import { useRegionStore } from '@/features/region-selector/lib/use-region-store';
import { Skeleton } from '@/shared/ui/skeleton';
import { BookCarousel } from '@/shared/ui/book-carousel';
import { Sparkles, BookOpen, Clock } from 'lucide-react';

interface NewArrivalsBooksProps {
  onBookSelect: (book: Book) => void;
  filterKids?: boolean;
}

export function NewArrivalsBooks({ onBookSelect, filterKids = false }: NewArrivalsBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [libraryName, setLibraryName] = useState<string>('');
  const { selectedRegion, selectedSubRegion } = useRegionStore();

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const params: any = { pageSize: 1 };
        
        // 지역 설정
        if (selectedSubRegion?.code) {
          params.dtl_region = selectedSubRegion.code;
        } else if (selectedRegion?.code) {
          params.region = selectedRegion.code;
        }

        const response = await libraryApiClient.getExtendedLibraryInfo(params);
        const libs = response?.response?.libs || [];
        
        if (libs.length > 0) {
          const lib = libs[0].lib;
          setLibraryName(lib.libInfo?.libName || '도서관');
          
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
          
          // 우리 아이 탭: 아동용 필터링
          if (filterKids) {
            newBooks = newBooks.filter(book => 
              book.additionSymbol?.startsWith('7')
            );
          }
          
          // 중복 제거 (ISBN 기준)
          const seen = new Set();
          newBooks = newBooks.filter(book => {
            const key = book.isbn13 || book.isbn;
            if (key && seen.has(key)) return false;
            if (key) seen.add(key);
            return true;
          });
          
          setBooks(newBooks.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to load new arrivals:', error);
      }
      setLoading(false);
    };
    loadBooks();
  }, [selectedRegion, selectedSubRegion, filterKids]);

  if (loading) {
    return (
      <div className="mx-4 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-28 h-40 rounded-xl shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <section className="mx-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-800">
              {filterKids ? '새로 들어온 아이책' : '신착도서'}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium line-clamp-1">
              {libraryName}의 최신 도서
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          NEW
        </div>
      </div>
      
      <BookCarousel className="pt-3">
        {books.map((book, idx) => (
          <motion.div
            key={`${book.isbn}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => onBookSelect(book)}
            className="relative shrink-0 cursor-pointer group"
          >
            {/* NEW 배지 (첫 3권만) */}
            {idx < 3 && (
              <div className="absolute -top-1.5 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10 shadow">
                NEW
              </div>
            )}
            
            {/* 책 이미지 */}
            <div className="w-28 h-40 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 border border-emerald-100">
              {book.bookImageURL ? (
                <Image
                  src={book.bookImageURL}
                  alt={book.title}
                  width={112}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-emerald-300" />
                </div>
              )}
            </div>
            
            {/* 제목 */}
            <p className="mt-2 text-[11px] font-bold text-gray-700 line-clamp-2 w-28">
              {book.title}
            </p>
          </motion.div>
        ))}
      </BookCarousel>
    </section>
  );
}
