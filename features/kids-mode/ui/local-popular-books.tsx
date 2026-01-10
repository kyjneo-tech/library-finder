"use client";

import { useEffect, useState } from "react";
import { BookOpen, TrendingUp } from "lucide-react";
import { useRegionStore } from "@/features/region-selector/lib/use-region-store";
import { useRecommendationsStore } from "@/features/kids-mode/lib/use-recommendations-store"; // ✅ Store import
import { Book } from "@/entities/book/model/types";
// import { bookRepository } from "@/entities/book/repository/book.repository.impl"; // Store 내부로 이동됨

interface LocalPopularBooksProps {
  onBookSelect: (book: Book) => void;
}

export function LocalPopularBooks({ onBookSelect }: LocalPopularBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const { getRegionCode, getDisplayName, selectedRegion, selectedSubRegion, selectedDistrict } = useRegionStore();
  const { fetchLocalKidsPopularBooks } = useRecommendationsStore(); // ✅ 키즈 전용 메서드 사용

  const fetchLocalPopular = async () => {
    setLoading(true);
    try {
      const regionCode = getRegionCode();
      // 🛡️ 아동 전용 필터가 적용된 데이터를 가져옴
      const result = await fetchLocalKidsPopularBooks(regionCode || undefined);

      setBooks(result.slice(0, 10));
    } catch (error) {
      console.error("[LocalPopularBooks] Failed to fetch:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalPopular();
  }, [selectedRegion?.code, selectedSubRegion?.code, selectedDistrict?.code]);

  if (loading) {
    return (
      <section className="mx-4 mt-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          🏆 우리 동네 인기 어린이 도서
          <span className="text-sm font-normal text-gray-500">
            (최근 30일)
          </span>
        </h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  // ❌ 데이터 없을 때도 표시 (디버깅 + UX 개선)
  // if (books.length === 0) {
  //   return null;
  // }

  return (
    <section className="mx-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          🏆 우리 동네 인기 어린이 도서
        </h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        {isFallback 
          ? "우리 동네 데이터가 부족해 전국 인기 도서를 보여드려요" 
          : `${getDisplayName() || "우리 동네"}에서 아이들이 가장 많이 빌려간 책이에요`
        }
      </p>

      {books.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            📭 데이터를 불러오지 못했어요
          </p>
          <button 
            onClick={fetchLocalPopular}
            className="text-xs text-blue-500 underline hover:text-blue-700"
          >
            다시 시도하기
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {books.map((book, idx) => (
          <button
            key={book.isbn}
            onClick={() => onBookSelect(book)}
            className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
          >
            {/* 순위 배지 */}
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0
              ${idx === 0 ? 'bg-yellow-500 text-white' :
                idx === 1 ? 'bg-gray-400 text-white' :
                idx === 2 ? 'bg-orange-600 text-white' :
                'bg-gray-100 text-gray-600'}
            `}>
              {idx + 1}
            </div>

            {/* 책 표지 */}
            {book.bookImageURL ? (
              <img
                src={book.bookImageURL}
                alt={book.title}
                className="w-14 h-20 object-cover rounded shadow-sm group-hover:shadow-md transition-shadow shrink-0"
              />
            ) : (
              <div className="w-14 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
            )}

            {/* 책 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                {book.author}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {book.publisher} {book.publishYear && `| ${book.publishYear}년`}
              </p>
              {book.loanCnt && book.loanCnt > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] text-orange-600 font-bold">
                    우리 동네 {book.loanCnt}회 대출됨
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
        </div>
      )}

      {books.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700">
            💡 우리 동네에서 검증된 인기 도서예요. 아이가 좋아할 확률이 높아요!
          </p>
        </div>
      )}
    </section>
  );
}
