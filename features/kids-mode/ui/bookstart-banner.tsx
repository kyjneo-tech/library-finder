'use client';

import { ExternalLink, Gift } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface BookstartBannerProps {
  className?: string;
}

export function BookstartBanner({ className }: BookstartBannerProps) {
  return (
    <div
      className={cn(
        'mt-3 p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-1',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 bg-white rounded-xl shadow-sm">
          <Gift className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-[10px] font-bold text-white uppercase tracking-wider">
              무료 혜택
            </span>
            <span className="text-xs font-bold text-indigo-900">북스타트 안내</span>
          </div>
          <p className="text-[12px] leading-relaxed text-indigo-800">
            아이들에게 <span className="font-bold text-indigo-600 underline underline-offset-2">무료 그림책 꾸러미</span>를 제공하는 독서 지원 프로그램입니다. 거주 지역 도서관을 통해 지원 여부를 확인하실 수 있습니다.
          </p>
          <a
            href="https://www.bookstart.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <span>북스타트 공식 홈페이지</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}