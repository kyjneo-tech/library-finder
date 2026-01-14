'use client';

import { useAgeFilter, type AgeGroup } from '@/features/kids-mode/lib/use-age-filter';
import { cn } from '@/shared/lib/cn';
import { BookstartBanner } from './bookstart-banner';

interface AgeGroupConfig {
  label: string;
  value: AgeGroup;
  icon: string;
  guide?: string; // 발달 단계 가이드
  recommended?: string; // 추천 도서 유형
  color: string;
  lightColor: string;
  textColor: string;
  borderColor: string;
}

const AGE_GROUPS: AgeGroupConfig[] = [
  {
    label: '전체',
    value: 'all',
    icon: '📚',
    guide: '모든 연령',
    recommended: '전 연령 인기 도서',
    color: 'bg-gray-500',
    lightColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
  },
  {
    label: '0-2세',
    value: '0-2',
    icon: '👶',
    guide: '첫 그림책, 감각 발달',
    recommended: '촉각책, 소리나는 책, 단순한 그림',
    color: 'bg-amber-400',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  {
    label: '3-5세',
    value: '3-5',
    icon: '🧒',
    guide: '상상력, 일상생활 배우기',
    recommended: '전래동화, 생활 습관, 감정 표현',
    color: 'bg-orange-400',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  {
    label: '6-7세',
    value: '6-7',
    icon: '👦',
    guide: '학교 준비, 한글 익히기',
    recommended: '글자 익히기, 친구 사귀기, 학교생활',
    color: 'bg-green-400',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  {
    label: '초등',
    value: '8-10',
    icon: '👧',
    guide: '독서 습관, 교과 연계',
    recommended: '위인전, 과학, 역사, 창작동화',
    color: 'bg-sky-400',
    lightColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
  },
];

export function AgeFilter() {
  const { selectedAge, setSelectedAge } = useAgeFilter();

  const selectedAgeGroup = AGE_GROUPS.find((age) => age.value === selectedAge);

  return (
    <div className="mt-4">
      {/* 연령 버튼 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {AGE_GROUPS.map((age) => (
          <button
            key={age.value}
            onClick={() => setSelectedAge(age.value)}
            className={cn(
              'px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 border-2',
              selectedAge === age.value
                ? `${age.color} text-white border-transparent shadow-lg scale-105`
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
            )}
            title={age.guide}
          >
            <span className="text-base">{age.icon}</span>
            <span>{age.label}</span>
          </button>
        ))}
      </div>

      {/* 선택된 연령 가이드 */}
      {selectedAgeGroup && selectedAgeGroup.value !== 'all' && (
        <div
          className={cn(
            'mt-3 p-3 rounded-2xl border-2 transition-all animate-in fade-in slide-in-from-top-1',
            selectedAgeGroup.lightColor,
            selectedAgeGroup.borderColor
          )}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className={cn('text-xs font-bold', selectedAgeGroup.textColor)}>
                {selectedAgeGroup.guide}
              </p>
              <p className={cn('text-[11px] mt-0.5 opacity-80', selectedAgeGroup.textColor)}>
                추천: {selectedAgeGroup.recommended}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 북스타트 안내 배너 (0-2세, 3-5세 대상) */}
      {(selectedAge === '0-2' || selectedAge === '3-5') && <BookstartBanner />}
    </div>
  );
}
