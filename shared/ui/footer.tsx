import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-100 py-10 mt-auto">
      <div className="max-w-2xl mx-auto px-6 flex flex-col items-center text-center gap-6">
        
        {/* 오류 제보 섹션 */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm w-full max-w-md">
          <p className="text-xs font-bold text-gray-500 mb-1">이용 중 오류가 있나요?</p>
          <a 
            href="mailto:kyjneo1@naver.com" 
            className="flex items-center justify-center gap-2 text-sm font-black text-gray-800 hover:text-purple-600 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>kyjneo1@naver.com</span>
          </a>
          <p className="text-[10px] text-gray-400 mt-1">
            서비스 이용 중 오류가 발생하거나 데이터가 조회되지 않는 경우<br/>
            위 이메일로 알려주시면 빠르게 조치하겠습니다.
          </p>
        </div>

        {/* 링크 및 저작권 */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 text-xs font-medium text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 underline underline-offset-2">
              개인정보처리방침
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="hover:text-gray-900">
              서비스 소개
            </Link>
          </div>
          <p className="text-[10px] text-gray-400">
            © {new Date().getFullYear()} 우리 가족 도서관. All rights reserved.<br/>
            이 사이트는 국립중앙도서관 정보나루 API를 활용하여 제작되었습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
