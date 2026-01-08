"use client";

import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRecommendationsStore } from "@/features/kids-mode/lib/use-recommendations-store";
import { useRegionStore } from "@/features/region-selector/lib/use-region-store";
import { Book } from "@/entities/book/model/types";
import { cn } from "@/shared/lib/cn";

interface FamilyPopularBooksProps {
  onBookSelect: (book: Book) => void;
}

export function FamilyPopularBooks({ onBookSelect }: FamilyPopularBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchFamilyPopularBooks } = useRecommendationsStore();
  const { selectedRegion, selectedSubRegion } = useRegionStore();

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      // 세부 지역 코드가 있으면 그것을 사용, 없으면 광역 코드를 사용
      const regionCode = selectedSubRegion?.code || selectedRegion?.code;
      const data = await fetchFamilyPopularBooks(regionCode);
      setBooks(data);
      setLoading(false);
    };
    loadBooks();
  }, [selectedRegion, selectedSubRegion, fetchFamilyPopularBooks]);

  if (loading) {
    return (
      <div className="space-y-4 mx-4 mt-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  if (books.length === 0) return null;

  // 표시할 지역 이름 (세부 지역이 있으면 세부 지역명 우선)
  const regionName = selectedSubRegion?.name || selectedRegion?.name;

  return (
    <section className="mx-4 mt-10 mb-20">
      <div className="flex flex-col mb-5 px-1">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <span className="text-xl">🔥</span>
            {regionName ? `${regionName} 인기 대출 도서` : "가족 인기 대출 도서"}
            </h3>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg uppercase tracking-wider">Verified</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 font-medium">
            {regionName 
                ? `${regionName} 도서관들에서 실제로 가장 활발히 대여되고 있는 책들이에요.` 
                : "전국 도서관 대출 데이터를 기반으로 검증된 도서들이에요."}
        </p>
      </div>

      <div className="space-y-4">
        {books.map((book, idx) => (
          <button
            key={book.isbn}
            onClick={() => onBookSelect(book)}
            className="w-full p-4 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all text-left flex gap-4 group relative"
          >
            {/* 순위 배지 */}
            <div className="flex flex-col items-center justify-center shrink-0 w-8">
              <span className={cn(
                "text-lg font-black",
                idx < 3 ? "text-purple-600" : "text-gray-300"
              )}>
                {idx + 1}
              </span>
              {idx < 3 && <TrendingUp className="w-3 h-3 text-purple-400" />}
            </div>

            {/* 책 이미지 */}
            <div className="relative shrink-0">
               {book.bookImageURL ? (
                 <img
                   src={book.bookImageURL}
                   alt={book.title}
                   className="w-14 h-22 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-all"
                 />
               ) : (
                 <div className="w-14 h-22 bg-gray-50 rounded-xl flex items-center justify-center">
                   <BookOpen className="w-6 h-6 text-gray-300" />
                 </div>
               )}
            </div>

            {/* 도서 정보 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                {book.title}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 font-medium">{book.author}</p>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <CheckCircle2 className="w-3 h-3" />
                    대여 성공 확률 높음
                </div>
                <span className="text-[10px] font-bold text-gray-300">
                  {book.publisher}
                </span>
              </div>
            </div>

            {/* 화살표 */}
            <div className="flex items-center text-gray-300 group-hover:text-purple-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
      
      <button className="w-full mt-6 py-4 bg-gray-50 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-100 transition-colors">
         더 많은 인기 도서 보기
      </button>
    </section>
  );
}
