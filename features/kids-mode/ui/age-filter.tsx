"use client";

import { useAgeFilter, type AgeGroup } from "@/features/kids-mode/lib/use-age-filter";
import { cn } from "@/shared/lib/cn";

interface AgeGroupConfig {
  label: string;
  value: AgeGroup;
  icon: string;
  guide?: string; // 발달 단계 가이드
  recommended?: string; // 추천 도서 유형
}

const AGE_GROUPS: AgeGroupConfig[] = [
  {
    label: "전체",
    value: "all",
    icon: "📚",
    guide: "모든 연령",
    recommended: "전 연령 인기 도서"
  },
  {
    label: "0-2세",
    value: "0-2",
    icon: "👶",
    guide: "첫 그림책, 감각 발달",
    recommended: "촉각책, 소리나는 책, 단순한 그림"
  },
  {
    label: "3-5세",
    value: "3-5",
    icon: "🧒",
    guide: "상상력, 일상생활 배우기",
    recommended: "전래동화, 생활 습관, 감정 표현"
  },
  {
    label: "6-7세",
    value: "6-7",
    icon: "👦",
    guide: "학교 준비, 한글 익히기",
    recommended: "글자 익히기, 친구 사귀기, 학교생활"
  },
  {
    label: "초등",
    value: "8-10",
    icon: "👧",
    guide: "독서 습관, 교과 연계",
    recommended: "위인전, 과학, 역사, 창작동화"
  },
];

export function AgeFilter() {
  const { selectedAge, setSelectedAge } = useAgeFilter();

  const selectedAgeGroup = AGE_GROUPS.find(age => age.value === selectedAge);

  return (
    <div className="mt-3">
      {/* 연령 버튼 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {AGE_GROUPS.map((age) => (
          <button
            key={age.value}
            onClick={() => setSelectedAge(age.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 transition-all shrink-0",
              selectedAge === age.value
                ? "bg-pink-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            title={age.guide}
          >
            <span>{age.icon}</span>
            <span>{age.label}</span>
          </button>
        ))}
      </div>

      {/* 선택된 연령 가이드 */}
      {selectedAgeGroup && selectedAgeGroup.value !== 'all' && (
        <div className="mt-2 p-2 bg-pink-50 rounded-lg border border-pink-100">
          <p className="text-xs text-pink-700 font-medium">
            📌 {selectedAgeGroup.guide}
          </p>
          <p className="text-xs text-pink-600 mt-1">
            추천: {selectedAgeGroup.recommended}
          </p>
        </div>
      )}
    </div>
  );
}
