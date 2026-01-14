import Link from 'next/link';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-100 py-10 mt-auto">
      <div className="max-w-2xl mx-auto px-6 flex flex-col items-center text-center gap-6">

        {/* 링크 및 저작권 */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
            <Link href="/about" className="hover:text-gray-900 underline underline-offset-2">
              서비스 소개
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/guide" className="hover:text-gray-900 underline underline-offset-2">
              이용 가이드
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="hover:text-gray-900 underline underline-offset-2">
              이용약관
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy" className="hover:text-gray-900 underline underline-offset-2">
              개인정보처리방침
            </Link>
          </div>
          <p className="text-[10px] text-gray-400">
            © {new Date().getFullYear()} 우리 가족 도서관. All rights reserved.
            <br />이 사이트는 국립중앙도서관 정보나루 API를 활용하여 제작되었습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
