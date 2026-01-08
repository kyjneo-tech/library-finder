"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useAgeFilter } from "@/features/kids-mode/lib/use-age-filter";
import { useRecommendationsStore } from "@/features/kids-mode/lib/use-recommendations-store"; // ✅ Store import
import { Book } from "@/entities/book/model/types";

interface KidsRecommendationsProps {
  onBookSelect: (book: Book) => void;
}

export function KidsRecommendations({ onBookSelect }: KidsRecommendationsProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const { selectedAge } = useAgeFilter();
  const { fetchAgeRecommendations } = useRecommendationsStore(); // ✅ Store hook 사용

  const getAgeLabel = () => {
    switch (selectedAge) {
      case '0-2': return "0~2세";
      case '3-5': return "3~5세";
      case '6-7': return "6~7세";
      case '8-10': return "초등 저학년";
      default: return "";
    }
  };

  const getTitle = () => {
    if (selectedAge === 'all') {
      return "🧸 요즘 아이들이 좋아하는 책";
    }
    return `🧸 ${getAgeLabel()} 친구들이 좋아하는 책`;
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchAgeRecommendations(selectedAge);
      setBooks(data.slice(0, 6));
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [selectedAge]); // selectedAge 변경 시 store를 통해 데이터 로드 (캐시 있으면 API 호출 안 함)

  if (loading) {
    return (
      <section className="mx-4 mt-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          {getTitle()}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-4 mt-6">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        {getTitle()}
      </h2>

      {books.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 mb-2">추천 도서를 불러오지 못했어요</p>
          <button 
            onClick={loadBooks}
            className="text-xs text-blue-500 underline"
          >
            다시 시도하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {books.map((book, idx) => (
            <button
              key={book.isbn}
              onClick={() => onBookSelect(book)}
              className="relative group"
            >
              {/* 인기 순위 배지 */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-md">
                {idx + 1}
              </div>

              {book.bookImageURL ? (
                <img
                  src={book.bookImageURL}
                  alt={book.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg shadow group-hover:shadow-lg transition-shadow"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-yellow-300" />
                </div>
              )}

              <p className="text-xs mt-1 line-clamp-2 text-left text-gray-700">
                {book.title}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
