'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인 오류</h1>
        <p className="text-gray-600 mb-6">
          로그인 중 문제가 발생했습니다.<br />
          잠시 후 다시 시도해 주세요.
        </p>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-lg text-red-600 text-xs font-mono mb-6 text-left overflow-auto max-h-32">
            Details: {error}
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/login" 
            className="block w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            로그인 화면으로 돌아가기
          </Link>
          <Link 
            href="/" 
            className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
