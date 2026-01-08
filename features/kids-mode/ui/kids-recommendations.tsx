"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useAgeFilter } from "@/features/kids-mode/lib/use-age-filter";
import { useRecommendationsStore } from "@/features/kids-mode/lib/use-recommendations-store"; // ✅ Store import
import { Book } from "@/entities/book/model/types";
import { cn } from "@/shared/lib/cn";

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
      <section className="mx-4 mt-8">
        <h2 className="text-xl font-black mb-5 flex items-center gap-2 px-1">
          <span className="text-2xl">✨</span>
          {getTitle()}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm" />
              <div className="h-3 bg-gray-100 rounded-full w-3/4 mx-auto animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-4 mt-8">
      <h2 className="text-xl font-black mb-5 flex items-center gap-2 px-1">
        <span className="text-2xl">🧸</span>
        {getTitle()}
      </h2>

      {books.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 shadow-inner">
          <p className="text-sm text-gray-400 font-bold mb-3">아직 추천 도서를 찾지 못했어요</p>
          <button 
            onClick={loadBooks}
            className="px-6 py-2 bg-orange-100 text-orange-600 rounded-xl text-xs font-black hover:bg-orange-200 transition-colors"
          >
            다시 불러오기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {books.map((book, idx) => (
            <button
              key={book.isbn}
              onClick={() => onBookSelect(book)}
              className="relative group text-center"
            >
              {/* 인기 순위 배지 */}
              <div className={cn(
                "absolute -top-2 -left-2 w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black z-10 shadow-lg border-2 border-white transition-transform group-hover:scale-110 group-hover:-rotate-12",
                idx === 0 ? "bg-amber-400 text-white" : 
                idx === 1 ? "bg-slate-300 text-white" :
                idx === 2 ? "bg-orange-400 text-white" : "bg-white text-gray-400"
              )}>
                {idx + 1}
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                {book.bookImageURL ? (
                  <img
                    src={book.bookImageURL}
                    alt={book.title}
                    className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-orange-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>

              <p className="text-[11px] mt-2.5 font-bold text-gray-700 line-clamp-1 px-1 group-hover:text-orange-500 transition-colors">
                {book.title}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
