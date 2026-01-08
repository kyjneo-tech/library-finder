"use client";

import { cn } from "@/shared/lib/cn";

interface FamilyCategoriesProps {
  onCategorySearch: (keyword: string, kdc?: string) => void;
}

interface Category {
  label: string;
  icon: string;
  keyword: string;
  kdc?: string;
  description?: string;
  color: string;
}

const FAMILY_CATEGORIES: Category[] = [
  {
    label: "경제경영",
    icon: "📈",
    keyword: "경제경영",
    kdc: "32",
    description: "트렌드와 재테크",
    color: "bg-blue-50 text-blue-700 border-blue-100"
  },
  {
    label: "자기계발",
    icon: "🏃",
    keyword: "자기계발",
    kdc: "19",
    description: "성장하는 삶",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100"
  },
  {
    label: "소설/시",
    icon: "🖋️",
    keyword: "소설",
    kdc: "81",
    description: "깊이 있는 문학",
    color: "bg-purple-50 text-purple-700 border-purple-100"
  },
  {
    label: "인문학",
    icon: "🏛️",
    keyword: "인문학",
    kdc: "1",
    description: "삶의 지혜",
    color: "bg-amber-50 text-amber-700 border-amber-100"
  },
  {
    label: "건강/취미",
    icon: "🧘",
    keyword: "취미",
    kdc: "59",
    description: "즐거운 일상",
    color: "bg-teal-50 text-teal-700 border-teal-100"
  },
  {
    label: "역사/문화",
    icon: "🗺️",
    keyword: "역사",
    kdc: "9",
    description: "지식의 지평",
    color: "bg-orange-50 text-orange-700 border-orange-100"
  }
];

export function FamilyCategories({ onCategorySearch }: FamilyCategoriesProps) {
  return (
    <section className="mx-4 mt-10 mb-12">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
           <span className="text-xl">👨‍👩‍👧‍👦</span>
           가족 모두를 위한 주제
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FAMILY_CATEGORIES.map((cat) => (
          <button
            key={cat.keyword}
            onClick={() => onCategorySearch(cat.keyword, cat.kdc)}
            className={cn(
              "p-5 rounded-[2rem] border-2 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col items-start text-left group",
              cat.color
            )}
          >
            <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">
              {cat.icon}
            </div>
            <div>
              <div className="text-sm font-black mb-1">
                {cat.label}
              </div>
              <div className="text-[10px] opacity-70 font-bold">
                {cat.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
