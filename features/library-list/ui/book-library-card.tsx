/**
 * 책 소장 도서관 카드 컴포넌트
 * 책의 대출 가능 여부와 도서관 정보를 표시합니다.
 */

'use client';

import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { checkLibraryServices } from '@/shared/lib/utils/library-services';

export interface BookLibraryCardProps {
  libCode: string;
  libName: string;
  address?: string;
  homepage?: string;
  loanAvailable?: boolean;
}

export function BookLibraryCard({
  libCode,
  libName,
  address,
  homepage,
  loanAvailable = false,
}: BookLibraryCardProps) {
  const services = checkLibraryServices(libName);

  return (
    <div
      key={libCode}
      className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-900 text-lg mb-1 group-hover:text-purple-600 transition-colors">
            {libName}
          </h3>
          {address && (
            <div className="flex items-center gap-1 text-gray-400 mb-3">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <p className="text-xs truncate font-bold">{address}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
          </div>
        </div>
        <div
          className={cn(
            'flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl text-[11px] font-black shrink-0 border-2 shadow-sm transition-all',
            loanAvailable
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-red-50 text-red-600 border-red-100'
          )}
        >
          {loanAvailable ? (
            <>
              <CheckCircle2 className="w-6 h-6 mb-0.5" />
              <span>대출가능!</span>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 mb-0.5" />
              <span>대출중</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
