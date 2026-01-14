'use client';

import { useBookSearch } from '@/features/book-search/lib/use-book-search';
import { SearchBar } from '@/features/book-search/ui/search-bar';
import { BookCard } from '@/features/book-search/ui/book-card';
import { Skeleton } from '@/shared/ui/skeleton';
import { BookOpen } from 'lucide-react';

export default function SearchPage() {
  const { books, totalCount, loading, filters } = useBookSearch();

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="sticky top-0 bg-background z-10 pb-4 border-b mb-6">
        <h1 className="text-2xl font-bold mb-4">책 검색</h1>
        <SearchBar autoSearch={true} />
        {filters.query && (
          <p className="text-sm text-muted-foreground mt-2">
            &quot;{filters.query}&quot; 검색 결과: {totalCount}권
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">
            {filters.query ? '검색 결과가 없습니다' : '검색어를 입력해주세요'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.isbn} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
