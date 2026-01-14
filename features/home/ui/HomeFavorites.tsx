'use client';

import { motion } from 'framer-motion';
import { Heart, Library as LibraryIcon, BookOpen, X } from 'lucide-react';
import { useFavoritesStore } from '@/features/favorites/lib/use-favorites-store';
import { useMapStore } from '@/features/library-map/lib/use-map-store';
import { Book } from '@/entities/book/model/types';
import { Library } from '@/entities/library/model/types';

interface HomeFavoritesProps {
  handleBookSelect: (book: Book) => void;
  selectedBook: Book | null;
  showSearchResults: boolean;
}

export function HomeFavorites({ handleBookSelect, selectedBook, showSearchResults }: HomeFavoritesProps) {
  const { favoriteLibraries, favoriteBooks, removeLibrary, removeBook } = useFavoritesStore();
  const { setSelectedLibrary } = useMapStore();

  if (
    (favoriteLibraries.length === 0 && favoriteBooks.length === 0) ||
    selectedBook ||
    showSearchResults
  ) {
    return null;
  }

  return (
    <motion.section
      className="mx-4 mt-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <span>나의 찜 목록</span>
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1 min-h-[140px]">
        {/* 찜한 도서관 */}
        {favoriteLibraries.map((lib) => (
          <motion.div
            key={lib.libCode}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="relative flex-shrink-0"
          >
            <motion.button
              onClick={() => {
                setSelectedLibrary(lib as Library);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="w-40 p-4 bg-white rounded-2xl border border-purple-100 shadow-sm text-left hover:border-purple-300 transition-all h-full"
              whileHover={{ y: -4 }}
            >
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-2">
                <LibraryIcon className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-black text-gray-900 line-clamp-2 leading-tight pr-6">
                {lib.libName}
              </p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">도서관 바로가기</p>
            </motion.button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeLibrary(lib.libCode);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="찜 해제"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}

        {/* 찜한 책 */}
        {favoriteBooks.map((book) => (
          <motion.div
            key={book.isbn13 || book.isbn}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="relative flex-shrink-0"
          >
            <motion.button
              onClick={() => handleBookSelect(book)}
              className="w-40 p-4 bg-white rounded-2xl border border-orange-100 shadow-sm text-left hover:border-orange-300 transition-all h-full"
              whileHover={{ y: -4 }}
            >
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs font-black text-gray-900 line-clamp-2 leading-tight pr-6">
                {book.title}
              </p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">{book.author}</p>
            </motion.button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeBook(book.isbn13 || book.isbn);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="찜 해제"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
