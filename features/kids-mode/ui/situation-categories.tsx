"use client";

interface SituationCategoriesProps {
  onCategorySearch: (keyword: string, kdc?: string) => void;
}

interface SituationCategory {
  label: string;
  icon: string;
  keyword: string;
  situation: string;
  description: string;
  ageRecommend?: string; // 추천 연령
}

const SITUATION_CATEGORIES: SituationCategory[] = [
  {
    label: "잠자리 동화",
    icon: "🌙",
    keyword: "잠자리 그림책", // ✅ 단순화
    situation: "sleep",
    description: "편안한 잠자리를 위해",
    ageRecommend: "0-7세"
  },
  {
    label: "동생 생겼을 때",
    icon: "👶",
    keyword: "동생 그림책", // ✅ 단순화
    situation: "sibling",
    description: "질투 극복하기",
    ageRecommend: "3-7세"
  },
  {
    label: "유치원 적응",
    icon: "🏫",
    keyword: "유치원 그림책", // ✅ 단순화
    situation: "school",
    description: "새로운 환경 적응",
    ageRecommend: "3-7세"
  },
  {
    label: "배변 훈련",
    icon: "🚽",
    keyword: "배변 그림책", // ✅ 단순화
    situation: "potty",
    description: "혼자서도 잘해요",
    ageRecommend: "2-5세"
  },
  {
    label: "편식하는 아이",
    icon: "🥕",
    keyword: "음식 그림책", // ✅ 단순화
    situation: "eating",
    description: "골고루 먹기",
    ageRecommend: "2-7세"
  },
  {
    label: "무서움 많을 때",
    icon: "💪",
    keyword: "용기 그림책", // ✅ 단순화
    situation: "courage",
    description: "용기를 키워요",
    ageRecommend: "3-7세"
  },
  {
    label: "인사 예절",
    icon: "🙇",
    keyword: "예절 그림책", // ✅ 단순화
    situation: "manners",
    description: "바른 습관 기르기",
    ageRecommend: "3-7세"
  },
  {
    label: "친구 사귀기",
    icon: "🤝",
    keyword: "친구 그림책", // ✅ 단순화
    situation: "friendship",
    description: "함께하는 즐거움",
    ageRecommend: "4-10세"
  },
  {
    label: "감정 표현",
    icon: "😊",
    keyword: "감정 그림책", // ✅ 단순화
    situation: "emotion",
    description: "마음을 말해요",
    ageRecommend: "3-7세"
  },
];

export function SituationCategories({ onCategorySearch }: SituationCategoriesProps) {
  return (
    <section className="mx-4 mt-6 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">상황별로 찾기</h3>
        <span className="text-xs text-gray-500">{SITUATION_CATEGORIES.length}개 상황</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        우리 아이에게 딱 맞는 순간을 선택해보세요
      </p>

      <div className="grid grid-cols-3 gap-2">
        {SITUATION_CATEGORIES.map((cat) => (
          <button
            key={cat.situation}
            onClick={() => onCategorySearch(cat.keyword)}
            className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
            title={cat.description}
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <div className="text-xs font-medium text-gray-800 leading-tight">
              {cat.label}
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">
              {cat.description}
            </div>
            {cat.ageRecommend && (
              <div className="text-[9px] text-gray-400 mt-1">
                {cat.ageRecommend}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
