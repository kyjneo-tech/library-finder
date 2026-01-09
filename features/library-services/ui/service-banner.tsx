/**
 * 책이음/책바다 서비스 안내 배너 컴포넌트
 * 전국 도서관 통합 서비스에 대한 안내를 제공합니다.
 */

"use client";

export function ServiceBanner() {
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl border border-amber-100/50">
      <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2">
        <span>🏛️</span> 전국 도서관 통합 서비스
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        다른 지역 도서관 책도 빌릴 수 있어요! 가입 후 이용하세요.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <a
          href="https://books.nl.go.kr/PU/contents/P20201000000.do"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-xl border border-amber-200 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">💳</div>
          <p className="font-bold text-sm text-gray-800 group-hover:text-amber-600">
            책이음
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            하나의 회원증으로 전국 2,804개 도서관
          </p>
        </a>
        <a
          href="https://books.nl.go.kr/PU/contents/P10202000000.do"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-xl border border-emerald-200 hover:shadow-md transition-all group"
        >
          <div className="text-2xl mb-2">🌊</div>
          <p className="font-bold text-sm text-gray-800 group-hover:text-emerald-600">
            책바다
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            타 지역 책 택배 배송 (왕복 5,800원)
          </p>
        </a>
      </div>
    </div>
  );
}
