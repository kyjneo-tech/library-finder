"use client";

interface KidsCategoriesProps {
  onCategorySearch: (keyword: string, kdc?: string) => void;
}

interface Category {
  label: string;
  icon: string;
  keyword: string;
  kdc?: string; // KDC 분류코드 (선택적)
  description?: string; // 카테고리 설명
}

const KIDS_CATEGORIES: Category[] = [
  {
    label: "그림책/동화",
    icon: "🎨",
    keyword: "그림책", // ✅ 단순화
    kdc: "8", // 문학
    description: "재미있는 이야기책"
  },
  {
    label: "과학",
    icon: "🔬",
    keyword: "어린이 과학책", // ✅ 단순화
    kdc: "4", // 자연과학
    description: "신기한 과학 세계"
  },
  {
    label: "역사/위인전",
    icon: "🦸",
    keyword: "위인전", // ✅ 단순화
    kdc: "9", // 역사
    description: "멋진 사람들 이야기"
  },
  {
    label: "예술",
    icon: "🎭",
    keyword: "미술 그림책", // ✅ 단순화
    kdc: "6", // 예술
    description: "그림과 음악"
  },
  {
    label: "영어",
    icon: "🅰️",
    keyword: "영어책", // ✅ 단순화
    kdc: "74", // 영어
    description: "재미있는 영어책"
  },
  {
    label: "수학/퍼즐",
    icon: "🧮",
    keyword: "수학 그림책", // ✅ 단순화
    kdc: "41", // 수학
    description: "숫자 놀이"
  },
  {
    label: "동물/식물",
    icon: "🐾",
    keyword: "동물 그림책", // ✅ 단순화
    kdc: "47", // 생물과학
    description: "자연과 친구들"
  },
  {
    label: "전래동화",
    icon: "📖",
    keyword: "전래동화", // ✅ 단순화
    kdc: "81", // 한국문학
    description: "우리 옛이야기"
  },
  {
    label: "학습만화",
    icon: "📚",
    keyword: "어린이 만화", // ✅ 단순화
    description: "만화로 배우기"
  },
];

export function KidsCategories({ onCategorySearch }: KidsCategoriesProps) {
  return (
    <section className="mx-4 mt-6 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">주제별로 찾기</h3>
        <span className="text-xs text-gray-500">{KIDS_CATEGORIES.length}개 주제</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KIDS_CATEGORIES.map((cat) => (
          <button
            key={cat.keyword}
            onClick={() => onCategorySearch(cat.keyword, cat.kdc)}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all hover:shadow-sm group"
            title={cat.description}
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <div className="text-xs font-medium text-gray-700 leading-tight">
              {cat.label}
            </div>
            {cat.description && (
              <div className="text-[10px] text-gray-400 mt-0.5">
                {cat.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
