'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Hash } from 'lucide-react';
import { bookRepository } from '@/entities/book/repository/book.repository.impl';

interface MonthlyTrendsProps {
  onKeywordSearch: (keyword: string, kdc?: string) => void;
}

export function MonthlyTrends({ onKeywordSearch }: MonthlyTrendsProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchKeywords = async () => {
      setLoading(true);
      try {
        const kw = await bookRepository.getMonthlyKeywords();
        // 아동 관련 키워드만 필터링 (선택적)
        const filtered = kw.filter((word) => {
          // 문자열 체크
          if (!word || typeof word !== 'string') return false;

          const lower = word.toLowerCase();
          // 성인 관련 키워드 제외
          return (
            !lower.includes('경제') &&
            !lower.includes('투자') &&
            !lower.includes('경영') &&
            !lower.includes('자기계발')
          );
        });
        setKeywords(filtered.slice(0, 12)); // 12개만 표시
      } catch (error) {
        console.error('Failed to fetch monthly keywords:', error);
        setKeywords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  if (loading) {
    return (
      <section className="mx-4 mt-6">
        <h3 className="font-semibold mb-3">🔥 이번 달 인기 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (keywords.length === 0) {
    return null;
  }

  return (
    <section className="mx-4 mt-6 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-gray-800">이번 달 인기 키워드</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">요즘 부모들이 많이 찾는 주제예요</p>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, idx) => (
          <button
            key={idx}
            onClick={() => onKeywordSearch(keyword)}
            className="group px-3 py-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 text-orange-700 rounded-full text-sm font-medium hover:from-orange-100 hover:to-yellow-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>{keyword}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <p className="text-xs text-orange-700">
          💡 키워드를 클릭하면 관련 도서를 바로 검색할 수 있어요
        </p>
      </div>
    </section>
  );
}
