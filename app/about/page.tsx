import { ChevronLeft, Library, BookOpen, Heart, Info } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">돌아가기</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">서비스 소개</h1>
        </div>

        <p className="text-gray-600 leading-relaxed mb-10">
          '우리 가족 도서관'은 책을 사랑하는 가족들을 위해 탄생했습니다. <br />
          가까운 동네 도서관에 내가 찾는 책이 있는지, 지금 바로 빌릴 수 있는지 확인하기 위해 여러
          사이트를 전전해야 했던 불편함을 해결하고자 합니다.
        </p>

        <div className="space-y-8">
          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Library className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">실시간 대출 현황 조회</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              전국 공공도서관의 데이터를 실시간으로 연결하여, 도서관에 방문하기 전 대출 가능 여부를
              즉시 확인할 수 있습니다. 책바다, 책이음 참여 도서관 정보도 함께 제공합니다.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-6 h-6 text-pink-600" />
              <h2 className="text-lg font-bold text-gray-900">우리 가족 맞춤 추천</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              영유아부터 성인까지, 연령대별 베스트셀러와 상황별(잠들기 전, 창의력 쑥쑥 등) 맞춤
              도서를 추천해 드립니다. 아이에게 어떤 책을 읽어줄지 고민하는 부모님의 마음을
              담았습니다.
            </p>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">데이터의 투명성</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              본 서비스는 국립중앙도서관 '도서관 정보나루'의 OpenAPI를 활용하여 신뢰할 수 있는
              데이터를 제공합니다. 모든 정보는 공익적인 목적으로 무료로 제공됩니다.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            '우리 가족 도서관'은 더 나은 독서 문화를 위해 계속 진화하고 있습니다.
            <br />
            서비스에 대한 의견은 언제든 환영합니다.
          </p>
        </div>
      </main>
    </div>
  );
}
