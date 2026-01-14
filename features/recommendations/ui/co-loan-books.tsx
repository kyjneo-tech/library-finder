'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Book } from '@/entities/book/model/types';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';
import { getBookCoverImages } from '@/shared/lib/utils/book-cover-fallback';
import { Skeleton } from '@/shared/ui/skeleton';
import { BookCarousel } from '@/shared/ui/book-carousel';
import { Link2, BookOpen } from 'lucide-react';

interface CoLoanBooksProps {
  isbn: string;
  onBookSelect: (book: Book) => void;
}

export function CoLoanBooks({ isbn, onBookSelect }: CoLoanBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      if (!isbn) return;
      
      setLoading(true);
      try {
        const analysis = await bookRepository.getUsageAnalysis(isbn);
        const coLoanBooks = analysis?.coLoanBooks || [];
        
        let mappedBooks: Book[] = coLoanBooks.map((item: any) => ({
          isbn: item.book?.isbn13 || item.book?.isbn,
          isbn13: item.book?.isbn13,
          title: item.book?.bookname,
          author: item.book?.authors,
          publisher: item.book?.publisher,
          publishYear: item.book?.publication_year,
          bookImageURL: item.book?.bookImageURL || '',
        }));
        
        mappedBooks = mappedBooks.slice(0, 10);
        
        // ✅ 표지 Fallback: ISBN 우선, 제목 정제 후 네이버 검색
        const coverImages = await getBookCoverImages(mappedBooks);
        
        const booksWithImages = mappedBooks.map((book, idx) => ({
          ...book,
          bookImageURL: coverImages[idx] || book.bookImageURL,
        }));
        
        setBooks(booksWithImages);
      } catch (error) {
        console.error('Failed to load co-loan books:', error);
      }
      setLoading(false);
    };
    loadBooks();
  }, [isbn]);

  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-20 h-28 rounded-lg shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
          <Link2 className="w-3.5 h-3.5 text-white" />
        </div>
        <h4 className="text-sm font-bold text-gray-700">
          이 책을 빌린 사람들이 함께 읽은 책
        </h4>
      </div>
      
      <BookCarousel>
        {books.map((book, idx) => (
          <motion.div
            key={book.isbn || idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onBookSelect(book)}
            className="shrink-0 cursor-pointer group"
          >
            {/* 책 이미지 */}
            <div className="w-20 h-28 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all group-hover:scale-105 border border-violet-100">
              {book.bookImageURL ? (
                <Image
                  src={book.bookImageURL}
                  alt={book.title}
                  width={80}
                  height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-violet-300" />
                </div>
              )}
            </div>
            
            {/* 제목 */}
            <p className="mt-1.5 text-[10px] font-medium text-gray-600 line-clamp-2 w-20">
              {book.title}
            </p>
          </motion.div>
        ))}
      </BookCarousel>
    </section>
  );
}
